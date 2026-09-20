import { defineConfig } from 'tsup'

export default defineConfig([
  {
    // Client entry: actual components (hooks, canvas, DOM events). Everything
    // here is a client boundary for RSC-aware frameworks like Next.js.
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'three', '@react-three/fiber'],
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
