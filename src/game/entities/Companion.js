/**
 * Companion Base Class — The Translators v2
 *
 * Base class for all companion creatures.
 * Handles common behavior: position, emotions, eye tracking, animation.
 * Subclasses implement creature-specific rendering.
 */

import { PALETTE, CREATURE_PALETTES } from '../config/palette.js';

export class Companion {
  constructor(game, creatureType) {
    this.game = game;
    this.creatureType = creatureType;
    this.palette = CREATURE_PALETTES[creatureType] || CREATURE_PALETTES.octopus;

    // Position
    this.x = game.width * 0.2;
    this.y = game.height * 0.4;
    this.targetX = this.x;
    this.targetY = this.y;

    // Velocity (smooth movement)
    this.vx = 0;
    this.vy = 0;

    // Animation time
    this.time = 0;

    // Emotion state
    this.emotion = 'neutral'; // neutral, curious, pleased, thoughtful
    this.emotionIntensity = 0; // 0-1 for emotion animations

    // Eye tracking
    this.lookX = 0;
    this.lookY = 0;

    // Scale (for reactions)
    this.scale = 1;
    this.targetScale = 1;

    // Visibility
    this.visible = true;
    this.alpha = 1;

    // Cursor following mode
    this.followCursor = false;
    this.followSpeed = 0.03;
    this.maxY = game.height - 150; // Stay above tray

    // Movement bounds (for island constraint)
    this.movementBounds = null;

    // State machine for Sakurai-style animation
    this.state = 'ready';  // ready, anticipating, moving, settling, idle
    this.stateTime = 0;

    // Personality timing (override in subclasses)
    this.personality = {
      anticipationDuration: 0.12,
      settlingDuration: 0.25,
      settlingOvershoot: 0.15,
      idleThreshold: 2.0,
      reactionDelay: 0.1
    };
  }

  /**
   * Enable/disable cursor following
   */
  setFollowCursor(enabled, maxY = null) {
    this.followCursor = enabled;
    if (maxY !== null) {
      this.maxY = maxY;
    }
  }

  /**
   * Set movement bounds (for island constraint)
   * @param {Object} bounds - { left, right, top, bottom }
   */
  setMovementBounds(bounds) {
    this.movementBounds = bounds;
  }

  /**
   * Set position directly
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
   * Set target position (companion moves toward it)
   */
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Set emotion state
   */
  setEmotion(emotion) {
    this.emotion = emotion;
    this.emotionIntensity = 1;

    // Emotion-specific reactions
    switch (emotion) {
      case 'curious':
        this.targetScale = 1.05;
        break;
      case 'pleased':
        this.targetScale = 1.1;
        break;
      case 'thoughtful':
        this.targetScale = 0.95;
        break;
      default:
        this.targetScale = 1;
    }
  }

  /**
   * Update physics and animation
   */
  update(game, dt) {
    this.time += dt;

    // Follow cursor when enabled
    if (this.followCursor && game.input) {
      const targetX = game.input.x;
      const targetY = Math.min(game.input.y, this.maxY);
      // Smooth follow with offset (companion floats near cursor, not directly on it)
      const offsetX = 60;
      const offsetY = -30;
      this.targetX += (targetX + offsetX - this.targetX) * this.followSpeed;
      this.targetY += (targetY + offsetY - this.targetY) * this.followSpeed;
    }

    // Clamp target to movement bounds (island constraint)
    if (this.movementBounds) {
      this.targetX = Math.max(this.movementBounds.left,
        Math.min(this.movementBounds.right, this.targetX));
      this.targetY = Math.max(this.movementBounds.top,
        Math.min(this.movementBounds.bottom, this.targetY));
    }

    // Move toward target
    const accel = 0.08;
    const drag = 0.85;

    this.vx += (this.targetX - this.x) * accel;
    this.vy += (this.targetY - this.y) * accel;
    this.vx *= drag;
    this.vy *= drag;
    this.x += this.vx;
    this.y += this.vy;

    // Scale interpolation
    this.scale += (this.targetScale - this.scale) * 0.1;

    // Decay emotion intensity
    this.emotionIntensity = Math.max(0, this.emotionIntensity - dt * 0.5);

    // Reset to neutral after emotion fades
    if (this.emotionIntensity <= 0 && this.emotion !== 'neutral') {
      this.emotion = 'neutral';
      this.targetScale = 1;
    }

    // Update eye tracking toward mouse/touch
    const mouseX = game.input.x;
    const mouseY = game.input.y;
    const maxLook = 4;

    if (mouseX !== undefined && mouseY !== undefined) {
      const dx = (mouseX - this.x) / game.width;
      const dy = (mouseY - this.y) / game.height;
      this.lookX += (dx * maxLook * 2 - this.lookX) * 0.1;
      this.lookY += (dy * maxLook * 2 - this.lookY) * 0.1;
    }
  }

  /**
   * React to nearby placements with curiosity
   */
  reactToPlacement(x, y) {
    // Move slightly toward placement
    this.setTarget(
      this.x + (x - this.x) * 0.2,
      this.y + (y - this.y) * 0.2
    );
    this.setEmotion('curious');
  }

  /**
   * React to tree shakes or interactions
   */
  reactToInteraction(x, y, emotion = 'pleased') {
    this.setTarget(
      this.x + (x - this.x) * 0.15,
      this.y + (y - this.y) * 0.15
    );
    this.setEmotion(emotion);
  }

  /**
   * Render the companion (override in subclasses)
   */
  render(ctx) {
    if (!this.visible || this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // Subclasses implement this
    this.renderCreature(ctx);

    ctx.restore();
  }

  /**
   * Override in subclasses to render specific creature
   */
  renderCreature(ctx) {
    // Default: simple circle placeholder
    ctx.fillStyle = this.palette.body || PALETTE.creatureBody;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Helper: draw eye with tracking
   */
  drawEye(ctx, x, y, size, colors) {
    // Eye white/base
    ctx.fillStyle = colors.base || '#e8d5b8';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil (tracks mouse)
    ctx.fillStyle = colors.pupil || '#4a4035';
    ctx.beginPath();
    ctx.arc(x + this.lookX, y + this.lookY, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = colors.highlight || '#ffffff';
    ctx.beginPath();
    ctx.arc(x + this.lookX - size * 0.15, y + this.lookY - size * 0.2, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Helper: breathing animation multiplier
   */
  getBreathScale() {
    return 1 + Math.sin(this.time * 1.5) * 0.02;
  }

  /**
   * Helper: bobbing animation offset
   */
  getBobOffset() {
    return Math.sin(this.time * 2) * 3;
  }

  /**
   * Helper: emotion-based eye size
   */
  getEyeScale() {
    switch (this.emotion) {
      case 'curious': return 1.2;
      case 'pleased': return 1.1;
      case 'thoughtful': return 0.9;
      default: return 1;
    }
  }
}
