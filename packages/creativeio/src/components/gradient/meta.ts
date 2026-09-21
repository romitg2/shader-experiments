import type { ComponentInfo } from '../../lib/types'

/**
 * Plain metadata only — deliberately does not import Gradient.tsx. Anything
 * that imports this file (e.g. the server-safe `registry.ts` entry) stays
 * free of the component's react-three-fiber/three dependency chain.
 */
export const gradientInfo: ComponentInfo = {
  id: 'gradient',
  name: 'Animated Gradient',
  category: 'backgrounds',
  tags: ['webgl', 'gradient', 'noise', 'background', 'ambient'],
  description:
    'Domain-warped simplex-noise gradient, continuously animated and subtly reactive to the pointer — a classic generative-shader technique for mesh-gradient backgrounds.',
}
