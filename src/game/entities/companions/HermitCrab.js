/**
 * Hermit Crab Companion — The Collector
 *
 * A small hermit crab carrying treasures in its shell.
 * Curious, careful, always noticing small details.
 */

import { Companion } from '../Companion.js';
import { CREATURE_PALETTES } from '../../config/palette.js';

export class HermitCrab extends Companion {
  constructor(game) {
    super(game, 'hermitCrab');
    this.palette = CREATURE_PALETTES.hermitCrab;
    this.legPhase = 0;

    // Personality timing — Slow, workmanlike
    this.personality = {
      anticipationDuration: 0.18,
      settlingDuration: 0.35,
      settlingOvershoot: 0.08,
      idleThreshold: 3.0,
      reactionDelay: 0.2
    };
  }

  update(game, dt) {
    super.update(game, dt);
    // Leg animation
    this.legPhase += dt * 4;
  }

  renderCreature(ctx) {
    const p = this.palette;
    const bob = this.getBobOffset() * 0.5;
    const breath = this.getBreathScale();

    // === SHELL (spiral on back) ===
    ctx.save();
    ctx.translate(0, bob - 5);
    ctx.scale(breath, breath);

    // Shell base
    ctx.fillStyle = p.shell;
    ctx.beginPath();
    ctx.ellipse(2, -8, 22, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Shell spiral pattern
    ctx.strokeStyle = p.shellDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(5, -10, 8, Math.PI * 0.5, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(3, -8, 14, Math.PI * 0.3, Math.PI * 1.5);
    ctx.stroke();

    // Shell highlight
    ctx.fillStyle = p.shellLight;
    ctx.beginPath();
    ctx.ellipse(-5, -14, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === BODY (peeking from shell) ===
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(-8, 8 + bob, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight
    ctx.fillStyle = p.bodyLight;
    ctx.beginPath();
    ctx.ellipse(-10, 5 + bob, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // === LEGS (scuttling) ===
    ctx.strokeStyle = p.body;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1;
      const legIndex = i % 2;
      const phase = this.legPhase + legIndex * Math.PI;
      const legMove = Math.sin(phase) * 3;

      ctx.beginPath();
      ctx.moveTo(-8 + side * 8, 10 + bob);
      ctx.lineTo(-8 + side * 18 + legMove, 18 + bob + legIndex * 3);
      ctx.stroke();
    }

    // === CLAWS ===
    // Left claw (smaller)
    ctx.fillStyle = p.claws;
    ctx.beginPath();
    ctx.ellipse(-22, 6 + bob, 6, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Right claw (bigger - collector's tool)
    ctx.fillStyle = p.claws;
    ctx.beginPath();
    ctx.ellipse(-24, 12 + bob, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Claw pincers
    ctx.strokeStyle = p.shellDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, 10 + bob);
    ctx.lineTo(-32, 8 + bob);
    ctx.moveTo(-28, 14 + bob);
    ctx.lineTo(-32, 16 + bob);
    ctx.stroke();

    // === EYE STALKS ===
    const eyeScale = this.getEyeScale();

    // Left eye stalk
    ctx.strokeStyle = p.body;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 4 + bob);
    ctx.quadraticCurveTo(-15, -2 + bob, -18, -4 + bob);
    ctx.stroke();

    // Right eye stalk
    ctx.beginPath();
    ctx.moveTo(-8, 4 + bob);
    ctx.quadraticCurveTo(-8, -2 + bob, -6, -6 + bob);
    ctx.stroke();

    // Eyes on stalks
    this.drawEye(ctx, -18, -4 + bob, 4 * eyeScale, {
      base: p.shellLight,
      pupil: p.eyes,
      highlight: '#fff'
    });

    this.drawEye(ctx, -6, -6 + bob, 4 * eyeScale, {
      base: p.shellLight,
      pupil: p.eyes,
      highlight: '#fff'
    });

    // === EMOTION INDICATORS ===
    if (this.emotion === 'curious' && this.emotionIntensity > 0.3) {
      // Question mark sparkle
      ctx.fillStyle = p.shellLight;
      ctx.font = '12px sans-serif';
      ctx.fillText('?', 15, -15);
    }

    if (this.emotion === 'pleased' && this.emotionIntensity > 0.3) {
      // Little sparkles
      ctx.fillStyle = '#c9a04a';
      for (let i = 0; i < 3; i++) {
        const angle = (this.time * 2 + i * 2) % (Math.PI * 2);
        const dist = 25 + i * 5;
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * dist,
          Math.sin(angle) * dist - 10,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}
