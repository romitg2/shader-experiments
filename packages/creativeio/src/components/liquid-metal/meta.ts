import type { ComponentInfo } from '../../lib/types'

export const liquidMetalInfo: ComponentInfo = {
  id: 'liquid-metal',
  name: 'Liquid Metal',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'metal', 'chrome', 'lighting', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, shaded like mercury instead of smoke: the density field\'s local gradient is treated as a fake surface normal and lit with diffuse, specular, and fresnel terms, giving the trail a shiny liquid-chrome look. Fully still at rest.',
}
