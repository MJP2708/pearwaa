"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EncyclopediaFlower, PetalFinish3D } from "@/data/flower-encyclopedia";
import { getPetalGeometry } from "./petal-geometry";
import { seeded } from "@/lib/seeded-random";

const GOLDEN_ANGLE = 137.508;
const WILT_COLOR = new THREE.Color("#8a7a5e");
const STEM_COLOR = "#5a7a52";
const ANTHER_COLOR = "#E8C158";
const FILAMENT_COLOR = "#E9E1C8";

/** Real per-species surface behaviour under PBR lighting — a tulip's
 * waxy sheen, a rose's velvet nap, a hibiscus's papery translucency.
 * These map fairly directly to MeshPhysicalMaterial's own vocabulary. */
const FINISH_PARAMS: Record<PetalFinish3D, Partial<THREE.MeshPhysicalMaterialParameters>> = {
  matte: { roughness: 0.85, clearcoat: 0, transmission: 0, sheen: 0.1, sheenRoughness: 0.9 },
  glossy: { roughness: 0.18, clearcoat: 0.75, clearcoatRoughness: 0.12, transmission: 0, sheen: 0 },
  velvety: { roughness: 0.72, clearcoat: 0, transmission: 0, sheen: 1, sheenRoughness: 0.5 },
  translucent: { roughness: 0.38, clearcoat: 0.15, clearcoatRoughness: 0.25, transmission: 0.55, thickness: 0.35, ior: 1.35 },
};

type Props = {
  flower: EncyclopediaFlower;
  colorHex: string;
  /** 0 = bud, 1 = full bloom, up to ~1.3 = wilted — the stage to animate
   * toward. The instanced petals ease there over time via useFrame. */
  targetBloomT: number;
  reducedMotion: boolean;
};

export function ProceduralFlower({ flower, colorHex, targetBloomT, reducedMotion }: Props) {
  const petalMeshRef = useRef<THREE.InstancedMesh>(null);
  const currentBloomRef = useRef(reducedMotion ? targetBloomT : 0);
  const { petalShape, petalCount, maxOpenDeg, finish = "matte" } = flower.model;
  const isCluster = petalShape === "cluster";
  // Spike-type blooms (lavender, and any future raceme flower) grow as a
  // tight column of many tiny buds around a central stalk — nothing like
  // "cluster"'s loose spherical dome of bigger round petals, which is
  // what previously made lavender read as a vague blob rather than
  // lavender specifically.
  const isSpike = petalShape === "spike";
  // Stamens read as visible botanical detail on open-faced/trumpet blooms;
  // a spike's "flower" is the buds themselves, and a dome of small cluster
  // petals already hides its own center.
  const showStamens = !isSpike && !isCluster;

  const petalGeometry = useMemo(
    () => getPetalGeometry(petalShape, isSpike ? 0.075 : isCluster ? 0.34 : 0.62, isSpike ? 0.045 : isCluster ? 0.3 : 0.34),
    [petalShape, isCluster, isSpike],
  );
  const leafGeometry = useMemo(() => getPetalGeometry("pointed", 0.22, 0.1), []);

  const petalMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, ...FINISH_PARAMS[finish] }),
    [finish],
  );
  const stemMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: STEM_COLOR, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.4 }), []);
  const leafMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: STEM_COLOR, side: THREE.DoubleSide, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.35 }), []);
  const filamentMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: FILAMENT_COLOR, roughness: 0.5 }), []);
  const antherMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: ANTHER_COLOR, roughness: 0.6 }), []);

  function applyBloom(bloomT: number) {
    const openT = Math.min(1, bloomT);
    const wiltT = Math.max(0, Math.min(1, (bloomT - 1) / 0.3));

    const base = new THREE.Color(colorHex);
    petalMaterial.color.copy(base).lerp(WILT_COLOR, wiltT * 0.6);

    const mesh = petalMeshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const headY = 0.86;

    for (let i = 0; i < petalCount; i++) {
      const jitter = seeded(i, 0);
      if (isSpike) {
        const jitter2 = seeded(i, 500);
        const t = petalCount > 1 ? i / (petalCount - 1) : 0;
        const spikeBaseY = headY - 0.02;
        const spikeHeight = 0.36;
        const droop = wiltT * t * t * 0.12;
        const y = spikeBaseY + t * spikeHeight - droop;
        const azimuth = i * GOLDEN_ANGLE * (Math.PI / 180);
        const coreRadius = 0.05 * (1 - t * 0.4);
        // Closed buds hug the central stalk; as the flower opens they
        // poke outward slightly — the "bloom" here is buds separating
        // from the spike, not petals fanning open.
        const budRadius = coreRadius + (0.018 + jitter * 0.014) * (0.3 + openT * 0.7);
        dummy.position.set(Math.cos(azimuth) * budRadius, y, Math.sin(azimuth) * budRadius);
        dummy.rotation.set((jitter2 - 0.5) * 0.5, azimuth, Math.PI / 2 + (jitter - 0.5) * 0.4);
        const scale = (0.75 + jitter2 * 0.35) * (1 - wiltT * 0.2);
        dummy.scale.setScalar(scale);
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
      } else {
        const jitter2 = seeded(i, 500);
        const baseAngleY = ((360 / petalCount) * i + (jitter - 0.5) * 6) * (Math.PI / 180);
        const closedDeg = 12;
        const openDeg = closedDeg + openT * (maxOpenDeg - closedDeg);
        const wiltDroopDeg = wiltT * 30;
        const tilt = (openDeg + wiltDroopDeg) * (Math.PI / 180);
        const roll = (jitter2 - 0.5) * 0.35;

        dummy.position.set(0, headY, 0);
        dummy.rotation.set(tilt, baseAngleY, roll, "YXZ");
        // Non-uniform scale — width and length vary independently per
        // petal (not just a single uniform scalar) so neighboring petals
        // read as individually shaped rather than stamped copies of one
        // ellipse at different sizes.
        const scaleBase = 0.5 + openT * 0.5;
        const lengthScale = scaleBase * (1 - wiltT * 0.12) * (0.92 + jitter * 0.16);
        const widthScale = lengthScale * (0.86 + jitter2 * 0.26);
        dummy.scale.set(widthScale, lengthScale, widthScale);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // Color/shape/count changes should redraw immediately at the current stage.
  useEffect(() => {
    applyBloom(currentBloomRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorHex, petalShape, petalCount, maxOpenDeg, isCluster, isSpike]);

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
      <mesh position={[0, 0.4, 0]} material={stemMaterial} castShadow>
        <cylinderGeometry args={[0.026, 0.036, 0.86, 10]} />
      </mesh>

      {/* A simple leaf pair partway up the stem — cheap, universal
          botanical detail every species benefits from. */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.03, 0.32, 0]}
          rotation={[0, 0, side * -1.1]}
          scale={[side, 1, 1]}
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
