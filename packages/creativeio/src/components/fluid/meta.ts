import type { ComponentMeta } from '../../lib/types'
import { Fluid } from './Fluid'

export const fluidMeta: ComponentMeta = {
  id: 'fluid',
  name: 'Fluid Simulation',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'smoke', 'interactive', 'mouse'],
  description:
    'Interactive smoke/fluid simulation driven by GPU texture feedback: ping-pong advection, a Jacobi pressure solver, and incompressibility via gradient subtraction. Move the mouse to inject velocity and density.',
  Component: Fluid,
}
