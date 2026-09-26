import type { ComponentInfo } from '../../lib/types'

export const circuitTraceInfo: ComponentInfo = {
  id: 'circuit-trace',
  name: 'Circuit Trace',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'circuit', 'pcb', 'grid', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim as City Grid, but instead of filled squares each active cell draws a small pad connected by thin right-angle traces to whichever neighbor cells are also active — snapping the flow onto a PCB circuit-board layout instead of a smooth blob or independent squares. Fully still at rest.',
}
