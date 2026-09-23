import type { ComponentInfo } from '../../lib/types'

export const particleFlowInfo: ComponentInfo = {
  id: 'particle-flow',
  name: 'Particle Flow',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'particles', 'gpgpu', 'interactive', 'mouse'],
  description:
    'Driven by the same GPU fluid velocity sim, but rendered as thousands of discrete GPGPU particles instead of a continuous field — each one a texel in a ping-ponged position/life texture that drifts along local velocity and brightens only where the flow is actually moving. Fully still at rest.',
}
