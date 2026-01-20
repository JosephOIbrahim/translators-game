/**
 * ProfileSchema.js - Cognitive Profile Structure
 *
 * This schema defines the structure for capturing cognitive patterns.
 * NOT a diagnostic tool. This reveals HOW someone's mind works,
 * not what's "wrong" with them.
 *
 * Philosophy: If someone has ADHD but doesn't know it, the profile
 * should reveal the PATTERN that explains their EXPERIENCE.
 * "Your focus works differently" not "You have attention problems"
 */

// ============================================================================
// DOMAIN DEFINITIONS
// ============================================================================

/**
 * The 8 cognitive domains we measure.
 * Each domain has multiple dimensions to capture nuance.
 */
export const COGNITIVE_DOMAINS = {
  ATTENTION: 'attention',
  WORKING_MEMORY: 'workingMemory',
  TIME_PERCEPTION: 'timePerception',
  ENERGY: 'energy',
  MOTIVATION: 'motivation',
  PROCESSING: 'processing',
  EMOTIONAL: 'emotional',
  SOCIAL: 'social'
};

// ============================================================================
// ATTENTION ARCHITECTURE
// ============================================================================

/**
 * Attention isn't "good" or "bad" - it has a STYLE.
 * This captures HOW attention operates, not how "much" there is.
 */
export const AttentionStyles = {
  SUSTAINED: 'sustained',           // Can maintain focus through willpower
  INTEREST_DRIVEN: 'interest-driven', // Focus follows engagement, not effort
  BURST_BASED: 'burst-based',       // Intense focus periods, then needs reset
  CONTEXT_DEPENDENT: 'context-dependent', // Highly variable based on environment
  FLEXIBLE: 'flexible'              // Can switch between modes adaptively
};

export const AttentionTriggers = {
  NOVELTY: 'novelty',               // New things capture attention
  URGENCY: 'urgency',               // Deadlines activate focus
  CHALLENGE: 'challenge',           // Difficulty engages attention
  SOCIAL: 'social',                 // Others' presence helps focus
  INTEREST: 'interest',             // Personal relevance required
  STRUCTURE: 'structure'            // External organization helps
};

export const AttentionDrains = {
  ROUTINE: 'routine',               // Repetitive tasks deplete
  WAITING: 'waiting',               // Passive waiting is hard
  AMBIGUITY: 'ambiguity',           // Unclear expectations drain
  LOW_STAKES: 'low-stakes',         // Unimportant tasks don't engage
  MONOTONY: 'monotony',             // Same stimulation level depletes
  INTERRUPTIONS: 'interruptions'    // Context switching is costly
};

// ============================================================================
// WORKING MEMORY & COGNITIVE LOAD
// ============================================================================

export const WorkingMemoryCapacity = {
  HIGH: 'high',           // Can juggle 5-7 things mentally
  MEDIUM: 'medium',       // 3-4 things comfortably
  LOW: 'low',             // 1-2 things before overload
  VARIABLE: 'variable'    // Changes with energy/interest
};

export const ScaffoldingNeed = {
  MINIMAL: 'minimal',     // Rarely needs external support
  MODERATE: 'moderate',   // Lists/reminders helpful but not essential
  SIGNIFICANT: 'significant', // Strongly benefits from external systems
  ESSENTIAL: 'essential'  // External systems are necessary for function
};

export const ChunkSize = {
  LARGE: 'large',         // Can handle big tasks as units
  MEDIUM: 'medium',       // Needs moderate breakdown
  SMALL: 'small',         // Needs fine-grained steps
  MICRO: 'micro'          // Needs very small, immediate steps
};

// ============================================================================
// TIME PERCEPTION
// ============================================================================

export const TimeAccuracy = {
  ACCURATE: 'accurate',         // Reliable time estimates
  OPTIMISTIC: 'optimistic',     // Consistently underestimates
  PESSIMISTIC: 'pessimistic',   // Consistently overestimates
  UNPREDICTABLE: 'unpredictable' // No reliable pattern (time-blind)
};

export const DeadlineRelationship = {
  MOTIVATING: 'motivating',     // Deadlines help activate
  PARALYZING: 'paralyzing',     // Deadlines cause freeze
  IRRELEVANT: 'irrelevant',     // Deadlines don't register
  ESSENTIAL: 'essential'        // Only functions with deadlines
};

export const TimeOrientation = {
  PAST: 'past',                 // Reflects on what happened
  PRESENT: 'present',           // Lives in the now
  FUTURE: 'future',             // Plans and anticipates
  FLUID: 'fluid'                // Time feels non-linear
};

// ============================================================================
// ENERGY & REGULATION
// ============================================================================

export const EnergyPattern = {
  STEADY: 'steady',             // Consistent energy throughout
  BURST: 'burst',               // Intense periods, needs recovery
  CYCLICAL: 'cyclical',         // Predictable highs and lows
  REACTIVE: 'reactive',         // Energy responds to external factors
  VOLATILE: 'volatile'          // Unpredictable fluctuations
};

export const RecoveryNeed = {
  LOW: 'low',                   // Quick bounce-back
  MODERATE: 'moderate',         // Needs reasonable downtime
  HIGH: 'high',                 // Extended recovery required
  PROPORTIONAL: 'proportional'  // Recovery scales with exertion
};

export const BurnoutSignals = {
  IRRITABILITY: 'irritability',
  SHUTDOWN: 'shutdown',
  HYPERACTIVITY: 'hyperactivity',
  PHYSICAL: 'physical',
  EMOTIONAL: 'emotional',
  COGNITIVE: 'cognitive'
};

// ============================================================================
// MOTIVATION ARCHITECTURE
// ============================================================================

export const MotivationDrivers = {
  INTRINSIC: 'intrinsic',       // Internal satisfaction
  EXTRINSIC: 'extrinsic',       // External rewards/consequences
  SOCIAL: 'social',             // Others' expectations/approval
  CHALLENGE: 'challenge',       // Difficulty and mastery
  NOVELTY: 'novelty',           // Newness and variety
  PURPOSE: 'purpose'            // Meaning and significance
};

// ============================================================================
// PROCESSING STYLE
// ============================================================================

export const ProcessingMode = {
  LINEAR: 'linear',             // Step-by-step, sequential
  PARALLEL: 'parallel',         // Multiple threads simultaneously
  RANDOM: 'random',             // Non-linear, associative
  HIERARCHICAL: 'hierarchical', // Top-down structured
  EMERGENT: 'emergent'          // Bottom-up pattern recognition
};

export const ProcessingDepth = {
  DEEP_NARROW: 'deep-narrow',         // Goes deep on few things
  SHALLOW_BROAD: 'shallow-broad',     // Covers many things surface-level
  CONTEXT_DEPENDENT: 'context-dependent', // Depth varies with interest
  COMPREHENSIVE: 'comprehensive'      // Both deep and broad
};

export const LearningModalities = {
  VISUAL: 'visual',
  AUDITORY: 'auditory',
  KINESTHETIC: 'kinesthetic',
  READING: 'reading',
  EXPERIENTIAL: 'experiential',
  SOCIAL: 'social'
};

// ============================================================================
// EMOTIONAL PATTERNS
// ============================================================================

export const EmotionalIntensity = {
  HIGH: 'high',                 // Feels things strongly
  MODERATE: 'moderate',         // Typical range
  LOW: 'low',                   // Muted emotional response
  VARIABLE: 'variable'          // Context-dependent intensity
};

export const EmotionalRecovery = {
  FAST: 'fast',                 // Bounces back quickly
  MODERATE: 'moderate',         // Standard recovery time
  SLOW: 'slow',                 // Takes time to process
  ACCUMULATIVE: 'accumulative'  // Effects stack over time
};

// ============================================================================
// SOCIAL ENERGY
// ============================================================================

export const SocialRecharge = {
  ALONE: 'alone',               // Recharges in solitude
  SOCIAL: 'social',             // Recharges with others
  SELECTIVE: 'selective',       // Depends on who
  MIXED: 'mixed'                // Needs balance of both
};

export const MaskingLevel = {
  MINIMAL: 'minimal',           // Presents authentically
  SITUATIONAL: 'situational',   // Masks in specific contexts
  FREQUENT: 'frequent',         // Often presents differently
  CONSTANT: 'constant'          // Always managing presentation
};

// ============================================================================
// PROFILE SCHEMA
// ============================================================================

/**
 * Creates a new empty cognitive profile.
 * Confidence values (0-1) indicate measurement strength.
 * null values indicate unmeasured dimensions.
 */
export function createEmptyProfile() {
  return {
    version: '1.0.0',
    created: Date.now(),
    lastUpdated: Date.now(),
    questionsAnswered: 0,
    sessionsCompleted: 0,

    // Each domain has dimensions and confidence scores
    attention: {
      style: null,                    // AttentionStyles
      styleConfidence: 0,
      variability: null,              // 0-1 (how consistent)
      triggers: [],                   // AttentionTriggers[]
      triggersConfidence: 0,
      drains: [],                     // AttentionDrains[]
      drainsConfidence: 0,
      hyperfocusCapable: null,        // boolean
      hyperfocusConfidence: 0
    },

    workingMemory: {
      capacity: null,                 // WorkingMemoryCapacity
      capacityConfidence: 0,
      scaffoldingNeed: null,          // ScaffoldingNeed
      scaffoldingConfidence: 0,
      optimalChunkSize: null,         // ChunkSize
      chunkConfidence: 0,
      overloadSignals: []             // What happens when overloaded
    },

    timePerception: {
      accuracy: null,                 // TimeAccuracy
      accuracyConfidence: 0,
      deadlineRelationship: null,     // DeadlineRelationship
      deadlineConfidence: 0,
      orientation: null,              // TimeOrientation
      orientationConfidence: 0,
      urgencyThreshold: null          // How close deadline must be to activate
    },

    energy: {
      pattern: null,                  // EnergyPattern
      patternConfidence: 0,
      peakTimes: [],                  // ['morning', 'afternoon', 'evening', 'night']
      peakConfidence: 0,
      recoveryNeed: null,             // RecoveryNeed
      recoveryConfidence: 0,
      burnoutSignals: [],             // BurnoutSignals[]
      currentLevel: null              // Tracked during session (0-1)
    },

    motivation: {
      primaryDriver: null,            // MotivationDrivers
      driverConfidence: 0,
      secondaryDrivers: [],           // MotivationDrivers[]
      noveltyDrive: null,             // 0-1
      noveltyConfidence: 0,
      completionDrive: null,          // 0-1 (how much finishing matters)
      completionConfidence: 0,
      perfectionismLevel: null        // 0-1
    },

    processing: {
      mode: null,                     // ProcessingMode
      modeConfidence: 0,
      depth: null,                    // ProcessingDepth
      depthConfidence: 0,
      learningModalities: [],         // LearningModalities[] (ranked)
      modalityConfidence: 0
    },

    emotional: {
      intensity: null,                // EmotionalIntensity
      intensityConfidence: 0,
      recovery: null,                 // EmotionalRecovery
      recoveryConfidence: 0,
      frustrationTolerance: null,     // 0-1
      frustrationConfidence: 0,
      rejectionSensitivity: null,     // 0-1 (RSD indicator)
      rsdConfidence: 0
    },

    social: {
      rechargeMode: null,             // SocialRecharge
      rechargeConfidence: 0,
      dailyCapacity: null,            // 0-1 (social energy budget)
      capacityConfidence: 0,
      maskingLevel: null,             // MaskingLevel
      maskingConfidence: 0
    },

    // Cross-domain patterns that emerge from triangulation
    emergentPatterns: {
      interestDrivenNervousSystem: null,  // ADHD indicator
      executiveFunctionChallenges: null,
      sensoryProcessingDifferences: null,
      neurodivergentSignals: [],
      strengthAreas: [],
      growthAreas: []
    },

    // Behavioral data (implicit measurement)
    behavioralSignals: {
      averageResponseTime: null,
      responseTimeVariability: null,
      revisionsCount: 0,
      sessionEngagementCurve: [],
      optimalSessionLength: null,
      preferredTimeOfDay: null
    }
  };
}

/**
 * Calculates overall profile completeness (0-1)
 */
export function calculateProfileCompleteness(profile) {
  const domains = [
    profile.attention,
    profile.workingMemory,
    profile.timePerception,
    profile.energy,
    profile.motivation,
    profile.processing,
    profile.emotional,
    profile.social
  ];

  let measured = 0;
  let total = 0;

  domains.forEach(domain => {
    Object.entries(domain).forEach(([key, value]) => {
      if (key.endsWith('Confidence')) {
        total++;
        if (value > 0.3) measured++;
      }
    });
  });

  return total > 0 ? measured / total : 0;
}

/**
 * Determines which domains need more questions
 */
export function getUnderexploredDomains(profile) {
  const domainConfidences = {
    attention: averageConfidence(profile.attention),
    workingMemory: averageConfidence(profile.workingMemory),
    timePerception: averageConfidence(profile.timePerception),
    energy: averageConfidence(profile.energy),
    motivation: averageConfidence(profile.motivation),
    processing: averageConfidence(profile.processing),
    emotional: averageConfidence(profile.emotional),
    social: averageConfidence(profile.social)
  };

  return Object.entries(domainConfidences)
    .filter(([_, confidence]) => confidence < 0.5)
    .sort((a, b) => a[1] - b[1])
    .map(([domain]) => domain);
}

function averageConfidence(domain) {
  const confidenceKeys = Object.keys(domain).filter(k => k.endsWith('Confidence'));
  if (confidenceKeys.length === 0) return 0;
  const sum = confidenceKeys.reduce((acc, key) => acc + (domain[key] || 0), 0);
  return sum / confidenceKeys.length;
}

/**
 * Checks if enough data exists to generate meaningful insights
 */
export function hasMinimumViableProfile(profile) {
  const completeness = calculateProfileCompleteness(profile);
  const questionsAnswered = profile.questionsAnswered || 0;
  return completeness > 0.3 && questionsAnswered >= 10;
}

/**
 * Profile checksum for consistency validation (ThinkingMachines compliance)
 */
export function computeProfileChecksum(profile) {
  const stableData = {
    attention: profile.attention,
    workingMemory: profile.workingMemory,
    timePerception: profile.timePerception,
    energy: profile.energy,
    motivation: profile.motivation,
    processing: profile.processing,
    emotional: profile.emotional,
    social: profile.social
  };

  const str = JSON.stringify(stableData, Object.keys(stableData).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export default {
  COGNITIVE_DOMAINS,
  AttentionStyles,
  AttentionTriggers,
  AttentionDrains,
  WorkingMemoryCapacity,
  ScaffoldingNeed,
  ChunkSize,
  TimeAccuracy,
  DeadlineRelationship,
  TimeOrientation,
  EnergyPattern,
  RecoveryNeed,
  BurnoutSignals,
  MotivationDrivers,
  ProcessingMode,
  ProcessingDepth,
  LearningModalities,
  EmotionalIntensity,
  EmotionalRecovery,
  SocialRecharge,
  MaskingLevel,
  createEmptyProfile,
  calculateProfileCompleteness,
  getUnderexploredDomains,
  hasMinimumViableProfile,
  computeProfileChecksum
};
