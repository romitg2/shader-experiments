import type { ComponentInfo } from '../../lib/types'

export const pixelInkInfo: ComponentInfo = {
  id: 'pixel-ink',
  name: 'Pixel Ink',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'pixel', 'dither', 'grain', 'interactive', 'mouse'],
  description:
    'The same GPU fluid velocity sim as Fluid Simulation, rendered as a dithered grain of pixels instead of smooth smoke — density controls how many dots twinkle into existence at a given point, colored by a palette that shifts along the trail. Fully still at rest.',
}
