import type { ComponentInfo } from '../../lib/types'

export const portraitRevealInfo: ComponentInfo = {
  id: 'portrait-reveal',
  name: 'Portrait Reveal',
  category: 'smoke-fluid',
  tags: ['webgl', 'ascii', 'standalone', 'cheap', 'fbm', 'interactive', 'mouse'],
  description:
    'Standalone: a domain-warped FBM turbulence field is rendered entirely as ASCII glyphs from a texture atlas. The cursor injects a local warp bump into the noise itself, so moving it pushes a flow/ripple through the pattern that dissipates once it stops - no hidden layer, no lens, just the ASCII field responding to motion.',
}
