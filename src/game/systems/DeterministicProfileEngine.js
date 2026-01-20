/**
 * DeterministicProfileEngine.js
 *
 * PURE FUNCTIONS for cognitive profile computation.
 *
 * CRITICAL INVARIANT: Same answers → Same profile. Always.
 * NO Math.random(). NO Date.now() in computation. NO side effects.
 *
 * This engine defeats non-determinism in profile generation by:
 * 1. Fixed reduction order (answers processed in dimension order)
 * 2. Pure functions (no external state)
 * 3. Checksum verification (integrity across transmission)
 *
 * Based on insights from "Defeating Non-Determinism in LLM Inference"
 * https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
 */

import { VERSION, getGeneratorString } from '../config/version.js';

/**
 * Dimension configuration — the semantic schema
 * Order matters for determinism: processed alphabetically
 */
const DIMENSION_CONFIG = {
  ambiguity: {
    high: { label: 'Comfortable', behavior: 'You handle uncertainty well — explore possibilities' },
    mid: { label: 'Balanced', behavior: 'You appreciate both clarity and exploration' },
    low: { label: 'Wants Clarity', behavior: 'You prefer clear answers — be direct about unknowns' }
  },
  communication: {
    high: { label: 'Gentle', behavior: 'You prefer encouragement with corrections' },
    mid: { label: 'Contextual', behavior: 'Match feedback style to the situation' },
    low: { label: 'Direct', behavior: 'Tell it straight — you can handle direct feedback' }
  },
  exploration: {
    high: { label: 'Expansive', behavior: 'You enjoy exploring tangents and connections' },
    mid: { label: 'Selective', behavior: 'Follow interesting threads, redirect boring ones' },
    low: { label: 'Focused', behavior: 'Stay on track — goal-directed conversations' }
  },
  organization: {
    high: { label: 'Structured', behavior: 'You prefer ordered steps and clear hierarchy' },
    mid: { label: 'Mixed', behavior: 'Blend structure with narrative as needed' },
    low: { label: 'Flexible', behavior: 'You prefer stories and examples over lists' }
  },
  pace: {
    high: { label: 'Deliberate', behavior: 'You appreciate context and thorough explanations' },
    mid: { label: 'Adaptive', behavior: 'Match your energy — quick or slow as needed' },
    low: { label: 'Quick', behavior: 'Get to the point — you process fast' }
  },
  rhythm: {
    high: { label: 'Reflective', behavior: 'Silence is productive — don\'t rush to fill it' },
    mid: { label: 'Natural', behavior: 'Comfortable with varied conversational rhythm' },
    low: { label: 'Quick-paced', behavior: 'Keep things moving — avoid long pauses' }
  },
  tangents: {
    high: { label: 'Embraces', behavior: 'Tangents welcome — that\'s where insights live' },
    mid: { label: 'Selective', behavior: 'Follow interesting tangents, skip boring ones' },
    low: { label: 'Redirects', behavior: 'Stay focused — bring wandering back on track' }
  },
  thoroughness: {
    high: { label: 'Detailed', behavior: 'Give all the details upfront — you\'ll sort through them' },
    mid: { label: 'Balanced', behavior: 'Appropriate depth for the context' },
    low: { label: 'Minimal', behavior: 'Start minimal — add detail only when asked' }
  }
};

/**
 * Insight templates based on trait patterns
 * Each insight has a condition function and text
 */
const INSIGHT_RULES = [
  {
    condition: (traits) => traits.pace?.value < 0.4,
    text: "You prefer quick, direct communication — don't bury the lede"
  },
  {
    condition: (traits) => traits.pace?.value > 0.6,
    text: "You appreciate context and thorough explanations"
  },
  {
    condition: (traits) => traits.exploration?.value > 0.7,
    text: "You enjoy exploring tangents and making unexpected connections"
  },
  {
    condition: (traits) => traits.exploration?.value < 0.3,
    text: "You prefer focused, goal-directed conversations"
  },
  {
    condition: (traits) => traits.thoroughness?.value > 0.6,
    text: "Give you all the details upfront — you'll sort through them"
  },
  {
    condition: (traits) => traits.thoroughness?.value < 0.4,
    text: "Start minimal, add detail only when asked"
  },
  {
    condition: (traits) => traits.rhythm?.value > 0.6,
    text: "Silence is productive for you — don't rush to fill it"
  },
  {
    condition: (traits) => traits.tangents?.value > 0.7,
    text: "Tangents are welcome — that's where insights live"
  },
  {
    condition: (traits) => traits.organization?.value > 0.7,
    text: "Structure helps you — use lists, steps, clear hierarchy"
  },
  {
    condition: (traits) => traits.communication?.value > 0.7,
    text: "You respond better to gentle corrections with encouragement"
  },
  {
    condition: (traits) => traits.communication?.value < 0.3,
    text: "Tell it straight — you prefer direct feedback"
  },
  {
    condition: (traits) => traits.ambiguity?.value > 0.7,
    text: "You're comfortable with uncertainty — explore possibilities"
  }
];

/**
 * Simple deterministic hash function
 * Based on djb2 algorithm — fast, deterministic, good distribution
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Convert hash to hex string
 */
function toHex(num, length = 8) {
  return num.toString(16).padStart(length, '0').slice(-length);
}

export class DeterministicProfileEngine {
  /**
   * Compute traits from raw answers
   * PURE FUNCTION — no side effects, deterministic
   *
   * @param {Object} answers - Raw answer data keyed by question ID
   * @returns {Object} Computed traits with values, labels, and behaviors
   */
  static computeTraits(answers) {
    const traits = {};

    // Step 1: Aggregate values by dimension
    // Process in FIXED ORDER (Object.values maintains insertion order,
    // but we sort by dimension for determinism)
    const answerList = Object.values(answers);
    answerList.sort((a, b) => a.dimension.localeCompare(b.dimension));

    answerList.forEach(answer => {
      const dim = answer.dimension;
      if (!traits[dim]) {
        traits[dim] = {
          values: [],
          depth: answer.depth
        };
      }
      traits[dim].values.push(answer.trait);
    });

    // Step 2: Compute final values (average)
    // Process dimensions in ALPHABETICAL ORDER for determinism
    const sortedDims = Object.keys(traits).sort();

    sortedDims.forEach(dim => {
      const trait = traits[dim];
      const avg = trait.values.reduce((a, b) => a + b, 0) / trait.values.length;

      // Round to 2 decimal places for consistency
      trait.value = Math.round(avg * 100) / 100;

      // Get label and behavior from config
      const config = DIMENSION_CONFIG[dim];
      if (config) {
        if (trait.value > 0.6) {
          trait.label = config.high.label;
          trait.behavior = config.high.behavior;
        } else if (trait.value < 0.4) {
          trait.label = config.low.label;
          trait.behavior = config.low.behavior;
        } else {
          trait.label = config.mid.label;
          trait.behavior = config.mid.behavior;
        }
      } else {
        trait.label = 'Balanced';
        trait.behavior = 'Adapt to context';
      }

      // Remove intermediate values array (not needed in output)
      delete trait.values;
    });

    return traits;
  }

  /**
   * Generate insights from trait patterns
   * PURE FUNCTION — deterministic rule matching
   *
   * @param {Object} traits - Computed traits
   * @returns {string[]} Array of insight strings (max 4)
   */
  static generateInsights(traits) {
    const insights = [];

    // Apply rules in FIXED ORDER
    INSIGHT_RULES.forEach(rule => {
      if (insights.length < 4 && rule.condition(traits)) {
        insights.push(rule.text);
      }
    });

    // Fallback if no rules matched
    if (insights.length === 0) {
      insights.push("You adapt fluidly to different communication styles");
    }

    return insights;
  }

  /**
   * Compute checksum for profile integrity verification
   * DETERMINISTIC — same traits → same checksum
   *
   * @param {Object} traits - Computed traits
   * @returns {string} 8-character hex checksum
   */
  static computeChecksum(traits) {
    // Serialize traits in FIXED ORDER
    const sortedDims = Object.keys(traits).sort();
    const serialized = sortedDims.map(dim => {
      const t = traits[dim];
      // Use fixed precision to avoid floating-point variance
      return `${dim}:${(t.value * 100).toFixed(0)}`;
    }).join('|');

    // Add version prefix for future compatibility
    const versioned = `${VERSION.checksumPrefix}|${serialized}`;

    // Compute hash
    const hash = djb2Hash(versioned);

    return toHex(hash);
  }

  /**
   * Generate semantic anchor for AI recognition
   * Format: [TRANSLATORS:<checksum>]
   *
   * @param {string} checksum - Profile checksum
   * @returns {string} Anchor string
   */
  static generateAnchor(checksum) {
    return `[TRANSLATORS:${checksum}]`;
  }

  /**
   * Build complete profile from answers
   * Main entry point — orchestrates all computations
   *
   * @param {Object} answers - Raw answer data
   * @returns {Object} Complete deterministic profile
   */
  static buildProfile(answers) {
    // Step 1: Compute traits (deterministic)
    const traits = this.computeTraits(answers);

    // Step 2: Generate insights (deterministic)
    const insights = this.generateInsights(traits);

    // Step 3: Compute checksum (deterministic)
    const checksum = this.computeChecksum(traits);

    // Step 4: Generate anchor (deterministic)
    const anchor = this.generateAnchor(checksum);

    return {
      version: VERSION.profile,
      generator: VERSION.generator,
      traits,
      insights,
      checksum,
      anchor,
      raw: answers
    };
  }

  /**
   * Verify profile integrity using checksum
   *
   * @param {Object} profile - Profile to verify
   * @returns {boolean} True if checksum matches
   */
  static verifyIntegrity(profile) {
    const computedChecksum = this.computeChecksum(profile.traits);
    return computedChecksum === profile.checksum;
  }

  /**
   * Validate profile structure and integrity
   * Use before export to prevent undefined/corrupted data
   *
   * @param {Object} profile - Profile to validate
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  static validateProfile(profile) {
    const errors = [];

    if (!profile) {
      errors.push('Profile is null or undefined');
      return { valid: false, errors };
    }

    if (!profile.traits || typeof profile.traits !== 'object') {
      errors.push('Missing or invalid traits object');
    }

    if (!profile.checksum || typeof profile.checksum !== 'string') {
      errors.push('Missing or invalid checksum');
    }

    if (!profile.anchor || typeof profile.anchor !== 'string') {
      errors.push('Missing or invalid anchor');
    }

    // Validate each trait has required fields
    if (profile.traits) {
      Object.entries(profile.traits).forEach(([dim, trait]) => {
        if (typeof trait.value !== 'number') {
          errors.push(`Trait '${dim}' missing numeric value`);
        }
        if (typeof trait.label !== 'string') {
          errors.push(`Trait '${dim}' missing label`);
        }
        if (typeof trait.behavior !== 'string') {
          errors.push(`Trait '${dim}' missing behavior`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get confidence level based on answer consistency
   * Higher consistency = higher confidence
   *
   * @param {Object} answers - Raw answers
   * @returns {number} Confidence 0-1
   */
  static computeConfidence(answers) {
    // Single play = base confidence
    // Could be extended for multi-session tracking
    const answerCount = Object.keys(answers).length;
    const expectedCount = 8;

    // Full interview = high confidence
    if (answerCount >= expectedCount) {
      return 0.85;
    }

    // Partial interview = scaled confidence
    return 0.4 + (answerCount / expectedCount) * 0.45;
  }
}

export { DIMENSION_CONFIG, INSIGHT_RULES };
