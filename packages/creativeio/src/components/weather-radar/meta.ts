import type { ComponentInfo } from '../../lib/types'

export const weatherRadarInfo: ComponentInfo = {
  id: 'weather-radar',
  name: 'Weather Radar',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'radar', 'weather', 'instrument', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, quantized into hard discrete bands and mapped through a NEXRAD-style reflectivity color ramp (green to yellow to orange to red to magenta) instead of a smooth gradient — reads like a live storm-system radar map. Fully still at rest.',
}
