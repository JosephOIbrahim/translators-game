/**
 * OrganicMath.js — Mathematical algorithms from nature
 *
 * Provides organic growth patterns to replace mechanical linear growth:
 * - SimplexNoise: Smooth, natural-looking randomness for curves
 * - sigmoidGrowth: S-curve growth (slow-fast-slow)
 * - GOLDEN_ANGLE: Nature's optimal angle for petal/leaf arrangement
 * - poissonDisc: Natural-looking point distribution with minimum spacing
 */

// === CONSTANTS ===

// Golden angle in radians (~137.5 degrees)
// This is the angle that maximizes packing efficiency in nature
// Used by sunflowers, pinecones, and many plants for seed/petal arrangement
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 radians

// Golden ratio - the ratio between consecutive Fibonacci numbers
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // ~1.618

// === SIMPLEX NOISE ===
// Based on Stefan Gustavson's implementation
// Produces smooth, continuous noise for organic curves

// Gradient vectors for 2D simplex noise
const GRAD2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

// Skewing factors for 2D simplex noise
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export class SimplexNoise {
  constructor(seed = Math.random() * 10000) {
    this.perm = new Uint8Array(512);
    this.permGrad = new Array(512);

    // Initialize permutation table with seed
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle using seed
    let s = seed;
    for (let i = 255; i > 0; i--) {
      // Simple LCG random
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }

    // Duplicate for wraparound
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permGrad[i] = GRAD2[this.perm[i] & 7];
    }
  }

  /**
   * 2D Simplex noise
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Noise value between -1 and 1
   */
  noise2D(x, y) {
    // Skew input space to determine which simplex cell we're in
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    // Unskew back to (x, y) space
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    // Determine which simplex we're in (upper or lower triangle)
    let i1, j1;
    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }

    // Offsets for corners
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    // Hash coordinates of the three simplex corners
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permGrad[ii + this.perm[jj]];
    const gi1 = this.permGrad[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permGrad[ii + 1 + this.perm[jj + 1]];

    // Calculate contribution from three corners
    let n0 = 0, n1 = 0, n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * (gi0[0] * x0 + gi0[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * (gi1[0] * x1 + gi1[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * (gi2[0] * x2 + gi2[1] * y2);
    }

    // Scale to [-1, 1]
    return 70 * (n0 + n1 + n2);
  }

  /**
   * Multi-octave noise (fractal Brownian motion)
   * Combines multiple frequencies for more natural-looking variation
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} octaves - Number of frequencies to combine
   * @param {number} persistence - How much each octave contributes (0-1)
   * @returns {number} Combined noise value
   */
  fbm(x, y, octaves = 3, persistence = 0.5) {
    let total = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

// === SIGMOID GROWTH ===

/**
 * Sigmoid S-curve growth function
 * Replaces linear growth with organic slow-fast-slow pattern
 *
 * @param {number} age - Current age in seconds
 * @param {number} duration - Total growth duration in seconds
 * @param {number} steepness - How sharp the transition is (0.2-0.8)
 * @returns {number} Growth value between 0 and 1
 */
export function sigmoidGrowth(age, duration = 15, steepness = 0.4) {
  const midpoint = duration / 2;
  const x = steepness * (age - midpoint);
  return 1 / (1 + Math.exp(-x));
}

/**
 * Eased sigmoid that starts at 0 and reaches 1 at duration
 * More natural-feeling than raw sigmoid
 *
 * @param {number} age - Current age in seconds
 * @param {number} duration - Total growth duration
 * @returns {number} Growth value between 0 and 1
 */
export function organicGrowth(age, duration = 15) {
  if (age <= 0) return 0;
  if (age >= duration) return 1;

  // Steepness scales with duration to keep consistent feel
  const steepness = 6 / duration;
  const midpoint = duration / 2;

  // Raw sigmoid
  const sig = 1 / (1 + Math.exp(-steepness * (age - midpoint)));

  // Scale to exactly 0-1 range
  const sigStart = 1 / (1 + Math.exp(-steepness * (0 - midpoint)));
  const sigEnd = 1 / (1 + Math.exp(-steepness * (duration - midpoint)));

  return (sig - sigStart) / (sigEnd - sigStart);
}

// === POISSON DISC SAMPLING ===

/**
 * Generates naturally-spaced points using Poisson disc sampling
 * Points have guaranteed minimum distance between them
 * Much more natural than uniform random distribution
 *
 * @param {number} width - Area width
 * @param {number} height - Area height
 * @param {number} minDist - Minimum distance between points
 * @param {number} maxAttempts - Attempts per point before giving up
 * @returns {Array<{x: number, y: number}>} Array of points
 */
export function poissonDisc(width, height, minDist, maxAttempts = 30) {
  const cellSize = minDist / Math.sqrt(2);
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);

  // Grid for fast neighbor lookup
  const grid = new Array(gridWidth * gridHeight).fill(-1);
  const points = [];
  const active = [];

  // Helper to get grid index
  const gridIndex = (x, y) => {
    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);
    if (gx < 0 || gx >= gridWidth || gy < 0 || gy >= gridHeight) return -1;
    return gx + gy * gridWidth;
  };

  // Check if point is valid (far enough from all neighbors)
  const isValid = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;

    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);

    // Check surrounding cells
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;

        const idx = grid[nx + ny * gridWidth];
        if (idx !== -1) {
          const other = points[idx];
          const distSq = (x - other.x) ** 2 + (y - other.y) ** 2;
          if (distSq < minDist * minDist) return false;
        }
      }
    }
    return true;
  };

  // Start with a random point
  const startX = width / 2;
  const startY = height / 2;
  points.push({ x: startX, y: startY });
  active.push(0);
  grid[gridIndex(startX, startY)] = 0;

  // Generate points
  while (active.length > 0) {
    const randIdx = Math.floor(Math.random() * active.length);
    const pointIdx = active[randIdx];
    const point = points[pointIdx];

    let found = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minDist + Math.random() * minDist;
      const newX = point.x + Math.cos(angle) * dist;
      const newY = point.y + Math.sin(angle) * dist;

      if (isValid(newX, newY)) {
        const newIdx = points.length;
        points.push({ x: newX, y: newY });
        active.push(newIdx);
        grid[gridIndex(newX, newY)] = newIdx;
        found = true;
        break;
      }
    }

    if (!found) {
      active.splice(randIdx, 1);
    }
  }

  return points;
}

/**
 * Simple Poisson disc for small areas (like moss patches)
 * Less accurate but faster for small point counts
 *
 * @param {number} radius - Circular area radius
 * @param {number} minDist - Minimum distance between points
 * @param {number} maxPoints - Maximum points to generate
 * @returns {Array<{x: number, y: number, size: number}>} Points with random sizes
 */
export function poissonDiscCircular(radius, minDist, maxPoints = 20) {
  const points = [];
  const maxAttempts = 100;

  for (let i = 0; i < maxPoints && points.length < maxPoints; i++) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Random point in circle
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist * 0.5; // Flatten vertically for perspective

      // Check distance from existing points
      let valid = true;
      for (const other of points) {
        const d = Math.sqrt((x - other.x) ** 2 + (y - other.y) ** 2);
        if (d < minDist) {
          valid = false;
          break;
        }
      }

      if (valid) {
        points.push({
          x,
          y,
          size: 2 + Math.random() * 3
        });
        break;
      }
    }
  }

  return points;
}

// === L-SYSTEM ===

/**
 * L-System grammar interpreter for fractal branching
 *
 * Axiom: Starting string
 * Rules: Production rules (e.g., { 'F': 'F[+F]F[-F]F' })
 *
 * Symbols:
 *   F = draw forward
 *   + = turn left
 *   - = turn right
 *   [ = push state (save position/angle)
 *   ] = pop state (restore position/angle)
 */
export class LSystem {
  constructor(axiom, rules, angle = 25) {
    this.axiom = axiom;
    this.rules = rules;
    this.angle = angle * Math.PI / 180; // Convert to radians
  }

  /**
   * Generate L-system string after n iterations
   */
  generate(iterations) {
    let result = this.axiom;
    for (let i = 0; i < iterations; i++) {
      let next = '';
      for (const char of result) {
        next += this.rules[char] || char;
      }
      result = next;
    }
    return result;
  }

  /**
   * Convert L-system string to drawable segments
   * @param {string} str - L-system string
   * @param {number} startAngle - Starting angle in radians
   * @param {number} length - Base segment length
   * @param {number} lengthScale - How much length shrinks per level
   * @returns {Array} Array of {x1, y1, x2, y2, depth} segments
   */
  toSegments(str, startAngle = -Math.PI / 2, length = 20, lengthScale = 0.7) {
    const segments = [];
    const stack = [];

    let x = 0, y = 0;
    let angle = startAngle;
    let depth = 0;
    let currentLength = length;

    for (const char of str) {
      switch (char) {
        case 'F':
          const x2 = x + Math.cos(angle) * currentLength;
          const y2 = y + Math.sin(angle) * currentLength;
          segments.push({ x1: x, y1: y, x2, y2, depth });
          x = x2;
          y = y2;
          break;
        case '+':
          angle -= this.angle;
          break;
        case '-':
          angle += this.angle;
          break;
        case '[':
          stack.push({ x, y, angle, depth, length: currentLength });
          depth++;
          currentLength *= lengthScale;
          break;
        case ']':
          const state = stack.pop();
          x = state.x;
          y = state.y;
          angle = state.angle;
          depth = state.depth;
          currentLength = state.length;
          break;
      }
    }

    return segments;
  }
}

// === UTILITY FUNCTIONS ===

/**
 * Smooth interpolation (ease in-out)
 */
export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}
