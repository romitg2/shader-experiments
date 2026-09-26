import type { ComponentInfo } from '../../lib/types'

export const coralGrowthInfo: ComponentInfo = {
  id: 'coral-growth',
  name: 'Coral Growth',
  category: 'smoke-fluid',
  tags: ['webgl', 'reaction-diffusion', 'gray-scott', 'cheap', 'interactive', 'mouse'],
  description:
    'A genuinely different simulation model from this library\'s fluid family: Gray-Scott reaction-diffusion, where two chemicals diffuse and react via a cheap 9-tap Laplacian (no per-pixel iteration counts) to self-organize into coral-like branching growth. Drag to seed a reaction site — once started, the pattern keeps growing and stabilizing on its own, it doesn\'t need continuous input like this library\'s fluid-family siblings.',
}
