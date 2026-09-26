import type { ComponentInfo } from '../../lib/types'

export const crtTerminalInfo: ComponentInfo = {
  id: 'crt-terminal',
  name: 'CRT Terminal',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'ascii', 'terminal', 'crt', 'retro', 'interactive', 'mouse'],
  description:
    'The same ASCII-bucket-to-glyph-atlas technique as ASCII Fluid, with an old-monitor overlay stacked on top: per-channel atlas sampling offset for chromatic aberration fringing, a moving scanline darken, a radial vignette, and a slow phosphor flicker. The underlying smoke settles at rest, but the scanline/flicker overlay keeps animating continuously.',
}
