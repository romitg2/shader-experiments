import type { ComponentInfo } from '../../lib/types'

export const crystalFacetsInfo: ComponentInfo = {
  id: 'crystal-facets',
  name: 'Crystal Facets',
  category: 'smoke-fluid',
  tags: ['webgl', 'worley', 'voronoi', 'crystal', 'cheap', 'interactive', 'mouse'],
  description:
    'The same Worley cell search as Cell Growth, but tracking the nearest AND second-nearest cell so each pixel can be flat-shaded by its owning region\'s color (true Voronoi fill) with a thin edge line at cell boundaries — a faceted crystal/stained-glass look instead of a soft glow.',
}
