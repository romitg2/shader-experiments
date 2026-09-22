import type { ComponentInfo } from '../../lib/types'

export const flowFieldInfo: ComponentInfo = {
  id: 'flow-field',
  name: 'Flow Field',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'velocity', 'lines', 'interactive', 'mouse'],
  description:
    'The same GPU fluid velocity sim, but rendered as the raw vector field itself instead of a transported dye — a grid of short strokes that orient and lengthen along local flow direction, collapsing to nothing wherever the field is at rest.',
}
