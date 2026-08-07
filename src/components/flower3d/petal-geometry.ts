import * as THREE from "three";
import type { PetalShape3D } from "@/data/flower-encyclopedia";

/**
 * Builds one petal's 2D outline (base at origin, tip toward +Y), extruded
 * to a thin 3D shape. These are deliberately simple, stylized silhouettes —
 * not sculpted botanical models — arranged radially by ProceduralFlower to
 * read as a flower.
 */
function petalOutline(shape: PetalShape3D, length: number, width: number): THREE.Shape {
  const s = new THREE.Shape();
  const w = width / 2;

  switch (shape) {
    case "round":
      // Deliberately not mirror-symmetric — a perfectly even ellipse is
      // what reads as a "generic blob" rather than a petal. The left lobe
      // peaks earlier and wider than the right, and the tip carries a
      // slight off-center notch instead of a smooth dome.
      s.moveTo(0, 0);
      s.bezierCurveTo(-w * 0.92, length * 0.26, -w * 0.7, length * 0.88, -w * 0.1, length * 0.99);
      s.quadraticCurveTo(w * 0.04, length * 1.04, w * 0.2, length * 0.94);
      s.bezierCurveTo(w * 0.76, length * 0.8, w * 0.6, length * 0.32, 0, 0);
      break;
    case "pointed":
      s.moveTo(0, 0);
      s.bezierCurveTo(-w * 1.05, length * 0.42, -w * 0.3, length * 0.9, -w * 0.04, length);
      s.bezierCurveTo(w * 0.15, length * 0.92, w * 0.85, length * 0.48, 0, 0);
      break;
    case "star":
      s.moveTo(0, 0);
      s.lineTo(-w * 0.6, length * 0.5);
      s.lineTo(0, length);
      s.lineTo(w * 0.6, length * 0.5);
      s.lineTo(0, 0);
      break;
    case "cluster":
      s.absarc(0, length * 0.55, width * 0.42, 0, Math.PI * 2, false);
      break;
    case "spike": {
      // A single tiny bud — not a petal at all. Flowers that grow as a
      // dense raceme (lavender, and similar spike-type blooms) read as a
      // narrow column of these packed tightly around a central stalk,
      // handled by ProceduralFlower's isSpike layout — very different
      // from "cluster"'s loose spherical dome of bigger round petals.
      const bw = width * 0.55;
      s.moveTo(0, 0);
      s.bezierCurveTo(-bw, length * 0.25, -bw * 0.7, length * 0.9, 0, length);
      s.bezierCurveTo(bw * 0.7, length * 0.9, bw, length * 0.25, 0, 0);
      break;
    }
    case "ruffled": {
      s.moveTo(0, 0);
      const steps = 7;
      const pts: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const wobble = Math.sin(t * Math.PI * 3) * width * 0.12;
        pts.push([-Math.sin(t * Math.PI) * w + wobble, t * length]);
      }
      for (const [x, y] of pts) s.lineTo(x, y);
      for (let i = steps; i >= 0; i--) {
        const t = i / steps;
        const wobble = Math.sin(t * Math.PI * 3 + 1.5) * width * 0.12;
        s.lineTo(Math.sin(t * Math.PI) * w + wobble, t * length);
      }
      break;
    }
    case "trumpet":
      s.moveTo(0, 0);
      s.bezierCurveTo(-w * 0.35, length * 0.4, -w, length * 0.85, -w * 0.9, length);
      s.lineTo(w * 0.9, length);
      s.bezierCurveTo(w, length * 0.85, w * 0.35, length * 0.4, 0, 0);
      break;
  }
  return s;
}

const geometryCache = new Map<string, THREE.BufferGeometry>();

/** Bends the petal tip forward along Z, increasingly toward the tip — real
 * petals aren't flat extrusions, they curl/cup. Displacement scales with
 * the petal's own length so it reads proportionate at every size, from a
 * lavender bud to a lotus petal. */
function applyCurl(geometry: THREE.BufferGeometry, length: number, curlAmount: number) {
  if (curlAmount <= 0 || length <= 0) return;
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const t = THREE.MathUtils.clamp(y / length, 0, 1);
    const curl = Math.sin(t * Math.PI * 0.5) ** 1.4 * length * curlAmount;
    position.setZ(i, position.getZ(i) + curl);
  }
  position.needsUpdate = true;
}

/** Curl strength per shape — trumpet/round petals cup noticeably, small
 * tight shapes (spike buds, cluster petals) barely need it. */
const CURL_BY_SHAPE: Record<PetalShape3D, number> = {
  round: 0.16,
  pointed: 0.12,
  star: 0.05,
  cluster: 0.03,
  spike: 0.02,
  ruffled: 0.1,
  trumpet: 0.22,
};

export function getPetalGeometry(shape: PetalShape3D, length: number, width: number): THREE.BufferGeometry {
  const key = `${shape}-${length.toFixed(2)}-${width.toFixed(2)}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;

  const depth = Math.max(0.012, length * 0.016);
  const outline = petalOutline(shape, length, width);
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 18,
  });
  geometry.translate(0, 0, -depth / 2);
  applyCurl(geometry, length, CURL_BY_SHAPE[shape] ?? 0.1);
  geometry.computeVertexNormals();
  geometryCache.set(key, geometry);
  return geometry;
}
