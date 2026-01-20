/**
 * Timing Constants — The Translators
 * Source: GAME_SPEC.md various sections
 * 
 * All timing/duration values live here.
 */

export const TIMING = {
  /**
   * Transitions
   */
  transitions: {
    // Overlay fade duration (ms)
    overlayFade: 400,
    
    // Delay before showing layer intro after previous layer ends
    layerTransitionDelay: 500,
    
    // Delay before starting gameplay after entering layer
    gameplayStartDelay: 400
  },

  /**
   * Layer 1: Exploration
   */
  explore: {
    // Delay before intro dialogue appears
    introDelay: 400
  },

  /**
   * Layer 2: Arrangement
   */
  arrange: {
    // Delay before continue button appears (ms)
    continueButtonDelay: 5000,
    
    // Delay before "stillness" dialogue (ms)
    // Source: GAME_SPEC.md "After 8s no action"
    stillnessDelay: 8000,
    
    // Intro dialogue delay
    introDelay: 400
  },

  /**
   * Layer 3: Communication
   */
  signal: {
    // Total rounds
    totalRounds: 4,
    
    // Delay before showing signal options after octopus starts pulsing
    optionsDelay: 1000,
    
    // Delay before next signal after response
    nextSignalDelay: 500,
    
    // Delay before starting first signal after intro
    firstSignalDelay: 600,
    
    // Intro dialogue delay
    introDelay: 400
  },

  /**
   * Dialogue system
   */
  dialogue: {
    // Delay after dialogue dismissed before callback fires
    callbackDelay: 100,
    
    // Blink animation period (ms) for continue indicator
    blinkPeriod: 1000
  },

  /**
   * Profile
   */
  profile: {
    // Processing pace thresholds (ms)
    // Source: GAME_SPEC.md "Processing Pace" trait
    quickThreshold: 2500,
    measuredThreshold: 4000,
    // Above measuredThreshold = "Deliberate"
    
    // Copy success message duration
    copyMessageDuration: 2500
  },

  /**
   * Animation timing
   */
  animation: {
    // Octopus tentacle wave period (seconds)
    tentacleWavePeriod: 5,
    
    // Octopus body breathe period (seconds)
    bodyBreathePeriod: 4,
    
    // Signal pulse frequency (multiplier on time)
    signalPulseSpeed: 4,
    
    // Ambient glow pulse frequency
    ambientGlowSpeed: 2,
    
    // Goal beacon pulse frequency
    goalPulseSpeed: 3
  }
};
