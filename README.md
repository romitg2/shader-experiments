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
