/**
 * Wolfram Lens — The Translators v2
 *
 * Mathematical transformation system that defines how the player
 * perceives the garden. The lens IS the profile.
 *
 * Core insight: We don't profile behavior, we calibrate perception.
 * The same garden, viewed through different lenses, creates different realities.
 *
 * Transforms:
 * 1. Spatial (Möbius) — How space curves for this viewer
 * 2. Temporal — How time flows (animation timing)
 * 3. Chromatic — How colors relate (LAB rotation)
 * 4. Frequency — How detail resolves (edge sharpness)
 * 5. Salience — What draws attention
 */

// Complex number operations
const Complex = {
  create: (re, im = 0) => ({ re, im }),

  add: (a, b) => ({
    re: a.re + b.re,
    im: a.im + b.im
  }),

  sub: (a, b) => ({
    re: a.re - b.re,
    im: a.im - b.im
  }),

  mul: (a, b) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  }),

  div: (a, b) => {
    const denom = b.re * b.re + b.im * b.im;
    if (denom === 0) return { re: 0, im: 0 };
    return {
      re: (a.re * b.re + a.im * b.im) / denom,
      im: (a.im * b.re - a.re * b.im) / denom
    };
  },

  abs: (z) => Math.sqrt(z.re * z.re + z.im * z.im),

  arg: (z) => Math.atan2(z.im, z.re),

  // z^power for real power
  pow: (z, power) => {
    const r = Complex.abs(z);
    if (r === 0) return { re: 0, im: 0 };
    const theta = Complex.arg(z);
    const newR = Math.pow(r, power);
    const newTheta = theta * power;
    return {
      re: newR * Math.cos(newTheta),
      im: newR * Math.sin(newTheta)
    };
  },

  // Scale a complex number
  scale: (z, s) => ({
    re: z.re * s,
    im: z.im * s
  })
};

/**
 * Color space conversion utilities
 */
const ColorSpace = {
  // sRGB to Linear RGB
  srgbToLinear: (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  },

  // Linear RGB to sRGB
  linearToSrgb: (c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(255, v * 255)));
  },

  // RGB to XYZ
  rgbToXyz: (r, g, b) => {
    const lr = ColorSpace.srgbToLinear(r);
    const lg = ColorSpace.srgbToLinear(g);
    const lb = ColorSpace.srgbToLinear(b);

    return {
      x: 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb,
      y: 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb,
      z: 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb
    };
  },

  // XYZ to RGB
  xyzToRgb: (x, y, z) => {
    const lr =  3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
    const lg = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
    const lb =  0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

    return {
      r: ColorSpace.linearToSrgb(lr),
      g: ColorSpace.linearToSrgb(lg),
      b: ColorSpace.linearToSrgb(lb)
    };
  },

  // XYZ to LAB
  xyzToLab: (x, y, z) => {
    // D65 white point
    const xn = 0.95047, yn = 1.00000, zn = 1.08883;

    const f = (t) => t > 0.008856 ? Math.pow(t, 1/3) : (903.3 * t + 16) / 116;

    const fx = f(x / xn);
    const fy = f(y / yn);
    const fz = f(z / zn);

    return {
      L: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz)
    };
  },

  // LAB to XYZ
  labToXyz: (L, a, b) => {
    const xn = 0.95047, yn = 1.00000, zn = 1.08883;

    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const f_inv = (t) => {
      const t3 = t * t * t;
      return t3 > 0.008856 ? t3 : (116 * t - 16) / 903.3;
    };

    return {
      x: xn * f_inv(fx),
      y: yn * f_inv(fy),
      z: zn * f_inv(fz)
    };
  },

  // RGB to LAB
  rgbToLab: (r, g, b) => {
    const xyz = ColorSpace.rgbToXyz(r, g, b);
    return ColorSpace.xyzToLab(xyz.x, xyz.y, xyz.z);
  },

  // LAB to RGB
  labToRgb: (L, a, b) => {
    const xyz = ColorSpace.labToXyz(L, a, b);
    return ColorSpace.xyzToRgb(xyz.x, xyz.y, xyz.z);
  },

  // Parse hex color to RGB
  parseHex: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // RGB to hex
  toHex: (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
};

/**
 * The Wolfram Lens
 *
 * A mathematical transformation that defines perception.
 * The lens parameters ARE the cognitive profile.
 */
export class WolframLens {
  constructor() {
    // Möbius transformation parameters: w = (az + b) / (cz + d)
    // Default is identity: a=1, b=0, c=0, d=1
    this.mobius = {
      a: Complex.create(1, 0),
      b: Complex.create(0, 0),
      c: Complex.create(0, 0),
      d: Complex.create(1, 0)
    };

    // Spatial transform parameters (simpler power mapping)
    this.spatial = {
      power: 1.0,        // z^power expansion/compression
      rotation: 0,       // Angular rotation in radians
      scale: 100         // Normalization scale
    };

    // Temporal transform (animation timing)
    this.temporal = {
      exponent: 1.0,     // t^exponent time warping
      pulse: 0,          // Sinusoidal pulse amplitude
      pulseFreq: 1       // Pulse frequency
    };

    // Chromatic transform (color perception)
    this.chromatic = {
      rotation: 0,       // Hue rotation in degrees (LAB a-b plane)
      chroma: 1.0,       // Saturation multiplier
      lightness: 0       // Lightness shift
    };

    // Frequency transform (detail/edge resolution)
    this.frequency = {
      sharpness: 0.5,    // 0 = soft, 1 = sharp
      order: 3           // Filter order (Butterworth-like)
    };

    // Salience (attention weighting)
    this.salience = {
      edges: 0.5,        // Edge sensitivity
      patterns: 0.5,     // Pattern sensitivity
      novelty: 0.5,      // Novelty sensitivity
      companion: 0.5     // Social/companion focus
    };

    // Lens state
    this.ready = false;
    this.calibrating = false;
    this.confidence = 0;

    // Transform center (set by containing state)
    this.centerX = 0;
    this.centerY = 0;

    // Internal time for temporal transforms
    this.time = 0;
  }

  /**
   * Update internal time (called each frame)
   */
  updateTime(dt) {
    this.time += dt;
  }

  /**
   * Transform a position through the spatial lens
   * Uses power mapping for intuitive control
   */
  transformPosition(x, y, centerX, centerY) {
    // Convert to complex number relative to center
    const dx = x - centerX;
    const dy = y - centerY;
    const z = Complex.create(dx, dy);

    // Normalize
    const r = Complex.abs(z);
    if (r < 1) {
      // Avoid singularity at center
      return { x, y };
    }

    // Apply power mapping: z' = z^power (normalized)
    const normalized = Complex.scale(z, 1 / this.spatial.scale);
    const transformed = Complex.pow(normalized, this.spatial.power);
    const scaled = Complex.scale(transformed, this.spatial.scale);

    // Apply rotation
    if (this.spatial.rotation !== 0) {
      const cos = Math.cos(this.spatial.rotation);
      const sin = Math.sin(this.spatial.rotation);
      const rotated = {
        re: scaled.re * cos - scaled.im * sin,
        im: scaled.re * sin + scaled.im * cos
      };
      return {
        x: centerX + rotated.re,
        y: centerY + rotated.im
      };
    }

    return {
      x: centerX + scaled.re,
      y: centerY + scaled.im
    };
  }

  /**
   * Transform position using full Möbius transformation
   * w = (az + b) / (cz + d)
   * More powerful but can create extreme distortions
   */
  transformPositionMobius(x, y, centerX, centerY) {
    const z = Complex.create(x - centerX, y - centerY);

    // w = (az + b) / (cz + d)
    const num = Complex.add(Complex.mul(this.mobius.a, z), this.mobius.b);
    const den = Complex.add(Complex.mul(this.mobius.c, z), this.mobius.d);
    const w = Complex.div(num, den);

    return {
      x: centerX + w.re,
      y: centerY + w.im
    };
  }

  /**
   * Transform animation time
   * Returns warped time value
   */
  transformTime(t) {
    // Power warping
    let warped = Math.pow(Math.max(0, Math.min(1, t)), this.temporal.exponent);

    // Add pulse if configured
    if (this.temporal.pulse > 0) {
      warped += this.temporal.pulse * Math.sin(t * Math.PI * 2 * this.temporal.pulseFreq);
    }

    return Math.max(0, Math.min(1, warped));
  }

  /**
   * Transform a color through the chromatic lens
   * Works in LAB space for perceptual uniformity
   */
  transformColor(r, g, b) {
    // Convert to LAB
    const lab = ColorSpace.rgbToLab(r, g, b);

    // Rotate in a-b plane (hue rotation)
    const angle = this.chromatic.rotation * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const a2 = lab.a * cos - lab.b * sin;
    const b2 = lab.a * sin + lab.b * cos;

    // Scale chroma
    const newLab = {
      L: Math.max(0, Math.min(100, lab.L + this.chromatic.lightness)),
      a: a2 * this.chromatic.chroma,
      b: b2 * this.chromatic.chroma
    };

    // Convert back to RGB
    return ColorSpace.labToRgb(newLab.L, newLab.a, newLab.b);
  }

  /**
   * Transform a hex color string
   */
  transformHexColor(hex) {
    const rgb = ColorSpace.parseHex(hex);
    if (!rgb) return hex;

    const transformed = this.transformColor(rgb.r, rgb.g, rgb.b);
    return ColorSpace.toHex(transformed.r, transformed.g, transformed.b);
  }

  /**
   * Calibrate lens from behavioral signals
   * This is where behavior becomes perception
   */
  calibrateFrom(signals) {
    this.calibrating = true;

    // Spatial: exploration → expansion power
    // 0.0 = focused (power < 1, compress toward center)
    // 1.0 = expansive (power > 1, expand outward)
    this.spatial.power = 0.85 + (signals.exploration || 0.5) * 0.4;

    // Spatial: organization → rotation
    // Structured = no rotation, Organic = slight rotation for organic feel
    this.spatial.rotation = ((signals.organization || 0.5) - 0.5) * 0.2;

    // Temporal: pace → time exponent
    // Quick = compress time (power < 1), Deliberate = stretch time
    this.temporal.exponent = 0.7 + (signals.pace || 0.5) * 0.6;

    // Chromatic: aesthetic → hue rotation
    // Maps aesthetic preference to color harmony shift
    const aestheticMap = {
      bold: 0,
      harmonious: 15,
      balanced: 8,
      complex: 25
    };
    this.chromatic.rotation = aestheticMap[signals.aesthetic] ||
                              ((signals.aesthetic || 0.5) - 0.5) * 30;

    // Chromatic: intensity → chroma
    this.chromatic.chroma = 0.85 + (signals.intensity || 0.5) * 0.3;

    // Frequency: thoroughness → sharpness
    this.frequency.sharpness = signals.thoroughness || 0.5;

    // Salience weights from trait emphasis
    this.salience.edges = signals.exploration || 0.5;
    this.salience.patterns = signals.organization || 0.5;
    this.salience.novelty = 1 - (signals.consistency || 0.5);
    this.salience.companion = signals.connection || 0.5;

    // Update confidence
    this.confidence = signals.confidence || 0.5;

    this.ready = true;
    this.calibrating = false;

    return this;
  }

  /**
   * Smoothly update lens toward new calibration
   * For real-time evolution during gameplay
   */
  updateToward(signals, lerp = 0.1) {
    const targetLens = new WolframLens().calibrateFrom(signals);

    // Interpolate each parameter
    this.spatial.power += (targetLens.spatial.power - this.spatial.power) * lerp;
    this.spatial.rotation += (targetLens.spatial.rotation - this.spatial.rotation) * lerp;

    this.temporal.exponent += (targetLens.temporal.exponent - this.temporal.exponent) * lerp;

    this.chromatic.rotation += (targetLens.chromatic.rotation - this.chromatic.rotation) * lerp;
    this.chromatic.chroma += (targetLens.chromatic.chroma - this.chromatic.chroma) * lerp;

    this.frequency.sharpness += (targetLens.frequency.sharpness - this.frequency.sharpness) * lerp;

    Object.keys(this.salience).forEach(key => {
      this.salience[key] += (targetLens.salience[key] - this.salience[key]) * lerp;
    });

    this.confidence += (targetLens.confidence - this.confidence) * lerp;
    this.ready = true;
  }

  /**
   * Get lens parameters as Wolfram-compatible expressions
   */
  toWolfram() {
    return {
      spatial: `z^${this.spatial.power.toFixed(3)}`,
      spatialFull: this.spatial.rotation !== 0
        ? `z^${this.spatial.power.toFixed(3)} * e^(i*${this.spatial.rotation.toFixed(3)})`
        : `z^${this.spatial.power.toFixed(3)}`,
      temporal: `t^${this.temporal.exponent.toFixed(3)}`,
      chromatic: `LAB rotation ${this.chromatic.rotation.toFixed(1)}°, chroma ×${this.chromatic.chroma.toFixed(2)}`,
      frequency: `sharpness ${(this.frequency.sharpness * 100).toFixed(0)}%`,

      links: {
        spatial: `https://www.wolframalpha.com/input?i=complex+plot+z%5E${this.spatial.power.toFixed(2)}`,
        conformal: `https://www.wolframalpha.com/input?i=conformal+map+z%5E${this.spatial.power.toFixed(2)}`,
        colorWheel: `https://www.wolframalpha.com/input?i=color+wheel+rotation+${this.chromatic.rotation.toFixed(0)}+degrees`
      }
    };
  }

  /**
   * Export lens as JSON for profile storage
   */
  toJSON() {
    return {
      version: '1.0',
      spatial: { ...this.spatial },
      temporal: { ...this.temporal },
      chromatic: { ...this.chromatic },
      frequency: { ...this.frequency },
      salience: { ...this.salience },
      confidence: this.confidence,
      wolfram: this.toWolfram()
    };
  }

  /**
   * Import lens from JSON
   */
  static fromJSON(json) {
    const lens = new WolframLens();

    if (json.spatial) Object.assign(lens.spatial, json.spatial);
    if (json.temporal) Object.assign(lens.temporal, json.temporal);
    if (json.chromatic) Object.assign(lens.chromatic, json.chromatic);
    if (json.frequency) Object.assign(lens.frequency, json.frequency);
    if (json.salience) Object.assign(lens.salience, json.salience);
    if (json.confidence !== undefined) lens.confidence = json.confidence;

    lens.ready = true;
    return lens;
  }

  /**
   * Create an identity lens (no transformation)
   */
  static identity() {
    return new WolframLens();
  }

  /**
   * Create lens from profile traits
   */
  static fromProfile(profile) {
    return new WolframLens().calibrateFrom({
      exploration: profile.exploration || 0.5,
      organization: profile.organization || 0.5,
      thoroughness: profile.thoroughness || 0.5,
      pace: profile.pace || 0.5,
      aesthetic: profile.aesthetic || 0.5,
      intensity: profile.intensity || 0.5,
      consistency: profile.consistency || 0.5,
      connection: profile.connection || 0.5,
      confidence: profile.confidence || 0.5
    });
  }
}

// Export utilities for direct use
export { Complex, ColorSpace };
