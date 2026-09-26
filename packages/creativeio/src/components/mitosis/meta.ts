import type { ComponentInfo } from '../../lib/types'

export const mitosisInfo: ComponentInfo = {
  id: 'mitosis',
  name: 'Mitosis',
  category: 'smoke-fluid',
  tags: ['webgl', 'reaction-diffusion', 'gray-scott', 'cheap', 'interactive', 'mouse'],
  description:
    'The same Gray-Scott reaction-diffusion engine as Coral Growth, but a different feed/kill preset produces a thinner, continuously winding maze-like growth instead of coral\'s thicker branching, colored as pale membranes on dark cytoplasm. Drag to seed a reaction site; once started, it keeps extending and stabilizing on its own.',
}
