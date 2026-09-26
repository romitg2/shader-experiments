import type { ComponentInfo } from '../../lib/types'

export const portraitRevealInfo: ComponentInfo = {
  id: 'portrait-reveal',
  name: 'Portrait Reveal',
  category: 'smoke-fluid',
  tags: ['webgl', 'ascii', 'standalone', 'cheap', 'fbm', 'interactive', 'mouse'],
  description:
    'Standalone: a domain-warped FBM field (same technique as Marble/Nebula Turbulence) is rendered as ASCII everywhere, but a circular lens that follows the cursor reveals the raw smooth field underneath with a touch of chromatic aberration - the pixelated-blob-resolves-into-a-smooth-blob transition, driven by where you point.',
}
