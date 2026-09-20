# creativeio

A monorepo (pnpm + Turborepo) housing **`@waterlystudios/creativeio`**, a growing
library of React Three Fiber / GLSL shader components, and a gallery app that
showcases them.

```
apps/
└── web/                # gallery site, consumes creativeio like any other user would
packages/
└── creativeio/          # the published library (@waterlystudios/creativeio)
```

## Getting started

```bash
pnpm install
pnpm dev      # runs the library in watch mode + the gallery dev server (via turbo)
```

Open the gallery at the printed Vite URL, click into a component to see it full-screen.

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

Every component also has a metadata entry in the exported `registry`, useful if
you want to build your own catalog/browser against the library:

```js
import { registry } from '@waterlystudios/creativeio'

registry.forEach(({ id, name, category, description }) => {
  console.log(id, name, category, description)
})
```

## Components

| Component | id | Category |
| --- | --- | --- |
| Fluid Simulation | `fluid` | smoke-fluid |

More on the way — flow fields, reaction-diffusion, water ripples, trails, cellular
automata, erosion. See [`docs/GPU_TEXTURE_FEEDBACK_PATTERNS.md`](docs/GPU_TEXTURE_FEEDBACK_PATTERNS.md)
for the underlying GPU texture-feedback techniques these are built from.

## Adding a new component

Each component lives in its own folder under `packages/creativeio/src/components/<slug>/`:

```
components/<slug>/
├── <Name>.tsx      # the component itself
├── shaders/*.glsl  # colocated GLSL source
├── meta.ts         # { id, name, category, tags, description, Component }
└── index.ts        # re-exports <Name> + meta
```

Reuse the shared GPU helpers in `packages/creativeio/src/lib/` (`fbo.ts` for
ping-pong render targets, `blit.ts` for rendering a material into a target)
instead of reimplementing them — everything else about the component (uniforms,
shader logic, props) is free to be entirely custom.

Then wire it in exactly two places:

1. `packages/creativeio/src/registry.ts` — import the new `meta` and add it to
   the `registry` array.
2. `packages/creativeio/src/index.ts` — re-export the new component.

The gallery app (`apps/web`) needs no changes — its `Gallery` page renders
whatever is in `registry`.

## Publishing the library

```bash
pnpm --filter @waterlystudios/creativeio build
pnpm --filter @waterlystudios/creativeio publish --access public
```

## Tech stack

- React + Vite
- Three.js / React Three Fiber
- GLSL shaders (inlined into the library's build output via tsup/esbuild — no
  loader config required downstream)
- pnpm workspaces + Turborepo
- TypeScript (library), tsup for bundling + type declarations
