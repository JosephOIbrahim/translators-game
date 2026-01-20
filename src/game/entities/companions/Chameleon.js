/**
 * Chameleon Companion — The Wanderer
 *
 * A curious chameleon with a spiral tail.
 * Adapts to surroundings, always exploring.
 */

import { Companion } from '../Companion.js';
import { CREATURE_PALETTES } from '../../config/palette.js';

export class Chameleon extends Companion {
  constructor(game) {
    super(game, 'chameleon');
    this.palette = CREATURE_PALETTES.chameleon;
    this.tailCurl = 0;

    // Personality timing — Cautious, deliberate
    this.personality = {
      anticipationDuration: 0.15,
      settlingDuration: 0.30,
      settlingOvershoot: 0.10,
      idleThreshold: 2.5,
      reactionDelay: 0.15
    };
  }

  update(game, dt) {
    super.update(game, dt);
    // Tail curl animation
    this.tailCurl = Math.sin(this.time * 0.8) * 0.3;
  }

  renderCreature(ctx) {
    const p = this.palette;
    const bob = this.getBobOffset();
    const breath = this.getBreathScale();

    // === TAIL (spiral) ===
    ctx.save();
    ctx.translate(25, 10 + bob);
    ctx.rotate(this.tailCurl);

    ctx.strokeStyle = p.tail;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Spiral tail
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let t = 0; t < Math.PI * 2.5; t += 0.2) {
      const r = 15 - t * 2;
      if (r < 2) break;
      ctx.lineTo(
        Math.cos(t) * r + t * 3,
        Math.sin(t) * r
      );
    }
    ctx.stroke();

    ctx.restore();

    // === BODY ===
    ctx.save();
    ctx.scale(breath, breath);

    // Main body
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(0, bob, 28, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body ridge/spine
    ctx.fillStyle = p.bodyDark;
    ctx.beginPath();
    ctx.moveTo(-20, bob - 8);
    for (let i = 0; i < 8; i++) {
      const x = -20 + i * 5;
      const spike = (i % 2 === 0) ? -3 : 0;
      ctx.lineTo(x, bob - 10 + spike);
    }
    ctx.lineTo(20, bob - 8);
    ctx.closePath();
    ctx.fill();

    // Belly
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(0, bob + 6, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === LEGS ===
    ctx.strokeStyle = p.body;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Front legs (gripping)
    const frontLegWave = Math.sin(this.time * 2) * 2;
    ctx.beginPath();
    ctx.moveTo(-15, 8 + bob);
    ctx.lineTo(-22, 18 + bob + frontLegWave);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, 10 + bob);
    ctx.lineTo(-14, 20 + bob - frontLegWave);
    ctx.stroke();

    // Back legs
    ctx.beginPath();
    ctx.moveTo(12, 10 + bob);
    ctx.lineTo(18, 20 + bob + frontLegWave);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(18, 8 + bob);
    ctx.lineTo(26, 18 + bob - frontLegWave);
    ctx.stroke();

    // === HEAD ===
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(-24, bob - 2, 14, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Casque (head crest)
    ctx.fillStyle = p.bodyDark;
    ctx.beginPath();
    ctx.moveTo(-28, bob - 10);
    ctx.lineTo(-35, bob - 20);
    ctx.lineTo(-20, bob - 12);
    ctx.closePath();
    ctx.fill();

    // === EYE (large, independent) ===
    const eyeScale = this.getEyeScale();
    const eyeSize = 10 * eyeScale;

    // Eye socket (bulging)
    ctx.fillStyle = p.bodyLight;
    ctx.beginPath();
    ctx.arc(-28, bob - 2, eyeSize + 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye ring
    ctx.strokeStyle = p.eyeRing;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-28, bob - 2, eyeSize, 0, Math.PI * 2);
    ctx.stroke();

    // Pupil (horizontal slit)
    ctx.fillStyle = p.eye;
    ctx.beginPath();
    ctx.ellipse(
      -28 + this.lookX * 0.5,
      bob - 2 + this.lookY * 0.5,
      eyeSize * 0.4,
      eyeSize * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // === TONGUE (on curious emotion) ===
    if (this.emotion === 'curious' && this.emotionIntensity > 0.2) {
      const tongueLength = 30 + Math.sin(this.time * 8) * 10;
      ctx.strokeStyle = '#d97a5d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-36, bob);
      ctx.lineTo(-36 - tongueLength, bob - 5);
      ctx.stroke();

      // Tongue tip
      ctx.fillStyle = '#d97a5d';
      ctx.beginPath();
      ctx.arc(-36 - tongueLength, bob - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // === EMOTION INDICATORS ===
    if (this.emotion === 'pleased') {
      // Color shift effect (simulated)
      ctx.globalAlpha = 0.3 * this.emotionIntensity;
      ctx.fillStyle = '#c9a04a';
      ctx.beginPath();
      ctx.ellipse(0, bob, 30, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (this.emotion === 'thoughtful') {
      // Slow blink
      const blink = Math.sin(this.time * 0.5);
      if (blink > 0.8) {
        ctx.fillStyle = p.body;
        ctx.beginPath();
        ctx.arc(-28, bob - 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
