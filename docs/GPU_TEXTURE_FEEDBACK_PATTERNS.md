# GPU Texture Feedback Patterns

A comprehensive guide to creating visual effects using textures as persistent state with feedback loops.

## Core Concept: Ping-Pong Buffers

All these effects share a common pattern - using two textures that swap each frame:

```
Frame N:                         Frame N+1:
┌──────────────┐                ┌──────────────┐
│  Texture A   │ ──── read ───→ │   Shader     │
│  (current)   │                │  (process)   │
└──────────────┘                └──────┬───────┘
       ↑                               │
       │                               ↓ write
       │                        ┌──────────────┐
       └─────── swap ───────────│  Texture B   │
                                │   (next)     │
                                └──────────────┘
```

**Why two textures?** GPUs can't read and write to the same texture simultaneously. We read from A, write to B, then swap.

---

## 1. Smoke/Fluid Simulation

**What's stored:** Velocity (vec2) + Density (float)

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. INPUT: Add velocity/density at mouse position       │
│     └─→ Splat shader: Gaussian blob at click point     │
│                                                         │
│  2. ADVECTION: Move quantities along velocity field     │
│     └─→ For each pixel, look "backwards" along velocity │
│         and sample what was there                       │
│                                                         │
│  3. PRESSURE: Make fluid incompressible                 │
│     └─→ Divergence: How much fluid "created" per pixel  │
│     └─→ Jacobi iteration: Solve pressure equation       │
│     └─→ Gradient subtract: Remove divergence            │
│                                                         │
│  4. DISSIPATION: Fade over time (multiply by 0.99)      │
└─────────────────────────────────────────────────────────┘
```

**Key Shader - Advection:**
```glsl
// Look backwards along velocity to find source
vec2 prevUV = uv - velocity * dt;
color = texture(source, prevUV) * dissipation;
```

**Resources:**
- Jos Stam's "Stable Fluids" paper (1999)
- GPU Gems Chapter 38

---

## 2. Flow Field / Vector Field

**What's stored:** Direction vectors (vec2) per pixel

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. INITIALIZE: Fill texture with noise or pattern      │
│     └─→ Perlin/Simplex noise for organic flow          │
│                                                         │
│  2. PARTICLES: Spawn particles, sample field at pos     │
│     └─→ velocity = texture(flowField, particle.pos)    │
│     └─→ particle.pos += velocity * dt                  │
│                                                         │
│  3. UPDATE (optional): Modify field based on input      │
│     └─→ Mouse interaction adds curl/rotation           │
│     └─→ Time-based animation of vectors                │
│                                                         │
│  4. RENDER: Draw particles as points/trails             │
└─────────────────────────────────────────────────────────┘
```

**Key Shader - Particle Update:**
```glsl
// Sample flow direction at particle position
vec2 flowDir = texture(flowField, particleUV).xy;
// Move particle
newPosition = oldPosition + flowDir * speed * dt;
```

**Variations:**
- Curl noise for turbulent flow
- Magnetic field lines
- Wind simulation

---

## 3. Reaction-Diffusion (Gray-Scott Model)

**What's stored:** Two chemical concentrations A and B (vec2)

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. DIFFUSION: Each chemical spreads to neighbors       │
│     └─→ Laplacian: average of neighbors minus center   │
│     └─→ A diffuses faster than B (Da > Db)             │
│                                                         │
│  2. REACTION: Chemicals interact                        │
│     └─→ A + 2B → 3B  (B consumes A to reproduce)       │
│     └─→ B decays naturally (kill rate k)               │
│     └─→ A is fed in constantly (feed rate f)           │
│                                                         │
│  3. RESULT: Organic patterns emerge!                    │
│     └─→ Spots, stripes, maze-like patterns             │
│     └─→ Depends on f and k parameters                  │
└─────────────────────────────────────────────────────────┘
```

**Key Shader:**
```glsl
// Laplacian (neighbor diffusion)
float lapA = -A + 0.2 * (left.A + right.A + up.A + down.A);
float lapB = -B + 0.2 * (left.B + right.B + up.B + down.B);

// Reaction
float reaction = A * B * B;
float newA = A + (Da * lapA - reaction + f * (1.0 - A)) * dt;
float newB = B + (Db * lapB + reaction - (k + f) * B) * dt;
```

**Parameter Space:**
| f (feed) | k (kill) | Pattern |
|----------|----------|---------|
| 0.055 | 0.062 | Mitosis (dividing cells) |
| 0.030 | 0.057 | Coral/maze |
| 0.025 | 0.060 | Spots |
| 0.078 | 0.061 | Stripes/worms |

**Resources:**
- Karl Sims' Reaction-Diffusion Tutorial
- pmneila.github.io/jsexp/grayscott

---

## 4. Water Ripples

**What's stored:** Height (float) + Velocity (float)

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. INPUT: Add "splash" at click position               │
│     └─→ Set height to 1.0 in small radius              │
│                                                         │
│  2. PROPAGATION: Wave equation                          │
│     └─→ acceleration = (neighbor_avg - current) * c²   │
│     └─→ velocity += acceleration * dt                  │
│     └─→ height += velocity * dt                        │
│                                                         │
│  3. DAMPING: Energy loss over time                      │
│     └─→ velocity *= 0.99                               │
│                                                         │
│  4. RENDER: Use height as displacement or normal map    │
│     └─→ Refraction based on gradient                   │
└─────────────────────────────────────────────────────────┘
```

**Key Shader:**
```glsl
// Wave equation (2D)
float neighborAvg = (left + right + up + down) * 0.25;
float acceleration = (neighborAvg - current) * waveSpeed;

velocity = (velocity + acceleration) * damping;
height = height + velocity;
```

**Rendering Tips:**
- Use height gradient for normal mapping
- Apply refraction to background image
- Add caustics for realism

---

## 5. Trails / Ribbons / Light Painting

**What's stored:** Color/intensity history (RGB or float)

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. FADE: Darken entire texture slightly                │
│     └─→ color *= 0.95 (or subtract small amount)       │
│                                                         │
│  2. DRAW: Add new content at current position           │
│     └─→ Draw bright spot/line at cursor                │
│     └─→ Additive or max blending                       │
│                                                         │
│  3. (Optional) BLUR: Smooth the trails                  │
│     └─→ Gaussian or box blur pass                      │
│                                                         │
│  4. DISPLAY: Show accumulated result                    │
└─────────────────────────────────────────────────────────┘
```

**Key Shader:**
```glsl
// Fade existing
vec3 existing = texture(trailTexture, uv).rgb * fadeAmount;

// Add new at cursor position
float dist = distance(uv, cursorPos);
vec3 newTrail = cursorColor * smoothstep(radius, 0.0, dist);

// Combine (additive)
gl_FragColor = vec4(existing + newTrail, 1.0);
```

**Variations:**
- Particle trails (each particle draws to texture)
- Audio-reactive ribbons
- Calligraphy brushes

---

## 6. Game of Life / Cellular Automata

**What's stored:** Cell state (0 or 1, or multiple states)

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. COUNT: Sum alive neighbors (8 surrounding cells)    │
│                                                         │
│  2. RULES: Apply automaton rules                        │
│     └─→ Conway's Life:                                 │
│         - Alive + 2-3 neighbors → Stay alive           │
│         - Dead + 3 neighbors → Become alive            │
│         - Otherwise → Die                              │
│                                                         │
│  3. RENDER: Color based on state                        │
│     └─→ Can add trail effect for history               │
└─────────────────────────────────────────────────────────┘
```

**Key Shader:**
```glsl
int neighbors = 0;
for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
        if (x == 0 && y == 0) continue;
        neighbors += int(texture(state, uv + vec2(x,y) * texelSize).r > 0.5);
    }
}

bool alive = texture(state, uv).r > 0.5;
bool nextAlive = (alive && neighbors >= 2 && neighbors <= 3)
              || (!alive && neighbors == 3);
```

**Other Automata:**
- Brian's Brain (3 states)
- Wireworld (for circuit simulation)
- Langton's Ant

---

## 7. Erosion / Terrain Simulation

**What's stored:** Height map + Water level + Sediment

**The Loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. RAIN: Add water randomly across terrain             │
│                                                         │
│  2. FLOW: Water moves downhill                          │
│     └─→ Calculate gradient from height map             │
│     └─→ Transfer water to lower neighbors              │
│                                                         │
│  3. EROSION: Moving water picks up sediment             │
│     └─→ erosion ∝ water_velocity * softness            │
│     └─→ Decrease terrain height                        │
│                                                         │
│  4. DEPOSITION: Slow water drops sediment               │
│     └─→ deposition ∝ sediment / water_capacity         │
│     └─→ Increase terrain height                        │
│                                                         │
│  5. EVAPORATION: Water slowly disappears                │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Tips

### 1. Floating Point Textures
```javascript
// Required for accurate simulation
const target = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.FloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
});
```

### 2. Boundary Conditions
```glsl
// Clamp UV to prevent wrapping artifacts
vec2 safeUV = clamp(uv, texelSize, 1.0 - texelSize);

// Or wrap for seamless tiling
vec2 wrappedUV = fract(uv);
```

### 3. Stability
```glsl
// Clamp values to prevent explosion
value = clamp(value, -maxValue, maxValue);

// Use small timesteps
dt = min(delta, 0.016); // Cap at 60fps equivalent
```

### 4. Performance
- Lower resolution textures (256x256 often sufficient)
- Fewer Jacobi iterations (10-20 vs 40-50)
- Skip frames for expensive simulations
- Use half-float when full precision not needed

---

## Quick Reference

| Effect | Textures Needed | Complexity | Use Case |
|--------|-----------------|------------|----------|
| Smoke/Fluid | 2 (vel + density) | High | Artistic effects |
| Flow Field | 1 | Low | Particle systems |
| Reaction-Diffusion | 1 (vec2) | Medium | Organic patterns |
| Water Ripples | 1 (vec2) | Low | Interactive water |
| Trails | 1 | Very Low | Light painting |
| Game of Life | 1 | Very Low | Generative art |
| Erosion | 3+ | Very High | Terrain generation |

---

## Resources

- [The Book of Shaders](https://thebookofshaders.com/) - Fundamentals
- [Shadertoy](https://shadertoy.com) - Thousands of examples
- [GPU Gems](https://developer.nvidia.com/gpugems) - In-depth techniques
- [Inigo Quilez](https://iquilezles.org/) - Advanced shader math
