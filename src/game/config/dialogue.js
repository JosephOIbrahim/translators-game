/**
 * Dialogue — The Translators
 * Source: GAME_SPEC.md Verbal Cues sections
 * 
 * ALL dialogue text lives here. Never hardcode dialogue in state files.
 */

export const DIALOGUE = {
  /**
   * Layer 1: Exploration
   * Source: GAME_SPEC.md "LAYER 1: TWILIGHT ZONE — Navigation > Verbal Cues"
   */
  explore: {
    intro: "Follow me. There are fragments here — collect what calls to you.",
    
    // Orb collection triggers
    firstOrb: "You found one. Most swim right past.",
    halfOrbs: "You look in the corners.",
    allOrbs: "All of them. You miss nothing.",
    
    // Exit dialogue (behavior-dependent)
    exitHighExploration: "You wander before you arrive. What you found comes with us.",
    exitDirect: "Direct. You know where you're going."
  },

  /**
   * Layer 2: Arrangement
   * Source: GAME_SPEC.md "LAYER 2: MIDNIGHT ZONE — Arrangement > Verbal Cues"
   */
  arrange: {
    intro: "They float here now. Arrange them if you like. Or don't.",
    
    // Inactivity trigger (8 seconds)
    stillness: "Stillness is also a choice.",
    
    // Exit dialogue (organization-style-dependent)
    exitLinear: "You made order. Structure suits you.",
    exitClustered: "Grouped by kind. You see categories.",
    exitMinimal: "You let them drift. Ambiguity doesn't trouble you.",
    exitDistributed: "Scattered but intentional."
  },

  /**
   * Layer 3: Communication
   * Source: GAME_SPEC.md "LAYER 3: THE ABYSS — Communication > Verbal Cues"
   */
  signal: {
    intro: "No light here but what we make. I'll speak. You answer.",
    
    // Response acknowledgments
    responseMirror: "You speak my language back.",
    responseSimilar: "Close, but your own.",
    responseComplement: "You complete the thought.",
    responseContrast: "You answer with your own voice.",
    
    // Exit
    exit: "I see how you connect."
  },

  /**
   * UI Labels
   */
  ui: {
    speaker: "Octopus",
    continueHint: "▼ tap to continue",
    continueButton: "Continue →",
    copyButton: "Copy to Clipboard",
    restartButton: "Start Over",
    copySuccess: "Copied!",
    
    // Instructions per layer
    instructionExplore: "Move to guide • Tap orbs to collect • Reach the light above",
    instructionArrange: "Drag to arrange • Or leave them as they are",
    instructionSignal: "I speak in color • Choose how to respond"
  },

  /**
   * Title Screen — Honest framing
   */
  title: {
    main: "The Translators",
    subtitle: "A Cognitive Interview",
    description: "Answer a few questions about how you think. Your answers become a profile that helps AI communicate with you more naturally.",
    startButton: "Begin",
    duration: "~90 seconds"
  },

  /**
   * Layer Intro Screen
   */
  layerIntro: {
    labelFormat: "Layer {n} of 3", // {n} replaced at runtime
    enterButton: "Enter"
  },

  /**
   * Profile Screen — Export
   */
  profile: {
    subtitle: "Calibration Complete",
    title: "Your Lens",
    patternsHeader: "Perception Parameters",
    insightsHeader: "What This Means"
  },

  /**
   * Signal Response Labels
   */
  signalOptions: {
    mirror: "Echo",
    similar: "Harmony",
    complement: "Balance",
    contrast: "Contrast"
  }
};

/**
 * Get layer intro text
 * @param {number} layerIndex - 0-indexed layer number
 * @returns {string} Formatted layer label
 */
export function getLayerLabel(layerIndex) {
  return DIALOGUE.layerIntro.labelFormat.replace('{n}', layerIndex + 1);
}
