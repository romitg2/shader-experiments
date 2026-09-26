import type { ComponentInfo } from '../../lib/types'

export const fireflySwarmInfo: ComponentInfo = {
  id: 'firefly-swarm',
  name: 'Firefly Swarm',
  category: 'smoke-fluid',
  tags: ['webgl', 'particles', 'standalone', 'cheap', 'ambient', 'interactive', 'mouse'],
  description:
    'Standalone: no simulation buffers, not even a ping-pong texture - each firefly\'s position is a closed-form function of a fixed home point, a per-particle phase, and time, computed fresh every frame directly in the vertex shader. Each one idles in a slow elliptical orbit and pulses its own glow, reading as living things rather than settling debris. Fireflies near the cursor drift gently toward it, like moths to light.',
}
