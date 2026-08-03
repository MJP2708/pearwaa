"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EncyclopediaFlower } from "@/data/flower-encyclopedia";
import { getPetalGeometry } from "./petal-geometry";
import { getToonGradientMap } from "./toon-gradient";

const GOLDEN_ANGLE = 137.508;
const WILT_COLOR = new THREE.Color("#8a7a5e");
const CENTER_COLOR = "#F6E6C8";
const STEM_COLOR = "#5a7a52";

/** Deterministic pseudo-random in [0,1), seeded by index — keeps the petal
 * jitter identical between renders instead of reshuffling every frame. */
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

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
  const { petalShape, petalCount, maxOpenDeg } = flower.model;
  const isCluster = petalShape === "cluster";

  const petalGeometry = useMemo(
    () => getPetalGeometry(petalShape, isCluster ? 0.34 : 0.62, isCluster ? 0.3 : 0.34),
    [petalShape, isCluster],
  );

  // A soft toon material — gentle painterly shading bands instead of
  // PBR-realistic falloff, matching the illustrated 2D art direction.
  const petalMaterial = useMemo(
    () => new THREE.MeshToonMaterial({ gradientMap: getToonGradientMap(), side: THREE.DoubleSide }),
    [],
  );

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
      const jitter = seeded(i);
      if (isCluster) {
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
        const jitter2 = seeded(i + 500);
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
  }, [colorHex, petalShape, petalCount, maxOpenDeg, isCluster]);

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

  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.028, 0.036, 0.86, 8]} />
        <meshToonMaterial color={STEM_COLOR} gradientMap={getToonGradientMap()} />
      </mesh>

      <instancedMesh ref={petalMeshRef} args={[petalGeometry, petalMaterial, petalCount]} castShadow />

      <mesh position={[0, 0.855, 0]} scale={0.1}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshToonMaterial color={CENTER_COLOR} gradientMap={getToonGradientMap()} />
      </mesh>
    </group>
  );
}
