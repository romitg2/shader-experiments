import type { ComponentInfo } from '../../lib/types'

export const asciiFluidInfo: ComponentInfo = {
  id: 'ascii-fluid',
  name: 'ASCII Fluid',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'ascii', 'terminal', 'text', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, rendered as a grid of monospace characters instead of a continuous field — each cell samples local density, buckets it into one of a fixed number of brightness levels, and looks up the matching glyph from a Canvas2D-rendered texture atlas built once at mount. A classic terminal ASCII-art look, fully still at rest.',
}
