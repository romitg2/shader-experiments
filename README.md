# creativeio

A monorepo (pnpm + Turborepo) housing **`@waterlystudios/creativeio`**, a growing
library of React Three Fiber / GLSL shader components, and a Next.js gallery app
that showcases them.

```
apps/
└── web/                # Next.js gallery site, consumes creativeio like any other user would
packages/
└── creativeio/          # the published library (@waterlystudios/creativeio)
```

## Getting started

```bash
pnpm install
pnpm dev      # runs the library in watch mode + the gallery dev server (via turbo)
```

Open the gallery at the printed Next.js URL — it lists every component on `/`,
and clicking one opens its own full-screen page at `/c/<id>`.

```bash
pnpm build    # builds the library, then the gallery site
pnpm lint     # oxlint across every workspace
```

## Using the library standalone

```bash
npm install @waterlystudios/creativeio
```

`react`, `react-dom`, `three`, and `@react-three/fiber` are regular dependencies of
the package, so they install automatically — no separate peer-dependency setup
required.

```jsx
import { Fluid } from '@waterlystudios/creativeio'

function App() {
  return <Fluid style={{ width: '100vw', height: '100vh' }} />
}
```

The package ships two entry points:

- **`@waterlystudios/creativeio`** — the actual components (`Fluid`, ...), plus
  a `components` id → Component map and a full `registry` (metadata + component
  references) for building a client-side catalog in one shot. Every component
  here uses hooks/canvas, so this entry is marked `"use client"` — safe to
  import from a Client Component, but not from a React Server Component.
- **`@waterlystudios/creativeio/registry`** — metadata only (`id`, `name`,
  `category`, `tags`, `description`), no component references, no
  react-three-fiber/three in its dependency graph. Safe to import from a React
  Server Component (this is what `apps/web`'s Next.js pages use to list
  components and drive `generateStaticParams`).

```js
import { registry } from '@waterlystudios/creativeio/registry'

registry.forEach(({ id, name, category, description }) => {
  console.log(id, name, category, description)
})
```

## Components

Most components share the same GPU velocity(+density) fluid sim (ping-pong
advection, Jacobi pressure solve, gradient-subtract incompressibility) behind a
different display shader. A few branch out into genuinely different techniques —
Gray-Scott reaction-diffusion (a different simulation model entirely) and several
standalone single-pass shaders (fractals, noise, Worley cells) with no simulation
buffers at all, chosen specifically to stay cheap on ordinary hardware:

| Component | id | What's different |
| --- | --- | --- |
| Fluid Simulation | `fluid` | Grayscale smoke, the baseline sim |
| Color Smoke | `color-smoke` | Density carries color, screen-blended for a luminous haze |
| Pixel Ink | `pixel-ink` | Density quantized to a randomly-dithered pixel grain |
| City Grid | `city-grid` | Density quantized to a grid of squares that grow/shrink |
| Flow Field | `flow-field` | Renders the raw velocity field as oriented strokes, not a transported dye |
| Liquid Metal | `liquid-metal` | Density gradient shaded as a fake normal — diffuse/specular/fresnel chrome look |
| Neon Flow | `neon-flow` | Sobel edge of density only — a glowing outline, no fill |
| Fire Flow | `fire-flow` | Splats carry upward buoyancy; density mapped through a fire color ramp |
| Halftone | `halftone` | Density quantized to a deterministic (non-random) grid of growing circles |
| Particle Flow | `particle-flow` | Thousands of discrete GPGPU particles advected by the velocity field, not a continuous quad |
| Soft Spread | `soft-spread` | Heavily blurred, low-opacity, transparent canvas — a barely-there translucent bloom |
| Whisper Smoke | `whisper-smoke` | Full turbulent detail kept, but low-contrast/low-opacity on a transparent canvas — faint natural wisps |
| Ink Bloom | `ink-bloom` | Pigment pools and darkens at the edge of the mass — a watercolor/ink-in-water bleed |
| Dust Drift | `dust-drift` | Sparser, slower, gentler tuning of the Particle Flow technique — ambient floating motes |
| Weather Radar | `weather-radar` | Density quantized into hard NEXRAD-style reflectivity bands instead of a smooth gradient |
| Thermal Camera | `thermal-cam` | IronBow infrared palette with a scanline/vignette overlay |
| Topographic Contour | `topo-contour` | Terrain elevation ramp with contour isolines at regular intervals |
| Radar Sweep | `radar-sweep` | Green phosphor density on a circular scope with range rings and a rotating sweep beam |
| Oscilloscope | `oscilloscope` | Samples density along one scanline and plots it as a live 1D waveform, not the 2D field |
| Field Lines | `field-lines` | Denser, thinner monochrome variant of Flow Field's strokes over a reference grid |
| Blueprint Schematic | `blueprint` | Edge-detected white contour lines on a solid blueprint-blue backdrop with a technical grid |
| Circuit Trace | `circuit-trace` | Grid cells connected by orthogonal PCB-style traces instead of filled squares |
| Coral Growth | `coral-growth` | Gray-Scott reaction-diffusion (not the fluid sim) — two chemicals self-organize into coral-like branching |
| Mitosis | `mitosis` | Same reaction-diffusion engine, different feed/kill preset — thinner winding maze-like growth |
| ASCII Fluid | `ascii-fluid` | Fluid sim rendered as monospace glyphs — density bucketed into brightness levels, looked up in a Canvas2D-built texture atlas |
| Braille Matrix | `braille-matrix` | Fluid sim rendered as a procedural 2x4 braille dot grid — no font atlas, 8x finer effective sampling than ASCII Fluid |
| CRT Terminal | `crt-terminal` | ASCII Fluid's glyph technique plus a scanline/vignette/chromatic-aberration CRT overlay |
| Portrait Reveal | `portrait-reveal` | Standalone: domain-warped FBM turbulence rendered as ASCII everywhere |
| Typographic Cloud | `typographic-cloud` | Fluid sim on a transparent canvas, rendered as fixed random letters whose opacity (not identity) tracks density |

Every component shares the category `smoke-fluid`.

See [`docs/GPU_TEXTURE_FEEDBACK_PATTERNS.md`](docs/GPU_TEXTURE_FEEDBACK_PATTERNS.md)
for the underlying GPU texture-feedback techniques these are built from.

**Uniform-mutation gotcha:** always mutate a `<shaderMaterial>`'s uniforms by
reading `.uniforms` off the live material via a ref inside `useFrame`
(`meshRef.current.material.uniforms.x.value = ...`), not by holding a
separate `useMemo`'d uniforms object in closure and mutating that. The
latter silently stops propagating to the GPU after the first frame in this
stack (React 19 + R3F 9 + Next.js production build) — every component here
follows the ref pattern for exactly this reason.

## Adding a new component

Each component lives in its own folder under `packages/creativeio/src/components/<slug>/`:

```
components/<slug>/
├── <Name>.tsx      # the component itself (client-only: hooks, canvas, DOM events)
├── shaders/*.glsl  # colocated GLSL source
├── meta.ts         # plain ComponentInfo: { id, name, category, tags, description }
│                   #   — must NOT import <Name>.tsx, keeps it server-safe
└── index.ts        # re-exports <Name> + the info object
```

Reuse the shared GPU helpers in `packages/creativeio/src/lib/` (`fbo.ts` for
ping-pong render targets, `blit.ts` for rendering a material into a target)
instead of reimplementing them — everything else about the component (uniforms,
shader logic, props) is free to be entirely custom.

Then wire it in exactly two places:

1. `packages/creativeio/src/registry.ts` — import the new info object and add
   it to the (server-safe) `registry` array.
2. `packages/creativeio/src/index.ts` — add the component to the `components`
   map and the full `registry` array.

The gallery app (`apps/web`) needs no changes — its pages render whatever is in
the registry.

## Publishing the library

```bash
pnpm --filter @waterlystudios/creativeio build
pnpm --filter @waterlystudios/creativeio publish --access public
```

## Tech stack

- Library: React Three Fiber, Three.js, GLSL shaders (inlined into the build
  output via tsup/esbuild — no loader config required downstream), TypeScript,
  tsup for bundling + type declarations (dual client/registry entry points).
- Gallery: Next.js (App Router), TypeScript.
- pnpm workspaces + Turborepo.
