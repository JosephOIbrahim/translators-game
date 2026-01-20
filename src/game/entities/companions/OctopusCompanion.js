/**
 * Octopus Companion — The Architect
 *
 * A thoughtful octopus with 8 arms for building connections.
 * Systematic, pattern-seeking, structure-oriented.
 */

import { Companion } from '../Companion.js';
import { CREATURE_PALETTES } from '../../config/palette.js';

export class OctopusCompanion extends Companion {
  constructor(game) {
    super(game, 'octopus');
    this.palette = CREATURE_PALETTES.octopus;
    this.tentaclePhases = Array(8).fill(0).map((_, i) => i * 0.5);

    // Personality timing — Thoughtful, meditative
    this.personality = {
      anticipationDuration: 0.20,
      settlingDuration: 0.40,
      settlingOvershoot: 0.05,
      idleThreshold: 3.5,
      reactionDelay: 0.25
    };
  }

  update(game, dt) {
    super.update(game, dt);
    // Update tentacle phases
    this.tentaclePhases = this.tentaclePhases.map((p, i) => p + dt * (1.5 + i * 0.1));
  }

  renderCreature(ctx) {
    const p = this.palette;
    const bob = this.getBobOffset();
    const breath = this.getBreathScale();

    // === TENTACLES (8 of them) ===
    ctx.lineCap = 'round';

    for (let i = 0; i < 8; i++) {
      const baseAngle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const wave = Math.sin(this.tentaclePhases[i]) * 0.2;

      // Tentacle gradient from body to tip
      const gradient = ctx.createLinearGradient(
        0, 0,
        Math.cos(baseAngle) * 45,
        Math.sin(baseAngle) * 40 + 20
      );
      gradient.addColorStop(0, p.body);
      gradient.addColorStop(1, p.bodyLight);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 6 - i * 0.3;

      ctx.beginPath();
      ctx.moveTo(
        Math.cos(baseAngle) * 18,
        Math.sin(baseAngle) * 14 + bob
      );

      // Curved tentacle with wave
      const midX = Math.cos(baseAngle + wave * 0.5) * 32;
      const midY = Math.sin(baseAngle) * 28 + 10 + bob;
      const endX = Math.cos(baseAngle + wave) * 45;
      const endY = Math.sin(baseAngle) * 38 + 20 + bob;

      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      // Suckers
      ctx.fillStyle = p.suckers;
      const suckerCount = 3;
      for (let s = 0; s < suckerCount; s++) {
        const t = (s + 1) / (suckerCount + 1);
        const sx = Math.cos(baseAngle) * 18 + (endX - Math.cos(baseAngle) * 18) * t;
        const sy = Math.sin(baseAngle) * 14 + bob + (endY - Math.sin(baseAngle) * 14 - bob) * t;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 - s * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tentacle tip glow (for architect = connection points)
      if (this.emotion === 'pleased' || this.emotion === 'curious') {
        ctx.fillStyle = p.bodyLight;
        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === BODY ===
    ctx.save();
    ctx.scale(breath, breath);

    // Main body (mantle)
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(0, bob - 5, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body spots/texture
    ctx.fillStyle = p.spots;
    const spotPositions = [
      { x: -8, y: -8, r: 4 },
      { x: 10, y: -5, r: 3 },
      { x: -3, y: 5, r: 3 },
      { x: 12, y: 3, r: 2 }
    ];
    spotPositions.forEach(spot => {
      ctx.beginPath();
      ctx.arc(spot.x, spot.y + bob, spot.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Body highlight
    ctx.fillStyle = p.bodyLight;
    ctx.beginPath();
    ctx.ellipse(-8, bob - 12, 10, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === EYES (large, expressive) ===
    const eyeScale = this.getEyeScale();
    const eyeSize = 8 * eyeScale;

    // Left eye
    ctx.fillStyle = p.eyeHighlight;
    ctx.beginPath();
    ctx.ellipse(-10, bob - 5, eyeSize + 2, eyeSize, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.eye;
    ctx.beginPath();
    ctx.arc(-10 + this.lookX, bob - 5 + this.lookY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-12 + this.lookX * 0.5, bob - 8 + this.lookY * 0.5, eyeSize * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = p.eyeHighlight;
    ctx.beginPath();
    ctx.ellipse(10, bob - 5, eyeSize + 2, eyeSize, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.eye;
    ctx.beginPath();
    ctx.arc(10 + this.lookX, bob - 5 + this.lookY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8 + this.lookX * 0.5, bob - 8 + this.lookY * 0.5, eyeSize * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // === EMOTION INDICATORS ===
    if (this.emotion === 'curious') {
      // Tentacles reach forward
      ctx.strokeStyle = p.bodyLight;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(-30, bob);
      ctx.lineTo(-45, bob - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.emotion === 'pleased') {
      // Connection lines between tentacle tips (architect building)
      ctx.strokeStyle = p.bodyLight + '60';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a1 = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 4) / 8) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a1) * 45, Math.sin(a1) * 38 + 20 + bob);
        ctx.lineTo(Math.cos(a2) * 45, Math.sin(a2) * 38 + 20 + bob);
        ctx.stroke();
      }
    }

    if (this.emotion === 'thoughtful') {
      // Contemplative ink cloud
      ctx.fillStyle = p.bodyDark + '30';
      ctx.beginPath();
      ctx.arc(20, bob + 15, 8 + Math.sin(this.time) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
