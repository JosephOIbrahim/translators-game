/**
 * Tree Entity — The Translators v2
 *
 * Swaying trees that can be shaken for micro-rewards.
 * Animal Crossing-inspired vegetation.
 */

export class Tree {
  constructor(x, y, type, size) {
    this.x = x;
    this.y = y;
    this.type = type; // 'round', 'pine', 'bush'
    this.size = size; // 0.6 - 1.4
    this.swayAngle = 0;
    this.shakeAmount = 0;
    this.shakeTime = 0;
  }

  update(dt, environment) {
    // Natural sway from wind
    this.swayAngle = environment.getSwayAt(this.x) * 0.08;

    // Shake decay with wobble
    if (this.shakeAmount > 0.01) {
      this.shakeTime += dt * 20;
      this.shakeAmount *= 0.92;
    } else {
      this.shakeAmount = 0;
      this.shakeTime = 0;
    }
  }

  shake() {
    this.shakeAmount = 1;
    this.shakeTime = 0;
  }

  render(ctx, palette, lens = null) {
    // If lens provided, render at transformed position
    if (lens && lens.ready) {
      this.renderAt(ctx, this.x, this.y, palette, lens);
    } else {
      this.renderAt(ctx, this.x, this.y, palette);
    }
  }

  /**
   * Render tree at specific position (for lens transformation)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Render X position
   * @param {number} y - Render Y position
   * @param {Object} palette - Color palette { trunk, foliage, foliageLight }
   * @param {WolframLens} lens - Optional lens for color transforms
   */
  renderAt(ctx, x, y, palette, lens = null) {
    ctx.save();
    ctx.translate(x, y);

    // Apply sway and shake
    const shakeWobble = Math.sin(this.shakeTime) * this.shakeAmount * 0.15;
    ctx.rotate(this.swayAngle + shakeWobble);
    ctx.scale(this.size, this.size);

    // Get colors (optionally transformed by lens)
    const trunkColor = lens ? lens.transformHexColor(palette.trunk) : palette.trunk;
    const foliageColor = lens ? lens.transformHexColor(palette.foliage) : palette.foliage;
    const highlightBase = palette.foliageLight || this.lightenColor(palette.foliage, 20);
    const highlightColor = lens ? lens.transformHexColor(highlightBase) : highlightBase;

    // Trunk
    ctx.fillStyle = trunkColor;
    this.drawTrunk(ctx);

    // Foliage (type-dependent)
    ctx.fillStyle = foliageColor;
    this.drawFoliage(ctx);

    // Foliage highlight
    ctx.fillStyle = highlightColor;
    this.drawFoliageHighlight(ctx);

    ctx.restore();
  }

  drawTrunk(ctx) {
    if (this.type === 'bush') {
      // Bushes have minimal trunk
      ctx.fillRect(-3, -2, 6, 12);
    } else if (this.type === 'pine') {
      ctx.fillRect(-5, -5, 10, 30);
    } else {
      // Round tree
      ctx.fillRect(-6, -5, 12, 35);
    }
  }

  drawFoliage(ctx) {
    if (this.type === 'round') {
      // Fluffy round canopy
      ctx.beginPath();
      ctx.arc(0, -28, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-15, -18, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15, -18, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'pine') {
      // Triangular pine
      ctx.beginPath();
      ctx.moveTo(0, -55);
      ctx.lineTo(-22, -10);
      ctx.lineTo(22, -10);
      ctx.closePath();
      ctx.fill();
      // Second layer
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(-18, -15);
      ctx.lineTo(18, -15);
      ctx.closePath();
      ctx.fill();
    } else {
      // Bush - low and wide
      ctx.beginPath();
      ctx.ellipse(0, -10, 25, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-12, -5, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(12, -5, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFoliageHighlight(ctx) {
    if (this.type === 'round') {
      ctx.beginPath();
      ctx.arc(-8, -35, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'pine') {
      ctx.beginPath();
      ctx.moveTo(-5, -50);
      ctx.lineTo(-15, -25);
      ctx.lineTo(-3, -25);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(-8, -15, 10, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    // Check against foliage area
    const hitRadius = this.type === 'bush' ? 25 : 35;
    const hitCenterY = this.type === 'bush' ? -10 : -25;
    return Math.sqrt(dx * dx + (dy - hitCenterY * this.size) ** 2) < hitRadius * this.size;
  }

  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `rgb(${R}, ${G}, ${B})`;
  }
}
