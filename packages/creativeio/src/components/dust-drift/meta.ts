import type { ComponentInfo } from '../../lib/types'

export const dustDriftInfo: ComponentInfo = {
  id: 'dust-drift',
  name: 'Dust Drift',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'particles', 'ambient', 'subtle', 'interactive', 'mouse'],
  description:
    'A gentler tuning of the same GPGPU particle technique as Particle Flow — motes with a wide soft splat, reading as floating dust stirred by a passing current rather than an energetic burst. Each mote also remembers its original position and drifts back to it once undisturbed, instead of wandering away forever, and stays faintly visible at rest rather than fading to nothing.',
}
