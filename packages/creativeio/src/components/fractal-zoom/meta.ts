import type { ComponentInfo } from '../../lib/types'

export const fractalZoomInfo: ComponentInfo = {
  id: 'fractal-zoom',
  name: 'Fractal Zoom',
  category: 'smoke-fluid',
  tags: ['webgl', 'fractal', 'ifs', 'cheap', 'interactive', 'mouse'],
  description:
    'A genuine fractal, not a fluid trail: a fixed 8-iteration fold-and-scale loop fakes Sierpinski/IFS-style self-similarity at a cost independent of zoom depth (unlike Mandelbrot-style escape-time, which needs hundreds of iterations per pixel). Always visible — moving the cursor perturbs the fold ratio, rippling through the whole structure.',
}
