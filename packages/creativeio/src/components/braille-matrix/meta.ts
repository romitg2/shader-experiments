import type { ComponentInfo } from '../../lib/types'

export const brailleMatrixInfo: ComponentInfo = {
  id: 'braille-matrix',
  name: 'Braille Matrix',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'ascii', 'braille', 'dots', 'terminal', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as Fluid Simulation, rendered as a procedural grid of braille-style dot cells instead of glyphs from a font atlas — each cell is split into a 2x4 sub-grid of 8 dots, and every dot independently samples the density field at its own sub-cell position, giving 8x finer effective resolution than ASCII Fluid\'s one-sample-per-cell lookup. Fully still at rest.',
}
