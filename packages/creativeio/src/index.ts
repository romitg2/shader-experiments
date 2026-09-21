'use client'

import type { ComponentType } from 'react'
import type { ComponentMeta } from './lib/types'
import { Fluid, fluidInfo } from './components/fluid'
import { Gradient, gradientInfo } from './components/gradient'
import { WebGLImageTransition, imageTransitionInfo } from './components/image-transition'
import { CheckerboardTextTransition, checkerboardTextInfo } from './components/checkerboard-text'
import { HoverDistortionCard, hoverDistortionInfo } from './components/hover-distortion'
import { ColorSmoke, colorSmokeInfo } from './components/color-smoke'
import { PixelInk, pixelInkInfo } from './components/pixel-ink'
import { CityGrid, cityGridInfo } from './components/city-grid'

export { Fluid, type FluidProps } from './components/fluid'
export { Gradient, type GradientProps } from './components/gradient'
export {
  WebGLImageTransition,
  type WebGLImageTransitionProps,
  type ImageTransitionEffect,
} from './components/image-transition'
export { CheckerboardTextTransition, type CheckerboardTextTransitionProps } from './components/checkerboard-text'
export { HoverDistortionCard, type HoverDistortionCardProps } from './components/hover-distortion'
export { ColorSmoke, type ColorSmokeProps } from './components/color-smoke'
export { PixelInk, type PixelInkProps } from './components/pixel-ink'
export { CityGrid, type CityGridProps } from './components/city-grid'
export type { ComponentMeta } from './lib/types'

/** id -> component, for looking up which component to render by registry id. */
export const components: Record<string, ComponentType<any>> = {
  fluid: Fluid,
  gradient: Gradient,
  'image-transition': WebGLImageTransition,
  'checkerboard-text': CheckerboardTextTransition,
  'hover-distortion': HoverDistortionCard,
  'color-smoke': ColorSmoke,
  'pixel-ink': PixelInk,
  'city-grid': CityGrid,
}

/**
 * Full catalog including component references, for consumers building their
 * own client-side gallery in one shot (non-RSC apps). Next.js/RSC apps
 * should prefer the metadata-only `@waterlystudios/creativeio/registry`
 * subpath for listing pages, and use `components` above to render.
 */
export const registry: ComponentMeta[] = [
  { ...fluidInfo, Component: Fluid },
  { ...gradientInfo, Component: Gradient },
  { ...imageTransitionInfo, Component: WebGLImageTransition },
  { ...checkerboardTextInfo, Component: CheckerboardTextTransition },
  { ...hoverDistortionInfo, Component: HoverDistortionCard },
  { ...colorSmokeInfo, Component: ColorSmoke },
  { ...pixelInkInfo, Component: PixelInk },
  { ...cityGridInfo, Component: CityGrid },
]
