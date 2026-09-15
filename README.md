# Shader Experiments

A collection of WebGL shader experiments using React Three Fiber.

## Experiments

### 1. Fluid Simulation
Interactive smoke/fluid simulation using GPU texture feedback.

![Fluid Demo](docs/fluid-demo.gif)

**Techniques:**
- Ping-pong buffers for state persistence
- Advection (moving fluid along velocity)
- Pressure solver (Jacobi iteration)
- Incompressibility (gradient subtraction)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── fluid/
│   ├── FluidDemo.jsx          # Main component
│   └── shaders/
│       ├── advection.glsl     # Move quantities along velocity
│       ├── splat.glsl         # Add force/density at mouse
│       ├── divergence.glsl    # Compute flow divergence
│       ├── pressure.glsl      # Jacobi pressure solver
│       ├── gradientSubtract.glsl  # Make incompressible
│       ├── display.glsl       # Render to screen
│       └── vertex.glsl        # Basic vertex shader
└── App.jsx
```

## Documentation

See [docs/GPU_TEXTURE_FEEDBACK_PATTERNS.md](docs/GPU_TEXTURE_FEEDBACK_PATTERNS.md) for a comprehensive guide on:

- **Smoke/Fluid** - Velocity + density advection
- **Flow Fields** - Particle systems following vector fields
- **Reaction-Diffusion** - Organic pattern generation (Gray-Scott)
- **Water Ripples** - Wave equation simulation
- **Trails/Ribbons** - Persistence effects
- **Cellular Automata** - Game of Life and variations
- **Erosion** - Terrain simulation

## Tech Stack

- React + Vite
- Three.js / React Three Fiber
- GLSL Shaders
- vite-plugin-glsl

## Resources

- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://shadertoy.com)
- [GPU Gems - Fluid Dynamics](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)
- Jos Stam's "Stable Fluids" (1999)
