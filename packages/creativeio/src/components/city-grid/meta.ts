import type { ComponentInfo } from '../../lib/types'

export const cityGridInfo: ComponentInfo = {
  id: 'city-grid',
  name: 'City Grid',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'grid', 'pixel', 'color', 'interactive', 'mouse'],
  description:
    'The same GPU fluid velocity sim as Fluid Simulation, rendered as a grid of squares whose size follows local density — a splat reads as colored blocks expanding outward from wherever you move, cycling through a palette so different gestures trigger a different color to expand. Fully still at rest.',
}
