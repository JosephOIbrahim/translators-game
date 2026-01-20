/**
 * Renderer System — The Translators
 * 
 * Handles canvas rendering utilities.
 */

import { PALETTE, LAYERS } from '../config/index.js';

export class Renderer {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
  }

  /**
   * Clear canvas with current layer background
   */
  clear() {
    const layer = LAYERS[this.game.currentLayer];
    const bg = layer ? layer.background : PALETTE.void;
    
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.game.width, this.game.height);
    
    // Subtle radial gradient overlay
    const grad = this.ctx.createRadialGradient(
      this.game.width / 2, this.game.height * 0.2, 0,
      this.game.width / 2, this.game.height * 0.2, this.game.height * 0.8
    );
    grad.addColorStop(0, 'rgba(61, 107, 90, 0.08)');
    grad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.game.width, this.game.height);
  }

  /**
   * Draw a glowing circle
   */
  drawGlowCircle(x, y, radius, color, glowAlpha = 0.3) {
    // Glow
    this.ctx.fillStyle = color + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0');
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Core
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Convert hex color to rgba
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
