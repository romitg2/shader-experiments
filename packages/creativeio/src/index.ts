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
import { ParticleFlow, particleFlowInfo } from './components/particle-flow'
import { SoftSpread, softSpreadInfo } from './components/soft-spread'
import { WhisperSmoke, whisperSmokeInfo } from './components/whisper-smoke'
import { InkBloom, inkBloomInfo } from './components/ink-bloom'
import { DustDrift, dustDriftInfo } from './components/dust-drift'
import { WeatherRadar, weatherRadarInfo } from './components/weather-radar'
import { ThermalCam, thermalCamInfo } from './components/thermal-cam'
import { TopoContour, topoContourInfo } from './components/topo-contour'
import { RadarSweep, radarSweepInfo } from './components/radar-sweep'
import { Oscilloscope, oscilloscopeInfo } from './components/oscilloscope'
import { FieldLines, fieldLinesInfo } from './components/field-lines'
import { Blueprint, blueprintInfo } from './components/blueprint'
import { CircuitTrace, circuitTraceInfo } from './components/circuit-trace'
import { CoralGrowth, coralGrowthInfo } from './components/coral-growth'
import { Mitosis, mitosisInfo } from './components/mitosis'
import { Kaleidoscope, kaleidoscopeInfo } from './components/kaleidoscope'
import { MandalaBloom, mandalaBloomInfo } from './components/mandala-bloom'
import { FractalZoom, fractalZoomInfo } from './components/fractal-zoom'
import { ApollonianWeave, apollonianWeaveInfo } from './components/apollonian-weave'
import { MarbleTurbulence, marbleTurbulenceInfo } from './components/marble-turbulence'
import { NebulaTurbulence, nebulaTurbulenceInfo } from './components/nebula-turbulence'
import { CellGrowth, cellGrowthInfo } from './components/cell-growth'
import { CrystalFacets, crystalFacetsInfo } from './components/crystal-facets'

export { Fluid, type FluidProps } from './components/fluid'
export { ColorSmoke, type ColorSmokeProps } from './components/color-smoke'
export { PixelInk, type PixelInkProps } from './components/pixel-ink'
export { CityGrid, type CityGridProps } from './components/city-grid'
export { FlowField, type FlowFieldProps } from './components/flow-field'
export { LiquidMetal, type LiquidMetalProps } from './components/liquid-metal'
export { NeonFlow, type NeonFlowProps } from './components/neon-flow'
export { FireFlow, type FireFlowProps } from './components/fire-flow'
export { Halftone, type HalftoneProps } from './components/halftone'
export { ParticleFlow, type ParticleFlowProps } from './components/particle-flow'
export { SoftSpread, type SoftSpreadProps } from './components/soft-spread'
export { WhisperSmoke, type WhisperSmokeProps } from './components/whisper-smoke'
export { InkBloom, type InkBloomProps } from './components/ink-bloom'
export { DustDrift, type DustDriftProps } from './components/dust-drift'
export { WeatherRadar, type WeatherRadarProps } from './components/weather-radar'
export { ThermalCam, type ThermalCamProps } from './components/thermal-cam'
export { TopoContour, type TopoContourProps } from './components/topo-contour'
export { RadarSweep, type RadarSweepProps } from './components/radar-sweep'
export { Oscilloscope, type OscilloscopeProps } from './components/oscilloscope'
export { FieldLines, type FieldLinesProps } from './components/field-lines'
export { Blueprint, type BlueprintProps } from './components/blueprint'
export { CircuitTrace, type CircuitTraceProps } from './components/circuit-trace'
export { CoralGrowth, type CoralGrowthProps } from './components/coral-growth'
export { Mitosis, type MitosisProps } from './components/mitosis'
export { Kaleidoscope, type KaleidoscopeProps } from './components/kaleidoscope'
export { MandalaBloom, type MandalaBloomProps } from './components/mandala-bloom'
export { FractalZoom, type FractalZoomProps } from './components/fractal-zoom'
export { ApollonianWeave, type ApollonianWeaveProps } from './components/apollonian-weave'
export { MarbleTurbulence, type MarbleTurbulenceProps } from './components/marble-turbulence'
export { NebulaTurbulence, type NebulaTurbulenceProps } from './components/nebula-turbulence'
export { CellGrowth, type CellGrowthProps } from './components/cell-growth'
export { CrystalFacets, type CrystalFacetsProps } from './components/crystal-facets'
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
  'particle-flow': ParticleFlow,
  'soft-spread': SoftSpread,
  'whisper-smoke': WhisperSmoke,
  'ink-bloom': InkBloom,
  'dust-drift': DustDrift,
  'weather-radar': WeatherRadar,
  'thermal-cam': ThermalCam,
  'topo-contour': TopoContour,
  'radar-sweep': RadarSweep,
  oscilloscope: Oscilloscope,
  'field-lines': FieldLines,
  blueprint: Blueprint,
  'circuit-trace': CircuitTrace,
  'coral-growth': CoralGrowth,
  mitosis: Mitosis,
  kaleidoscope: Kaleidoscope,
  'mandala-bloom': MandalaBloom,
  'fractal-zoom': FractalZoom,
  'apollonian-weave': ApollonianWeave,
  'marble-turbulence': MarbleTurbulence,
  'nebula-turbulence': NebulaTurbulence,
  'cell-growth': CellGrowth,
  'crystal-facets': CrystalFacets,
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
  { ...particleFlowInfo, Component: ParticleFlow },
  { ...softSpreadInfo, Component: SoftSpread },
  { ...whisperSmokeInfo, Component: WhisperSmoke },
  { ...inkBloomInfo, Component: InkBloom },
  { ...dustDriftInfo, Component: DustDrift },
  { ...weatherRadarInfo, Component: WeatherRadar },
  { ...thermalCamInfo, Component: ThermalCam },
  { ...topoContourInfo, Component: TopoContour },
  { ...radarSweepInfo, Component: RadarSweep },
  { ...oscilloscopeInfo, Component: Oscilloscope },
  { ...fieldLinesInfo, Component: FieldLines },
  { ...blueprintInfo, Component: Blueprint },
  { ...circuitTraceInfo, Component: CircuitTrace },
  { ...coralGrowthInfo, Component: CoralGrowth },
  { ...mitosisInfo, Component: Mitosis },
  { ...kaleidoscopeInfo, Component: Kaleidoscope },
  { ...mandalaBloomInfo, Component: MandalaBloom },
  { ...fractalZoomInfo, Component: FractalZoom },
  { ...apollonianWeaveInfo, Component: ApollonianWeave },
  { ...marbleTurbulenceInfo, Component: MarbleTurbulence },
  { ...nebulaTurbulenceInfo, Component: NebulaTurbulence },
  { ...cellGrowthInfo, Component: CellGrowth },
  { ...crystalFacetsInfo, Component: CrystalFacets },
]
