/**
 * Bird Entity — The Translators v2
 *
 * Ambient flying birds for life and movement.
 * Occasionally triggered, fly across screen.
 */

export class Bird {
  constructor(game) {
    this.reset(game);
    this.wingPhase = 0;
    this.color = '#4a4035';
  }

  reset(game) {
    // Spawn off-screen left
    this.x = -50;
    this.y = 40 + Math.random() * 120;
    this.speed = 80 + Math.random() * 40;
    this.active = false;
    this.size = 0.8 + Math.random() * 0.4;
    this.waveAmplitude = 10 + Math.random() * 20;
    this.waveFrequency = 0.01 + Math.random() * 0.01;
  }

  trigger() {
    this.active = true;
  }

  update(dt, game) {
    if (!this.active) return;

    this.x += this.speed * dt;
    this.y += Math.sin(this.x * this.waveFrequency) * this.waveAmplitude * dt;
    this.wingPhase += dt * 15;

    if (this.x > game.width + 50) {
      this.reset(game);
    }
  }

  render(ctx) {
    if (!this.active) return;

    const wingY = Math.sin(this.wingPhase) * 5 * this.size;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Body
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(0, -2, 10, 0);
    ctx.stroke();

    // Left wing
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(-8, -5 + wingY, -12, -10 + wingY);
    ctx.stroke();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.quadraticCurveTo(8, -5 - wingY, 12, -10 - wingY);
    ctx.stroke();

    ctx.restore();
  }
}
