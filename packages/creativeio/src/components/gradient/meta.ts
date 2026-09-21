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
  tags: ['webgl', 'gradient', 'noise', 'background', 'interactive', 'mouse'],
  description:
    'Three-color animated mesh gradient with a glowing accent-color spotlight that follows the pointer, all blended through domain-warped simplex noise. Move the mouse to drag the third color around.',
}
