import type { ComponentInfo } from '../../lib/types'

export const colorSmokeInfo: ComponentInfo = {
  id: 'color-smoke',
  name: 'Color Smoke',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'smoke', 'color', 'gradient', 'interactive', 'mouse'],
  description:
    'The same GPU fluid velocity sim as Fluid Simulation, but the smoke itself is colored — each splat picks up whatever hue is currently rotating through the palette, so a sweeping gesture leaves a trail that shifts through color as it flows and blends. Fully still at rest.',
}
