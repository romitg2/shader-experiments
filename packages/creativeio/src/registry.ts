import type { ComponentInfo } from './lib/types'
import { fluidInfo } from './components/fluid/meta'
import { gradientInfo } from './components/gradient/meta'

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
export const registry: ComponentInfo[] = [fluidInfo, gradientInfo]

export type { ComponentInfo } from './lib/types'
