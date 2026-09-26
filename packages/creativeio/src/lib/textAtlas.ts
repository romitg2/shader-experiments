import * as THREE from 'three'

/**
 * Renders a horizontal strip of characters into an offscreen canvas once
 * (at mount, not per-frame) and returns it as a texture — cheap to sample
 * per-pixel every frame afterward, and needs no external font/image
 * assets since it uses the browser's own font rendering via Canvas2D.
 * Each cell is `cellPx` wide/tall; cell `i` covers u in
 * [i / chars.length, (i + 1) / chars.length].
 */
export function createGlyphAtlas(
  chars: string[],
  cellPx = 64,
  font = `${Math.round(cellPx * 0.72)}px monospace`,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = cellPx * chars.length
  canvas.height = cellPx
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  chars.forEach((ch, i) => {
    ctx.fillText(ch, i * cellPx + cellPx / 2, cellPx / 2 + cellPx * 0.04)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}
