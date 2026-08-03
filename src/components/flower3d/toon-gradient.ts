import * as THREE from "three";

let cached: THREE.Texture | null = null;

/**
 * A soft, five-step gradient map for MeshToonMaterial — gentle painterly
 * shading bands instead of PBR-realistic falloff, matching the illustrated
 * 2D art direction. One texture, shared by every flower. Bands are closely
 * spaced (vs. a harsher 4-step ramp) so shading reads as soft gouache
 * blending rather than a flat, sharply-banded "clay render" look, and each
 * band is tinted slightly warm — even the shadow side leans toward amber
 * rather than neutral/cool gray, which is what actually reads as
 * hand-painted rather than plastic under studio light.
 */
export function getToonGradientMap(): THREE.Texture {
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = 5;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const shades = [128, 168, 198, 224, 248];
    for (let i = 0; i < shades.length; i++) {
      const v = shades[i];
      ctx.fillStyle = `rgb(${v}, ${Math.round(v * 0.965)}, ${Math.round(v * 0.9)})`;
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
