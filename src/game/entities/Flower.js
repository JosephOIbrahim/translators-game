/**
 * Flower Entity — The Translators v2
 *
 * Gently bobbing flowers for ambient life.
 */

export class Flower {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.scale = 0.7 + Math.random() * 0.4;
    this.petalCount = 5 + Math.floor(Math.random() * 3);
    this.rotation = Math.random() * Math.PI * 2;
  }

  update(dt, environment) {
    this.bobPhase += dt * 2;
    // Slight sway from wind
    this.rotation += environment.getSwayAt(this.x) * dt * 0.3;
  }

  render(ctx, lens = null) {
    // If lens provided, render at transformed position
    if (lens && lens.ready) {
      this.renderAt(ctx, this.x, this.y, lens);
    } else {
      this.renderAt(ctx, this.x, this.y);
    }
  }

  /**
   * Render flower at specific position (for lens transformation)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Render X position
   * @param {number} y - Render Y position
   * @param {WolframLens} lens - Optional lens for color transforms
   */
  renderAt(ctx, x, y, lens = null) {
    const bob = Math.sin(this.bobPhase) * 2;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(this.scale, this.scale);

    // Get colors (optionally transformed by lens)
    const stemColor = lens ? lens.transformHexColor('#6b9b5d') : '#6b9b5d';
    const leafColor = lens ? lens.transformHexColor('#7aa86d') : '#7aa86d';
    const petalColor = lens ? lens.transformHexColor(this.color) : this.color;
    const centerColor = lens ? lens.transformHexColor('#e8c64a') : '#e8c64a';
    const highlightColor = lens ? lens.transformHexColor('#f5d66a') : '#f5d66a';

    // Stem
    ctx.strokeStyle = stemColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.sin(this.bobPhase * 0.5) * 3, 6, 0, 14);
    ctx.stroke();

    // Small leaf
    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.ellipse(4, 8, 4, 2, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Petals
    ctx.fillStyle = petalColor;
    for (let i = 0; i < this.petalCount; i++) {
      const angle = this.rotation + (i / this.petalCount) * Math.PI * 2;
      ctx.save();
      ctx.translate(0, -6);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -6, 3.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Center
    ctx.fillStyle = centerColor;
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Center highlight
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.arc(-1, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Pre-defined flower colors for variety
 */
export const FLOWER_COLORS = [
  '#e8a5b5', // Pink
  '#b8d4e8', // Light blue
  '#f5d76e', // Yellow
  '#d4a5e8', // Lavender
  '#e8c5a5', // Peach
  '#a5e8d4', // Mint
  '#e8e8a5', // Cream
  '#d97a5d'  // Coral
];
