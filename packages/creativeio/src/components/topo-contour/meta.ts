import type { ComponentInfo } from '../../lib/types'

export const topoContourInfo: ComponentInfo = {
  id: 'topo-contour',
  name: 'Topographic Contour',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'topography', 'contour', 'map', 'instrument', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, colored through a terrain elevation ramp (water to lowland to highland to snow peak) with thin contour isolines drawn at regular intervals — reads like a topographic or pressure map instead of smoke. Fully still at rest.',
}
