/**
 * Cockatiel Companion — The Caretaker
 *
 * A friendly cockatiel with expressive crest.
 * Social, nurturing, always attentive to others.
 */

import { Companion } from '../Companion.js';
import { CREATURE_PALETTES } from '../../config/palette.js';

export class Cockatiel extends Companion {
  constructor(game) {
    super(game, 'cockatiel');
    this.palette = CREATURE_PALETTES.cockatiel;
    this.crestRaise = 0.5; // 0-1, how raised the crest is
    this.wingTuck = 1; // 1 = tucked, 0 = spread

    // Personality timing — Snappy, alert
    this.personality = {
      anticipationDuration: 0.06,
      settlingDuration: 0.15,
      settlingOvershoot: 0.25,
      idleThreshold: 1.5,
      reactionDelay: 0.05
    };
  }

  update(game, dt) {
    super.update(game, dt);

    // Crest responds to emotion
    const targetCrest = this.emotion === 'curious' ? 1 :
                        this.emotion === 'pleased' ? 0.8 :
                        this.emotion === 'thoughtful' ? 0.3 : 0.5;
    this.crestRaise += (targetCrest - this.crestRaise) * 0.1;

    // Wing flutter on pleased
    if (this.emotion === 'pleased') {
      this.wingTuck = 0.7 + Math.sin(this.time * 10) * 0.2;
    } else {
      this.wingTuck += (1 - this.wingTuck) * 0.1;
    }
  }

  renderCreature(ctx) {
    const p = this.palette;
    const bob = this.getBobOffset();
    const breath = this.getBreathScale();

    // === TAIL FEATHERS ===
    ctx.fillStyle = p.wing;
    ctx.beginPath();
    ctx.moveTo(15, 10 + bob);
    ctx.lineTo(35, 25 + bob);
    ctx.lineTo(30, 30 + bob);
    ctx.lineTo(25, 28 + bob);
    ctx.lineTo(18, 15 + bob);
    ctx.closePath();
    ctx.fill();

    // === BODY ===
    ctx.save();
    ctx.scale(breath, breath);

    // Main body
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(0, bob, 22, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight
    ctx.fillStyle = p.bodyLight;
    ctx.beginPath();
    ctx.ellipse(-5, bob - 6, 10, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === WING ===
    ctx.save();
    ctx.translate(8, bob);
    ctx.rotate(0.3 + (1 - this.wingTuck) * 0.5);

    ctx.fillStyle = p.wing;
    ctx.beginPath();
    ctx.ellipse(0, 5, 15 * this.wingTuck + 5, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Wing stripes
    ctx.strokeStyle = p.body;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(8, 10);
    ctx.moveTo(-3, 3);
    ctx.lineTo(10, 13);
    ctx.stroke();

    ctx.restore();

    // === FEET ===
    ctx.strokeStyle = p.beak;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Left foot
    ctx.beginPath();
    ctx.moveTo(-8, 15 + bob);
    ctx.lineTo(-10, 22 + bob);
    ctx.moveTo(-10, 22 + bob);
    ctx.lineTo(-14, 25 + bob);
    ctx.moveTo(-10, 22 + bob);
    ctx.lineTo(-8, 26 + bob);
    ctx.moveTo(-10, 22 + bob);
    ctx.lineTo(-6, 25 + bob);
    ctx.stroke();

    // Right foot
    ctx.beginPath();
    ctx.moveTo(5, 15 + bob);
    ctx.lineTo(7, 22 + bob);
    ctx.moveTo(7, 22 + bob);
    ctx.lineTo(3, 25 + bob);
    ctx.moveTo(7, 22 + bob);
    ctx.lineTo(9, 26 + bob);
    ctx.moveTo(7, 22 + bob);
    ctx.lineTo(11, 24 + bob);
    ctx.stroke();

    // === HEAD ===
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(-12, bob - 14, 14, 0, Math.PI * 2);
    ctx.fill();

    // Head highlight
    ctx.fillStyle = p.bodyLight;
    ctx.beginPath();
    ctx.ellipse(-16, bob - 18, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // === CHEEK PATCH (signature cockatiel orange) ===
    ctx.fillStyle = p.cheek;
    ctx.beginPath();
    ctx.ellipse(-6, bob - 10, 6, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // === CREST ===
    ctx.fillStyle = p.crest;
    const crestHeight = 15 + this.crestRaise * 12;
    const crestSpread = 0.3 + this.crestRaise * 0.4;

    // Multiple crest feathers
    for (let i = -2; i <= 2; i++) {
      const angle = -Math.PI / 2 + i * crestSpread * 0.3;
      const length = crestHeight - Math.abs(i) * 3;

      ctx.beginPath();
      ctx.moveTo(-12, bob - 24);
      ctx.quadraticCurveTo(
        -12 + Math.cos(angle) * length * 0.5,
        bob - 24 + Math.sin(angle) * length * 0.5,
        -12 + Math.cos(angle) * length,
        bob - 24 + Math.sin(angle) * length
      );
      ctx.lineWidth = 3 - Math.abs(i) * 0.5;
      ctx.strokeStyle = p.crest;
      ctx.stroke();
    }

    // === BEAK ===
    ctx.fillStyle = p.beak;
    // Upper beak
    ctx.beginPath();
    ctx.moveTo(-22, bob - 12);
    ctx.quadraticCurveTo(-30, bob - 14, -32, bob - 10);
    ctx.quadraticCurveTo(-30, bob - 8, -22, bob - 10);
    ctx.closePath();
    ctx.fill();

    // Lower beak
    ctx.beginPath();
    ctx.moveTo(-22, bob - 10);
    ctx.quadraticCurveTo(-26, bob - 6, -22, bob - 8);
    ctx.closePath();
    ctx.fill();

    // === EYE ===
    const eyeScale = this.getEyeScale();
    this.drawEye(ctx, -8, bob - 16, 5 * eyeScale, {
      base: '#f5ebe0',
      pupil: p.eye,
      highlight: '#fff'
    });

    // === EMOTION INDICATORS ===
    if (this.emotion === 'pleased' && this.emotionIntensity > 0.3) {
      // Musical notes
      ctx.fillStyle = p.crest;
      ctx.font = '14px sans-serif';
      const noteY = Math.sin(this.time * 3) * 5;
      ctx.fillText('\u266A', 10, bob - 25 + noteY);
      ctx.fillText('\u266B', 20, bob - 30 - noteY);
    }

    if (this.emotion === 'curious' && this.emotionIntensity > 0.3) {
      // Head tilt indicator (already expressed via crest)
    }

    if (this.emotion === 'thoughtful') {
      // Gentle eye close
      const blink = Math.sin(this.time * 0.3);
      if (blink > 0.7) {
        ctx.fillStyle = p.body;
        ctx.beginPath();
        ctx.ellipse(-8, bob - 16, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
