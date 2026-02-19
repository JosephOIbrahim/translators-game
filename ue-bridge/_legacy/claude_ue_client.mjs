/**
 * claude_ue_client.mjs
 *
 * Node.js client for the Claude Code → UE5.7 Bridge.
 *
 * Usage:
 *   import { UEBridge } from './claude_ue_client.mjs';
 *   const bridge = new UEBridge();
 *   await bridge.ping();
 *   await bridge.setCognitiveTrait('pace', 0.2, 'Quick', 'Get to the point');
 */

const BRIDGE_URL = 'http://localhost:8765';

export class UEBridge {
  constructor(url = BRIDGE_URL) {
    this.url = url;
  }

  /**
   * Send command to UE bridge.
   */
  async send(command) {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('UE Bridge not running. Start it in Unreal Editor.');
      }
      throw error;
    }
  }

  // === High-Level Commands ===

  /**
   * Test connection to UE.
   */
  async ping() {
    return this.send({ type: 'ping' });
  }

  /**
   * Log message in UE console.
   */
  async log(message, level = 'info') {
    return this.send({ type: 'log', message, level });
  }

  /**
   * Get all actors in current level.
   */
  async getActors() {
    return this.send({ type: 'get_actors' });
  }

  /**
   * Get USD stage information.
   */
  async getUsdStage() {
    return this.send({ type: 'get_usd_stage' });
  }

  /**
   * Set attribute on USD prim.
   */
  async setUsdAttribute(prim, attribute, value) {
    return this.send({
      type: 'set_usd_attribute',
      prim,
      attribute,
      value
    });
  }

  /**
   * Create new USD layer.
   */
  async createUsdLayer(name) {
    return this.send({ type: 'create_usd_layer', name });
  }

  /**
   * Spawn actor in scene.
   */
  async spawnActor(className, location = [0, 0, 0], rotation = [0, 0, 0]) {
    return this.send({
      type: 'spawn_actor',
      class: className,
      location,
      rotation
    });
  }

  /**
   * Spawn Niagara particle system.
   */
  async spawnNiagara(systemPath, location = [0, 0, 0]) {
    return this.send({
      type: 'spawn_niagara',
      system: systemPath,
      location
    });
  }

  // === The Translators Integration ===

  /**
   * Set a cognitive trait on the profile.
   * This updates the USD layer in real-time as answers come in.
   */
  async setCognitiveTrait(dimension, value, label, behavior) {
    return this.send({
      type: 'set_cognitive_trait',
      dimension,
      value,
      label,
      behavior
    });
  }

  /**
   * Send complete profile to UE.
   * Called when all 8 questions are answered.
   */
  async sendProfile(profile) {
    const results = [];

    // Send each trait
    for (const [dim, trait] of Object.entries(profile.traits)) {
      const result = await this.setCognitiveTrait(
        dim,
        trait.value,
        trait.label,
        trait.behavior
      );
      results.push(result);
    }

    // Log completion
    await this.log(`Profile complete: ${profile.anchor}`, 'info');

    return {
      success: true,
      checksum: profile.checksum,
      anchor: profile.anchor,
      traits_sent: results.length
    };
  }
}

// === CLI Usage ===

async function main() {
  const bridge = new UEBridge();

  console.log('Testing UE Bridge connection...');

  try {
    const ping = await bridge.ping();
    console.log('Connected:', ping);

    // Test cognitive trait
    const trait = await bridge.setCognitiveTrait(
      'pace',
      0.2,
      'Quick',
      'Get to the point — you process fast'
    );
    console.log('Set trait:', trait);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('claude_ue_client.mjs')) {
  main();
}

export default UEBridge;
