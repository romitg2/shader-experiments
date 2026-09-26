import type { ComponentInfo } from '../../lib/types'

export const kaleidoscopeInfo: ComponentInfo = {
  id: 'kaleidoscope',
  name: 'Kaleidoscope',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'kaleidoscope', 'mandala', 'symmetry', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Color Smoke, at zero extra simulation cost: the sampling UV is folded into an N-way mirrored wedge before reading the density field, turning any cursor gesture into a symmetric mandala. Fully still at rest.',
}
