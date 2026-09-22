import type { ComponentInfo } from '../../lib/types'

export const neonFlowInfo: ComponentInfo = {
  id: 'neon-flow',
  name: 'Neon Flow',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'neon', 'outline', 'glow', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, rendered edges-only: a Sobel gradient of the density field traces a glowing neon contour around the moving mass instead of filling it in, cycling through a palette so the outline color shifts as you move. Fully still at rest.',
}
