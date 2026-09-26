import type { ComponentInfo } from '../../lib/types'

export const matrixRainInfo: ComponentInfo = {
  id: 'matrix-rain',
  name: 'Matrix Code Rain',
  category: 'smoke-fluid',
  tags: ['webgl', 'ascii', 'standalone', 'cheap', 'terminal', 'interactive', 'mouse'],
  description:
    'Standalone: no simulation buffers at all. Each column falls at its own hash-seeded speed with a bright head and fading tail, and every cell\'s glyph is re-rolled from a texture atlas every few frames — always visible ambient rain, with the cursor adding a soft proximity glow rather than driving the effect.',
}
