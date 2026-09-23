import type { ComponentInfo } from './lib/types'
import { fluidInfo } from './components/fluid/meta'
import { colorSmokeInfo } from './components/color-smoke/meta'
import { pixelInkInfo } from './components/pixel-ink/meta'
import { cityGridInfo } from './components/city-grid/meta'
import { flowFieldInfo } from './components/flow-field/meta'
import { liquidMetalInfo } from './components/liquid-metal/meta'
import { neonFlowInfo } from './components/neon-flow/meta'
import { fireFlowInfo } from './components/fire-flow/meta'
import { halftoneInfo } from './components/halftone/meta'
import { particleFlowInfo } from './components/particle-flow/meta'
import { softSpreadInfo } from './components/soft-spread/meta'
import { whisperSmokeInfo } from './components/whisper-smoke/meta'
import { inkBloomInfo } from './components/ink-bloom/meta'
import { dustDriftInfo } from './components/dust-drift/meta'

/**
 * Server-safe catalog: metadata only, no component references. Published as
 * the `@waterlystudios/creativeio/registry` subpath so React Server
 * Components (Next.js App Router and friends) can list every component
 * without pulling in react-three-fiber/three — those only load once you
 * actually render a component client-side via the main entry.
 *
 * Adding a new component means adding its info import + array entry here,
 * and a re-export in index.ts — nothing else in this file changes.
 */
export const registry: ComponentInfo[] = [
  fluidInfo,
  colorSmokeInfo,
  pixelInkInfo,
  cityGridInfo,
  flowFieldInfo,
  liquidMetalInfo,
  neonFlowInfo,
  fireFlowInfo,
  halftoneInfo,
  particleFlowInfo,
  softSpreadInfo,
  whisperSmokeInfo,
  inkBloomInfo,
  dustDriftInfo,
]

export type { ComponentInfo } from './lib/types'
