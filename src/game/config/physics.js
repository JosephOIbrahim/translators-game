/**
 * Physics Constants — The Translators
 * Source: GAME_SPEC.md Octopus Specification > Movement
 * 
 * All physics tuning happens here, not in entity files.
 */

export const PHYSICS = {
  /**
   * Octopus movement
   * Source: GAME_SPEC.md "Octopus Specification > Movement"
   */
  octopus: {
    // Acceleration toward target (0.02 in spec)
    acceleration: 0.02,
    
    // Velocity damping per frame (0.92 in spec)
    drag: 0.92,
    
    // Eye tracking limits (pixels)
    eyeTrackRange: { x: 3, y: 2 }
  },

  /**
   * Orb behavior
   */
  orb: {
    // Collection radius (pixels)
    collectRadius: 50,
    
    // Pulse speed (radians per frame)
    pulseSpeed: 0.05,
    
    // Pulse amplitude (0-1 multiplier)
    pulseAmplitude: 0.3,
    
    // Base pulse (minimum scale)
    pulseBase: 0.7
  },

  /**
   * Element behavior (Layer 2)
   */
  element: {
    // Drift velocity range
    driftSpeed: 0.3,
    
    // Drag detection radius (pixels added to element size)
    dragPadding: 20,
    
    // Boundary padding (pixels from edge)
    boundaryPadding: {
      left: 50,
      right: 50,
      top: 80,
      bottom: 150
    }
  },

  /**
   * Goal beacon (Layer 1)
   */
  goal: {
    // Radius for completion detection
    reachRadius: 80,
    
    // Visual radii
    outerGlowRadius: 70,
    innerRingRadius: 40,
    centerRadius: 8
  },

  /**
   * Particles
   */
  particle: {
    // Upward drift speed range
    speedMin: 0.2,
    speedMax: 0.5,
    
    // Size range
    sizeMin: 2,
    sizeMax: 4,
    
    // Alpha range
    alphaMin: 0.2,
    alphaMax: 0.5,
    
    // Count per layer
    countExplore: 20,
    countArrange: 12,
    countSignal: 8
  },

  /**
   * Analysis thresholds
   * Source: GAME_SPEC.md organization style classification
   */
  analysis: {
    // Alignment threshold (pixels)
    alignmentThreshold: 30,
    
    // Clustering threshold (pixels from centroid)
    clusterThreshold: 80,
    
    // Minimum actions for "minimal" classification
    minimalActionsThreshold: 3,
    
    // Minimum alignment pairs for "linear" classification
    linearAlignmentThreshold: 2,
    
    // Cluster ratio for "clustered" classification
    clusterRatioThreshold: 0.6
  }
};
