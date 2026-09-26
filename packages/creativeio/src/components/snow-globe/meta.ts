import type { ComponentInfo } from '../../lib/types'

export const snowGlobeInfo: ComponentInfo = {
  id: 'snow-globe',
  name: 'Snow Globe',
  category: 'smoke-fluid',
  tags: ['webgl', 'particles', 'gpgpu', 'physics', 'interactive', 'mouse'],
  description:
    'A different particle technique from Dust Drift\'s: no fluid velocity field, just literal per-particle position+velocity physics — gravity, drag, and a floor to settle on. The cursor doesn\'t push a shared current, it injects a direct outward-and-up kick scaled by how fast it moves, so waving through the flecks reads as shaking the globe. Everything arcs, falls, and re-settles into a resting pile on its own.',
}
