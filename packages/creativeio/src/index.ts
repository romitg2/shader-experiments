'use client'

import type { ComponentType } from 'react'
import type { ComponentMeta } from './lib/types'
import { Fluid, fluidInfo } from './components/fluid'

export { Fluid, type FluidProps } from './components/fluid'
export type { ComponentMeta } from './lib/types'

/** id -> component, for looking up which component to render by registry id. */
export const components: Record<string, ComponentType<any>> = {
  fluid: Fluid,
}

/**
 * Full catalog including component references, for consumers building their
 * own client-side gallery in one shot (non-RSC apps). Next.js/RSC apps
 * should prefer the metadata-only `@waterlystudios/creativeio/registry`
 * subpath for listing pages, and use `components` above to render.
 */
export const registry: ComponentMeta[] = [{ ...fluidInfo, Component: Fluid }]
