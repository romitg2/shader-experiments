import type { ComponentInfo } from '../../lib/types'

export const thermalCamInfo: ComponentInfo = {
  id: 'thermal-cam',
  name: 'Thermal Camera',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'thermal', 'flir', 'instrument', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, mapped through a classic infrared-camera "IronBow" palette (black through purple, red, orange, to white) with a scanline and vignette overlay — reads like a heat-camera viewfinder watching an invisible thermal plume. Fully still at rest.',
}
