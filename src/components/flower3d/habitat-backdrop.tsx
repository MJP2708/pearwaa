"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Habitat } from "@/data/flower-encyclopedia";

/** A lightweight sense-of-place backdrop — a gradient sky and a ground
 * color — rather than a fully modeled environment. Context, not spectacle. */
export function HabitatBackdrop({ habitat }: { habitat: Habitat }) {
  const { scene } = useThree();

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, habitat.skyTop);
      gradient.addColorStop(1, habitat.skyBottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [habitat.skyTop, habitat.skyBottom]);

  useEffect(() => {
    // Setting scene.background/.fog imperatively is the standard R3F pattern
    // for this — `scene` is a live Three.js object, not React state.
    /* eslint-disable react-hooks/immutability */
    scene.background = texture;
    scene.fog = new THREE.Fog(new THREE.Color(habitat.fog), 3.4, 9);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
    /* eslint-enable react-hooks/immutability */
  }, [scene, texture, habitat.fog]);

  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[4, 48]} />
      <meshStandardMaterial color={habitat.ground} roughness={0.92} />
    </mesh>
  );
}
