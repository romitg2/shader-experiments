import type { ComponentInfo } from '../../lib/types'

export const whisperSmokeInfo: ComponentInfo = {
  id: 'whisper-smoke',
  name: 'Whisper Smoke',
  category: 'smoke-fluid',
  tags: ['webgl', 'fluid', 'subtle', 'natural', 'transparent', 'interactive', 'mouse'],
  description:
    'The same GPU fluid sim at full turbulent detail, but pushed through a narrow output curve and low alpha on a transparent canvas so it reads as faint, natural wisps rather than opaque smoke — unlike Soft Spread, no blur is applied, so fine curls stay visible even at low opacity. Fully still at rest.',
}
