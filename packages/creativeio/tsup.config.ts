import { defineConfig } from 'tsup'

export default defineConfig([
  {
    // Client entry: actual components (hooks, canvas, DOM events). Everything
    // here is a client boundary for RSC-aware frameworks like Next.js.
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    // Cleaning happens once, up front, via the `build`/`dev` npm scripts —
    // NOT here. tsup runs every entry in this array concurrently, and
    // `clean: true` wipes the *entire* dist/ folder (not just this entry's
    // own output), racing against the registry entry below. Depending on
    // timing that could delete registry.d.ts right after it was written,
    // silently breaking `@waterlystudios/creativeio/registry`'s types for
    // consumers until the next lucky-timed rebuild.
    clean: false,
    external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'gsap'],
    esbuildOptions(options) {
      options.loader = { ...options.loader, '.glsl': 'text' }
    },
  },
  {
    // Server-safe entry: plain catalog metadata only, no component
    // references and no react-three-fiber/three in its dependency graph —
    // safe to import from a React Server Component.
    entry: { registry: 'src/registry.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
  },
])
