import type { ComponentInfo } from '../../lib/types'

export const marbleTurbulenceInfo: ComponentInfo = {
  id: 'marble-turbulence',
  name: 'Marble Turbulence',
  category: 'smoke-fluid',
  tags: ['webgl', 'noise', 'turbulence', 'marble', 'cheap', 'interactive', 'mouse'],
  description:
    'Classic domain-warped fractional Brownian motion — a fixed 5-octave value noise warped through itself twice, the standard cheap technique for marbled/painterly turbulence (fixed cost regardless of apparent swirl complexity). Always visible — moving the cursor injects a local warp bump that ripples outward.',
}
