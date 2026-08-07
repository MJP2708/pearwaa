import * as THREE from "three";
import type { PetalShape3D } from "@/data/flower-encyclopedia";

/**
 * PERFORMANCE BUDGET (per flower, at full detail — the only detail level
 * that exists, since only one flower ever renders at a time; see the note
 * on LOD in procedural-flower.tsx):
 *   - Triangles: ~6,000–9,000 total (petals + florets + stem + leaves +
 *     stamens combined), budgeted for a mid-range phone GPU, not a dev
 *     machine.
 *   - Draw calls: petals/florets share ONE InstancedMesh (1 draw call
 *     regardless of count); stem, leaves, stamens are a handful of small
 *     meshes — under 15 draw calls per flower.
 *   - No image textures anywhere in this pipeline (fully procedural), so
 *     there's no texture memory budget to define — color variation comes
 *     from baked vertex colors + per-instance tint (both essentially free
 *     at render time) rather than sampled maps.
 *   - Target frame rate: steady 60fps on desktop, steady 30fps+ on
 *     mid-range mobile (see the FPS measurement script referenced in the
 *     3D pass notes).
 */

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
    case "spiral":
      // Deliberately not mirror-symmetric — a perfectly even ellipse is
      // what reads as a "generic blob" rather than a petal. The left lobe
      // peaks earlier and wider than the right, and the tip carries a
      // slight off-center notch instead of a smooth dome. "spiral" (rose)
      // reuses this same silhouette — its distinct read comes from the
      // layered-ring layout in ProceduralFlower, not a different outline.
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
    case "disc-ray":
      // "disc-ray" (sunflower, daisy) reuses the thin ray-petal silhouette;
      // its distinct read comes from the dense seed-disc center (see
      // getSeedGeometry) that "star" alone never had.
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
    case "cup":
      // A broader, more upright petal than "round" — tulip tepals are
      // simple, smooth, and barely notched, cupping together rather than
      // fanning flat. Two overlapping rings of 3 (see ProceduralFlower's
      // isCup layout) form the classic tulip cup from this one shape.
      s.moveTo(0, 0);
      s.bezierCurveTo(-w * 0.85, length * 0.35, -w * 0.55, length * 0.95, 0, length);
      s.bezierCurveTo(w * 0.55, length * 0.95, w * 0.85, length * 0.35, 0, 0);
      break;
    case "floret":
      // Handled entirely by getFloretGeometry (a merged 4-lobe shape) —
      // never reached directly, but present so the PetalShape3D switch
      // stays exhaustive.
      s.moveTo(0, 0);
      s.absarc(0, length * 0.3, width * 0.3, 0, Math.PI * 2, false);
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

/** Bakes a soft base-to-tip luminance gradient into vertex colors — a
 * cheap, GPU-native way to get "darker at the base, lighter at the edge"
 * shading without a texture map or expensive real-time subsurface
 * scattering. Multiplies with whatever material.color is set at runtime
 * (see ProceduralFlower), so it works for any species' hue. */
function applyGradientColor(geometry: THREE.BufferGeometry, length: number) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const t = THREE.MathUtils.clamp(length > 0 ? y / length : 0, 0, 1);
    const v = 0.78 + t * 0.32; // darker base (0.78) to lighter tip (1.1, clamped by material)
    colors[i * 3] = v;
    colors[i * 3 + 1] = v;
    colors[i * 3 + 2] = v;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

/** Concatenates several already-built (position/normal/color) geometries
 * into one — used to bake a multi-part shape like a 4-lobe floret into a
 * single mesh/draw-call instead of nesting InstancedMeshes, which three.js
 * doesn't support. Deliberately hand-rolled rather than pulling in
 * three/examples BufferGeometryUtils for one small merge. */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  for (const g of geometries) {
    const pos = g.attributes.position;
    const norm = g.attributes.normal;
    const col = g.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      if (col) colors.push(col.getX(i), col.getY(i), col.getZ(i));
      else colors.push(1, 1, 1);
    }
    const idx = g.index;
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset);
    } else {
      // Non-indexed source geometry — its vertices are already in
      // triangle draw order, so a plain sequential index reproduces the
      // same triangles. Without this branch, any non-indexed input
      // geometry contributes vertices with zero triangles referencing
      // them: silently invisible, not an error.
      for (let i = 0; i < pos.count; i++) indices.push(i + offset);
    }
    offset += pos.count;
  }

  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  merged.setIndex(indices);
  return merged;
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
  spiral: 0.14,
  cup: 0.2,
  "disc-ray": 0.04,
  floret: 0.05,
};

function buildRawPetalGeometry(shape: PetalShape3D, length: number, width: number): THREE.BufferGeometry {
  const depth = Math.max(0.012, length * 0.016);
  const outline = petalOutline(shape, length, width);
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 14,
  });
  geometry.translate(0, 0, -depth / 2);
  applyCurl(geometry, length, CURL_BY_SHAPE[shape] ?? 0.1);
  geometry.computeVertexNormals();
  applyGradientColor(geometry, length);
  return geometry;
}

export function getPetalGeometry(shape: PetalShape3D, length: number, width: number): THREE.BufferGeometry {
  const key = `${shape}-${length.toFixed(2)}-${width.toFixed(2)}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const geometry = buildRawPetalGeometry(shape, length, width);
  geometryCache.set(key, geometry);
  return geometry;
}

/** A tiny 4-lobed floret — hydrangea's actual bloom unit (many of these
 * packed into a dome, not big single petals), and lavender's individual
 * buds close-up. Built by merging 4 small petal shapes around a center
 * point into one geometry, so a whole dome of florets is still just one
 * InstancedMesh / one draw call. */
export function getFloretGeometry(size: number): THREE.BufferGeometry {
  const key = `floret-${size.toFixed(3)}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;

  const lobe = buildRawPetalGeometry("round", size, size * 0.85);
  const lobes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const clone = lobe.clone();
    const m = new THREE.Matrix4().makeRotationZ((i / 4) * Math.PI * 2);
    clone.applyMatrix4(m);
    lobes.push(clone);
  }
  const merged = mergeGeometries(lobes);
  merged.computeVertexNormals();
  geometryCache.set(key, merged);
  return merged;
}

/** A tiny flattened cone — the individual "seed" unit packed densely into
 * a sunflower/daisy disc center. Solid-color, no gradient needed (they're
 * nearly invisible individually, only the mass reads). */
export function getSeedGeometry(size: number): THREE.BufferGeometry {
  const key = `seed-${size.toFixed(3)}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const geometry = new THREE.ConeGeometry(size * 0.5, size, 6, 1);
  geometry.rotateX(Math.PI);
  geometryCache.set(key, geometry);
  return geometry;
}
