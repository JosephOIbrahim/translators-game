/**
 * Particle Entity — The Translators v2
 *
 * Background ambient particles with wind influence and varied types.
 */

import { PHYSICS } from '../config/physics.js';

export class Particle {
  constructor(x, y, type = 'dust') {
    this.x = x;
    this.y = y;
    this.type = type; // 'dust', 'leaf', 'firefly', 'pollen'

    const { speedMin, speedMax, sizeMin, sizeMax, alphaMin, alphaMax } = PHYSICS.particle;

    this.speed = speedMin + Math.random() * (speedMax - speedMin);
    this.size = sizeMin + Math.random() * (sizeMax - sizeMin);
    this.alpha = alphaMin + Math.random() * (alphaMax - alphaMin);

    // Type-specific adjustments
    if (type === 'leaf') {
      this.size *= 2;
      this.speed *= 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 3;
    } else if (type === 'firefly') {
      this.size *= 1.2;
      this.speed *= 0.3;
      this.pulsePhase = Math.random() * Math.PI * 2;
    } else if (type === 'pollen') {
      this.size *= 0.6;
      this.speed *= 0.2;
      this.driftPhase = Math.random() * Math.PI * 2;
    }

    this.vx = 0;
    this.vy = -this.speed;
  }

  /**
   * Update particle position with optional wind
   */
  update(dt, height, width, windOffset = 0) {
    // Wind affects horizontal movement
    this.vx = windOffset * 0.5;

    if (this.type === 'leaf') {
      // Leaves tumble and drift
      this.rotation += this.rotationSpeed * dt;
      this.vy = this.speed * 0.5; // Fall down
      this.vx += Math.sin(this.y * 0.02) * 0.3;
    } else if (this.type === 'firefly') {
      // Fireflies meander slowly
      this.pulsePhase += dt * 3;
      this.vx += Math.sin(this.pulsePhase) * 0.2;
      this.vy = Math.cos(this.pulsePhase * 0.7) * this.speed * 0.3;
    } else if (this.type === 'pollen') {
      // Pollen drifts gently upward
      this.driftPhase += dt * 2;
      this.vx += Math.sin(this.driftPhase) * 0.3;
      this.vy = -this.speed;
    } else {
      // Dust rises
      this.vy = -this.speed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around
    if (this.y < -10) this.y = height + 10;
    if (this.y > height + 10) this.y = -10;
    if (this.x < -10) this.x = width + 10;
    if (this.x > width + 10) this.x = -10;
  }

  /**
   * Render the particle
   */
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.type === 'leaf') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = '#8ab877';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.5, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Leaf vein
      ctx.strokeStyle = '#6b9b5d';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(this.size, 0);
      ctx.stroke();
    } else if (this.type === 'firefly') {
      const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
      ctx.translate(this.x, this.y);
      // Glow
      ctx.globalAlpha = this.alpha * pulse * 0.3;
      ctx.fillStyle = '#e8d080';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 4, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.globalAlpha = this.alpha * (0.5 + pulse * 0.5);
      ctx.fillStyle = '#f5e8a0';
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'pollen') {
      ctx.fillStyle = '#f5e8c8';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Dust - warm parchment color
      ctx.fillStyle = '#d4c4a8';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Create a batch of particles with mixed types
   */
  static createBatch(count, width, height, types = ['dust']) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      particles.push(new Particle(
        Math.random() * width,
        Math.random() * height,
        type
      ));
    }
    return particles;
  }

  /**
   * Create particles for a garden environment
   */
  static createGardenBatch(count, width, height) {
    const particles = [];
    // Mostly dust/pollen, occasional leaves and fireflies
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let type;
      if (roll < 0.5) {
        type = 'dust';
      } else if (roll < 0.75) {
        type = 'pollen';
      } else if (roll < 0.92) {
        type = 'leaf';
      } else {
        type = 'firefly';
      }
      particles.push(new Particle(
        Math.random() * width,
        Math.random() * height,
        type
      ));
    }
    return particles;
  }
}
