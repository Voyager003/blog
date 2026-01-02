---
title: "Weekly Development Notes #46"
date: 2024-10-22
tags: ["devlog", "shaders", "optimization", "conference"]
category: "log"
excerpt: "Updates on shader optimization, new brush engine features, and reflections on recent conference talks."
draft: false
---

# Weekly Development Notes #46

Another productive week! Here's the roundup.

## Shader Optimization Deep Dive

Spent several days optimizing our shader pipeline. The main bottleneck was in the blur pass.

### Before

```glsl
// Naive 9x9 box blur - 81 texture samples per pixel
for (int x = -4; x <= 4; x++) {
  for (int y = -4; y <= 4; y++) {
    color += texture(tex, uv + vec2(x, y) * texelSize);
  }
}
color /= 81.0;
```

### After

```glsl
// Separable blur - only 18 texture samples
// Horizontal pass
for (int x = -4; x <= 4; x++) {
  color += texture(tex, uv + vec2(x, 0) * texelSize) * weights[abs(x)];
}

// Vertical pass (separate shader)
for (int y = -4; y <= 4; y++) {
  color += texture(tex, uv + vec2(0, y) * texelSize) * weights[abs(y)];
}
```

**Result**: 4.5x faster blur at same quality.

## Brush Engine Progress

The new brush engine is coming along nicely:

### New Features

- [x] Pressure sensitivity curves
- [x] Tilt support
- [x] Wet-on-wet mixing
- [ ] Texture stamps (in progress)
- [ ] Custom brush shapes

### Technical Notes

The wet-on-wet mixing required a new blending approach:

```javascript
const mix = (a, b, wetness) => {
  const blend = wetness * pressure;
  return {
    r: lerp(a.r, (a.r + b.r) / 2, blend),
    g: lerp(a.g, (a.g + b.g) / 2, blend),
    b: lerp(a.b, (a.b + b.b) / 2, blend),
  };
};
```

## Conference Reflections

Attended a creative coding meetup this week. Some interesting takeaways:

1. **Process over output** - Many artists emphasized showing work-in-progress
2. **Constraints as freedom** - Limited palettes, simple shapes can spark creativity
3. **Community matters** - Sharing code and ideas benefits everyone

### Talk Notes

*"The best creative code is the code that surprises you"* - Great reminder to embrace happy accidents.

## Reading List

Currently reading:

- "The Nature of Code" by Daniel Shiffman
- "Generative Design" (2nd edition)
- Various papers on PBR and material rendering

## Next Week Goals

- [ ] Finish brush texture system
- [ ] Start planning interactive installation
- [ ] Write WebGPU tutorial
- [ ] Update portfolio site

Until next week!
