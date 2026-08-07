"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EncyclopediaFlower, PetalFinish3D } from "@/data/flower-encyclopedia";
import { getPetalGeometry, getFloretGeometry, getSeedGeometry } from "./petal-geometry";
import { seeded } from "@/lib/seeded-random";

const GOLDEN_ANGLE = 137.508;
const WILT_COLOR = new THREE.Color("#8a7a5e");
const STEM_COLOR = "#5a7a52";
const ANTHER_COLOR = "#E8C158";
const FILAMENT_COLOR = "#E9E1C8";
const SEED_COLOR = "#4A3B28";

/** Stylized-realism surface variation per species — a tulip's waxy sheen,
 * a rose's velvet nap, a hibiscus's papery softness. Deliberately *not*
 * full photoreal PBR: `transmission` (real light-through-object refraction)
 * is dropped everywhere because it forces an extra full-scene render pass
 * every frame — expensive on exactly the mid-range devices this is
 * budgeted for. "Translucent" fakes its soft, papery look instead with a
 * touch of emissive glow plus low roughness, which costs nothing extra
 * per frame; clearcoat/sheen are also kept modest (one cheap-ish specular
 * lobe, not stacked) rather than pushed toward photoreal intensity. */
const FINISH_PARAMS: Record<PetalFinish3D, Partial<THREE.MeshPhysicalMaterialParameters>> = {
  matte: { roughness: 0.85, clearcoat: 0, sheen: 0.1, sheenRoughness: 0.9 },
  glossy: { roughness: 0.22, clearcoat: 0.4, clearcoatRoughness: 0.18 },
  velvety: { roughness: 0.7, sheen: 0.6, sheenRoughness: 0.55 },
  translucent: { roughness: 0.32, clearcoat: 0.1, clearcoatRoughness: 0.3 },
};

/** Emissive-tinted glow applied only to the "translucent" finish, mixed
 * in per-frame in applyBloom (needs the live species color) — the cheap
 * stand-in for real transmission described above. */
const TRANSLUCENT_GLOW = 0.12;

type Props = {
  flower: EncyclopediaFlower;
  colorHex: string;
  /** 0 = bud, 1 = full bloom, up to ~1.3 = wilted — the stage to animate
   * toward. The instanced petals ease there over time via useFrame. */
  targetBloomT: number;
  reducedMotion: boolean;
};

/** Only one flower is ever mounted at a time (the Encyclopedia's detail
 * page viewer) — there's no list/thumbnail context anywhere in the app
 * that renders many of these at once, so a traditional multi-resolution
 * LOD swap has nothing to trade against. The real budget lever here is
 * keeping the *single* active model cheap: one InstancedMesh draw call
 * for all repeated parts (petals/florets/seeds) regardless of count,
 * shared cached geometry across same-shaped parts, and no image textures
 * anywhere in the material stack. See the budget note in petal-geometry.ts. */
export function ProceduralFlower({ flower, colorHex, targetBloomT, reducedMotion }: Props) {
  const petalMeshRef = useRef<THREE.InstancedMesh>(null);
  const seedMeshRef = useRef<THREE.InstancedMesh>(null);
  const currentBloomRef = useRef(reducedMotion ? targetBloomT : 0);
  const { petalShape, petalCount, maxOpenDeg, finish = "matte" } = flower.model;
  const isCluster = petalShape === "cluster";
  const isSpike = petalShape === "spike";
  const isSpiral = petalShape === "spiral";
  const isCup = petalShape === "cup";
  const isDiscRay = petalShape === "disc-ray";
  const isFloret = petalShape === "floret";
  const showStamens = !isSpike && !isCluster && !isFloret && !isDiscRay;
  const seedCount = isDiscRay ? Math.max(40, petalCount * 3) : 0;

  const petalGeometry = useMemo(() => {
    if (isFloret) return getFloretGeometry(0.09);
    // Tried reusing the hydrangea floret geometry here too (lavender buds
    // are botanically tiny florets, not plain teardrops) — but the floret
    // is built radially-symmetric around its own center, while the spike
    // layout's rotation math orients each instance like an elongated bud
    // pointing outward from the stalk. The two don't share an "up" axis,
    // and the mismatch left every bud edge-on to the camera (invisible).
    // Keeping the dedicated "spike" outline here until that's reconciled.
    if (isSpike) return getPetalGeometry("spike", 0.075, 0.045);
    if (isDiscRay) return getPetalGeometry("disc-ray", 0.4, 0.13);
    if (isCup) return getPetalGeometry("cup", 0.58, 0.4);
    if (isSpiral) return getPetalGeometry("spiral", 0.42, 0.3);
    return getPetalGeometry(petalShape, isCluster ? 0.34 : 0.62, isCluster ? 0.3 : 0.34);
  }, [petalShape, isCluster, isSpike, isSpiral, isCup, isDiscRay, isFloret]);
  const seedGeometry = useMemo(() => getSeedGeometry(0.028), []);
  const leafGeometry = useMemo(() => getPetalGeometry("pointed", 0.22, 0.1), []);

  const petalMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, vertexColors: true, ...FINISH_PARAMS[finish] }),
    [finish],
  );
  const seedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: SEED_COLOR, roughness: 0.7 }), []);
  const stemMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: STEM_COLOR, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.4 }), []);
  const leafMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: STEM_COLOR, side: THREE.DoubleSide, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.35 }), []);
  const filamentMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: FILAMENT_COLOR, roughness: 0.5 }), []);
  const antherMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: ANTHER_COLOR, roughness: 0.6 }), []);

  // A gently curved stem (not a straight cylinder) — real stems bow
  // slightly under a bloom's weight. Curve direction/strength is
  // deterministic per species (seeded off petalCount, which already
  // varies per flower) so it's consistent between renders, not random
  // per-frame. One TubeGeometry, built once per mount.
  const stemGeometry = useMemo(() => {
    const bend = (seeded(petalCount, 777) - 0.5) * 0.09;
    const bendDir = seeded(petalCount, 778) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(bendDir) * bend * 0.3, 0.43, Math.sin(bendDir) * bend * 0.3),
      new THREE.Vector3(Math.cos(bendDir) * bend, 0.86, Math.sin(bendDir) * bend),
    ]);
    const geo = new THREE.TubeGeometry(curve, 12, 0.028, 6, false);
    // Taper: thicker at the base, narrower under the bloom.
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / 0.86, 0, 1);
      const taper = 1 - t * 0.32;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [petalCount]);

  const leaves = useMemo(() => {
    const count = 2 + Math.round(seeded(petalCount, 810) * 1.4); // 2-3 leaves
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const j = seeded(i, 811);
      return {
        side,
        y: 0.24 + (i / count) * 0.14 + j * 0.03,
        angle: 1.0 + j * 0.35,
        scale: 0.85 + seeded(i, 812) * 0.35,
      };
    });
  }, [petalCount]);

  function applyBloom(bloomT: number) {
    const openT = Math.min(1, bloomT);
    const wiltT = Math.max(0, Math.min(1, (bloomT - 1) / 0.3));

    const base = new THREE.Color(colorHex);
    petalMaterial.color.copy(base).lerp(WILT_COLOR, wiltT * 0.6);
    if (finish === "translucent") {
      petalMaterial.emissive.copy(petalMaterial.color).multiplyScalar(TRANSLUCENT_GLOW * (1 - wiltT * 0.5));
    } else if (petalMaterial.emissive.getHex() !== 0) {
      petalMaterial.emissive.setRGB(0, 0, 0);
    }

    const mesh = petalMeshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const headY = 0.86;
    const tintColor = new THREE.Color();

    for (let i = 0; i < petalCount; i++) {
      const jitter = seeded(i, 0);
      const jitter2 = seeded(i, 500);

      if (isSpike) {
        const t = petalCount > 1 ? i / (petalCount - 1) : 0;
        const spikeBaseY = headY - 0.02;
        const spikeHeight = 0.36;
        const droop = wiltT * t * t * 0.12;
        const y = spikeBaseY + t * spikeHeight - droop;
        const azimuth = i * GOLDEN_ANGLE * (Math.PI / 180);
        const coreRadius = 0.05 * (1 - t * 0.4);
        const budRadius = coreRadius + (0.018 + jitter * 0.014) * (0.3 + openT * 0.7);
        dummy.position.set(Math.cos(azimuth) * budRadius, y, Math.sin(azimuth) * budRadius);
        dummy.rotation.set((jitter2 - 0.5) * 0.5, azimuth, Math.PI / 2 + (jitter - 0.5) * 0.4);
        dummy.scale.setScalar((0.75 + jitter2 * 0.35) * (1 - wiltT * 0.2));
      } else if (isFloret) {
        // A dome of tiny florets — same golden-angle dome math as
        // "cluster" but denser/smaller, reading as hydrangea's actual
        // bloom unit rather than one big petal per instance.
        const idx = i + 0.5;
        const azimuth = idx * GOLDEN_ANGLE * (Math.PI / 180);
        const polar = (0.2 + openT * 0.62 + wiltT * 0.2) * Math.min(1, Math.sqrt(idx / petalCount) * 1.5 + 0.35);
        const radius = 0.14 + Math.sqrt(idx / petalCount) * 0.24;
        dummy.position.set(
          Math.sin(polar) * Math.cos(azimuth) * radius,
          headY + Math.cos(polar) * radius * 0.55 - wiltT * 0.1,
          Math.sin(polar) * Math.sin(azimuth) * radius,
        );
        dummy.rotation.set(jitter * Math.PI, azimuth, jitter2 * Math.PI);
        dummy.scale.setScalar((0.7 + jitter * 0.4) * (1 - wiltT * 0.12));
      } else if (isCluster) {
        const idx = i + 0.5;
        const azimuth = idx * GOLDEN_ANGLE * (Math.PI / 180);
        const polar = (0.15 + openT * 0.55 + wiltT * 0.25) * Math.min(1, Math.sqrt(idx / petalCount) * 1.6 + 0.3);
        const radius = 0.16 + Math.sqrt(idx / petalCount) * 0.22;
        const scale = 0.65 + jitter * 0.3;
        dummy.position.set(
          Math.sin(polar) * Math.cos(azimuth) * radius,
          headY + Math.cos(polar) * radius * 0.6 - wiltT * 0.1,
          Math.sin(polar) * Math.sin(azimuth) * radius,
        );
        dummy.rotation.set((jitter - 0.5) * 0.6, azimuth, (jitter - 0.5) * 0.4);
        dummy.scale.setScalar(scale * (1 - wiltT * 0.15));
      } else if (isSpiral) {
        // Layered concentric rings, tightest/smallest/most closed at the
        // center, looser/larger outward, each ring rotated against the
        // last — a rose's actual spiral-overlap structure. Kept small and
        // capped well short of fully flat-open (unlike every other shape
        // here) so outer rings still cup and overlap the inner ones
        // instead of reflexing back into a flat, spiky "dahlia" silhouette.
        const ringCount = 5;
        const ring = Math.min(ringCount - 1, Math.floor((i / petalCount) * ringCount));
        const inRing = petalCount / ringCount;
        const idxInRing = i - ring * inRing;
        const ringT = ring / (ringCount - 1);
        const baseAngleY = ((360 / inRing) * idxInRing + ring * 33 + (jitter - 0.5) * 6) * (Math.PI / 180);
        const closedDeg = 8 + ringT * 10;
        const maxRingOpenDeg = Math.min(72, maxOpenDeg) * (0.45 + ringT * 0.5);
        const openDeg = closedDeg + openT * (maxRingOpenDeg - closedDeg);
        const tilt = (openDeg + wiltT * 22) * (Math.PI / 180);
        const ringRadius = ringT * 0.03;
        dummy.position.set(Math.sin(baseAngleY) * ringRadius, headY - ringT * 0.035, Math.cos(baseAngleY) * ringRadius);
        dummy.rotation.set(tilt, baseAngleY, (jitter2 - 0.5) * 0.2, "YXZ");
        const ringScale = 0.5 + ringT * 0.5;
        const scaleBase = (0.5 + openT * 0.5) * ringScale;
        dummy.scale.set(scaleBase * (0.86 + jitter2 * 0.26), scaleBase * (1 - wiltT * 0.12) * (0.92 + jitter * 0.16), scaleBase * (0.86 + jitter2 * 0.26));
      } else if (isCup) {
        // Two rings of 3 (six tepals total, a tulip's real count) —
        // inner ring upright and tight, outer ring slightly wider/looser,
        // together forming the cup rather than a flat fan.
        const outer = i % 2 === 1;
        const ringIndex = Math.floor(i / 2);
        const baseAngleY = ((120 * ringIndex + (outer ? 60 : 0) + (jitter - 0.5) * 5) * Math.PI) / 180;
        const closedDeg = 8;
        const openDeg = closedDeg + openT * ((maxOpenDeg - closedDeg) * (outer ? 1 : 0.72));
        const tilt = (openDeg + wiltT * 25) * (Math.PI / 180);
        dummy.position.set(0, headY, 0);
        dummy.rotation.set(tilt, baseAngleY, (jitter2 - 0.5) * 0.2, "YXZ");
        const scaleBase = (0.55 + openT * 0.45) * (outer ? 1.08 : 0.92);
        dummy.scale.set(scaleBase * (0.9 + jitter2 * 0.16), scaleBase * (1 - wiltT * 0.1) * (0.94 + jitter * 0.1), scaleBase * (0.9 + jitter2 * 0.16));
      } else if (isDiscRay) {
        // A ring of thin ray petals around the (separately-instanced)
        // seed disc — the two-part Asteraceae structure.
        const baseAngleY = ((360 / petalCount) * i + (jitter - 0.5) * 4) * (Math.PI / 180);
        const openDeg = 8 + openT * (maxOpenDeg - 8);
        const tilt = (openDeg + wiltT * 35) * (Math.PI / 180);
        dummy.position.set(0, headY, 0);
        dummy.rotation.set(tilt, baseAngleY, 0, "YXZ");
        const scaleBase = 0.55 + openT * 0.5;
        dummy.scale.set(scaleBase * (0.9 + jitter2 * 0.14), scaleBase * (1 - wiltT * 0.15) * (0.9 + jitter * 0.16), scaleBase);
      } else {
        const baseAngleY = ((360 / petalCount) * i + (jitter - 0.5) * 6) * (Math.PI / 180);
        const closedDeg = 12;
        const openDeg = closedDeg + openT * (maxOpenDeg - closedDeg);
        const wiltDroopDeg = wiltT * 30;
        const tilt = (openDeg + wiltDroopDeg) * (Math.PI / 180);
        const roll = (jitter2 - 0.5) * 0.35;

        dummy.position.set(0, headY, 0);
        dummy.rotation.set(tilt, baseAngleY, roll, "YXZ");
        const scaleBase = 0.5 + openT * 0.5;
        const lengthScale = scaleBase * (1 - wiltT * 0.12) * (0.92 + jitter * 0.16);
        const widthScale = lengthScale * (0.86 + jitter2 * 0.26);
        dummy.scale.set(widthScale, lengthScale, widthScale);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Per-instance color tint — no two petals on the same bloom are
      // quite the same hue/value, via THREE's instanceColor (near-free at
      // render time, no extra geometry or material needed).
      tintColor.copy(petalMaterial.color).offsetHSL(0, (jitter - 0.5) * 0.06, (jitter2 - 0.5) * 0.08);
      mesh.setColorAt(i, tintColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const seedMesh = seedMeshRef.current;
    if (seedMesh && isDiscRay) {
      const seedDummy = new THREE.Object3D();
      for (let i = 0; i < seedCount; i++) {
        const idx = i + 0.5;
        const azimuth = idx * GOLDEN_ANGLE * (Math.PI / 180);
        const radius = 0.02 + Math.sqrt(idx / seedCount) * 0.16;
        seedDummy.position.set(Math.cos(azimuth) * radius, headY + 0.006, Math.sin(azimuth) * radius);
        seedDummy.rotation.set(0, azimuth, 0);
        const s = 0.7 + seeded(i, 950) * 0.5;
        seedDummy.scale.setScalar(s);
        seedDummy.updateMatrix();
        seedMesh.setMatrixAt(i, seedDummy.matrix);
      }
      seedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  // Shape/count changes should redraw immediately at the current stage.
  useEffect(() => {
    applyBloom(currentBloomRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorHex, petalShape, petalCount, maxOpenDeg, isCluster, isSpike, isSpiral, isCup, isDiscRay, isFloret]);

  useFrame((_, delta) => {
    if (reducedMotion) {
      if (currentBloomRef.current !== targetBloomT) {
        currentBloomRef.current = targetBloomT;
        applyBloom(currentBloomRef.current);
      }
      return;
    }
    const diff = targetBloomT - currentBloomRef.current;
    if (Math.abs(diff) > 0.0015) {
      currentBloomRef.current += diff * Math.min(1, delta * 1.6);
      applyBloom(currentBloomRef.current);
    }
  });

  const stamens = useMemo(() => {
    if (!showStamens) return [];
    const count = Math.min(8, Math.max(5, Math.round(petalCount / 3)));
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + seeded(i, 900) * 0.6;
      const tilt = 0.15 + seeded(i, 902) * 0.25;
      return { angle, tilt, len: 0.05 + seeded(i, 903) * 0.02 };
    });
  }, [showStamens, petalCount]);

  return (
    <group>
      <mesh geometry={stemGeometry} material={stemMaterial} castShadow />

      {/* A small, per-species-varied leaf set partway up the stem — real
          plants don't grow perfectly mirrored leaf pairs. */}
      {leaves.map((leaf, i) => (
        <mesh
          key={i}
          position={[leaf.side * 0.03, leaf.y, 0]}
          rotation={[0, 0, leaf.side * -leaf.angle]}
          scale={[leaf.side * leaf.scale, leaf.scale, leaf.scale]}
          geometry={leafGeometry}
          material={leafMaterial}
          castShadow
        />
      ))}

      {isSpike && (
        <mesh position={[0, 0.86 + 0.16, 0]} material={stemMaterial}>
          <cylinderGeometry args={[0.01, 0.022, 0.36, 8]} />
        </mesh>
      )}

      <instancedMesh ref={petalMeshRef} args={[petalGeometry, petalMaterial, petalCount]} castShadow />

      {isDiscRay && (
        <instancedMesh ref={seedMeshRef} args={[seedGeometry, seedMaterial, seedCount]} castShadow />
      )}

      {showStamens && (
        <group position={[0, 0.855, 0]}>
          <mesh material={filamentMaterial}>
            <sphereGeometry args={[0.045, 12, 10]} />
          </mesh>
          {stamens.map((s, i) => (
            <group key={i} rotation={[s.tilt, s.angle, 0]}>
              <mesh position={[0, s.len / 2 + 0.045, 0]} material={filamentMaterial}>
                <cylinderGeometry args={[0.003, 0.004, s.len, 5]} />
              </mesh>
              <mesh position={[0, s.len + 0.045, 0]} material={antherMaterial}>
                <sphereGeometry args={[0.011, 8, 6]} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}
