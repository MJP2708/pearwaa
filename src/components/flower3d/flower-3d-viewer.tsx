"use client";

import { Suspense, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { EncyclopediaFlower } from "@/data/flower-encyclopedia";
import { ProceduralFlower } from "./procedural-flower";
import { HabitatBackdrop } from "./habitat-backdrop";
import { ParticleDrift } from "./particle-drift";
import { Mascot } from "@/components/mascot";

const STAGE_T: Record<string, number> = { bud: 0, half: 0.5, full: 1, wilted: 1.3 };

function AutoSpin({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (enabled && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

type Props = {
  flower: EncyclopediaFlower;
  colorHex: string;
  bloomStage: string;
  autoSpin: boolean;
  showParticles: boolean;
  reducedMotion: boolean;
};

export function Flower3DViewer({ flower, colorHex, bloomStage, autoSpin, showParticles, reducedMotion }: Props) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [ready, setReady] = useState(false);
  const targetBloomT = STAGE_T[bloomStage] ?? 1;

  function handleKeyDown(e: React.KeyboardEvent) {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object as THREE.PerspectiveCamera;
    const target = controls.target;
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const rotateStep = THREE.MathUtils.degToRad(4);
    const zoomStep = 0.15;
    let handled = true;

    if (e.key === "ArrowLeft") spherical.theta -= rotateStep;
    else if (e.key === "ArrowRight") spherical.theta += rotateStep;
    else if (e.key === "ArrowUp") spherical.phi = THREE.MathUtils.clamp(spherical.phi - rotateStep, 0.5, Math.PI - 0.5);
    else if (e.key === "ArrowDown") spherical.phi = THREE.MathUtils.clamp(spherical.phi + rotateStep, 0.5, Math.PI - 0.5);
    else if (e.key === "+" || e.key === "=") spherical.radius = Math.max(controls.minDistance ?? 1.4, spherical.radius - zoomStep);
    else if (e.key === "-" || e.key === "_") spherical.radius = Math.min(controls.maxDistance ?? 5, spherical.radius + zoomStep);
    else handled = false;

    if (handled) {
      e.preventDefault();
      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      controls.update();
    }
  }

  return (
    <div
      role="group"
      aria-label={`3D model of ${flower.commonName}. Drag to rotate, scroll to zoom. When focused: arrow keys rotate, plus and minus zoom.`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative h-full w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/30">
          <Mascot size={48} mood="sleepy" className={reducedMotion ? "opacity-70" : "animate-pulse opacity-70"} />
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 1.1, 2.6], fov: 40 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true }}
        onCreated={() => setReady(true)}
        style={{ opacity: ready ? 1 : 0, transition: reducedMotion ? "none" : "opacity 0.6s ease" }}
      >
        {/* Warm, soft lighting rather than clinical/showroom — a warm-tinted
            key light plus a warm ambient fill, toned down for the toon
            material's gentle shading bands rather than PBR intensity. */}
        <ambientLight intensity={0.55} color="#FFE9CC" />
        <directionalLight position={[2, 3, 2]} intensity={0.75} color="#FFDCAE" castShadow />
        <Suspense fallback={null}>
          <Environment preset="sunset" environmentIntensity={0.35} />
        </Suspense>

        <HabitatBackdrop habitat={flower.habitat} />

        <AutoSpin enabled={autoSpin && !reducedMotion}>
          <ProceduralFlower flower={flower} colorHex={colorHex} targetBloomT={targetBloomT} reducedMotion={reducedMotion} />
        </AutoSpin>

        {showParticles && !reducedMotion && <ParticleDrift colorHex={colorHex} />}

        <OrbitControls
          ref={controlsRef}
          target={[0, 0.7, 0]}
          enablePan={false}
          minDistance={1.4}
          maxDistance={4.2}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI - 0.5}
        />
      </Canvas>
    </div>
  );
}
