import type { ComponentInfo } from '../../lib/types'

export const typographicCloudInfo: ComponentInfo = {
  id: 'typographic-cloud',
  name: 'Typographic Cloud',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'ascii', 'typography', 'transparent', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, rendered on a transparent canvas as a drifting cloud of letters instead of a brightness-mapped ASCII picture: each cell gets a fixed random letter (hashed once from its grid coordinate, never changing), and only that letter\'s opacity tracks local density. Fully still at rest.',
}
