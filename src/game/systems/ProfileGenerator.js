/**
 * Profile Generator — The Translators
 * Source: GAME_SPEC.md "PROFILE GENERATION"
 *
 * Generates cognitive profile from tracked behaviors.
 * Includes Wolfram Lens — mathematical perception filter that IS the profile.
 */

import { TIMING } from '../config/timing.js';
import { WolframLens } from './WolframLens.js';

export class ProfileGenerator {
  /**
   * Generate complete profile from behavior tracker
   * @param {BehaviorTracker} behavior - Tracked behavior data
   * @param {number} directDistance - Direct path distance for exploration calc
   * @param {WolframLens} lens - Optional calibrated lens from gameplay
   * @returns {object} Profile with traits, insights, and lens
   */
  static generate(behavior, directDistance, lens = null) {
    const traits = this.computeTraits(behavior, directDistance);
    const insights = this.generateInsights(traits, behavior);

    // Create or use provided lens
    let profileLens = lens;
    if (!profileLens || !profileLens.ready) {
      // Generate lens from behavioral signals
      const signals = behavior.getLensSignals ? behavior.getLensSignals(800, 600) : {};
      profileLens = new WolframLens().calibrateFrom(signals);
    }

    return { traits, insights, lens: profileLens };
  }

  /**
   * Compute all traits from behavior data
   * Source: GAME_SPEC.md "Traits Computed"
   */
  static computeTraits(behavior, directDistance) {
    const traits = {};
    
    // Exploration (Layer 1)
    const explorationScore = behavior.getExplorationScore(directDistance);
    traits.exploration = {
      value: explorationScore,
      label: explorationScore > 0.4 ? 'Expansive' : 
             explorationScore > 0.2 ? 'Balanced' : 'Direct'
    };
    
    // Thoroughness (Layer 1)
    const thoroughnessScore = behavior.getThoroughnessScore();
    traits.thoroughness = {
      value: thoroughnessScore,
      label: thoroughnessScore >= 0.75 ? 'Complete' :
             thoroughnessScore >= 0.4 ? 'Selective' : 'Minimal'
    };
    
    // Organization (Layer 2)
    const orgStyle = behavior.getOrganizationStyle();
    const orgLabels = {
      'linear': 'Structured',
      'clustered': 'Grouped',
      'minimal': 'Fluid',
      'distributed': 'Organic'
    };
    traits.organization = {
      value: behavior.arrangeActions / 10, // Normalize roughly
      label: orgLabels[orgStyle] || 'Organic',
      style: orgStyle
    };
    
    // Communication (Layer 3)
    const commStyle = behavior.getCommunicationStyle();
    traits.communication = {
      label: commStyle.charAt(0).toUpperCase() + commStyle.slice(1),
      style: commStyle
    };
    
    // Processing Pace (Layer 3)
    const avgTime = behavior.getAverageResponseTime();
    traits.pace = {
      value: avgTime,
      label: avgTime < TIMING.profile.quickThreshold ? 'Quick' :
             avgTime < TIMING.profile.measuredThreshold ? 'Measured' : 'Deliberate'
    };
    
    return traits;
  }

  /**
   * Generate insights from traits
   * Source: GAME_SPEC.md "Insight Generation Rules"
   */
  static generateInsights(traits, behavior) {
    const insights = [];
    
    if (traits.exploration.value > 0.5 && traits.thoroughness.value > 0.6) {
      insights.push("Explores fully before deciding — values completeness");
    }
    
    if (traits.exploration.value < 0.4 && traits.organization.label === 'Structured') {
      insights.push("Efficient and organized — clear pathways work best");
    }
    
    if (traits.communication.style === 'reflective') {
      insights.push("Builds connection through reflection — match their style");
    }
    
    if (traits.communication.style === 'independent') {
      insights.push("Values independent perspective — don't just echo");
    }
    
    if (traits.organization.style === 'minimal') {
      insights.push("Comfortable with ambiguity — less structure is fine");
    }
    
    if (traits.pace.label === 'Quick') {
      insights.push("Quick processor — get to the point");
    }
    
    if (traits.pace.label === 'Deliberate') {
      insights.push("Deliberate thinker — provide full context");
    }
    
    // Ensure at least one insight
    if (insights.length === 0) {
      insights.push("Adaptable approach — adjusts to context");
    }
    
    return insights.slice(0, 3);
  }

  /**
   * Generate markdown profile for clipboard
   * Source: GAME_SPEC.md "Profile Output Format"
   */
  static toMarkdown(profile) {
    const { traits, insights, lens } = profile;

    let md = `# Communication Profile\n`;
    md += `## The Translators — Octopus Path\n\n`;

    md += `### Observed Patterns\n`;
    md += `**Exploration**: ${traits.exploration.label}\n`;
    md += `**Thoroughness**: ${traits.thoroughness.label}\n`;
    md += `**Organization**: ${traits.organization.label}\n`;
    md += `**Communication**: ${traits.communication.label}\n`;
    md += `**Processing Pace**: ${traits.pace.label}\n\n`;

    md += `### Insights\n`;
    insights.forEach(i => md += `- ${i}\n`);

    md += `\n### How To Communicate With Me\n`;

    // Instructions based on traits
    if (traits.exploration.label === 'Expansive') {
      md += `- Feel free to explore tangents and connections\n`;
    } else {
      md += `- Stay focused on the main thread\n`;
    }

    if (traits.organization.label === 'Structured') {
      md += `- Present information in clear, ordered steps\n`;
    } else if (traits.organization.label === 'Fluid') {
      md += `- Don't over-structure — flexibility is valued\n`;
    }

    if (traits.communication.style === 'reflective') {
      md += `- Mirror my communication style\n`;
    } else if (traits.communication.style === 'independent') {
      md += `- Share your own perspective, don't just echo\n`;
    }

    if (traits.pace.label === 'Quick') {
      md += `- Get to the point efficiently\n`;
    } else if (traits.pace.label === 'Deliberate') {
      md += `- Provide full context before conclusions\n`;
    }

    // Include Wolfram Lens data
    if (lens && lens.ready) {
      const wolfram = lens.toWolfram();
      md += `\n### Perception Lens (Mathematical Profile)\n`;
      md += `**Spatial**: \`${wolfram.spatial}\` — how space curves for this viewer\n`;
      md += `**Temporal**: \`${wolfram.temporal}\` — how time flows\n`;
      md += `**Chromatic**: ${wolfram.chromatic}\n\n`;
      md += `*Explore these transforms:*\n`;
      md += `- [Conformal Map](${wolfram.links.conformal})\n`;
    }

    md += `\n---\n*Profile from The Translators*`;

    return md;
  }

  /**
   * Generate USD ASCII format for persistent cognitive substrate
   * This is the core of the USD-as-memory thesis:
   * - Hierarchical structure maps to cognitive organization
   * - Custom properties carry typed trait data
   * - Composition-ready (can be layered with other USD files)
   * - Human-readable AND machine-readable
   * - Includes Wolfram Lens as executable mathematical profile
   */
  static toUSDA(profile) {
    const { traits, insights, lens } = profile;
    const timestamp = new Date().toISOString();

    // Generate communication instructions
    const instructions = this.generateInstructions(traits);

    // Build lens section if available
    let lensSection = '';
    if (lens && lens.ready) {
      const wolfram = lens.toWolfram();
      lensSection = `
    # === Wolfram Lens (Mathematical Profile) ===
    # The lens IS the profile: transforms how this viewer perceives reality
    # These are EXECUTABLE mathematical functions, not descriptions
    def "WolframLens" (
        doc = "Mathematical transformation defining perception. The profile as function."
    )
    {
        # Spatial Transform: z^power
        custom string spatial:expression = "${wolfram.spatial}"
        custom float spatial:power = ${lens.spatial.power.toFixed(4)}
        custom float spatial:rotation = ${lens.spatial.rotation.toFixed(4)}
        custom string spatial:wolframLink = "${wolfram.links.conformal}"

        # Temporal Transform: t^exponent
        custom string temporal:expression = "${wolfram.temporal}"
        custom float temporal:exponent = ${lens.temporal.exponent.toFixed(4)}
        custom float temporal:pulse = ${lens.temporal.pulse.toFixed(4)}

        # Chromatic Transform: LAB rotation
        custom string chromatic:description = "${wolfram.chromatic}"
        custom float chromatic:rotation = ${lens.chromatic.rotation.toFixed(2)}
        custom float chromatic:chroma = ${lens.chromatic.chroma.toFixed(4)}
        custom float chromatic:lightness = ${lens.chromatic.lightness.toFixed(4)}

        # Frequency (detail resolution)
        custom float frequency:sharpness = ${lens.frequency.sharpness.toFixed(4)}

        # Salience (attention weighting)
        custom float salience:edges = ${lens.salience.edges.toFixed(4)}
        custom float salience:patterns = ${lens.salience.patterns.toFixed(4)}
        custom float salience:novelty = ${lens.salience.novelty.toFixed(4)}
        custom float salience:companion = ${lens.salience.companion.toFixed(4)}

        # Confidence
        custom float confidence = ${lens.confidence.toFixed(4)}
    }
`;
    }

    // Build USD ASCII content
    let usda = `#usda 1.0
(
    defaultPrim = "CognitiveProfile"
    metersPerUnit = 1
    customLayerData = {
        string source = "The Translators"
        string version = "2.0"
        string generated = "${timestamp}"
        string purpose = "AI Communication Preferences + Perception Lens"
    }
)

def "CognitiveProfile" (
    kind = "component"
    doc = "Cognitive profile derived from behavioral observation, not self-report. Includes Wolfram Lens for mathematical perception definition."
)
{
    # === Core Traits ===
    # These map to USD composition priority (LIVRPS):
    # - Can be overridden by stronger layers (session-specific)
    # - Can be referenced by other USD files
    # - Can be varianted (work mode vs personal mode)

    custom string exploration = "${traits.exploration.label}"
    custom float exploration:score = ${traits.exploration.value.toFixed(3)}

    custom string thoroughness = "${traits.thoroughness.label}"
    custom float thoroughness:score = ${traits.thoroughness.value.toFixed(3)}

    custom string organization = "${traits.organization.label}"
    custom string organization:style = "${traits.organization.style}"

    custom string communication = "${traits.communication.label}"
    custom string communication:style = "${traits.communication.style}"

    custom string pace = "${traits.pace.label}"
    custom float pace:avgResponseMs = ${Math.round(traits.pace.value)}
${lensSection}
    # === Derived Insights ===
    def "Insights" (
        doc = "Behavioral patterns observed during profiling session"
    )
    {
${insights.map((insight, i) => `        custom string insight_${i} = "${this.escapeUSD(insight)}"`).join('\n')}
    }

    # === Communication Instructions ===
    def "Instructions" (
        doc = "How AI systems should communicate with this user"
    )
    {
${instructions.map((instr, i) => `        custom string instruction_${i} = "${this.escapeUSD(instr)}"`).join('\n')}
    }

    # === Metadata ===
    def "Meta" (
        doc = "Profiling session metadata"
    )
    {
        custom string source = "The Translators"
        custom string method = "behavioral_observation"
        custom string timestamp = "${timestamp}"
        custom int sessionDurationSec = 180
    }
}
`;

    return usda;
  }

  /**
   * Generate instructions array from traits (reused by both markdown and USD)
   */
  static generateInstructions(traits) {
    const instructions = [];

    if (traits.exploration.label === 'Expansive') {
      instructions.push("Feel free to explore tangents and connections");
    } else {
      instructions.push("Stay focused on the main thread");
    }

    if (traits.organization.label === 'Structured') {
      instructions.push("Present information in clear, ordered steps");
    } else if (traits.organization.label === 'Fluid') {
      instructions.push("Don't over-structure — flexibility is valued");
    }

    if (traits.communication.style === 'reflective') {
      instructions.push("Mirror my communication style");
    } else if (traits.communication.style === 'independent') {
      instructions.push("Share your own perspective, don't just echo");
    }

    if (traits.pace.label === 'Quick') {
      instructions.push("Get to the point efficiently");
    } else if (traits.pace.label === 'Deliberate') {
      instructions.push("Provide full context before conclusions");
    }

    return instructions;
  }

  /**
   * Escape special characters for USD string values
   */
  static escapeUSD(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  /**
   * Generate JSON format (useful for API integration)
   */
  static toJSON(profile) {
    const { traits, insights, lens } = profile;
    const instructions = this.generateInstructions(traits);

    const result = {
      schema: "cognitive-profile-v2",
      source: "The Translators",
      generated: new Date().toISOString(),
      traits: {
        exploration: { label: traits.exploration.label, score: traits.exploration.value },
        thoroughness: { label: traits.thoroughness.label, score: traits.thoroughness.value },
        organization: { label: traits.organization.label, style: traits.organization.style },
        communication: { label: traits.communication.label, style: traits.communication.style },
        pace: { label: traits.pace.label, avgResponseMs: traits.pace.value }
      },
      insights,
      instructions
    };

    // Include Wolfram Lens if available
    if (lens && lens.ready) {
      result.wolframLens = lens.toJSON();
    }

    return JSON.stringify(result, null, 2);
  }
}
