import * as THREE from "three";

let cached: THREE.Texture | null = null;

/**
 * A soft, four-step gradient map for MeshToonMaterial — gentle painterly
 * shading bands instead of PBR-realistic falloff, matching the illustrated
 * 2D art direction. One texture, shared by every flower.
 */
export function getToonGradientMap(): THREE.Texture {
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const shades = [92, 168, 212, 255];
    for (let i = 0; i < shades.length; i++) {
      ctx.fillStyle = `rgb(${shades[i]}, ${shades[i]}, ${shades[i]})`;
      ctx.fillRect(i, 0, 1, 1);
    }
  }
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  cached = texture;
  return texture;
}
