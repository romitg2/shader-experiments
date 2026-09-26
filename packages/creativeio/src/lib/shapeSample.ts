/**
 * Renders text into an offscreen Canvas2D once, reads back which pixels are
 * "ink," and returns a flat (x, y) point list — one entry per requested
 * particle — sampled from those ink pixels. Used as a GPU texture's initial
 * data (each particle's fixed "home" position) so a scattered particle
 * system can be pulled back into the shape of the text instead of a random
 * point, reusing the same homing mechanic as Dust Drift.
 */
export function sampleTextPositions(text: string, count: number, canvasSize = 256): Float32Array {
  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  ctx.fillStyle = '#fff'

  let fontSize = Math.floor(canvasSize * 0.28)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${fontSize}px sans-serif`
  const maxWidth = canvasSize * 0.86
  while (fontSize > 8 && ctx.measureText(text).width > maxWidth) {
    fontSize -= 2
    ctx.font = `bold ${fontSize}px sans-serif`
  }
  ctx.fillText(text, canvasSize / 2, canvasSize / 2 + fontSize * 0.04)

  const { data } = ctx.getImageData(0, 0, canvasSize, canvasSize)
  const points: number[] = []
  for (let y = 0; y < canvasSize; y++) {
    for (let x = 0; x < canvasSize; x++) {
      if (data[(y * canvasSize + x) * 4] > 128) {
        points.push(x / canvasSize, 1 - y / canvasSize)
      }
    }
  }

  const out = new Float32Array(count * 4)
  if (points.length === 0) {
    for (let i = 0; i < count; i++) {
      out[i * 4] = 0.5
      out[i * 4 + 1] = 0.5
    }
    return out
  }

  const numPoints = points.length / 2
  // Deterministic pseudo-shuffle: an odd stride coprime-ish with numPoints
  // spreads consecutive particle indices across the whole point list instead
  // of each landing near the same tiny cluster of raster-adjacent pixels.
  const stride = Math.max(1, (Math.floor(numPoints * 0.61803) | 1) % numPoints || 1)
  for (let i = 0; i < count; i++) {
    const pick = (i * stride) % numPoints
    out[i * 4] = points[pick * 2]
    out[i * 4 + 1] = points[pick * 2 + 1]
  }
  return out
}
