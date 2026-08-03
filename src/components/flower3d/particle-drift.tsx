"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Soft pollen/light motes drifting upward past the flower — optional
 * texture for the bloom reveal, skipped entirely under reduced motion. */
export function ParticleDrift({ count = 24, colorHex = "#F6E6C8" }: { count?: number; colorHex?: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Randomized starting positions/speeds, seeded once per mount — there's
  // no pure alternative to random scatter, so the impurity is intentional.
  /* eslint-disable react-hooks/purity */
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.6;
      pos[i * 3 + 1] = Math.random() * 1.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      spd[i] = 0.05 + Math.random() * 0.07;
    }
    return { positions: pos, speeds: spd };
  }, [count]);
  /* eslint-enable react-hooks/purity */

  useFrame((_, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + speeds[i] * delta;
      if (y > 1.8) y = 0;
      posAttr.setY(i, y);
      posAttr.setX(i, posAttr.getX(i) + Math.sin((y + i) * 2.2) * 0.0016);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={colorHex} size={0.02} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}
