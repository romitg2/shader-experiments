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
import { ShapeReassembly, shapeReassemblyInfo } from './components/shape-reassembly'
import { SnowGlobe, snowGlobeInfo } from './components/snow-globe'
import { FireflySwarm, fireflySwarmInfo } from './components/firefly-swarm'
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
import { AsciiFluid, asciiFluidInfo } from './components/ascii-fluid'
import { BrailleMatrix, brailleMatrixInfo } from './components/braille-matrix'
import { CrtTerminal, crtTerminalInfo } from './components/crt-terminal'
import { PortraitReveal, portraitRevealInfo } from './components/portrait-reveal'
import { TypographicCloud, typographicCloudInfo } from './components/typographic-cloud'

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
export { ShapeReassembly, type ShapeReassemblyProps } from './components/shape-reassembly'
export { SnowGlobe, type SnowGlobeProps } from './components/snow-globe'
export { FireflySwarm, type FireflySwarmProps } from './components/firefly-swarm'
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
export { AsciiFluid, type AsciiFluidProps } from './components/ascii-fluid'
export { BrailleMatrix, type BrailleMatrixProps } from './components/braille-matrix'
export { CrtTerminal, type CrtTerminalProps } from './components/crt-terminal'
export { PortraitReveal, type PortraitRevealProps } from './components/portrait-reveal'
export { TypographicCloud, type TypographicCloudProps } from './components/typographic-cloud'
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
  'shape-reassembly': ShapeReassembly,
  'snow-globe': SnowGlobe,
  'firefly-swarm': FireflySwarm,
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
  'ascii-fluid': AsciiFluid,
  'braille-matrix': BrailleMatrix,
  'crt-terminal': CrtTerminal,
  'portrait-reveal': PortraitReveal,
  'typographic-cloud': TypographicCloud,
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
  { ...shapeReassemblyInfo, Component: ShapeReassembly },
  { ...snowGlobeInfo, Component: SnowGlobe },
  { ...fireflySwarmInfo, Component: FireflySwarm },
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
  { ...asciiFluidInfo, Component: AsciiFluid },
  { ...brailleMatrixInfo, Component: BrailleMatrix },
  { ...crtTerminalInfo, Component: CrtTerminal },
  { ...portraitRevealInfo, Component: PortraitReveal },
  { ...typographicCloudInfo, Component: TypographicCloud },
]
