import type { ComponentInfo } from '../../lib/types'

export const fireFlowInfo: ComponentInfo = {
  id: 'fire-flow',
  name: 'Fire Flow',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'fire', 'flame', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, but every splat carries a constant upward buoyancy force and density is mapped through a classic fire color ramp (black to red to orange to yellow to white) — the trail behaves and reads like rising flame instead of neutral smoke. Fully still at rest.',
}
