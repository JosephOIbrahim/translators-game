/**
 * Environment System — The Translators v2
 *
 * Simulates ambient environment: wind, lighting, atmosphere.
 * Creates the living world feeling.
 */

export class Environment {
  constructor(character) {
    this.character = character;
    this.time = 0;
    this.windStrength = 0.3;
    this.windPhase = 0;
    this.windDirection = 1; // 1 = right, -1 = left
  }

  update(dt) {
    this.time += dt;

    // Wind varies slowly over time
    this.windPhase = Math.sin(this.time * 0.3) * 0.5 + 0.5;

    // Occasional wind direction shifts
    if (Math.random() < 0.001) {
      this.windDirection *= -1;
    }
  }

  /**
   * Get sway amount at a specific x position
   * Creates natural variation across the scene
   */
  getSwayAt(x) {
    return Math.sin(this.time * 1.5 + x * 0.005) * this.windPhase * this.windDirection;
  }

  /**
   * Get current wind offset for particles
   */
  getWindOffset() {
    return Math.sin(this.time * 0.8) * this.windStrength * 2 * this.windDirection;
  }

  /**
   * Get ambient light level (for future day/night cycles)
   */
  getAmbientLight() {
    return 1.0; // Full brightness for now
  }
}
