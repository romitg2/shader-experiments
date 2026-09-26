import type { ComponentInfo } from '../../lib/types'

export const cellGrowthInfo: ComponentInfo = {
  id: 'cell-growth',
  name: 'Cell Growth',
  category: 'smoke-fluid',
  tags: ['webgl', 'worley', 'voronoi', 'cellular', 'cheap', 'interactive', 'mouse'],
  description:
    'Worley (cellular) noise: each pixel checks only the 3x3 grid of cells around it (9 distance comparisons) for the nearest of one pseudo-random point per cell — fixed cost regardless of scale. Cells gently pulse over time like living tissue and glow brighter near the cursor.',
}
