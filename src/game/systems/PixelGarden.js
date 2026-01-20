/**
 * PixelGarden — GROW-A-GARDEN style plant system
 *
 * Visual style: CRT green phosphor pixel art with DEFINITION
 * Gameplay feel: Garden grows TOWARD the Mac, enveloping it
 *
 * Key principles:
 * - 2px pixels for sharper definition
 * - Dark outlines for readability
 * - Bright highlights for glow
 * - Plants grow from edges toward center (Mac)
 *
 * Organic growth algorithms:
 * - Sigmoid S-curve growth (slow-fast-slow)
 * - Golden angle for petal arrangement
 * - Simplex noise for natural curves
 * - L-system for fractal branching
 * - Poisson disc for natural clustering
 */

import {
  SimplexNoise,
  organicGrowth,
  GOLDEN_ANGLE,
  GOLDEN_RATIO,
  poissonDiscCircular,
  LSystem,
  clamp,
  smoothstep
} from './OrganicMath.js';

// === L-SYSTEM PRESETS ===
// Classic botanical L-systems that produce natural branching patterns
const LSYSTEM_PRESETS = {
  // Fern: Asymmetric branching, like a real fern frond
  fern: {
    axiom: 'X',
    rules: {
      'X': 'F+[[X]-X]-F[-FX]+X',
      'F': 'FF'
    },
    angle: 25,
    iterations: 4,
    lengthScale: 0.5
  },
  // Bush: Symmetric branching
  bush: {
    axiom: 'F',
    rules: {
      'F': 'FF+[+F-F-F]-[-F+F+F]'
    },
    angle: 22.5,
    iterations: 3,
    lengthScale: 0.6
  },
  // Tree: Simple binary branching
  tree: {
    axiom: 'F',
    rules: {
      'F': 'F[+F]F[-F]F'
    },
    angle: 25.7,
    iterations: 4,
    lengthScale: 0.65
  },
  // Weed: Organic, slightly random feel
  weed: {
    axiom: 'F',
    rules: {
      'F': 'F[+F]F[-F][F]'
    },
    angle: 20,
    iterations: 4,
    lengthScale: 0.55
  }
};

// === PIXEL ART PALETTE ===
// CRT green phosphor with good contrast
export const PALETTE = {
  void: '#050a05',
  darkest: '#0a140a',
  darker: '#0f1f0f',
  dark: '#152a15',
  mid: '#204020',
  light: '#306030',
  lighter: '#408040',
  bright: '#50a050',
  glow: '#70d070',
  white: '#90ff90',

  // For outlines and definition
  outline: '#081008',
  shadow: '#0a120a',

  // Accent colors
  cyan: '#40c0c0',
  teal: '#308080',
  yellow: '#90c040',
};

// === PLANT-SPECIFIC COLOR PALETTES ===
// Each plant type has its own visual identity
export const PLANT_PALETTES = {
  fern: {
    dark: '#1a4020', mid: '#2a6030', light: '#3a8040',
    bright: '#50b060', glow: '#70e080', white: '#a0ffa0'
  },
  flower: {
    dark: '#301a40', mid: '#502a60', light: '#704080',
    bright: '#9060b0', glow: '#c080ff', white: '#ffc0ff',
    petal: '#ff80c0', petalBright: '#ffa0d0'  // PINK!
  },
  mushroom: {
    dark: '#402010', mid: '#603020', light: '#904830',
    bright: '#c06040', glow: '#ff8060', white: '#ffc0a0',
    cap: '#c03030', capBright: '#e04040'  // RED cap!
  },
  crystal: {
    dark: '#102040', mid: '#204080', light: '#3060c0',
    bright: '#40a0ff', glow: '#80d0ff', white: '#c0f0ff'
  },
  moss: {
    dark: '#0a2010', mid: '#154020', light: '#206030',
    bright: '#308040', glow: '#40a050', white: '#80c080'
  },
  tallgrass: {
    dark: '#152a15', mid: '#204020', light: '#306030',
    bright: '#50a050', glow: '#70d070', white: '#90ff90'
  },
  vine: {
    dark: '#1a3020', mid: '#2a5030', light: '#3a7040',
    bright: '#50a060', glow: '#70d080', white: '#a0ffa0'
  },
  creeper: {
    dark: '#203020', mid: '#305030', light: '#407040',
    bright: '#60a060', glow: '#80d080', white: '#b0ffb0'
  }
};

// === PIXEL RENDERING UTILITIES ===
export class PixelRenderer {
  constructor(ctx, pixelSize = 3) {  // IMPACT: 2→3 for 50% larger visual presence
    this.ctx = ctx;
    this.px = pixelSize;
  }

  // Snap coordinate to pixel grid
  snap(v) {
    return Math.floor(v / this.px) * this.px;
  }

  // Draw a single "pixel"
  pixel(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.snap(x), this.snap(y), this.px, this.px);
  }

  // Draw a chunky rectangle
  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    const sx = this.snap(x);
    const sy = this.snap(y);
    const sw = Math.max(this.px, Math.ceil(w / this.px) * this.px);
    const sh = Math.max(this.px, Math.ceil(h / this.px) * this.px);
    this.ctx.fillRect(sx, sy, sw, sh);
  }

  // Draw a filled circle
  circle(cx, cy, r, color) {
    this.ctx.fillStyle = color;
    const px = this.px;
    const sr = Math.max(px, Math.ceil(r / px) * px);

    for (let y = -sr; y <= sr; y += px) {
      for (let x = -sr; x <= sr; x += px) {
        if (x * x + y * y <= sr * sr) {
          this.ctx.fillRect(this.snap(cx + x), this.snap(cy + y), px, px);
        }
      }
    }
  }

  // Draw a line with Bresenham's algorithm
  line(x1, y1, x2, y2, color, thickness = 1) {
    this.ctx.fillStyle = color;
    const px = this.px;

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? px : -px;
    const sy = y1 < y2 ? px : -px;
    let err = dx - dy;

    let x = this.snap(x1);
    let y = this.snap(y1);
    const endX = this.snap(x2);
    const endY = this.snap(y2);

    let steps = 0;
    const maxSteps = 500; // Prevent infinite loops

    while (steps < maxSteps) {
      // Draw pixel with thickness
      for (let t = 0; t < thickness; t++) {
        this.ctx.fillRect(x, y + t * px, px, px);
      }

      if (x === endX && y === endY) break;

      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
      steps++;
    }
  }

  // Vertical line (optimized for stems)
  vline(x, y1, y2, color, width = 1) {
    this.ctx.fillStyle = color;
    const sx = this.snap(x);
    const sy1 = this.snap(Math.min(y1, y2));
    const sy2 = this.snap(Math.max(y1, y2));
    const w = width * this.px;
    this.ctx.fillRect(sx - w / 2, sy1, w, sy2 - sy1);
  }

  // Soft glow (no globalAlpha issues)
  glow(cx, cy, r, color, intensity = 0.5) {
    // Parse color and create faded versions
    const alpha = Math.floor(intensity * 80);
    const alphaOuter = Math.floor(intensity * 30);

    // Outer glow
    this.ctx.fillStyle = color + Math.floor(alphaOuter).toString(16).padStart(2, '0');
    this.circle(cx, cy, r * 2, this.ctx.fillStyle);

    // Inner glow
    this.ctx.fillStyle = color + Math.floor(alpha).toString(16).padStart(2, '0');
    this.circle(cx, cy, r, this.ctx.fillStyle);
  }
}

// === GLOBAL BREATH ===
// All plants breathe together in a slow 6-second cycle
// This creates the feeling of a living organism
let globalBreathTime = 0;
export function getGlobalBreath(time) {
  return Math.sin(time * 0.17) * 0.5 + 0.5; // 0-1 over ~6 seconds
}

// === VISUAL IMPACT TUNING ===
// These multipliers amplify visual presence without changing the math
const IMPACT = {
  // Scale: 1.0 = original, higher = bigger plants
  SIZE_MULTIPLIER: 1.6,
  // Growth: higher = faster (for visible feedback during testing)
  GROWTH_SPEED_MULTIPLIER: 3.0,  // 3x faster so you SEE the growth
  // Motion: higher = more dramatic sway
  SWAY_MULTIPLIER: 3.0,
  // Lean: higher = more dramatic cursor response
  LEAN_MULTIPLIER: 2.5,
  // Density: how many plants per answer (original was 1)
  PLANTS_PER_ANSWER: 3,
};

// === PLANT BASE CLASS ===
class Plant {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.baseX = x; // Original position for lean calculations
    this.age = 0;
    this.growth = 0;
    this.targetGrowth = 1;
    // Growth duration in seconds - AMPLIFIED for visible feedback
    // Original: 12-18 seconds, Now: 4-6 seconds
    this.growthSpeed = options.growthSpeed || 0.06 + Math.random() * 0.04;
    this.growthDuration = (1 / this.growthSpeed) / IMPACT.GROWTH_SPEED_MULTIPLIER;
    this.mature = false;
    this.size = (options.size || 1) * IMPACT.SIZE_MULTIPLIER;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.swayAmount = (options.swayAmount || 0.015) * IMPACT.SWAY_MULTIPLIER;
    // Presence response
    this.leanX = 0;
    this.leanTarget = 0;
    // Noise generator for organic variation
    this.noise = new SimplexNoise(Math.random() * 10000);
  }

  update(dt, time, cursorX = null, cursorY = null) {
    this.age += dt;

    // Sigmoid S-curve growth: slow start, fast middle, slow finish
    // This replaces the linear: growth += growthSpeed * dt
    if (this.growth < this.targetGrowth) {
      this.growth = organicGrowth(this.age, this.growthDuration) * this.targetGrowth;
    }

    if (this.growth >= 0.9 && !this.mature) {
      this.mature = true;
    }

    // Presence response: lean toward cursor - AMPLIFIED
    if (cursorX !== null && this.growth > 0.3) {
      const dx = cursorX - this.baseX;
      const dist = Math.abs(dx);
      if (dist < 150) {  // Increased detection range
        // Lean toward cursor - AMPLIFIED for dramatic response
        const intensity = 1 - (dist / 150);
        this.leanTarget = Math.sign(dx) * intensity * 8 * IMPACT.LEAN_MULTIPLIER * this.growth;
      } else {
        this.leanTarget = 0;
      }
    }
    // Smooth lean interpolation
    this.leanX += (this.leanTarget - this.leanX) * dt * 2;
  }

  render(pr, time) {
    // Override in subclasses
  }

  // Get current sway including global breath
  getSway(time, multiplier = 1) {
    const breath = getGlobalBreath(time);
    const localSway = Math.sin(time * 0.3 + this.swayOffset);
    // Combine global breath with local variation + lean
    return (breath * 0.6 + localSway * 0.4) * this.swayAmount * multiplier * 10 + this.leanX;
  }
}

// === MUSHROOM ===
export class Mushroom extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.capWidth = (10 + Math.random() * 8) * this.size;
    this.capHeight = (5 + Math.random() * 4) * this.size;
    this.stemHeight = (8 + Math.random() * 8) * this.size;
    this.stemWidth = (3 + Math.random() * 2) * this.size;
    this.glowPhase = Math.random() * Math.PI * 2;
    this.palette = PLANT_PALETTES.mushroom;  // Use mushroom colors!
  }

  render(pr, time) {
    if (this.growth < 0.1) return;
    const P = this.palette;

    const g = this.growth;
    const sway = this.getSway(time, 0.8);

    const stemH = this.stemHeight * g;
    const stemW = this.stemWidth * Math.min(1, g * 1.5);
    const stemX = this.x + sway * 0.3;

    // Stem outline
    pr.rect(stemX - stemW/2 - pr.px, this.y - stemH, stemW + pr.px*2, stemH + pr.px, PALETTE.outline);
    // Stem fill - warm brown tones
    pr.rect(stemX - stemW/2, this.y - stemH, stemW, stemH, P.light);
    // Stem highlight
    pr.vline(stemX - stemW/4, this.y - stemH, this.y, P.bright, 1);

    // Cap
    if (g > 0.3) {
      const capG = (g - 0.3) / 0.7;
      const capW = this.capWidth * capG;
      const capH = this.capHeight * capG;
      const capY = this.y - stemH - capH * 0.5;
      const capX = this.x + sway;

      // Glow under cap - warm orange glow
      const glowPulse = 0.4 + Math.sin(time * 1.5 + this.glowPhase) * 0.2;
      pr.glow(capX, capY + capH * 0.3, capW * 0.4, P.glow, glowPulse * capG);

      // Cap outline
      pr.circle(capX, capY, capW/2 + pr.px, PALETTE.outline);
      // Cap body - RED dome shape!
      pr.circle(capX, capY, capW/2, P.cap);
      pr.circle(capX, capY - pr.px, capW/2 - pr.px, P.capBright);
      pr.circle(capX - pr.px, capY - pr.px*2, capW/4, P.white);

      // White spots on red cap
      if (capG > 0.6) {
        pr.pixel(capX - capW*0.2, capY - capH*0.2, '#ffffff');
        pr.pixel(capX + capW*0.15, capY - capH*0.1, '#ffffff');
        pr.pixel(capX + capW*0.05, capY - capH*0.3, '#ffffff');
      }
    }
  }
}

// === FERN ===
// TRUE L-SYSTEM fern using formal grammar generation
// Generates fractal branching patterns that stay bounded
export class Fern extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.frondCount = 2 + Math.floor(Math.random() * 2);
    this.baseLength = (4 + Math.random() * 3) * this.size; // Segment length

    // Generate L-system fronds
    this.fronds = [];
    const preset = LSYSTEM_PRESETS.fern;

    for (let i = 0; i < this.frondCount; i++) {
      const spread = 0.4;
      const baseAngle = -Math.PI / 2 + (i - (this.frondCount - 1) / 2) * spread;

      // Create L-system and generate segments
      const lsys = new LSystem(preset.axiom, preset.rules, preset.angle);
      const lstring = lsys.generate(preset.iterations);
      const segments = lsys.toSegments(
        lstring,
        baseAngle,
        this.baseLength,
        preset.lengthScale
      );

      // Find bounds to ensure it fits
      let maxDist = 0;
      segments.forEach(seg => {
        const d = Math.sqrt(seg.x2 * seg.x2 + seg.y2 * seg.y2);
        if (d > maxDist) maxDist = d;
      });

      // Scale to fit within reasonable bounds
      const targetSize = 60 * this.size;  // IMPACT: Bigger ferns (was 35)
      const scale = maxDist > 0 ? Math.min(1, targetSize / maxDist) : 1;

      this.fronds.push({
        segments: segments.map(s => ({
          x1: s.x1 * scale,
          y1: s.y1 * scale,
          x2: s.x2 * scale,
          y2: s.y2 * scale,
          depth: s.depth
        })),
        baseAngle,
        noiseSeed: Math.random() * 1000,
        unfurl: 0
      });
    }
  }

  update(dt, time) {
    super.update(dt, time);
    // Stagger unfurling of fronds
    this.fronds.forEach((frond, i) => {
      const start = i * 0.15;
      if (this.growth > start) {
        frond.unfurl = Math.min(1, (this.growth - start) / 0.5);
      }
    });
  }

  render(pr, time) {
    if (this.growth < 0.05) return;

    const sway = this.getSway(time, 1.0);

    this.fronds.forEach((frond) => {
      if (frond.unfurl < 0.1) return;

      // Calculate how many segments to show based on unfurl
      const visibleCount = Math.floor(frond.segments.length * frond.unfurl);

      // Apply sway rotation
      const swayAngle = sway * 0.05;
      const cos = Math.cos(swayAngle);
      const sin = Math.sin(swayAngle);

      for (let i = 0; i < visibleCount; i++) {
        const seg = frond.segments[i];

        // Add subtle noise variation
        const noiseOffset = this.noise.noise2D(frond.noiseSeed + i * 0.1, time * 0.2) * 2;

        // Rotate and translate segment
        const x1 = this.x + seg.x1 * cos - seg.y1 * sin + noiseOffset * 0.3;
        const y1 = this.y + seg.x1 * sin + seg.y1 * cos;
        const x2 = this.x + seg.x2 * cos - seg.y2 * sin + noiseOffset * 0.3;
        const y2 = this.y + seg.x2 * sin + seg.y2 * cos;

        // Color based on depth (trunk darker, tips lighter)
        const color = seg.depth === 0 ? PALETTE.dark :
                      seg.depth === 1 ? PALETTE.mid :
                      seg.depth === 2 ? PALETTE.light :
                      PALETTE.lighter;

        pr.line(x1, y1, x2, y2, color, 1);
      }

      // Tip highlights
      if (frond.unfurl > 0.7 && visibleCount > 0) {
        const lastSeg = frond.segments[visibleCount - 1];
        const tx = this.x + lastSeg.x2 * cos - lastSeg.y2 * sin;
        const ty = this.y + lastSeg.x2 * sin + lastSeg.y2 * cos;
        pr.pixel(tx, ty, PALETTE.bright);
      }
    });
  }
}

// === TALL GRASS ===
// Organic grass with multi-octave noise curves instead of simple sine
export class TallGrass extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.bladeCount = 4 + Math.floor(Math.random() * 4);
    this.blades = [];

    for (let i = 0; i < this.bladeCount; i++) {
      this.blades.push({
        offsetX: (Math.random() - 0.5) * 12 * this.size,
        height: (30 + Math.random() * 30) * this.size,
        // Each blade gets a unique noise seed for organic variation
        noiseSeed: Math.random() * 1000,
        // Base lean direction (slight bias)
        baseLean: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(pr, time) {
    if (this.growth < 0.1) return;

    const globalSway = this.getSway(time, 0.6);

    this.blades.forEach(blade => {
      const h = blade.height * this.growth;
      const sway = globalSway + Math.sin(time * 0.4 + blade.phase) * 0.02;

      let x = this.x + blade.offsetX;
      let y = this.y;
      const segs = Math.floor(h / (pr.px * 2));

      for (let s = 0; s < segs; s++) {
        const t = s / segs;

        // Multi-octave noise for organic curve
        // 3 frequencies combined: large waves + medium detail + fine variation
        const noiseT = t * 2 + time * 0.1; // Animate slightly over time
        const curve =
          this.noise.noise2D(blade.noiseSeed, noiseT) * 6 +           // Large wave
          this.noise.noise2D(blade.noiseSeed + 100, noiseT * 2) * 3 + // Medium detail
          this.noise.noise2D(blade.noiseSeed + 200, noiseT * 4) * 1.5; // Fine detail

        // More bend at top (t^2 weighting) + base lean direction
        const bend = (curve * t * t * 0.15) + (blade.baseLean * t) + (sway * t * t * 0.06);

        x += bend;
        y -= pr.px * 2;

        // Gradient from dark base to bright tip
        const color = t < 0.3 ? PALETTE.dark : t < 0.6 ? PALETTE.mid : t < 0.85 ? PALETTE.light : PALETTE.bright;
        pr.pixel(x, y, color);
      }
    });
  }
}

// === FLOWER ===
// Organic flower with golden angle petal arrangement
export class Flower extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.type = options.type || ['star', 'bell', 'puff'][Math.floor(Math.random() * 3)];
    // IMPACT: Increased stem height (was 18-38, now 30-65)
    this.stemHeight = (30 + Math.random() * 35) * this.size;
    this.petalCount = this.type === 'star' ? 7 : this.type === 'puff' ? 12 : 1;  // More petals!
    this.petalSize = (8 + Math.random() * 5) * this.size;  // Bigger petals!
    this.openness = 0;
    // Random rotation offset for variety
    this.angleOffset = Math.random() * Math.PI * 2;
    this.palette = PLANT_PALETTES.flower;  // PINK/PURPLE palette!
  }

  update(dt, time) {
    super.update(dt, time);
    if (this.growth > 0.5) {
      this.openness = Math.min(1, (this.growth - 0.5) / 0.5);
    }
  }

  render(pr, time) {
    if (this.growth < 0.1) return;
    const P = this.palette;

    const sway = this.getSway(time, 1.0);
    const stemH = this.stemHeight * Math.min(1, this.growth * 1.2);

    // Stem with noise-based organic curve (not just sway) - purple tinted
    let stemX = this.x;
    for (let y = 0; y < stemH; y += pr.px * 2) {
      const t = y / stemH;
      // Add subtle noise to stem curve
      const noiseCurve = this.noise.noise2D(this.x * 0.01, t * 3) * 3 * t;
      stemX = this.x + sway * t * t + noiseCurve;
      pr.pixel(stemX, this.y - y, t < 0.5 ? P.dark : P.mid);
    }

    // Flower head
    if (this.openness > 0.2) {
      const fx = stemX;
      const fy = this.y - stemH;
      const open = this.openness;

      if (this.type === 'star') {
        // Star flower with GOLDEN ANGLE arrangement - PINK PETALS!
        for (let i = 0; i < this.petalCount; i++) {
          const angle = i * GOLDEN_ANGLE + this.angleOffset;
          const radius = this.petalSize * (0.85 + i * 0.03) * open;
          const ex = fx + Math.cos(angle) * radius;
          const ey = fy + Math.sin(angle) * radius;
          // Pink petal lines!
          pr.line(fx, fy, ex, ey, P.petal, 1);
          pr.pixel(ex, ey, P.petalBright);
        }
        // Yellow center
        pr.circle(fx, fy, pr.px * 1.5, PALETTE.yellow);

      } else if (this.type === 'bell') {
        // Bell flower with organic wobble - PURPLE BELL!
        const bellH = this.petalSize * 1.5 * open;
        const bellW = this.petalSize * 1.2 * open;
        for (let dy = 0; dy < bellH; dy += pr.px) {
          const t = dy / bellH;
          const wobble = this.noise.noise2D(dy * 0.5, time * 0.5) * 0.1;
          const w = bellW * Math.sin(t * Math.PI * 0.6) * (1 + wobble);
          pr.rect(fx - w/2, fy + dy, w, pr.px, t < 0.5 ? P.bright : P.glow);
        }
        // Bell rim - bright pink
        pr.rect(fx - bellW/2, fy + bellH - pr.px, bellW, pr.px, P.petal);

      } else if (this.type === 'puff') {
        // Dandelion puff with golden angle - white/pink wisps
        const r = this.petalSize * open;
        for (let i = 0; i < this.petalCount; i++) {
          const angle = i * GOLDEN_ANGLE + this.angleOffset;
          const seedLen = r * (0.9 + this.noise.noise2D(i, 0) * 0.2);
          // Alternate pink and white wisps
          const color = i % 2 === 0 ? P.white : P.petalBright;
          pr.line(fx, fy, fx + Math.cos(angle) * seedLen, fy + Math.sin(angle) * seedLen, color, 1);
        }
        pr.circle(fx, fy, pr.px * 2, '#ffffff');
      }
    }
  }
}

// === CRYSTAL ===
export class Crystal extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    // IMPACT: More shards, bigger crystals
    this.shardCount = 3 + Math.floor(Math.random() * 3);
    this.shards = [];
    this.palette = PLANT_PALETTES.crystal;  // BLUE/CYAN palette!

    for (let i = 0; i < this.shardCount; i++) {
      this.shards.push({
        offsetX: (Math.random() - 0.5) * 16 * this.size,
        height: (20 + Math.random() * 20) * this.size,  // Taller crystals!
        width: (5 + Math.random() * 4) * this.size,
        glowPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(pr, time) {
    if (this.growth < 0.1) return;
    const P = this.palette;

    this.shards.forEach(shard => {
      const h = shard.height * this.growth;
      const w = shard.width * Math.min(1, this.growth * 1.5);
      const x = this.x + shard.offsetX;

      // BLUE Glow - more intense!
      const pulse = 0.4 + Math.sin(time * 1.2 + shard.glowPhase) * 0.2;
      pr.glow(x, this.y - h/2, h * 0.4, P.glow, pulse);

      // Crystal body - tapered - BLUE GRADIENT
      for (let dy = 0; dy < h; dy += pr.px) {
        const t = dy / h;
        const rowW = w * (1 - t * 0.7);
        const color = t < 0.3 ? P.dark : t < 0.6 ? P.mid : t < 0.8 ? P.light : P.bright;
        pr.rect(x - rowW/2, this.y - dy, rowW, pr.px, color);
      }

      // Tip highlight - bright cyan
      pr.pixel(x, this.y - h, P.white);
      pr.pixel(x, this.y - h + pr.px, P.glow);
    });
  }
}

// === VINE ===
// Organic vine with biased growth direction and noise persistence
export class Vine extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.length = (50 + Math.random() * 40) * this.size;
    this.direction = options.direction || (Math.random() > 0.5 ? 1 : -1);
    this.crawl = options.crawl !== false;
    this.vineSeed = Math.random() * 1000; // Persistent seed for this vine
    this.segments = [];
    this.generatePath();
  }

  generatePath() {
    let x = 0, y = 0;
    const segLen = 6;
    const count = Math.floor(this.length / segLen);

    // Goal direction - vines tend toward a direction
    let angle = this.crawl ? 0 : -Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const t = i / count;

      // Persistent noise creates coherent curves (same seed throughout vine)
      const noiseValue = this.noise.noise2D(this.vineSeed, t * 3);

      // Biased growth: noise variation + slight gravitropism for climbing vines
      if (this.crawl) {
        // Crawling vines wander more freely
        angle += noiseValue * 0.3;
        // Slight tendency to stay level
        angle *= 0.95;
      } else {
        // Climbing vines tend upward but weave
        angle = -Math.PI / 2 + noiseValue * 0.4;
        // Add slight droop (gravitropism) that increases with length
        angle += t * 0.2;
      }

      x += Math.cos(angle) * segLen * this.direction;
      y += Math.sin(angle) * segLen;

      // Leaves placed using golden angle for natural spacing
      const leafChance = 0.25 + this.noise.noise2D(i, this.vineSeed) * 0.1;

      this.segments.push({
        x, y,
        angle, // Store for leaf orientation
        hasLeaf: Math.random() < leafChance,
        leafSide: Math.random() > 0.5 ? 1 : -1,
        leafSize: 4 + Math.random() * 3
      });
    }
  }

  render(pr, time) {
    if (this.growth < 0.05) return;

    const visible = Math.floor(this.segments.length * this.growth);
    let prevX = this.x, prevY = this.y;

    for (let i = 0; i < visible; i++) {
      const seg = this.segments[i];
      const t = i / this.segments.length;

      // Add subtle sway animation
      const swayOffset = this.noise.noise2D(i * 0.1, time * 0.3) * 2 * t;

      const x = this.x + seg.x + swayOffset;
      const y = this.y + seg.y;

      // Vine segment - darker at base, lighter at tips
      const color = t < 0.4 ? PALETTE.dark : t < 0.7 ? PALETTE.mid : PALETTE.light;
      pr.line(prevX, prevY, x, y, PALETTE.outline, 1);
      pr.line(prevX, prevY, x, y, color, 1);

      // Leaf with organic variation
      if (seg.hasLeaf && i > 2) {
        // Leaf angle based on vine segment angle + perpendicular offset
        const leafAngle = seg.angle + seg.leafSide * (Math.PI / 2.5);
        const leafLen = seg.leafSize * this.size * Math.min(1, this.growth * 2);

        // Slight curve to leaf
        const leafEndX = x + Math.cos(leafAngle) * leafLen;
        const leafEndY = y + Math.sin(leafAngle) * leafLen;

        pr.line(x, y, leafEndX, leafEndY, PALETTE.light, 1);
        // Leaf tip highlight
        pr.pixel(leafEndX, leafEndY, PALETTE.bright);
      }

      prevX = x;
      prevY = y;
    }
  }
}

// === MOSS ===
// Organic moss with Poisson disc distribution for natural clustering
export class Moss extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.radius = (18 + Math.random() * 15) * this.size;
    this.bumps = [];

    // Generate primary bumps using Poisson disc sampling
    // This ensures natural-looking spacing (not too uniform, not too clumpy)
    const primaryBumps = poissonDiscCircular(this.radius * 0.7, 4, 12);

    primaryBumps.forEach(bump => {
      this.bumps.push({
        x: bump.x,
        y: bump.y,
        size: bump.size,
        isPrimary: true
      });

      // Add secondary smaller bumps near primary ones
      // This creates natural clustering like reaction-diffusion patterns
      if (Math.random() < 0.5) {
        const clusterCount = 1 + Math.floor(Math.random() * 2);
        for (let c = 0; c < clusterCount; c++) {
          const offsetAngle = Math.random() * Math.PI * 2;
          const offsetDist = 2 + Math.random() * 3;
          this.bumps.push({
            x: bump.x + Math.cos(offsetAngle) * offsetDist,
            y: bump.y + Math.sin(offsetAngle) * offsetDist * 0.5,
            size: bump.size * (0.4 + Math.random() * 0.3),
            isPrimary: false
          });
        }
      }
    });

    // Add some edge detail bumps
    const edgeCount = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < edgeCount; i++) {
      const angle = (i / edgeCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = this.radius * (0.5 + Math.random() * 0.2);
      this.bumps.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.35,
        size: 1.5 + Math.random() * 1.5,
        isPrimary: false
      });
    }
  }

  render(pr, time) {
    if (this.growth < 0.1) return;

    const r = this.radius * this.growth;

    // Base patch with subtle noise variation
    pr.circle(this.x, this.y, r * 0.6, PALETTE.darkest);

    // Sort bumps by y for proper layering
    const sortedBumps = [...this.bumps].sort((a, b) => a.y - b.y);

    // Bumpy texture
    sortedBumps.forEach(bump => {
      const bx = this.x + bump.x * this.growth;
      const by = this.y + bump.y * this.growth;
      const bs = bump.size * this.growth;

      // Animate subtle pulsing for organic feel
      const pulse = 1 + this.noise.noise2D(bump.x, time * 0.3) * 0.1;
      const animatedSize = bs * pulse;

      // Primary bumps are more prominent
      if (bump.isPrimary) {
        pr.circle(bx, by, animatedSize + 1, PALETTE.outline);
        pr.circle(bx, by, animatedSize, PALETTE.dark);
        pr.circle(bx, by - pr.px, animatedSize * 0.7, PALETTE.mid);
        // Highlight
        pr.pixel(bx, by - pr.px * 2, PALETTE.light);
      } else {
        pr.circle(bx, by, animatedSize, PALETTE.dark);
        pr.pixel(bx, by - pr.px, PALETTE.mid);
      }
    });
  }
}

// === CREEPER ===
// L-system based creeping vine with tendrils
// Uses formal grammar to generate natural tendril patterns
export class Creeper extends Plant {
  constructor(x, y, options = {}) {
    super(x, y, options);
    this.direction = options.direction || (Math.random() > 0.5 ? 1 : -1);
    this.baseLength = (3 + Math.random() * 2) * this.size;

    // Use weed L-system preset for organic tendril growth
    const preset = LSYSTEM_PRESETS.weed;
    const lsys = new LSystem(preset.axiom, preset.rules, preset.angle);
    const lstring = lsys.generate(3); // Fewer iterations for creeper
    const rawSegments = lsys.toSegments(
      lstring,
      this.direction > 0 ? -Math.PI / 6 : -Math.PI + Math.PI / 6, // Angle sideways
      this.baseLength,
      preset.lengthScale
    );

    // Scale and bound the creeper
    let maxDist = 0;
    rawSegments.forEach(seg => {
      const d = Math.sqrt(seg.x2 * seg.x2 + seg.y2 * seg.y2);
      if (d > maxDist) maxDist = d;
    });

    const targetSize = 40 * this.size;
    const scale = maxDist > 0 ? Math.min(1, targetSize / maxDist) : 1;

    this.segments = rawSegments.map(s => ({
      x1: s.x1 * scale * this.direction,
      y1: s.y1 * scale,
      x2: s.x2 * scale * this.direction,
      y2: s.y2 * scale,
      depth: s.depth,
      hasTendril: Math.random() < 0.15 && s.depth > 1
    }));

    // Add small leaves at some segment endpoints
    this.leaves = this.segments
      .filter((s, i) => i > 2 && Math.random() < 0.2)
      .map(s => ({
        x: s.x2,
        y: s.y2,
        size: 2 + Math.random() * 2,
        angle: Math.atan2(s.y2 - s.y1, s.x2 - s.x1) + (Math.random() - 0.5) * 0.5
      }));
  }

  render(pr, time) {
    if (this.growth < 0.05) return;

    const sway = this.getSway(time, 0.8);
    const visibleCount = Math.floor(this.segments.length * this.growth);

    // Draw segments
    for (let i = 0; i < visibleCount; i++) {
      const seg = this.segments[i];
      const t = i / this.segments.length;

      // Animate with subtle sway
      const swayOffset = sway * t * 0.1;

      const x1 = this.x + seg.x1 + swayOffset;
      const y1 = this.y + seg.y1;
      const x2 = this.x + seg.x2 + swayOffset;
      const y2 = this.y + seg.y2;

      // Color gradient along depth
      const color = seg.depth === 0 ? PALETTE.dark :
                    seg.depth === 1 ? PALETTE.mid :
                    PALETTE.light;

      pr.line(x1, y1, x2, y2, color, 1);

      // Draw curling tendrils
      if (seg.hasTendril && this.growth > 0.5) {
        const tendrilAngle = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
        const curlDir = Math.random() > 0.5 ? 1 : -1;
        let tx = x2, ty = y2;
        const tendrilLen = 3 + Math.random() * 3;

        // Spiral tendril
        for (let j = 0; j < 5; j++) {
          const a = tendrilAngle + curlDir * j * 0.6 + time * 0.5;
          const len = tendrilLen * (1 - j * 0.15);
          const nx = tx + Math.cos(a) * len * 0.5;
          const ny = ty + Math.sin(a) * len * 0.5;
          pr.line(tx, ty, nx, ny, PALETTE.lighter, 1);
          tx = nx;
          ty = ny;
        }
      }
    }

    // Draw leaves
    if (this.growth > 0.4) {
      const leafProgress = (this.growth - 0.4) / 0.6;
      const visibleLeaves = Math.floor(this.leaves.length * leafProgress);

      for (let i = 0; i < visibleLeaves; i++) {
        const leaf = this.leaves[i];
        const lx = this.x + leaf.x + sway * 0.1;
        const ly = this.y + leaf.y;
        const size = leaf.size * leafProgress;

        // Simple leaf shape
        pr.circle(lx, ly, size, PALETTE.light);
        pr.pixel(lx, ly - pr.px, PALETTE.bright);
      }
    }
  }
}

// === FIREFLY ===
// ZEN: Calm, drifting movement - not bouncy
export class Firefly {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;
    this.glowPhase = Math.random() * Math.PI * 2;
    // ZEN: Slower glow pulse
    this.glowSpeed = 0.6 + Math.random() * 0.6;
    this.moveTimer = 0;
    // ZEN: Longer dwell times between moves
    this.moveDuration = 4 + Math.random() * 5;
  }

  update(dt, time, bounds, cursorX = null, cursorY = null) {
    this.glowPhase += this.glowSpeed * dt;
    this.moveTimer += dt;

    if (this.moveTimer > this.moveDuration) {
      this.moveTimer = 0;
      this.moveDuration = 4 + Math.random() * 5;
      this.targetX = bounds.x + Math.random() * bounds.width;
      this.targetY = bounds.y + Math.random() * bounds.height;
    }

    // ZEN: Attracted to cursor if nearby
    if (cursorX !== null) {
      const dx = cursorX - this.x;
      const dy = cursorY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const pull = 0.002 * (1 - dist / 150);
        this.vx += dx * pull;
        this.vy += dy * pull;
      }
    }

    // ZEN: Much slower, driftier movement
    this.vx += (this.targetX - this.x) * 0.004;
    this.vy += (this.targetY - this.y) * 0.004;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
  }

  render(pr, time) {
    const glow = Math.max(0, Math.sin(this.glowPhase));

    if (glow > 0.2) {
      // ZEN: Softer, larger glow
      pr.glow(this.x, this.y, 6, PALETTE.glow, glow * 0.35);
      // Core
      pr.pixel(this.x, this.y, glow > 0.6 ? PALETTE.white : PALETTE.glow);
    }
  }
}

// === SEED ===
// ZEN: The planting ritual - seed falls, lands, pauses, then becomes a plant
class Seed {
  constructor(x, startY, groundY, questionId, traitValue) {
    this.x = x;
    this.y = startY;
    this.groundY = groundY;
    this.questionId = questionId;
    this.traitValue = traitValue;

    // Falling phase
    this.phase = 'falling'; // falling -> settling -> waiting -> sprouting
    this.fallSpeed = 0;
    this.maxFallSpeed = 40;
    this.fallAccel = 25;

    // Settling phase (tiny bounce)
    this.settleTime = 0;
    this.settleDuration = 0.3;

    // Waiting phase (the pause before growth)
    this.waitTime = 0;
    this.waitDuration = 0.8 + Math.random() * 0.4;

    // Visual
    this.glowPhase = Math.random() * Math.PI * 2;
    this.size = 2 + Math.random() * 2;

    // Result
    this.plant = null;
    this.done = false;
  }

  update(dt, time) {
    this.glowPhase += dt * 2;

    switch (this.phase) {
      case 'falling':
        this.fallSpeed = Math.min(this.maxFallSpeed, this.fallSpeed + this.fallAccel * dt);
        this.y += this.fallSpeed * dt;
        if (this.y >= this.groundY) {
          this.y = this.groundY;
          this.phase = 'settling';
        }
        break;

      case 'settling':
        // Tiny bounce effect
        this.settleTime += dt;
        const bounce = Math.sin(this.settleTime / this.settleDuration * Math.PI) * 3;
        this.y = this.groundY - bounce;
        if (this.settleTime >= this.settleDuration) {
          this.y = this.groundY;
          this.phase = 'waiting';
        }
        break;

      case 'waiting':
        // The sacred pause - the seed is deciding
        this.waitTime += dt;
        if (this.waitTime >= this.waitDuration) {
          this.phase = 'sprouting';
          // Create the actual plant
          this.plant = PlantFactory.createForAnswer(
            this.questionId,
            this.traitValue,
            this.x,
            this.groundY,
            this.groundY
          );
          this.done = true;
        }
        break;
    }
  }

  render(pr, time) {
    if (this.phase === 'sprouting') return; // Plant takes over

    const glow = 0.5 + Math.sin(this.glowPhase) * 0.3;

    // === IMPACT: PARTICLE TRAIL while falling ===
    if (this.phase === 'falling' && this.fallSpeed > 10) {
      for (let i = 1; i <= 4; i++) {
        const trailY = this.y - i * 6 - this.fallSpeed * 0.05 * i;
        const trailAlpha = (5 - i) / 5;
        const wobble = Math.sin(time * 8 + i) * 2;
        pr.glow(this.x + wobble, trailY, this.size * 0.5, PALETTE.glow, trailAlpha * 0.3);
      }
    }

    // === IMPACT: BURST on landing ===
    if (this.phase === 'settling' && this.settleTime < 0.15) {
      const burstProgress = this.settleTime / 0.15;
      const burstRadius = 15 + burstProgress * 20;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 2;
        const dist = burstRadius * burstProgress;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist * 0.4; // Squashed vertical
        const alpha = 1 - burstProgress;
        pr.glow(px, py, 3, PALETTE.white, alpha * 0.5);
      }
    }

    // Soft glow around seed
    pr.glow(this.x, this.y, this.size * 2.5, PALETTE.glow, glow * 0.5);

    // Seed core - larger
    pr.circle(this.x, this.y, this.size * 1.2, PALETTE.bright);
    pr.pixel(this.x, this.y - pr.px, PALETTE.white);
  }
}

// === PLANT FACTORY ===
export class PlantFactory {
  static create(type, x, y, options = {}) {
    switch (type) {
      case 'mushroom': return new Mushroom(x, y, options);
      case 'fern': return new Fern(x, y, options);
      case 'tallgrass': return new TallGrass(x, y, options);
      case 'flower': return new Flower(x, y, options);
      case 'crystal': return new Crystal(x, y, options);
      case 'vine': return new Vine(x, y, options);
      case 'moss': return new Moss(x, y, options);
      case 'creeper': return new Creeper(x, y, options);
      default: return new TallGrass(x, y, options);
    }
  }

  // Create plant based on question answer
  static createForAnswer(questionId, traitValue, x, y, groundY) {
    const options = { size: 0.8 + Math.random() * 0.4 };
    const plantY = groundY;

    switch (questionId) {
      case 'load':
        if (traitValue < 0.4) return this.create('moss', x, plantY, options);
        if (traitValue > 0.6) return this.create('fern', x, plantY, options);
        return this.create('tallgrass', x, plantY, options);

      case 'ground':
        if (traitValue < 0.4) return this.create('mushroom', x, plantY, options);
        if (traitValue > 0.6) return this.create('tallgrass', x, plantY, options);
        return this.create('flower', x, plantY, options);

      case 'leash':
        return this.create(['flower', 'tallgrass', 'fern'][Math.floor(Math.random() * 3)], x, plantY, options);

      case 'lost':
        if (traitValue > 0.6) return this.create('vine', x, plantY, { ...options, crawl: true });
        if (traitValue < 0.4) return this.create('crystal', x, plantY, options);
        return this.create('fern', x, plantY, options);

      case 'wrong':
        return this.create('flower', x, plantY, {
          ...options,
          type: traitValue < 0.4 ? 'star' : traitValue > 0.6 ? 'bell' : 'puff'
        });

      case 'fog':
        if (traitValue < 0.4) return this.create('crystal', x, plantY, options);
        if (traitValue > 0.6) return this.create('moss', x, plantY, options);
        return this.create('mushroom', x, plantY, options);

      case 'silence':
        // ZEN: Adjusted for slow growth (0.04-0.12/s range)
        const speed = traitValue < 0.4 ? 0.12 : traitValue > 0.6 ? 0.04 : 0.07;
        return this.create(
          ['flower', 'tallgrass', 'mushroom'][Math.floor(Math.random() * 3)],
          x, plantY, { ...options, growthSpeed: speed }
        );

      case 'wander':
        // Wanderers get vines and creepers - plants that explore
        if (traitValue > 0.7) return this.create('creeper', x, plantY, options);
        if (traitValue > 0.5) return this.create('vine', x, plantY, options);
        return this.create(['flower', 'crystal'][Math.floor(Math.random() * 2)], x, plantY, options);

      default:
        return this.create('tallgrass', x, plantY, options);
    }
  }
}

// === GARDEN MANAGER ===
// ZEN: The garden breathes as one. Seeds fall. Plants grow slowly.
export class PixelGarden {
  constructor(width, height, groundY) {
    this.width = width;
    this.height = height;
    this.groundY = groundY;
    this.plants = [];
    this.seeds = [];
    this.fireflies = [];
    this.renderer = null;

    // Cursor tracking for presence response
    this.cursorX = null;
    this.cursorY = null;
  }

  setRenderer(ctx, pixelSize = 2) {
    this.renderer = new PixelRenderer(ctx, pixelSize);
  }

  setCursor(x, y) {
    this.cursorX = x;
    this.cursorY = y;
  }

  addPlant(plant) {
    this.plants.push(plant);
  }

  // ZEN: Spawn a single seed that will fall and become a plant
  addSeed(questionId, traitValue, x, startY) {
    const seed = new Seed(x, startY, this.groundY, questionId, traitValue);
    this.seeds.push(seed);
  }

  // IMPACT: Spawn MULTIPLE seeds around the Mac for visual density
  addSeedAroundCenter(questionId, traitValue, centerX, centerY, radius) {
    // Spawn cluster of plants for visual impact
    const clusterSize = IMPACT.PLANTS_PER_ANSWER;

    for (let i = 0; i < clusterSize; i++) {
      // Spread plants around the center point
      const side = i % 2 === 0 ? 1 : -1;
      const spread = 60 + Math.random() * 40;
      const dist = radius * (0.5 + Math.random() * 0.5);
      const x = centerX + side * dist + (Math.random() - 0.5) * spread;

      // Stagger seed drops for visual effect
      const startY = this.groundY - 150 - Math.random() * 50 - i * 25;

      // Slight delay between seeds in cluster
      setTimeout(() => {
        this.addSeed(questionId, traitValue, x, startY);
      }, i * 150); // 150ms stagger
    }
  }

  // Legacy: Spawn plants around the Mac (for backwards compatibility)
  addPlantsAroundCenter(questionId, traitValue, centerX, centerY, radius, count = 1) {
    // ZEN: Only spawn 1 seed now
    this.addSeedAroundCenter(questionId, traitValue, centerX, centerY, radius);
  }

  // Original method for backwards compatibility
  addPlantsForAnswer(questionId, traitValue, centerX, count = 1) {
    const x = centerX + (Math.random() - 0.5) * 60;
    const startY = this.groundY - 150 - Math.random() * 50;
    this.addSeed(questionId, traitValue, x, startY);
  }

  addFirefly(x, y) {
    this.fireflies.push(new Firefly(x, y));
  }

  // Get count of mature plants (for Mac heart glow)
  getMaturePlantCount() {
    return this.plants.filter(p => p.growth > 0.5).length;
  }

  update(dt, time) {
    // Update seeds
    this.seeds.forEach(s => s.update(dt, time));

    // Convert finished seeds to plants
    const finishedSeeds = this.seeds.filter(s => s.done);
    finishedSeeds.forEach(s => {
      if (s.plant) {
        this.plants.push(s.plant);
      }
    });
    this.seeds = this.seeds.filter(s => !s.done);

    // Update plants with cursor position for presence response
    this.plants.forEach(p => p.update(dt, time, this.cursorX, this.cursorY));

    // Update fireflies
    const bounds = {
      x: 50,
      y: this.groundY - 180,
      width: this.width - 100,
      height: 130
    };
    this.fireflies.forEach(f => f.update(dt, time, bounds, this.cursorX, this.cursorY));
  }

  render(time) {
    if (!this.renderer) return;

    // Render seeds first (they're falling)
    this.seeds.forEach(s => s.render(this.renderer, time));

    // Sort plants by y for depth
    const sorted = [...this.plants].sort((a, b) => a.y - b.y);
    sorted.forEach(p => p.render(this.renderer, time));

    // Fireflies on top
    this.fireflies.forEach(f => f.render(this.renderer, time));
  }

  clear() {
    this.plants = [];
    this.seeds = [];
    this.fireflies = [];
  }
}
