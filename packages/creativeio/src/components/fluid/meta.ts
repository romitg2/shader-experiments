import type { ComponentInfo } from '../../lib/types'

/**
 * Plain metadata only — deliberately does not import Fluid.tsx. Anything
 * that imports this file (e.g. the server-safe `registry.ts` entry) stays
 * free of the component's react-three-fiber/three dependency chain.
 */
export const fluidInfo: ComponentInfo = {
  id: 'fluid',
  name: 'Fluid Simulation',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'smoke', 'interactive', 'mouse'],
  description:
    'Interactive smoke/fluid simulation driven by GPU texture feedback: ping-pong advection, a Jacobi pressure solver, and incompressibility via gradient subtraction. Fully still at rest — move the mouse to inject velocity and density, which trails and dissipates naturally.',
}
