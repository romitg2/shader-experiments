import type { ComponentInfo } from '../../lib/types'

export const nebulaTurbulenceInfo: ComponentInfo = {
  id: 'nebula-turbulence',
  name: 'Nebula Turbulence',
  category: 'smoke-fluid',
  tags: ['webgl', 'noise', 'turbulence', 'nebula', 'cheap', 'interactive', 'mouse'],
  description:
    'The same domain-warped FBM technique as Marble Turbulence, but with a larger warp scale, a cosmic purple/pink palette, and a cheap sparse twinkling-star layer (a single hashed-cell test per pixel, not a particle system) for a nebula-cloud look. Always visible — moving the cursor injects a local warp bump that ripples outward.',
}
