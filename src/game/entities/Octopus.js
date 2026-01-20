/**
 * Octopus Entity — The Translators
 * Source: GAME_SPEC.md "OCTOPUS SPECIFICATION"
 * 
 * The guide character that follows player input and displays signals.
 */

import { PALETTE } from '../config/index.js';
import { PHYSICS } from '../config/physics.js';
import { TIMING } from '../config/timing.js';

export class Octopus {
  constructor(game) {
    this.game = game;
    
    // Position
    this.x = game.width / 2;
    this.y = game.height * 0.7;
    this.targetX = this.x;
    this.targetY = this.y;
    
    // Velocity
    this.vx = 0;
    this.vy = 0;
    
    // Animation
    this.time = 0;
    
    // Signal state (Layer 3)
    this.signalColor = null;
  }

  /**
   * Set position directly (for layer transitions)
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;
  }

  /**
   * Set target position (octopus will move toward it)
   */
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Set signal color (for Layer 3)
   */
  setSignal(colorName) {
    this.signalColor = colorName;
  }

  /**
   * Clear signal
   */
  clearSignal() {
    this.signalColor = null;
  }

  /**
   * Update physics
   * Source: GAME_SPEC.md "Movement" physics
   */
  update(game, dt) {
    this.time += dt;
    
    const { acceleration, drag } = PHYSICS.octopus;
    
    // Apply acceleration toward target
    this.vx += (this.targetX - this.x) * acceleration;
    this.vy += (this.targetY - this.y) * acceleration;
    
    // Apply drag
    this.vx *= drag;
    this.vy *= drag;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
  }

  /**
   * Render the octopus
   * Source: GAME_SPEC.md "Visual (Pixel Art)" and "Animation"
   */
  render(ctx, mouseX, mouseY) {
    const x = this.x;
    const y = this.y;
    
    // Signal glow (Layer 3)
    if (this.signalColor) {
      const pulse = 0.5 + Math.sin(this.time * TIMING.animation.signalPulseSpeed) * 0.5;
      const alpha = Math.floor(pulse * 80).toString(16).padStart(2, '0');
      ctx.fillStyle = PALETTE[this.signalColor] + alpha;
      ctx.beginPath();
      ctx.arc(x, y, 60 + pulse * 30, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Ambient glow
    const glowPulse = 0.3 + Math.sin(this.time * TIMING.animation.ambientGlowSpeed) * 0.1;
    ctx.fillStyle = `rgba(92, 255, 219, ${glowPulse})`;
    ctx.beginPath();
    ctx.arc(x, y, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // Tentacles
    ctx.strokeStyle = PALETTE.octopusTentacle;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < 6; i++) {
      const baseAngle = (i / 6) * Math.PI + Math.PI / 2 - Math.PI / 6;
      const wave = Math.sin(this.time * 2 + i * 0.8) * 0.15;
      
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(baseAngle) * 18,
        y + Math.sin(baseAngle) * 12
      );
      
      const endX = x + Math.cos(baseAngle + wave) * 35;
      const endY = y + Math.sin(baseAngle) * 30 + 15;
      const ctrlX = x + Math.cos(baseAngle + wave * 0.5) * 28;
      const ctrlY = y + Math.sin(baseAngle) * 22 + 8;
      
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();
      
      // Tentacle tip glow
      ctx.fillStyle = PALETTE.glowCyan;
      ctx.beginPath();
      ctx.arc(endX, endY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Body
    ctx.fillStyle = PALETTE.octopusBody;
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body highlight
    ctx.fillStyle = PALETTE.octopusHighlight;
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 5, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye tracking
    const { eyeTrackRange } = PHYSICS.octopus;
    const lookX = mouseX !== undefined ? 
      ((mouseX - x) / this.game.width) * eyeTrackRange.x : 0;
    const lookY = mouseY !== undefined ? 
      ((mouseY - y) / this.game.height) * eyeTrackRange.y : 0;
    
    // Left eye
    ctx.fillStyle = PALETTE.octopusEye;
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = this.signalColor ? PALETTE[this.signalColor] : PALETTE.glowCyan;
    ctx.beginPath();
    ctx.arc(x - 8 + lookX, y - 2 + lookY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.fillStyle = PALETTE.octopusEye;
    ctx.beginPath();
    ctx.ellipse(x + 8, y - 2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = this.signalColor ? PALETTE[this.signalColor] : PALETTE.glowCyan;
    ctx.beginPath();
    ctx.arc(x + 8 + lookX, y - 2 + lookY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
