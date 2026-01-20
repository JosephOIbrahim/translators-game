/**
 * Island Entity — The Translators v2
 *
 * Floating garden platform that contains all vegetation and companions.
 * Creates the "cozy contained space" feeling from the reference image.
 *
 * Visual layers (back to front):
 * 1. Underside shadow (floating effect)
 * 2. Terracotta side faces (depth)
 * 3. Grass surface ellipse
 * 4. Grass texture details
 */

import { ISLAND_PALETTE } from '../config/palette.js';

export class Island {
  constructor(game) {
    this.game = game;
    this.gardenHeight = null;
    this.recalculateBounds(game);
  }

  /**
   * Recalculate island bounds based on canvas size
   * Call this on window resize
   */
  recalculateBounds(game) {
    const w = game.width;
    const h = this.gardenHeight || game.height * 0.75;

    // Surface ellipse center (island floats in middle-lower area)
    this.centerX = w / 2;
    this.centerY = h * 0.5;

    // Surface dimensions (70% width, elliptical shape)
    this.surfaceRadiusX = w * 0.35;
    this.surfaceRadiusY = h * 0.14;

    // Depth (visible terracotta side height)
    this.depthHeight = h * 0.22;

    // Spawn bounds (where trees/flowers/companion can safely go)
    // Inset from edges for visual margin
    this.spawnBounds = {
      left: this.centerX - this.surfaceRadiusX * 0.8,
      right: this.centerX + this.surfaceRadiusX * 0.8,
      top: this.centerY - this.surfaceRadiusY * 0.6,
      bottom: this.centerY + this.surfaceRadiusY * 0.4
    };
  }

  /**
   * Set the garden area height (excluding tray)
   */
  setGardenHeight(height) {
    this.gardenHeight = height;
    this.recalculateBounds(this.game);
  }

  /**
   * Check if a point is within the island surface ellipse
   */
  isOnSurface(x, y) {
    const dx = (x - this.centerX) / this.surfaceRadiusX;
    const dy = (y - this.centerY) / this.surfaceRadiusY;
    return (dx * dx + dy * dy) <= 1;
  }

  /**
   * Get a random spawn point guaranteed to be on the island surface
   */
  getSpawnPoint() {
    const bounds = this.spawnBounds;
    let attempts = 0;

    while (attempts < 30) {
      const x = bounds.left + Math.random() * (bounds.right - bounds.left);
      const y = bounds.top + Math.random() * (bounds.bottom - bounds.top);

      if (this.isOnSurface(x, y)) {
        return { x, y };
      }
      attempts++;
    }

    // Fallback to center if no valid point found
    return { x: this.centerX, y: this.centerY };
  }

  /**
   * Get spawn point biased toward back of island (for trees)
   */
  getBackSpawnPoint() {
    const point = this.getSpawnPoint();
    // Bias Y toward top of island for depth
    point.y = Math.min(point.y, this.centerY - this.surfaceRadiusY * 0.2);
    return point;
  }

  /**
   * Render the complete island
   */
  render(ctx) {
    const p = ISLAND_PALETTE;

    ctx.save();

    // 1. Underside shadow (floating effect)
    this.renderUnderside(ctx, p);

    // 2. Terracotta side faces (depth)
    this.renderSide(ctx, p);

    // 3. Grass surface ellipse
    this.renderSurface(ctx, p);

    // 4. Grass texture details
    this.renderGrassDetail(ctx, p);

    ctx.restore();
  }

  /**
   * Render shadow beneath island for floating effect
   */
  renderUnderside(ctx, p) {
    ctx.fillStyle = p.shadowColor;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX,
      this.centerY + this.depthHeight + 15,
      this.surfaceRadiusX * 0.6,
      this.surfaceRadiusY * 0.35,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }

  /**
   * Render terracotta side faces showing depth
   */
  renderSide(ctx, p) {
    // Main terracotta body (convex curve bottom)
    ctx.fillStyle = p.terracottaMid;
    ctx.beginPath();
    ctx.moveTo(this.centerX - this.surfaceRadiusX, this.centerY);

    // Left curve down
    ctx.quadraticCurveTo(
      this.centerX - this.surfaceRadiusX * 0.6,
      this.centerY + this.depthHeight * 0.9,
      this.centerX,
      this.centerY + this.depthHeight
    );

    // Right curve up
    ctx.quadraticCurveTo(
      this.centerX + this.surfaceRadiusX * 0.6,
      this.centerY + this.depthHeight * 0.9,
      this.centerX + this.surfaceRadiusX,
      this.centerY
    );

    ctx.closePath();
    ctx.fill();

    // Light side highlight (left - imaginary sun from top-left)
    ctx.fillStyle = p.terracottaLight;
    ctx.beginPath();
    ctx.moveTo(this.centerX - this.surfaceRadiusX, this.centerY);
    ctx.quadraticCurveTo(
      this.centerX - this.surfaceRadiusX * 0.75,
      this.centerY + this.depthHeight * 0.5,
      this.centerX - this.surfaceRadiusX * 0.4,
      this.centerY + this.depthHeight * 0.6
    );
    ctx.lineTo(this.centerX - this.surfaceRadiusX * 0.5, this.centerY + 5);
    ctx.closePath();
    ctx.fill();

    // Dark side shadow (right)
    ctx.fillStyle = p.terracottaDark;
    ctx.beginPath();
    ctx.moveTo(this.centerX + this.surfaceRadiusX, this.centerY);
    ctx.quadraticCurveTo(
      this.centerX + this.surfaceRadiusX * 0.75,
      this.centerY + this.depthHeight * 0.5,
      this.centerX + this.surfaceRadiusX * 0.4,
      this.centerY + this.depthHeight * 0.6
    );
    ctx.lineTo(this.centerX + this.surfaceRadiusX * 0.5, this.centerY + 5);
    ctx.closePath();
    ctx.fill();

    // Bottom underside (darkest)
    ctx.fillStyle = p.terracottaDeep;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX,
      this.centerY + this.depthHeight - 5,
      this.surfaceRadiusX * 0.5,
      this.depthHeight * 0.15,
      0, 0, Math.PI
    );
    ctx.fill();

    // Dirt layer visible at top edge
    ctx.fillStyle = p.dirtTop;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX,
      this.centerY + 6,
      this.surfaceRadiusX * 0.95,
      this.surfaceRadiusY * 0.25,
      0, 0, Math.PI
    );
    ctx.fill();
  }

  /**
   * Render the grass surface ellipse
   */
  renderSurface(ctx, p) {
    // Main grass surface
    ctx.fillStyle = p.grassMid;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX,
      this.centerY,
      this.surfaceRadiusX,
      this.surfaceRadiusY,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Lighter grass highlight (top-left quadrant - sun)
    ctx.fillStyle = p.grassLight;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX - this.surfaceRadiusX * 0.25,
      this.centerY - this.surfaceRadiusY * 0.15,
      this.surfaceRadiusX * 0.55,
      this.surfaceRadiusY * 0.65,
      -0.25,
      0, Math.PI * 2
    );
    ctx.fill();

    // Darker grass shadow (bottom-right)
    ctx.fillStyle = p.grassDark;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX + this.surfaceRadiusX * 0.3,
      this.centerY + this.surfaceRadiusY * 0.2,
      this.surfaceRadiusX * 0.35,
      this.surfaceRadiusY * 0.5,
      0.3,
      0, Math.PI * 2
    );
    ctx.fill();
    ctx.globalAlpha = 1;

    // Edge definition stroke
    ctx.strokeStyle = p.grassEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      this.centerX,
      this.centerY,
      this.surfaceRadiusX,
      this.surfaceRadiusY,
      0, 0, Math.PI * 2
    );
    ctx.stroke();
  }

  /**
   * Render subtle grass texture lines
   */
  renderGrassDetail(ctx, p) {
    ctx.strokeStyle = p.grassDark;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;

    // Horizontal grass texture lines
    const lineCount = 6;
    for (let i = 0; i < lineCount; i++) {
      const offsetY = (i - lineCount / 2) * this.surfaceRadiusY * 0.2;
      const lineY = this.centerY + offsetY;

      // Calculate line width at this Y position (ellipse math)
      const normalizedY = offsetY / this.surfaceRadiusY;
      const lineHalfWidth = Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY)) * this.surfaceRadiusX;

      if (lineHalfWidth > 10) {
        ctx.beginPath();
        // Slight wave for organic feel
        const wave = Math.sin(i * 1.5) * 8;
        ctx.moveTo(this.centerX - lineHalfWidth * 0.7 + wave, lineY);
        ctx.quadraticCurveTo(
          this.centerX,
          lineY + Math.sin(i * 2) * 3,
          this.centerX + lineHalfWidth * 0.7 - wave,
          lineY
        );
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Get bounds for external use
   */
  getBounds() {
    return {
      centerX: this.centerX,
      centerY: this.centerY,
      radiusX: this.surfaceRadiusX,
      radiusY: this.surfaceRadiusY,
      spawn: this.spawnBounds
    };
  }
}
