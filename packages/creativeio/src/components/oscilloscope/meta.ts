import type { ComponentInfo } from '../../lib/types'

export const oscilloscopeInfo: ComponentInfo = {
  id: 'oscilloscope',
  name: 'Oscilloscope',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'oscilloscope', 'signal', 'instrument', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim, but instead of rendering the 2D field it samples density along one horizontal scanline and plots it as a live glowing waveform over a CRT graticule — turning the fluid into a 1D signal reading, like an oscilloscope or seismograph trace. Fully still at rest.',
}
