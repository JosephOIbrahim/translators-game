/**
 * Orb Entity — The Translators
 * 
 * Collectible orbs in Layer 1 (Exploration).
 */

import { PALETTE } from '../config/index.js';
import { PHYSICS } from '../config/physics.js';

export class Orb {
  constructor(x, y, colorName) {
    this.x = x;
    this.y = y;
    this.colorName = colorName;
    this.collected = false;
    this.pulse = Math.random() * Math.PI * 2;
  }

  /**
   * Check if point is within collection radius
   */
  containsPoint(px, py) {
    if (this.collected) return false;
    
    const dist = Math.sqrt((px - this.x) ** 2 + (py - this.y) ** 2);
    return dist < PHYSICS.orb.collectRadius;
  }

  /**
   * Mark as collected
   */
  collect() {
    this.collected = true;
  }

  /**
   * Update animation
   */
  update(dt) {
    this.pulse += PHYSICS.orb.pulseSpeed;
  }

  /**
   * Render the orb
   */
  render(ctx) {
    if (this.collected) return;
    
    const { pulseBase, pulseAmplitude } = PHYSICS.orb;
    const p = pulseBase + Math.sin(this.pulse) * pulseAmplitude;
    const color = PALETTE[this.colorName];
    
    // Glow
    ctx.fillStyle = color + '40';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 25 * p, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12 * p, 0, Math.PI * 2);
    ctx.fill();
  }
}
