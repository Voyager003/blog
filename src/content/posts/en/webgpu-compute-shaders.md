---
title: "Experimenting with WebGPU Compute Shaders"
date: 2024-11-01
tags: ["webgpu", "shaders", "experiment", "particles", "gpu"]
category: "lab"
excerpt: "Early experiments with WebGPU compute shaders for real-time particle simulations and generative graphics."
draft: false
---

# Experimenting with WebGPU Compute Shaders

WebGPU is finally becoming widely available, and I've been exploring its compute shader capabilities for creative coding.

## Why WebGPU?

WebGL compute shaders (via extensions) were limited and inconsistent. WebGPU offers:

- **True compute shaders** - Not just vertex/fragment
- **Better memory model** - Explicit buffer management
- **Modern API** - Async, promise-based
- **Cross-platform** - Same code runs everywhere

## First Experiment: Particle Simulation

My first experiment was a classic particle simulation with 1 million particles.

### The Setup

```wgsl
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
  life: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  var p = particles[i];

  // Physics update
  p.vel += gravity * deltaTime;
  p.pos += p.vel * deltaTime;
  p.life -= deltaTime;

  // Respawn dead particles
  if (p.life <= 0.0) {
    p.pos = emitterPos;
    p.vel = randomVelocity(i);
    p.life = 1.0;
  }

  particles[i] = p;
}
```

### Performance Results

| Particle Count | WebGL (FPS) | WebGPU (FPS) |
|---------------|-------------|--------------|
| 100,000 | 45 | 60 |
| 500,000 | 15 | 60 |
| 1,000,000 | 5 | 60 |
| 2,000,000 | - | 45 |

## Second Experiment: Fluid Simulation

A 2D fluid simulation using the Stable Fluids algorithm.

### Key Insights

1. **Workgroup size matters** - 16x16 works well for 2D grids
2. **Memory coalescing** - Access patterns affect performance dramatically
3. **Barrier usage** - `workgroupBarrier()` for shared memory sync

```wgsl
@compute @workgroup_size(16, 16)
fn advect(@builtin(global_invocation_id) id: vec3<u32>) {
  let coord = vec2<i32>(id.xy);
  let vel = textureLoad(velocityTex, coord, 0).xy;
  let backCoord = vec2<f32>(coord) - vel * deltaTime;
  let newVal = textureSampleLevel(densityTex, sampler, backCoord);
  textureStore(outputTex, coord, newVal);
}
```

## Third Experiment: Reaction-Diffusion

Gray-Scott reaction-diffusion with real-time parameter control.

### The Beauty of Emergence

What fascinates me about reaction-diffusion is how simple rules create complex patterns. The compute shader runs thousands of iterations per second:

```wgsl
// Gray-Scott update
let laplacian = computeLaplacian(coord);
let reaction = a * b * b;

newA = a + (dA * laplacian.x - reaction + feed * (1.0 - a)) * dt;
newB = b + (dB * laplacian.y + reaction - (kill + feed) * b) * dt;
```

## Lessons Learned

1. **Start simple** - Get basic compute working before optimizing
2. **Profile early** - GPU profiling tools are essential
3. **Read the spec** - WebGPU spec is well-written and helpful
4. **Browser differences** - Chrome and Firefox have different strengths

## Resources

- [WebGPU Spec](https://www.w3.org/TR/webgpu/)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)
- [WGSL Reference](https://www.w3.org/TR/WGSL/)

## What's Next

- Implement 3D Navier-Stokes solver
- Explore machine learning inference on GPU
- Build creative tools using compute shaders
