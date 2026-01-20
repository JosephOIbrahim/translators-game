/**
 * Element Entity — The Translators
 * 
 * Draggable elements in Layer 2 (Arrangement).
 */

import { PALETTE } from '../config/index.js';
import { PHYSICS } from '../config/physics.js';

export class Element {
  constructor(x, y, colorName, size = 20) {
    this.x = x;
    this.y = y;
    this.colorName = colorName;
    this.size = size;
    
    // Drift velocity
    const speed = PHYSICS.element.driftSpeed;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    
    this.isDragging = false;
  }

  /**
   * Check if point is within drag radius
   */
  containsPoint(px, py) {
    const dist = Math.sqrt((px - this.x) ** 2 + (py - this.y) ** 2);
    return dist < this.size + PHYSICS.element.dragPadding;
  }

  /**
   * Update position (drift when not dragging)
   */
  update(dt, width, height) {
    if (this.isDragging) return;
    
    // Apply drift
    this.x += this.vx;
    this.y += this.vy;
    
    // Bounce off boundaries
    const { boundaryPadding } = PHYSICS.element;
    
    if (this.x < boundaryPadding.left || this.x > width - boundaryPadding.right) {
      this.vx *= -1;
      this.x = Math.max(boundaryPadding.left, Math.min(width - boundaryPadding.right, this.x));
    }
    
    if (this.y < boundaryPadding.top || this.y > height - boundaryPadding.bottom) {
      this.vy *= -1;
      this.y = Math.max(boundaryPadding.top, Math.min(height - boundaryPadding.bottom, this.y));
    }
  }

  /**
   * Set position (during drag)
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Render the element
   */
  render(ctx) {
    const color = PALETTE[this.colorName];
    
    // Glow
    ctx.fillStyle = color + (this.isDragging ? '60' : '30');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Selection ring when dragging
    if (this.isDragging) {
      ctx.strokeStyle = PALETTE.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
