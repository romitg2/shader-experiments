'use client'

import type { ComponentType } from 'react'
import type { ComponentMeta } from './lib/types'
import { Fluid, fluidInfo } from './components/fluid'
import { ColorSmoke, colorSmokeInfo } from './components/color-smoke'
import { PixelInk, pixelInkInfo } from './components/pixel-ink'
import { CityGrid, cityGridInfo } from './components/city-grid'
import { FlowField, flowFieldInfo } from './components/flow-field'
import { LiquidMetal, liquidMetalInfo } from './components/liquid-metal'
import { NeonFlow, neonFlowInfo } from './components/neon-flow'
import { FireFlow, fireFlowInfo } from './components/fire-flow'
import { Halftone, halftoneInfo } from './components/halftone'

export { Fluid, type FluidProps } from './components/fluid'
export { ColorSmoke, type ColorSmokeProps } from './components/color-smoke'
export { PixelInk, type PixelInkProps } from './components/pixel-ink'
export { CityGrid, type CityGridProps } from './components/city-grid'
export { FlowField, type FlowFieldProps } from './components/flow-field'
export { LiquidMetal, type LiquidMetalProps } from './components/liquid-metal'
export { NeonFlow, type NeonFlowProps } from './components/neon-flow'
export { FireFlow, type FireFlowProps } from './components/fire-flow'
export { Halftone, type HalftoneProps } from './components/halftone'
export type { ComponentMeta } from './lib/types'

/** id -> component, for looking up which component to render by registry id. */
export const components: Record<string, ComponentType<any>> = {
  fluid: Fluid,
  'color-smoke': ColorSmoke,
  'pixel-ink': PixelInk,
  'city-grid': CityGrid,
  'flow-field': FlowField,
  'liquid-metal': LiquidMetal,
  'neon-flow': NeonFlow,
  'fire-flow': FireFlow,
  halftone: Halftone,
}

/**
 * Full catalog including component references, for consumers building their
 * own client-side gallery in one shot (non-RSC apps). Next.js/RSC apps
 * should prefer the metadata-only `@waterlystudios/creativeio/registry`
 * subpath for listing pages, and use `components` above to render.
 */
export const registry: ComponentMeta[] = [
  { ...fluidInfo, Component: Fluid },
  { ...colorSmokeInfo, Component: ColorSmoke },
  { ...pixelInkInfo, Component: PixelInk },
  { ...cityGridInfo, Component: CityGrid },
  { ...flowFieldInfo, Component: FlowField },
  { ...liquidMetalInfo, Component: LiquidMetal },
  { ...neonFlowInfo, Component: NeonFlow },
  { ...fireFlowInfo, Component: FireFlow },
  { ...halftoneInfo, Component: Halftone },
]
