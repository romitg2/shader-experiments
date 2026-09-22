import type { ComponentInfo } from '../../lib/types'

export const halftoneInfo: ComponentInfo = {
  id: 'halftone',
  name: 'Halftone',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'halftone', 'dots', 'print', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, rendered as a deterministic grid of circles whose radius grows continuously with local density — a classic newsprint halftone screen, cycling through a palette. No randomness, unlike Pixel Ink\'s dither grain. Fully still at rest.',
}
