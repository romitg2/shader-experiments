import type { ComponentInfo } from '../../lib/types'

export const shapeReassemblyInfo: ComponentInfo = {
  id: 'shape-reassembly',
  name: 'Shape Reassembly',
  category: 'smoke-fluid',
  tags: ['webgl', 'particles', 'gpgpu', 'text', 'interactive', 'mouse'],
  description:
    'Dust Drift\'s homing mechanic aimed at a purpose: each particle\'s fixed "home" position is sampled from the ink pixels of rendered text (a Canvas2D-built lookup, not random noise), so the particles settle into the shape of a word instead of scattering randomly. Swipe through it to blow the text apart into chaos, then watch it reassemble on its own once you stop.',
}
