/**
 * QuestionBank.js - Deep Cognitive Profiling Questions
 *
 * These questions are designed to reveal cognitive patterns through
 * EXPERIENCE, not self-assessment. We ask "what happens" not "how would
 * you rate yourself."
 *
 * Triangulation: Each construct is measured by 3+ questions approaching
 * from different angles. This catches inconsistencies and builds confidence.
 *
 * Philosophy: Non-pathologizing. "Many people find..." normalizes.
 * We surface patterns, not diagnoses.
 */

import {
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
  MaskingLevel
} from './ProfileSchema.js';

// ============================================================================
// QUESTION STRUCTURE
// ============================================================================

/**
 * Question tiers control progressive disclosure:
 * - CORE: Asked in first session (10-12 questions)
 * - DOMAIN: Asked based on initial signals (4-6 per domain)
 * - DEEP: Asked for high-confidence profiling (2-3 per domain)
 */
export const QuestionTier = {
  CORE: 'core',
  DOMAIN: 'domain',
  DEEP: 'deep'
};

/**
 * Each question has:
 * - id: unique identifier
 * - text: the question itself
 * - domain: which cognitive domain it measures
 * - tier: when to ask it
 * - options: choices with scoring rubrics
 * - triangulatesWith: other question IDs measuring same construct
 */

// ============================================================================
// ATTENTION DOMAIN
// ============================================================================

const attentionQuestions = [
  // CORE: Attention style detection
  {
    id: 'ATT_STYLE_01',
    text: "You're working on something important. A notification appears. What typically happens?",
    domain: COGNITIVE_DOMAINS.ATTENTION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['ATT_STYLE_02', 'ATT_STYLE_03'],
    options: [
      {
        text: "I ignore it and finish what I'm doing",
        scores: { attentionStyle: AttentionStyles.SUSTAINED, attentionVariability: 0.2 }
      },
      {
        text: "I check it immediately, then struggle to remember where I was",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, attentionVariability: 0.8 }
      },
      {
        text: "I check it but return to my work easily",
        scores: { attentionStyle: AttentionStyles.FLEXIBLE, attentionVariability: 0.4 }
      },
      {
        text: "It depends entirely on how engaged I am with the current task",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, attentionVariability: 0.7 }
      }
    ]
  },

  {
    id: 'ATT_STYLE_02',
    text: "Think about the most productive period you've had recently. What made it work?",
    domain: COGNITIVE_DOMAINS.ATTENTION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['ATT_STYLE_01', 'ATT_STYLE_03'],
    options: [
      {
        text: "I blocked all distractions and forced myself to focus",
        scores: { attentionStyle: AttentionStyles.SUSTAINED, triggers: [AttentionTriggers.STRUCTURE] }
      },
      {
        text: "There was a deadline breathing down my neck",
        scores: { attentionStyle: AttentionStyles.BURST_BASED, triggers: [AttentionTriggers.URGENCY] }
      },
      {
        text: "I was genuinely fascinated by what I was doing",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, triggers: [AttentionTriggers.INTEREST] }
      },
      {
        text: "Someone was counting on me to deliver",
        scores: { attentionStyle: AttentionStyles.CONTEXT_DEPENDENT, triggers: [AttentionTriggers.SOCIAL] }
      },
      {
        text: "Honestly, I struggle to remember having a truly productive period",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, attentionVariability: 0.9 }
      }
    ]
  },

  {
    id: 'ATT_STYLE_03',
    text: "When you read something that doesn't interest you but is necessary, what happens?",
    domain: COGNITIVE_DOMAINS.ATTENTION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['ATT_STYLE_01', 'ATT_STYLE_02'],
    options: [
      {
        text: "I can push through it, just takes discipline",
        scores: { attentionStyle: AttentionStyles.SUSTAINED, drains: [] }
      },
      {
        text: "My eyes move across the words but nothing sticks",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, drains: [AttentionDrains.LOW_STAKES] }
      },
      {
        text: "I read the same paragraph multiple times",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, attentionVariability: 0.8 }
      },
      {
        text: "I find a way to make it interesting or give up",
        scores: { attentionStyle: AttentionStyles.INTEREST_DRIVEN, triggers: [AttentionTriggers.NOVELTY] }
      }
    ]
  },

  // DOMAIN: Hyperfocus detection
  {
    id: 'ATT_HYPER_01',
    text: "Have you ever looked up from something you were doing to find hours had passed without noticing?",
    domain: COGNITIVE_DOMAINS.ATTENTION,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['ATT_HYPER_02'],
    options: [
      {
        text: "Yes, regularly - time disappears when I'm into something",
        scores: { hyperfocusCapable: true, attentionStyle: AttentionStyles.INTEREST_DRIVEN }
      },
      {
        text: "Occasionally, but it's rare",
        scores: { hyperfocusCapable: true, attentionVariability: 0.5 }
      },
      {
        text: "Not really - I'm usually aware of time passing",
        scores: { hyperfocusCapable: false, attentionStyle: AttentionStyles.SUSTAINED }
      },
      {
        text: "I wish - I can't stay focused long enough for that",
        scores: { hyperfocusCapable: false, attentionVariability: 0.9 }
      }
    ]
  },

  {
    id: 'ATT_HYPER_02',
    text: "When you're deeply engaged with something interesting, and someone interrupts you, what happens?",
    domain: COGNITIVE_DOMAINS.ATTENTION,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['ATT_HYPER_01'],
    options: [
      {
        text: "I feel a surge of irritation, even if they can't see it",
        scores: { hyperfocusCapable: true, drains: [AttentionDrains.INTERRUPTIONS] }
      },
      {
        text: "I shift to them easily, then back to my task",
        scores: { hyperfocusCapable: false, attentionStyle: AttentionStyles.FLEXIBLE }
      },
      {
        text: "I lose my train of thought completely and it's hard to get back",
        scores: { hyperfocusCapable: true, drains: [AttentionDrains.INTERRUPTIONS] }
      },
      {
        text: "I don't usually get that focused, so interruptions aren't a big deal",
        scores: { hyperfocusCapable: false, attentionVariability: 0.7 }
      }
    ]
  },

  // DEEP: Attention drain patterns
  {
    id: 'ATT_DRAIN_01',
    text: "Which type of work feels the most exhausting to you?",
    domain: COGNITIVE_DOMAINS.ATTENTION,
    tier: QuestionTier.DEEP,
    options: [
      {
        text: "Repetitive tasks, even if they're easy",
        scores: { drains: [AttentionDrains.ROUTINE, AttentionDrains.MONOTONY] }
      },
      {
        text: "Waiting for others before I can proceed",
        scores: { drains: [AttentionDrains.WAITING] }
      },
      {
        text: "Tasks with unclear expectations or goals",
        scores: { drains: [AttentionDrains.AMBIGUITY] }
      },
      {
        text: "Things that don't feel important or meaningful",
        scores: { drains: [AttentionDrains.LOW_STAKES], triggers: [AttentionTriggers.INTEREST] }
      }
    ]
  }
];

// ============================================================================
// WORKING MEMORY DOMAIN
// ============================================================================

const workingMemoryQuestions = [
  // CORE: Capacity detection
  {
    id: 'WM_CAP_01',
    text: "Someone gives you multi-step instructions verbally. What happens?",
    domain: COGNITIVE_DOMAINS.WORKING_MEMORY,
    tier: QuestionTier.CORE,
    triangulatesWith: ['WM_CAP_02', 'WM_SCAFFOLD_01'],
    options: [
      {
        text: "I remember them all and execute in order",
        scores: { capacity: WorkingMemoryCapacity.HIGH }
      },
      {
        text: "I remember the first few and improvise the rest",
        scores: { capacity: WorkingMemoryCapacity.MEDIUM }
      },
      {
        text: "I ask them to slow down or write it down",
        scores: { capacity: WorkingMemoryCapacity.LOW, scaffoldingNeed: ScaffoldingNeed.SIGNIFICANT }
      },
      {
        text: "I retain them initially but lose details as I work",
        scores: { capacity: WorkingMemoryCapacity.VARIABLE }
      }
    ]
  },

  {
    id: 'WM_CAP_02',
    text: "When juggling multiple projects or tasks, what describes you best?",
    domain: COGNITIVE_DOMAINS.WORKING_MEMORY,
    tier: QuestionTier.CORE,
    triangulatesWith: ['WM_CAP_01', 'WM_SCAFFOLD_01'],
    options: [
      {
        text: "I can track 4-5 things mentally without lists",
        scores: { capacity: WorkingMemoryCapacity.HIGH }
      },
      {
        text: "2-3 things is comfortable, more than that gets messy",
        scores: { capacity: WorkingMemoryCapacity.MEDIUM }
      },
      {
        text: "I prefer to focus on one thing completely before switching",
        scores: { capacity: WorkingMemoryCapacity.LOW }
      },
      {
        text: "I can handle many things if I have systems, but not in my head alone",
        scores: { capacity: WorkingMemoryCapacity.VARIABLE, scaffoldingNeed: ScaffoldingNeed.ESSENTIAL }
      }
    ]
  },

  // DOMAIN: Scaffolding needs
  {
    id: 'WM_SCAFFOLD_01',
    text: "How important are external systems (lists, reminders, calendars) for you?",
    domain: COGNITIVE_DOMAINS.WORKING_MEMORY,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['WM_CAP_01', 'WM_CAP_02'],
    options: [
      {
        text: "Nice to have, but I function fine without them",
        scores: { scaffoldingNeed: ScaffoldingNeed.MINIMAL }
      },
      {
        text: "They help me stay organized and on top of things",
        scores: { scaffoldingNeed: ScaffoldingNeed.MODERATE }
      },
      {
        text: "Without them, important things fall through the cracks",
        scores: { scaffoldingNeed: ScaffoldingNeed.SIGNIFICANT }
      },
      {
        text: "I've tried many systems but struggle to use them consistently",
        scores: { scaffoldingNeed: ScaffoldingNeed.ESSENTIAL, emergentPattern: 'executiveFunctionChallenges' }
      }
    ]
  },

  // DOMAIN: Optimal chunk size
  {
    id: 'WM_CHUNK_01',
    text: "When facing a large project, what helps you most?",
    domain: COGNITIVE_DOMAINS.WORKING_MEMORY,
    tier: QuestionTier.DOMAIN,
    options: [
      {
        text: "Understanding the big picture, then working through it",
        scores: { chunkSize: ChunkSize.LARGE }
      },
      {
        text: "Breaking it into a few major milestones",
        scores: { chunkSize: ChunkSize.MEDIUM }
      },
      {
        text: "Having it broken down into small, concrete next steps",
        scores: { chunkSize: ChunkSize.SMALL }
      },
      {
        text: "Knowing only the immediate next action - anything more feels overwhelming",
        scores: { chunkSize: ChunkSize.MICRO, emergentPattern: 'executiveFunctionChallenges' }
      }
    ]
  }
];

// ============================================================================
// TIME PERCEPTION DOMAIN
// ============================================================================

const timePerceptionQuestions = [
  // CORE: Time estimation accuracy
  {
    id: 'TIME_ACC_01',
    text: "When you estimate how long a task will take, what usually happens?",
    domain: COGNITIVE_DOMAINS.TIME_PERCEPTION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['TIME_ACC_02', 'TIME_DEAD_01'],
    options: [
      {
        text: "I'm usually pretty accurate",
        scores: { timeAccuracy: TimeAccuracy.ACCURATE }
      },
      {
        text: "It almost always takes longer than I thought",
        scores: { timeAccuracy: TimeAccuracy.OPTIMISTIC }
      },
      {
        text: "I overestimate to be safe, so I often finish early",
        scores: { timeAccuracy: TimeAccuracy.PESSIMISTIC }
      },
      {
        text: "I honestly have no idea - time is unpredictable for me",
        scores: { timeAccuracy: TimeAccuracy.UNPREDICTABLE, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  {
    id: 'TIME_ACC_02',
    text: "Think about the last time you were almost late for something important. Why did it happen?",
    domain: COGNITIVE_DOMAINS.TIME_PERCEPTION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['TIME_ACC_01', 'TIME_DEAD_01'],
    options: [
      {
        text: "I rarely run late - I build in buffers",
        scores: { timeAccuracy: TimeAccuracy.ACCURATE }
      },
      {
        text: "I underestimated how long something would take",
        scores: { timeAccuracy: TimeAccuracy.OPTIMISTIC }
      },
      {
        text: "I lost track of time doing something else",
        scores: { timeAccuracy: TimeAccuracy.UNPREDICTABLE, timeOrientation: TimeOrientation.PRESENT }
      },
      {
        text: "I waited too long to start getting ready",
        scores: { timeAccuracy: TimeAccuracy.OPTIMISTIC, deadlineRelationship: DeadlineRelationship.IRRELEVANT }
      }
    ]
  },

  // CORE: Deadline relationship
  {
    id: 'TIME_DEAD_01',
    text: "How does having a deadline affect you?",
    domain: COGNITIVE_DOMAINS.TIME_PERCEPTION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['TIME_ACC_01', 'TIME_ACC_02'],
    options: [
      {
        text: "It helps me plan backward and pace myself",
        scores: { deadlineRelationship: DeadlineRelationship.MOTIVATING, timeOrientation: TimeOrientation.FUTURE }
      },
      {
        text: "It activates me - I do my best work under pressure",
        scores: { deadlineRelationship: DeadlineRelationship.ESSENTIAL, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "It makes me anxious and sometimes I freeze up",
        scores: { deadlineRelationship: DeadlineRelationship.PARALYZING }
      },
      {
        text: "I know it's there but it doesn't feel real until it's close",
        scores: { deadlineRelationship: DeadlineRelationship.IRRELEVANT, timeAccuracy: TimeAccuracy.UNPREDICTABLE }
      }
    ]
  },

  // DOMAIN: Time orientation
  {
    id: 'TIME_ORI_01',
    text: "Where does your mind naturally spend most of its time?",
    domain: COGNITIVE_DOMAINS.TIME_PERCEPTION,
    tier: QuestionTier.DOMAIN,
    options: [
      {
        text: "Reflecting on what happened and what I learned",
        scores: { timeOrientation: TimeOrientation.PAST }
      },
      {
        text: "Immersed in whatever is happening now",
        scores: { timeOrientation: TimeOrientation.PRESENT }
      },
      {
        text: "Planning and anticipating what's coming",
        scores: { timeOrientation: TimeOrientation.FUTURE }
      },
      {
        text: "Time feels less like a line and more like... everything at once?",
        scores: { timeOrientation: TimeOrientation.FLUID, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  }
];

// ============================================================================
// ENERGY DOMAIN
// ============================================================================

const energyQuestions = [
  // CORE: Energy pattern
  {
    id: 'NRG_PAT_01',
    text: "How would you describe your typical energy pattern throughout the day?",
    domain: COGNITIVE_DOMAINS.ENERGY,
    tier: QuestionTier.CORE,
    triangulatesWith: ['NRG_PAT_02', 'NRG_REC_01'],
    options: [
      {
        text: "Fairly consistent - I maintain a steady level",
        scores: { energyPattern: EnergyPattern.STEADY }
      },
      {
        text: "Bursts of high energy followed by crashes",
        scores: { energyPattern: EnergyPattern.BURST, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "Predictable peaks and valleys at certain times",
        scores: { energyPattern: EnergyPattern.CYCLICAL }
      },
      {
        text: "Highly dependent on what I'm doing and who I'm with",
        scores: { energyPattern: EnergyPattern.REACTIVE }
      },
      {
        text: "Unpredictable - I never know what I'll have",
        scores: { energyPattern: EnergyPattern.VOLATILE }
      }
    ]
  },

  {
    id: 'NRG_PAT_02',
    text: "After completing something mentally demanding, what do you need?",
    domain: COGNITIVE_DOMAINS.ENERGY,
    tier: QuestionTier.CORE,
    triangulatesWith: ['NRG_PAT_01', 'NRG_REC_01'],
    options: [
      {
        text: "A short break, then I can continue",
        scores: { recoveryNeed: RecoveryNeed.LOW }
      },
      {
        text: "Reasonable downtime - maybe an hour or so",
        scores: { recoveryNeed: RecoveryNeed.MODERATE }
      },
      {
        text: "Extended recovery - I'm often depleted for the rest of the day",
        scores: { recoveryNeed: RecoveryNeed.HIGH, energyPattern: EnergyPattern.BURST }
      },
      {
        text: "It scales with how intense the work was",
        scores: { recoveryNeed: RecoveryNeed.PROPORTIONAL }
      }
    ]
  },

  // DOMAIN: Recovery patterns
  {
    id: 'NRG_REC_01',
    text: "When you're running on empty, what happens?",
    domain: COGNITIVE_DOMAINS.ENERGY,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['NRG_PAT_01', 'NRG_PAT_02'],
    options: [
      {
        text: "I get irritable and snap more easily",
        scores: { burnoutSignals: [BurnoutSignals.IRRITABILITY] }
      },
      {
        text: "I shut down and can't think clearly",
        scores: { burnoutSignals: [BurnoutSignals.SHUTDOWN, BurnoutSignals.COGNITIVE] }
      },
      {
        text: "I get more frantic and hyperactive, not less",
        scores: { burnoutSignals: [BurnoutSignals.HYPERACTIVITY], emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "My body starts giving me signals (headaches, tension, etc.)",
        scores: { burnoutSignals: [BurnoutSignals.PHYSICAL] }
      },
      {
        text: "I feel everything more intensely and get emotional",
        scores: { burnoutSignals: [BurnoutSignals.EMOTIONAL] }
      }
    ]
  },

  // DOMAIN: Peak times
  {
    id: 'NRG_PEAK_01',
    text: "When do you do your best thinking?",
    domain: COGNITIVE_DOMAINS.ENERGY,
    tier: QuestionTier.DOMAIN,
    options: [
      {
        text: "Morning - I'm sharpest when the day is fresh",
        scores: { peakTimes: ['morning'] }
      },
      {
        text: "Afternoon - I need time to warm up",
        scores: { peakTimes: ['afternoon'] }
      },
      {
        text: "Evening - I come alive when others are winding down",
        scores: { peakTimes: ['evening'] }
      },
      {
        text: "Late night - the quiet hours are my best",
        scores: { peakTimes: ['night'] }
      },
      {
        text: "It varies - no consistent pattern",
        scores: { peakTimes: ['morning', 'afternoon', 'evening', 'night'], energyPattern: EnergyPattern.VOLATILE }
      }
    ]
  }
];

// ============================================================================
// MOTIVATION DOMAIN
// ============================================================================

const motivationQuestions = [
  // CORE: Primary driver
  {
    id: 'MOT_DRV_01',
    text: "When you think about tasks you've completed well, what made the difference?",
    domain: COGNITIVE_DOMAINS.MOTIVATION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['MOT_DRV_02', 'MOT_NOV_01'],
    options: [
      {
        text: "Personal satisfaction and pride in the work itself",
        scores: { primaryDriver: MotivationDrivers.INTRINSIC }
      },
      {
        text: "Recognition, rewards, or avoiding consequences",
        scores: { primaryDriver: MotivationDrivers.EXTRINSIC }
      },
      {
        text: "Not wanting to let others down",
        scores: { primaryDriver: MotivationDrivers.SOCIAL }
      },
      {
        text: "The challenge and opportunity to master something",
        scores: { primaryDriver: MotivationDrivers.CHALLENGE }
      },
      {
        text: "It was new and interesting",
        scores: { primaryDriver: MotivationDrivers.NOVELTY, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  {
    id: 'MOT_DRV_02',
    text: "You have a task you've been putting off. What would actually make you do it?",
    domain: COGNITIVE_DOMAINS.MOTIVATION,
    tier: QuestionTier.CORE,
    triangulatesWith: ['MOT_DRV_01', 'MOT_NOV_01'],
    options: [
      {
        text: "Connecting it to a goal I care about",
        scores: { primaryDriver: MotivationDrivers.PURPOSE }
      },
      {
        text: "An imminent deadline or consequence",
        scores: { primaryDriver: MotivationDrivers.EXTRINSIC, deadlineRelationship: DeadlineRelationship.ESSENTIAL }
      },
      {
        text: "Someone asking me directly or checking in",
        scores: { primaryDriver: MotivationDrivers.SOCIAL }
      },
      {
        text: "Finding a way to make it more interesting",
        scores: { primaryDriver: MotivationDrivers.NOVELTY, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "Honestly? Panic when it can't wait any longer",
        scores: { deadlineRelationship: DeadlineRelationship.ESSENTIAL, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  // DOMAIN: Novelty drive
  {
    id: 'MOT_NOV_01',
    text: "How many hobbies, interests, or projects have you started and abandoned?",
    domain: COGNITIVE_DOMAINS.MOTIVATION,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['MOT_DRV_01', 'MOT_DRV_02'],
    options: [
      {
        text: "A few - I generally stick with what I start",
        scores: { noveltyDrive: 0.3, completionDrive: 0.8 }
      },
      {
        text: "Several - I've had different phases",
        scores: { noveltyDrive: 0.5, completionDrive: 0.5 }
      },
      {
        text: "Many - I get excited about new things then move on",
        scores: { noveltyDrive: 0.8, completionDrive: 0.3, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "I've lost count - the graveyard of abandoned interests is vast",
        scores: { noveltyDrive: 0.95, completionDrive: 0.1, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  // DOMAIN: Completion drive
  {
    id: 'MOT_COMP_01',
    text: "When a project is 80% done, what happens?",
    domain: COGNITIVE_DOMAINS.MOTIVATION,
    tier: QuestionTier.DOMAIN,
    options: [
      {
        text: "I finish it - the last 20% is satisfying",
        scores: { completionDrive: 0.9 }
      },
      {
        text: "I push through even though the excitement has faded",
        scores: { completionDrive: 0.6 }
      },
      {
        text: "It often stalls - the interesting part is done",
        scores: { completionDrive: 0.3, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "I've already started thinking about the next thing",
        scores: { completionDrive: 0.2, noveltyDrive: 0.9, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  // DEEP: Perfectionism
  {
    id: 'MOT_PERF_01',
    text: "Which feels worse to you?",
    domain: COGNITIVE_DOMAINS.MOTIVATION,
    tier: QuestionTier.DEEP,
    options: [
      {
        text: "Shipping something imperfect",
        scores: { perfectionismLevel: 0.8 }
      },
      {
        text: "Never shipping at all",
        scores: { perfectionismLevel: 0.2, completionDrive: 0.7 }
      },
      {
        text: "They're equally uncomfortable",
        scores: { perfectionismLevel: 0.5 }
      },
      {
        text: "Honestly, I struggle with both",
        scores: { perfectionismLevel: 0.6, emergentPattern: 'executiveFunctionChallenges' }
      }
    ]
  }
];

// ============================================================================
// PROCESSING STYLE DOMAIN
// ============================================================================

const processingQuestions = [
  // CORE: Processing mode
  {
    id: 'PROC_MODE_01',
    text: "How do you naturally approach solving a complex problem?",
    domain: COGNITIVE_DOMAINS.PROCESSING,
    tier: QuestionTier.CORE,
    triangulatesWith: ['PROC_MODE_02', 'PROC_DEPTH_01'],
    options: [
      {
        text: "Step by step, in logical order",
        scores: { processingMode: ProcessingMode.LINEAR }
      },
      {
        text: "Jump around different aspects simultaneously",
        scores: { processingMode: ProcessingMode.PARALLEL, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "Follow whatever thread seems most interesting",
        scores: { processingMode: ProcessingMode.RANDOM, emergentPattern: 'interestDrivenNervousSystem' }
      },
      {
        text: "Start with the big picture, then zoom into details",
        scores: { processingMode: ProcessingMode.HIERARCHICAL }
      },
      {
        text: "Gather information until patterns emerge on their own",
        scores: { processingMode: ProcessingMode.EMERGENT }
      }
    ]
  },

  {
    id: 'PROC_MODE_02',
    text: "When explaining something to someone, you tend to...",
    domain: COGNITIVE_DOMAINS.PROCESSING,
    tier: QuestionTier.CORE,
    triangulatesWith: ['PROC_MODE_01', 'PROC_DEPTH_01'],
    options: [
      {
        text: "Walk them through it step by step from the beginning",
        scores: { processingMode: ProcessingMode.LINEAR }
      },
      {
        text: "Jump to the most important part first",
        scores: { processingMode: ProcessingMode.HIERARCHICAL }
      },
      {
        text: "Use analogies and connect it to things they know",
        scores: { processingMode: ProcessingMode.EMERGENT }
      },
      {
        text: "Go off on tangents that somehow all connect",
        scores: { processingMode: ProcessingMode.RANDOM, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  // DOMAIN: Processing depth
  {
    id: 'PROC_DEPTH_01',
    text: "When you're interested in a topic, how do you typically engage?",
    domain: COGNITIVE_DOMAINS.PROCESSING,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['PROC_MODE_01', 'PROC_MODE_02'],
    options: [
      {
        text: "I go deep - I want to understand everything about it",
        scores: { processingDepth: ProcessingDepth.DEEP_NARROW }
      },
      {
        text: "I explore broadly - connections to other things matter most",
        scores: { processingDepth: ProcessingDepth.SHALLOW_BROAD }
      },
      {
        text: "Depends on the topic - some get depth, some get breadth",
        scores: { processingDepth: ProcessingDepth.CONTEXT_DEPENDENT }
      },
      {
        text: "Both - I want depth AND breadth",
        scores: { processingDepth: ProcessingDepth.COMPREHENSIVE }
      }
    ]
  },

  // DOMAIN: Learning modality
  {
    id: 'PROC_LEARN_01',
    text: "When learning something new, what works best for you?",
    domain: COGNITIVE_DOMAINS.PROCESSING,
    tier: QuestionTier.DOMAIN,
    options: [
      {
        text: "See it demonstrated or visualized",
        scores: { learningModalities: [LearningModalities.VISUAL] }
      },
      {
        text: "Have someone explain it to me",
        scores: { learningModalities: [LearningModalities.AUDITORY] }
      },
      {
        text: "Try it myself, learn by doing",
        scores: { learningModalities: [LearningModalities.KINESTHETIC, LearningModalities.EXPERIENTIAL] }
      },
      {
        text: "Read about it in detail",
        scores: { learningModalities: [LearningModalities.READING] }
      },
      {
        text: "Talk it through with someone",
        scores: { learningModalities: [LearningModalities.SOCIAL, LearningModalities.AUDITORY] }
      }
    ]
  }
];

// ============================================================================
// EMOTIONAL DOMAIN
// ============================================================================

const emotionalQuestions = [
  // CORE: Emotional intensity
  {
    id: 'EMO_INT_01',
    text: "Compared to others, how intensely do you experience emotions?",
    domain: COGNITIVE_DOMAINS.EMOTIONAL,
    tier: QuestionTier.CORE,
    triangulatesWith: ['EMO_INT_02', 'EMO_REC_01'],
    options: [
      {
        text: "More intensely - I feel things deeply",
        scores: { emotionalIntensity: EmotionalIntensity.HIGH }
      },
      {
        text: "About the same as most people",
        scores: { emotionalIntensity: EmotionalIntensity.MODERATE }
      },
      {
        text: "Less intensely - I'm pretty even-keeled",
        scores: { emotionalIntensity: EmotionalIntensity.LOW }
      },
      {
        text: "It varies wildly depending on the situation",
        scores: { emotionalIntensity: EmotionalIntensity.VARIABLE }
      }
    ]
  },

  {
    id: 'EMO_INT_02',
    text: "When something upsets you, what typically happens?",
    domain: COGNITIVE_DOMAINS.EMOTIONAL,
    tier: QuestionTier.CORE,
    triangulatesWith: ['EMO_INT_01', 'EMO_REC_01'],
    options: [
      {
        text: "I feel it strongly but it passes relatively quickly",
        scores: { emotionalIntensity: EmotionalIntensity.HIGH, emotionalRecovery: EmotionalRecovery.FAST }
      },
      {
        text: "I acknowledge it and move on",
        scores: { emotionalIntensity: EmotionalIntensity.MODERATE, emotionalRecovery: EmotionalRecovery.FAST }
      },
      {
        text: "It takes time to process and shake off",
        scores: { emotionalRecovery: EmotionalRecovery.SLOW }
      },
      {
        text: "It stays with me longer than I want it to",
        scores: { emotionalRecovery: EmotionalRecovery.SLOW, emergentPattern: 'rejectionSensitivity' }
      }
    ]
  },

  // DOMAIN: Frustration tolerance
  {
    id: 'EMO_FRUST_01',
    text: "When something isn't working despite repeated attempts, what happens?",
    domain: COGNITIVE_DOMAINS.EMOTIONAL,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['EMO_INT_01', 'EMO_INT_02'],
    options: [
      {
        text: "I stay patient and methodically try new approaches",
        scores: { frustrationTolerance: 0.9 }
      },
      {
        text: "I get frustrated but push through",
        scores: { frustrationTolerance: 0.6 }
      },
      {
        text: "Frustration builds quickly and I need to step away",
        scores: { frustrationTolerance: 0.3 }
      },
      {
        text: "I hit a wall fast - my brain seems to shut down",
        scores: { frustrationTolerance: 0.1, emergentPattern: 'interestDrivenNervousSystem' }
      }
    ]
  },

  // DEEP: Rejection sensitivity (RSD indicator)
  {
    id: 'EMO_RSD_01',
    text: "When you receive criticism or feel rejected, what's your experience?",
    domain: COGNITIVE_DOMAINS.EMOTIONAL,
    tier: QuestionTier.DEEP,
    options: [
      {
        text: "I consider it and move on",
        scores: { rejectionSensitivity: 0.2 }
      },
      {
        text: "It stings, but I recover within the day",
        scores: { rejectionSensitivity: 0.4 }
      },
      {
        text: "It hits hard and I replay it in my mind",
        scores: { rejectionSensitivity: 0.7 }
      },
      {
        text: "Even small criticism can feel crushing or consuming",
        scores: { rejectionSensitivity: 0.95, emergentPattern: 'rejectionSensitivity' }
      }
    ]
  }
];

// ============================================================================
// SOCIAL DOMAIN
// ============================================================================

const socialQuestions = [
  // CORE: Social recharge
  {
    id: 'SOC_RECH_01',
    text: "After a full day of social interaction, how do you feel?",
    domain: COGNITIVE_DOMAINS.SOCIAL,
    tier: QuestionTier.CORE,
    triangulatesWith: ['SOC_RECH_02', 'SOC_CAP_01'],
    options: [
      {
        text: "Energized - being around people fills me up",
        scores: { socialRecharge: SocialRecharge.SOCIAL }
      },
      {
        text: "Drained - I need alone time to recover",
        scores: { socialRecharge: SocialRecharge.ALONE }
      },
      {
        text: "Depends entirely on who I was with",
        scores: { socialRecharge: SocialRecharge.SELECTIVE }
      },
      {
        text: "Both - I'm stimulated but also depleted",
        scores: { socialRecharge: SocialRecharge.MIXED }
      }
    ]
  },

  {
    id: 'SOC_RECH_02',
    text: "When you have unstructured free time, what sounds most appealing?",
    domain: COGNITIVE_DOMAINS.SOCIAL,
    tier: QuestionTier.CORE,
    triangulatesWith: ['SOC_RECH_01', 'SOC_CAP_01'],
    options: [
      {
        text: "Reaching out to connect with someone",
        scores: { socialRecharge: SocialRecharge.SOCIAL }
      },
      {
        text: "Time completely alone with my own thoughts",
        scores: { socialRecharge: SocialRecharge.ALONE }
      },
      {
        text: "Low-key time with one close person",
        scores: { socialRecharge: SocialRecharge.SELECTIVE }
      },
      {
        text: "Depends on how my recent days have been",
        scores: { socialRecharge: SocialRecharge.MIXED }
      }
    ]
  },

  // DOMAIN: Social capacity
  {
    id: 'SOC_CAP_01',
    text: "How much social interaction feels sustainable for you daily?",
    domain: COGNITIVE_DOMAINS.SOCIAL,
    tier: QuestionTier.DOMAIN,
    triangulatesWith: ['SOC_RECH_01', 'SOC_RECH_02'],
    options: [
      {
        text: "I can be social most of the day without issue",
        scores: { socialCapacity: 0.9 }
      },
      {
        text: "A few hours of quality interaction, then I need space",
        scores: { socialCapacity: 0.6 }
      },
      {
        text: "Limited - even pleasant interactions deplete me",
        scores: { socialCapacity: 0.3 }
      },
      {
        text: "It varies dramatically based on factors I can't always predict",
        scores: { socialCapacity: 0.5, energyPattern: EnergyPattern.VOLATILE }
      }
    ]
  },

  // DOMAIN: Masking
  {
    id: 'SOC_MASK_01',
    text: "Do you feel like you present differently in social situations than you feel internally?",
    domain: COGNITIVE_DOMAINS.SOCIAL,
    tier: QuestionTier.DOMAIN,
    options: [
      {
        text: "No - what you see is what you get",
        scores: { maskingLevel: MaskingLevel.MINIMAL }
      },
      {
        text: "Sometimes, in professional or unfamiliar settings",
        scores: { maskingLevel: MaskingLevel.SITUATIONAL }
      },
      {
        text: "Often - I adapt significantly to different contexts",
        scores: { maskingLevel: MaskingLevel.FREQUENT, emergentPattern: 'neurodivergentSignals' }
      },
      {
        text: "Almost always - my internal experience is quite different from what I show",
        scores: { maskingLevel: MaskingLevel.CONSTANT, emergentPattern: 'neurodivergentSignals' }
      }
    ]
  }
];

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_QUESTIONS = [
  ...attentionQuestions,
  ...workingMemoryQuestions,
  ...timePerceptionQuestions,
  ...energyQuestions,
  ...motivationQuestions,
  ...processingQuestions,
  ...emotionalQuestions,
  ...socialQuestions
];

export const QUESTIONS_BY_DOMAIN = {
  [COGNITIVE_DOMAINS.ATTENTION]: attentionQuestions,
  [COGNITIVE_DOMAINS.WORKING_MEMORY]: workingMemoryQuestions,
  [COGNITIVE_DOMAINS.TIME_PERCEPTION]: timePerceptionQuestions,
  [COGNITIVE_DOMAINS.ENERGY]: energyQuestions,
  [COGNITIVE_DOMAINS.MOTIVATION]: motivationQuestions,
  [COGNITIVE_DOMAINS.PROCESSING]: processingQuestions,
  [COGNITIVE_DOMAINS.EMOTIONAL]: emotionalQuestions,
  [COGNITIVE_DOMAINS.SOCIAL]: socialQuestions
};

export const CORE_QUESTIONS = ALL_QUESTIONS.filter(q => q.tier === QuestionTier.CORE);
export const DOMAIN_QUESTIONS = ALL_QUESTIONS.filter(q => q.tier === QuestionTier.DOMAIN);
export const DEEP_QUESTIONS = ALL_QUESTIONS.filter(q => q.tier === QuestionTier.DEEP);

/**
 * Get the next batch of questions based on profile state
 * @param {Object} profile - Current cognitive profile
 * @param {number} batchSize - Number of questions to return
 * @param {string[]} answeredIds - Question IDs already answered
 */
export function getNextQuestions(profile, batchSize = 3, answeredIds = []) {
  const unanswered = id => !answeredIds.includes(id);

  // First session: return core questions
  if (profile.questionsAnswered < 12) {
    return CORE_QUESTIONS.filter(q => unanswered(q.id)).slice(0, batchSize);
  }

  // Subsequent sessions: prioritize underexplored domains
  const { getUnderexploredDomains } = require('./ProfileSchema.js');
  const underexplored = getUnderexploredDomains(profile);

  if (underexplored.length > 0) {
    const targetDomain = underexplored[0];
    const domainQuestions = QUESTIONS_BY_DOMAIN[targetDomain]
      .filter(q => unanswered(q.id) && q.tier !== QuestionTier.CORE);

    if (domainQuestions.length >= batchSize) {
      return domainQuestions.slice(0, batchSize);
    }
  }

  // Fallback: any unanswered domain or deep questions
  return [...DOMAIN_QUESTIONS, ...DEEP_QUESTIONS]
    .filter(q => unanswered(q.id))
    .slice(0, batchSize);
}

/**
 * Get question by ID
 */
export function getQuestionById(id) {
  return ALL_QUESTIONS.find(q => q.id === id);
}

export default {
  QuestionTier,
  ALL_QUESTIONS,
  QUESTIONS_BY_DOMAIN,
  CORE_QUESTIONS,
  DOMAIN_QUESTIONS,
  DEEP_QUESTIONS,
  getNextQuestions,
  getQuestionById
};
