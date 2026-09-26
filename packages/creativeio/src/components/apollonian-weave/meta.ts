import type { ComponentInfo } from '../../lib/types'

export const apollonianWeaveInfo: ComponentInfo = {
  id: 'apollonian-weave',
  name: 'Apollonian Weave',
  category: 'smoke-fluid',
  tags: ['webgl', 'fractal', 'ifs', 'cheap', 'interactive', 'mouse'],
  description:
    'The same fixed 8-iteration IFS technique as Fractal Zoom, but folding by circle inversion instead of abs-fold — the classic Apollonian-gasket construction, producing a curved web instead of an angular tiling, at the same fixed low cost. Always visible — moving the cursor perturbs the inversion radius, rippling through the weave.',
}
