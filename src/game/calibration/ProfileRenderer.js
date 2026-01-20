/**
 * ProfileRenderer.js - Human-Readable Cognitive Profile Output
 *
 * This module transforms raw profile data into empowering, human-readable
 * descriptions. The goal is insight, not diagnosis.
 *
 * Philosophy:
 * - "Your attention works differently" not "You have attention problems"
 * - "This explains why..." connects patterns to lived experience
 * - "This helps you..." provides actionable strategies
 *
 * The profile should feel like finally getting an answer to "why am I like this?"
 */

import {
  AttentionStyles,
  TimeAccuracy,
  DeadlineRelationship,
  EnergyPattern,
  MotivationDrivers,
  ProcessingMode
} from './ProfileSchema.js';

// ============================================================================
// PROFILE SECTION RENDERERS
// ============================================================================

const sectionRenderers = {
  attention: renderAttentionSection,
  workingMemory: renderWorkingMemorySection,
  timePerception: renderTimePerceptionSection,
  energy: renderEnergySection,
  motivation: renderMotivationSection,
  processing: renderProcessingSection,
  emotional: renderEmotionalSection,
  social: renderSocialSection
};

// ============================================================================
// ATTENTION SECTION
// ============================================================================

function renderAttentionSection(profile) {
  const attention = profile.attention;
  if (!attention.style) return null;

  const styleDescriptions = {
    [AttentionStyles.SUSTAINED]: {
      title: 'Sustained Focus',
      description: `Your attention operates on a steady foundation. When you decide to focus, you can maintain it through effort and discipline. This is a strength—you can push through tasks that don't naturally engage you.`,
      explains: [
        'You can work through boring-but-necessary tasks',
        'Discipline and willpower are effective tools for you',
        'You may wonder why others "can\'t just focus"'
      ],
      helps: [
        'Trust your ability to power through when needed',
        'Build habits around the tasks that matter',
        'Be patient with others whose attention works differently'
      ]
    },
    [AttentionStyles.INTEREST_DRIVEN]: {
      title: 'Interest-Driven Attention',
      description: `Your attention doesn't operate on willpower—it operates on engagement. When something genuinely interests you, focus comes effortlessly. When it doesn't, no amount of "trying harder" will force it. This isn't a flaw; it's how your nervous system is wired.`,
      explains: [
        'Why some tasks feel impossible while others flow naturally',
        'Why you can hyperfocus for hours on engaging work, then struggle for minutes on boring tasks',
        'Why "just try harder" has never worked for you'
      ],
      helps: [
        'Make tasks interesting rather than forcing discipline',
        'Use external accountability and deadlines strategically',
        'Stop blaming yourself—work WITH your brain, not against it'
      ]
    },
    [AttentionStyles.BURST_BASED]: {
      title: 'Burst Performer',
      description: `You work in intense, concentrated bursts rather than steady streams. This isn't inconsistency—it's your natural rhythm. When you're "on," you're incredibly productive. When you're not, you need genuine recovery.`,
      explains: [
        'Why you can do a week\'s worth of work in one day, then need two days to recover',
        'Why sustained, consistent pace feels unnatural and exhausting',
        'Why your output varies so dramatically'
      ],
      helps: [
        'Plan for sprints, not marathons',
        'Schedule recovery time as essential, not optional',
        'Track your energy cycles to work with them'
      ]
    },
    [AttentionStyles.CONTEXT_DEPENDENT]: {
      title: 'Context-Shaped Focus',
      description: `Your attention is highly responsive to environment and circumstances. The right conditions unlock your best focus; the wrong ones make concentration nearly impossible. Understanding your conditions is key to performing well.`,
      explains: [
        'Why you can focus perfectly in some settings and not at all in others',
        'Why your concentration varies so much day to day',
        'Why generic productivity advice often doesn\'t work for you'
      ],
      helps: [
        'Identify and create your optimal focus conditions',
        'Don\'t fight bad days—change your environment instead',
        'Advocate for your workspace needs without apology'
      ]
    },
    [AttentionStyles.FLEXIBLE]: {
      title: 'Flexible Attention',
      description: `You can shift between different attention modes as needed. This adaptability is a real strength—you can match your focus style to the task at hand.`,
      explains: [
        'Why you can work effectively in various conditions',
        'Why you might not relate to either "focused" or "distracted" labels',
        'Why you can collaborate with people who have different focus styles'
      ],
      helps: [
        'Leverage your adaptability across different work types',
        'You have more options than most—use them',
        'Help others by translating between focus styles'
      ]
    }
  };

  const style = styleDescriptions[attention.style];
  if (!style) return null;

  const section = {
    domain: 'Attention',
    title: style.title,
    description: style.description,
    explains: style.explains,
    helps: style.helps,
    confidence: attention.styleConfidence || 0,
    details: []
  };

  // Add hyperfocus note if present
  if (attention.hyperfocusCapable) {
    section.details.push({
      label: 'Hyperfocus Capable',
      note: 'When fully engaged, you can enter deep focus states where time disappears. This is a superpower—but it needs the right trigger.'
    });
  }

  // Add triggers if present
  if (attention.triggers?.length) {
    section.details.push({
      label: 'Focus Activators',
      items: attention.triggers.map(formatTrigger)
    });
  }

  // Add drains if present
  if (attention.drains?.length) {
    section.details.push({
      label: 'Focus Drains',
      items: attention.drains.map(formatDrain)
    });
  }

  return section;
}

function formatTrigger(trigger) {
  const labels = {
    'novelty': 'New and interesting things',
    'urgency': 'Deadlines and time pressure',
    'challenge': 'Difficult problems',
    'social': 'Others\' presence or expectations',
    'interest': 'Personal relevance and meaning',
    'structure': 'External organization and frameworks'
  };
  return labels[trigger] || trigger;
}

function formatDrain(drain) {
  const labels = {
    'routine': 'Repetitive, unchanging tasks',
    'waiting': 'Passive waiting without action',
    'ambiguity': 'Unclear expectations or goals',
    'low-stakes': 'Things that don\'t feel important',
    'monotony': 'Same stimulation level for too long',
    'interruptions': 'Frequent context switching'
  };
  return labels[drain] || drain;
}

// ============================================================================
// WORKING MEMORY SECTION
// ============================================================================

function renderWorkingMemorySection(profile) {
  const wm = profile.workingMemory;
  if (!wm.capacity) return null;

  const capacityDescriptions = {
    'high': {
      title: 'High Working Memory Capacity',
      description: `You can hold multiple things in mind simultaneously without losing track. Complex, multi-step problems don't overwhelm your mental workspace.`,
      explains: [
        'Why you can follow complex arguments and instructions easily',
        'Why you might underestimate how much scaffolding others need'
      ]
    },
    'medium': {
      title: 'Moderate Working Memory',
      description: `Your mental workspace handles typical demands well. You may benefit from external supports for complex tasks, but don't require them for routine work.`,
      explains: [
        'Why moderately complex tasks feel manageable',
        'Why very high complexity benefits from writing things down'
      ]
    },
    'low': {
      title: 'Focused Working Memory',
      description: `Your mental workspace works best with fewer items at once. This isn't a deficit—it means you benefit greatly from external scaffolding like lists, notes, and reminders. These aren't crutches; they're tools that help your brain work optimally.`,
      explains: [
        'Why multi-step instructions can feel overwhelming',
        'Why you might forget things that were just told to you',
        'Why lists and written notes feel essential, not optional'
      ],
      helps: [
        'Use external systems without guilt—they\'re exactly what your brain needs',
        'Ask for written instructions instead of verbal ones',
        'Break tasks down before starting, not as you go'
      ]
    },
    'variable': {
      title: 'Variable Working Memory',
      description: `Your mental workspace capacity fluctuates—some days you can juggle many things, other days even simple sequences feel hard. This variability is often tied to energy, interest, and stress levels.`,
      explains: [
        'Why you can be brilliant one day and scattered the next',
        'Why cognitive load tolerance varies so much',
        'Why you need different support levels at different times'
      ]
    }
  };

  const desc = capacityDescriptions[wm.capacity];
  if (!desc) return null;

  const section = {
    domain: 'Working Memory',
    title: desc.title,
    description: desc.description,
    explains: desc.explains,
    helps: desc.helps || [],
    confidence: wm.capacityConfidence || 0,
    details: []
  };

  // Scaffolding needs
  if (wm.scaffoldingNeed) {
    const scaffoldingLabels = {
      'minimal': 'External systems are helpful but not essential',
      'moderate': 'Lists and reminders significantly improve function',
      'significant': 'External scaffolding is important for reliable function',
      'essential': 'External systems are necessary—embrace them fully'
    };
    section.details.push({
      label: 'Scaffolding Relationship',
      note: scaffoldingLabels[wm.scaffoldingNeed]
    });
  }

  // Chunk size
  if (wm.optimalChunkSize) {
    const chunkLabels = {
      'large': 'Can work with big-picture tasks',
      'medium': 'Moderate breakdown is helpful',
      'small': 'Benefits from fine-grained steps',
      'micro': 'Very small, immediate next-actions work best'
    };
    section.details.push({
      label: 'Optimal Task Size',
      note: chunkLabels[wm.optimalChunkSize]
    });
  }

  return section;
}

// ============================================================================
// TIME PERCEPTION SECTION
// ============================================================================

function renderTimePerceptionSection(profile) {
  const time = profile.timePerception;
  if (!time.accuracy) return null;

  const timeDescriptions = {
    [TimeAccuracy.ACCURATE]: {
      title: 'Reliable Time Sense',
      description: `Your internal clock matches external time well. You can estimate how long things will take and generally be right. This is genuinely useful for planning.`,
      explains: [
        'Why you can plan backwards from deadlines',
        'Why you might be frustrated by others\' "time blindness"'
      ]
    },
    [TimeAccuracy.OPTIMISTIC]: {
      title: 'Optimistic Time Estimation',
      description: `You consistently underestimate how long things will take. This isn't carelessness—it's how your brain models time. Knowing this pattern lets you compensate for it.`,
      explains: [
        'Why you\'re often running behind despite trying',
        'Why tasks always seem to take longer than planned',
        'Why buffer time keeps getting absorbed'
      ],
      helps: [
        'Multiply your estimates by 1.5-2x',
        'Use actual data from past similar tasks',
        'Build in mandatory buffer that you can\'t cut'
      ]
    },
    [TimeAccuracy.PESSIMISTIC]: {
      title: 'Conservative Time Estimation',
      description: `You tend to overestimate how long things will take. This means you often finish early and have time to spare—a form of built-in safety margin.`,
      explains: [
        'Why you\'re often early or have time left over',
        'Why you might over-prepare for things'
      ]
    },
    [TimeAccuracy.UNPREDICTABLE]: {
      title: 'Non-Linear Time Perception',
      description: `Your relationship with time is... complicated. Minutes can feel like hours; hours can vanish in what feels like minutes. This "time blindness" isn't a character flaw—it's a neurological difference that affects how your brain processes temporal information.`,
      explains: [
        'Why you genuinely don\'t know how long things will take',
        'Why you can be shocked at how much (or little) time has passed',
        'Why time-management advice written for "normal" brains doesn\'t work'
      ],
      helps: [
        'Use external time markers (timers, alarms, visual countdowns)',
        'Don\'t trust "just a few more minutes"—set an alarm',
        'Front-load important things; don\'t assume you\'ll have time later'
      ]
    }
  };

  const desc = timeDescriptions[time.accuracy];
  if (!desc) return null;

  const section = {
    domain: 'Time Perception',
    title: desc.title,
    description: desc.description,
    explains: desc.explains,
    helps: desc.helps || [],
    confidence: time.accuracyConfidence || 0,
    details: []
  };

  // Deadline relationship
  if (time.deadlineRelationship) {
    const deadlineLabels = {
      [DeadlineRelationship.MOTIVATING]: 'Deadlines help you plan and pace yourself',
      [DeadlineRelationship.ESSENTIAL]: 'Deadlines are necessary to activate your focus—use this strategically',
      [DeadlineRelationship.PARALYZING]: 'Deadlines can cause freeze responses—break tasks down and start early',
      [DeadlineRelationship.IRRELEVANT]: 'Deadlines don\'t register until imminent—use artificial early deadlines'
    };
    section.details.push({
      label: 'Deadline Relationship',
      note: deadlineLabels[time.deadlineRelationship]
    });
  }

  return section;
}

// ============================================================================
// ENERGY SECTION
// ============================================================================

function renderEnergySection(profile) {
  const energy = profile.energy;
  if (!energy.pattern) return null;

  const energyDescriptions = {
    [EnergyPattern.STEADY]: {
      title: 'Steady Energy',
      description: `Your energy maintains a relatively consistent level throughout the day. This allows for predictable pacing and sustained effort.`,
      explains: [
        'Why you can maintain consistent output',
        'Why extreme highs and lows aren\'t your experience'
      ]
    },
    [EnergyPattern.BURST]: {
      title: 'Burst Energy',
      description: `You operate in high-intensity bursts followed by recovery periods. This isn't laziness during the lows—it's your system recovering from the highs. Both phases are necessary.`,
      explains: [
        'Why you can be incredibly productive, then need to crash',
        'Why pushing through recovery time backfires',
        'Why your output is variable but your capacity isn\'t'
      ],
      helps: [
        'Plan important work for burst windows',
        'Protect recovery time as essential, not wasted',
        'Track your cycles to predict and prepare'
      ]
    },
    [EnergyPattern.CYCLICAL]: {
      title: 'Cyclical Energy',
      description: `Your energy follows predictable patterns—certain times of day, week, or other cycles are consistently higher or lower. Understanding your cycle lets you work with it.`,
      explains: [
        'Why your best hours are consistent',
        'Why fighting your natural rhythm is exhausting'
      ],
      helps: [
        'Map your cycle through tracking',
        'Schedule demanding work for peak times',
        'Don\'t waste high-energy periods on low-energy tasks'
      ]
    },
    [EnergyPattern.REACTIVE]: {
      title: 'Reactive Energy',
      description: `Your energy responds strongly to external factors—who you're with, what you're doing, where you are. Environment management is energy management for you.`,
      explains: [
        'Why the same task can be easy or impossible depending on context',
        'Why some people energize you while others drain you',
        'Why environment matters so much to your function'
      ]
    },
    [EnergyPattern.VOLATILE]: {
      title: 'Unpredictable Energy',
      description: `Your energy fluctuates in ways that aren't always predictable. This requires flexibility in planning and self-compassion when energy doesn't show up as expected.`,
      explains: [
        'Why you can\'t always predict what you\'ll be capable of',
        'Why rigid schedules often fail',
        'Why self-forgiveness is essential'
      ],
      helps: [
        'Build in flexibility rather than fighting variability',
        'Have high-energy and low-energy task options ready',
        'Communicate your variability to reduce pressure'
      ]
    }
  };

  const desc = energyDescriptions[energy.pattern];
  if (!desc) return null;

  const section = {
    domain: 'Energy',
    title: desc.title,
    description: desc.description,
    explains: desc.explains,
    helps: desc.helps || [],
    confidence: energy.patternConfidence || 0,
    details: []
  };

  // Peak times
  if (energy.peakTimes?.length) {
    section.details.push({
      label: 'Peak Times',
      items: energy.peakTimes.map(t =>
        t.charAt(0).toUpperCase() + t.slice(1)
      )
    });
  }

  return section;
}

// ============================================================================
// MOTIVATION SECTION
// ============================================================================

function renderMotivationSection(profile) {
  const motivation = profile.motivation;
  if (!motivation.primaryDriver) return null;

  const driverDescriptions = {
    [MotivationDrivers.INTRINSIC]: {
      title: 'Internally Driven',
      description: `Your motivation comes from within—personal satisfaction, curiosity, and the inherent value of the work itself. External rewards matter less than internal engagement.`,
      explains: [
        'Why you can work for hours on personally meaningful projects',
        'Why external rewards don\'t motivate you as much as "they should"',
        'Why forced tasks feel particularly draining'
      ]
    },
    [MotivationDrivers.EXTRINSIC]: {
      title: 'Outcome Driven',
      description: `You're motivated by external outcomes—rewards, recognition, consequences, achievements. Clear stakes and tangible results activate your drive.`,
      explains: [
        'Why unclear payoffs make tasks hard to start',
        'Why visible progress and rewards help you push through'
      ]
    },
    [MotivationDrivers.SOCIAL]: {
      title: 'Socially Driven',
      description: `Others\' expectations, needs, and presence activate your motivation. You often do for others what you can\'t do for yourself.`,
      explains: [
        'Why accountability partners work so well for you',
        'Why solo projects can feel impossible while collaborative ones flow',
        'Why letting others down feels particularly painful'
      ],
      helps: [
        'Build accountability into important projects',
        'Work alongside others, even on independent tasks',
        'Make commitments to people, not just to yourself'
      ]
    },
    [MotivationDrivers.CHALLENGE]: {
      title: 'Challenge Driven',
      description: `Difficulty and mastery drive you. Easy tasks bore you; hard problems engage you. You're motivated by the opportunity to grow and prove capability.`,
      explains: [
        'Why easy tasks feel harder than hard ones',
        'Why you might procrastinate on simple things while diving into complex ones'
      ]
    },
    [MotivationDrivers.NOVELTY]: {
      title: 'Novelty Driven',
      description: `New things capture your attention and motivation. Familiar, repetitive tasks lose their pull while fresh experiences energize you. This isn't flightiness—it's how your brain seeks the stimulation it needs.`,
      explains: [
        'Why you have a trail of started-but-abandoned projects',
        'Why the beginning of anything is always the most engaging',
        'Why routine tasks feel increasingly impossible over time'
      ],
      helps: [
        'Build novelty into routine tasks',
        'Front-load important work when it\'s still new',
        'Rotate through tasks to maintain freshness'
      ]
    },
    [MotivationDrivers.PURPOSE]: {
      title: 'Purpose Driven',
      description: `Meaning and significance fuel your motivation. Tasks connected to larger goals and values engage you; arbitrary requirements feel unbearable.`,
      explains: [
        'Why "why does this matter?" is always your first question',
        'Why meaningless tasks feel particularly draining'
      ]
    }
  };

  const desc = driverDescriptions[motivation.primaryDriver];
  if (!desc) return null;

  const section = {
    domain: 'Motivation',
    title: desc.title,
    description: desc.description,
    explains: desc.explains,
    helps: desc.helps || [],
    confidence: motivation.driverConfidence || 0,
    details: []
  };

  // Novelty vs completion
  if (motivation.noveltyDrive !== null && motivation.completionDrive !== null) {
    const noveltyLevel = motivation.noveltyDrive > 0.7 ? 'high' :
                         motivation.noveltyDrive > 0.4 ? 'moderate' : 'low';
    const completionLevel = motivation.completionDrive > 0.7 ? 'high' :
                            motivation.completionDrive > 0.4 ? 'moderate' : 'low';

    if (noveltyLevel !== completionLevel) {
      section.details.push({
        label: 'Start vs. Finish',
        note: noveltyLevel === 'high' && completionLevel === 'low'
          ? 'You\'re energized by starting things but may struggle to finish them. Consider smaller scopes or hand-off strategies.'
          : noveltyLevel === 'low' && completionLevel === 'high'
          ? 'You prefer to finish what you start. Taking on fewer, more complete projects suits you.'
          : 'Moderate balance between starting new things and completing them.'
      });
    }
  }

  return section;
}

// ============================================================================
// PROCESSING SECTION
// ============================================================================

function renderProcessingSection(profile) {
  const processing = profile.processing;
  if (!processing.mode) return null;

  const modeDescriptions = {
    [ProcessingMode.LINEAR]: {
      title: 'Sequential Processor',
      description: `You think in ordered steps—A leads to B leads to C. This systematic approach is excellent for complex procedures and detailed work.`,
      explains: [
        'Why step-by-step instructions work well for you',
        'Why random topic-jumping feels chaotic'
      ]
    },
    [ProcessingMode.PARALLEL]: {
      title: 'Parallel Processor',
      description: `You hold multiple threads in mind simultaneously, processing different aspects of a problem at once. This can look chaotic from outside but is actually highly efficient for you.`,
      explains: [
        'Why you can seem scattered while actually being productive',
        'Why you might switch between tasks frequently but effectively',
        'Why linear-only approaches feel constraining'
      ]
    },
    [ProcessingMode.RANDOM]: {
      title: 'Associative Processor',
      description: `Your thinking follows associations and connections rather than linear sequence. One idea leads to a related idea which leads somewhere unexpected. This is how creativity often works.`,
      explains: [
        'Why your tangents often turn out to be relevant',
        'Why forcing yourself to stay on topic is exhausting',
        'Why your solutions come from unexpected angles'
      ],
      helps: [
        'Capture tangent ideas quickly (notes, voice memos) before returning to main topic',
        'Trust your associations—they often lead somewhere valuable',
        'Use external structure to contain but not suppress your natural flow'
      ]
    },
    [ProcessingMode.HIERARCHICAL]: {
      title: 'Top-Down Processor',
      description: `You naturally start with the big picture and drill down into details. Understanding the whole helps you make sense of the parts.`,
      explains: [
        'Why you need context before diving into specifics',
        'Why starting with details feels disorienting'
      ]
    },
    [ProcessingMode.EMERGENT]: {
      title: 'Pattern-Recognition Processor',
      description: `You gather information until patterns emerge organically. Rather than forcing structure, you let understanding crystallize from immersion.`,
      explains: [
        'Why you need time to "just sit with" problems',
        'Why insights come suddenly after apparent inactivity',
        'Why forced analysis can feel counterproductive'
      ]
    }
  };

  const desc = modeDescriptions[processing.mode];
  if (!desc) return null;

  return {
    domain: 'Processing',
    title: desc.title,
    description: desc.description,
    explains: desc.explains,
    helps: desc.helps || [],
    confidence: processing.modeConfidence || 0,
    details: []
  };
}

// ============================================================================
// EMOTIONAL SECTION
// ============================================================================

function renderEmotionalSection(profile) {
  const emotional = profile.emotional;
  if (!emotional.intensity && !emotional.rejectionSensitivity) return null;

  const section = {
    domain: 'Emotional',
    title: 'Emotional Landscape',
    description: '',
    explains: [],
    helps: [],
    confidence: emotional.intensityConfidence || emotional.rsdConfidence || 0,
    details: []
  };

  // Intensity
  if (emotional.intensity === 'high') {
    section.description = `You feel things intensely—both positive and negative emotions hit harder than they might for others. This depth of feeling is part of who you are.`;
    section.explains.push('Why emotions can feel overwhelming');
    section.explains.push('Why you might need more time to process feelings');
    section.details.push({
      label: 'Emotional Intensity',
      note: 'High—feel things deeply and strongly'
    });
  }

  // Rejection sensitivity
  if (emotional.rejectionSensitivity > 0.6) {
    section.details.push({
      label: 'Rejection Sensitivity',
      note: 'Heightened—criticism and perceived rejection hit particularly hard. This is neurological, not oversensitivity. Knowing this helps you separate the intensity of the feeling from the reality of the situation.'
    });
    section.helps.push('Pause before reacting to perceived rejection');
    section.helps.push('Check your interpretation—the intensity of the feeling doesn\'t equal the reality');
    section.helps.push('Build a support system that understands this pattern');
  }

  // Frustration tolerance
  if (emotional.frustrationTolerance !== null) {
    const level = emotional.frustrationTolerance < 0.3 ? 'low' :
                  emotional.frustrationTolerance < 0.7 ? 'moderate' : 'high';

    if (level === 'low') {
      section.details.push({
        label: 'Frustration Tolerance',
        note: 'Lower threshold—frustration can escalate quickly. Having exit strategies and knowing your limits helps prevent overwhelm.'
      });
    }
  }

  return section.description || section.details.length ? section : null;
}

// ============================================================================
// SOCIAL SECTION
// ============================================================================

function renderSocialSection(profile) {
  const social = profile.social;
  if (!social.rechargeMode) return null;

  const rechargeDescriptions = {
    'alone': {
      title: 'Solo Recharger',
      description: `You recharge through solitude. Social interaction, even enjoyable interaction, draws from your energy reserves. Time alone isn't antisocial—it's necessary maintenance.`,
      explains: [
        'Why you need alone time after social events',
        'Why too much people-time leaves you depleted'
      ]
    },
    'social': {
      title: 'Social Recharger',
      description: `You recharge through connection with others. Isolation drains you; interaction energizes you.`,
      explains: [
        'Why too much alone time feels depleting',
        'Why you seek out company when stressed'
      ]
    },
    'selective': {
      title: 'Selective Recharger',
      description: `Your social energy depends heavily on WHO you're with. Some people energize you; others drain you. The relationship matters more than the interaction itself.`,
      explains: [
        'Why the same activity can be energizing or exhausting depending on the company',
        'Why you might love certain social situations and dread others'
      ]
    },
    'mixed': {
      title: 'Balanced Recharger',
      description: `You need a balance of social time and solitude. Both are energizing in the right doses; too much of either becomes draining.`,
      explains: [
        'Why you might feel conflicted about social plans',
        'Why you need both connection and alone time'
      ]
    }
  };

  const desc = rechargeDescriptions[social.rechargeMode];
  if (!desc) return null;

  const section = {
    domain: 'Social',
    title: desc.title,
    description: desc.description,
    explains: desc.explains,
    helps: [],
    confidence: social.rechargeConfidence || 0,
    details: []
  };

  // Masking
  if (social.maskingLevel && social.maskingLevel !== 'minimal') {
    const maskingNotes = {
      'situational': 'You adapt your presentation in some contexts—this is normal social flexibility.',
      'frequent': 'You often present differently than you feel inside. This takes energy. Finding safe spaces to unmask is important.',
      'constant': 'You\'re almost always managing how you appear to others. This is exhausting. Seek out accepting environments and relationships where you can be yourself.'
    };
    section.details.push({
      label: 'Social Masking',
      note: maskingNotes[social.maskingLevel]
    });
  }

  return section;
}

// ============================================================================
// EMERGENT PATTERNS SECTION
// ============================================================================

function renderEmergentPatterns(profile) {
  const patterns = profile.emergentPatterns;
  const insights = [];

  // Interest-Driven Nervous System
  if (patterns.interestDrivenNervousSystem > 0.5) {
    insights.push({
      title: 'Interest-Driven Nervous System',
      strength: patterns.interestDrivenNervousSystem,
      description: `Multiple patterns in your profile cluster around interest-based activation. Your nervous system appears to be wired for engagement-based, rather than importance-based, prioritization. This pattern is associated with ADHD-type brains (diagnosed or not).`,
      implications: [
        'Your challenge isn\'t motivation—it\'s activation',
        'Interest, novelty, urgency, and challenge are your activation levers',
        '"Just do it" advice doesn\'t work because that\'s not how your brain activates',
        'Working WITH this wiring, not against it, is the key'
      ]
    });
  }

  // Executive Function Challenges
  if (patterns.executiveFunctionChallenges > 0.4) {
    insights.push({
      title: 'Executive Function Differences',
      strength: patterns.executiveFunctionChallenges,
      description: `Your profile shows patterns consistent with executive function differences—challenges with planning, prioritizing, initiating, or completing tasks. These aren't character flaws; they're neurological variations that respond to specific strategies.`,
      implications: [
        'External structure compensates for internal executive function',
        'Breaking tasks down isn\'t weakness—it\'s matching your brain\'s needs',
        'Accountability and body-doubling can provide activation you struggle to generate alone'
      ]
    });
  }

  // Rejection Sensitivity
  if (patterns.rejectionSensitivity > 0.5 ||
      (profile.emotional.rejectionSensitivity && profile.emotional.rejectionSensitivity > 0.7)) {
    insights.push({
      title: 'Heightened Rejection Sensitivity',
      strength: patterns.rejectionSensitivity || profile.emotional.rejectionSensitivity,
      description: `You may experience rejection—real or perceived—more intensely than others. This can feel like physical pain. It\'s neurological, not "being too sensitive."`,
      implications: [
        'The intensity of your reaction doesn\'t equal the reality of the situation',
        'Knowing this pattern helps you pause before reacting',
        'Building resilience strategies specifically for RSD helps'
      ]
    });
  }

  return insights;
}

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

/**
 * Render a complete human-readable profile.
 * @param {Object} profile - The cognitive profile
 * @returns {Object} Formatted profile for display
 */
export function renderProfile(profile) {
  const sections = [];

  // Render each domain that has sufficient data
  for (const [domain, renderer] of Object.entries(sectionRenderers)) {
    const section = renderer(profile);
    if (section && section.confidence >= 0.3) {
      sections.push(section);
    }
  }

  // Sort by confidence (most confident first)
  sections.sort((a, b) => b.confidence - a.confidence);

  // Render emergent patterns
  const emergentInsights = renderEmergentPatterns(profile);

  return {
    sections,
    emergentInsights,
    completeness: calculateCompleteness(profile),
    metadata: {
      questionsAnswered: profile.questionsAnswered || 0,
      sessionsCompleted: profile.sessionsCompleted || 0,
      lastUpdated: profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString() : 'Unknown'
    }
  };
}

function calculateCompleteness(profile) {
  const domains = ['attention', 'workingMemory', 'timePerception', 'energy',
                   'motivation', 'processing', 'emotional', 'social'];
  let measured = 0;

  for (const domain of domains) {
    const keys = Object.keys(profile[domain]).filter(k => k.endsWith('Confidence'));
    const confident = keys.filter(k => profile[domain][k] >= 0.3);
    if (confident.length > 0) measured++;
  }

  return {
    domainsExplored: measured,
    totalDomains: domains.length,
    percentage: Math.round((measured / domains.length) * 100)
  };
}

/**
 * Render profile as plain text for export/display.
 */
export function renderProfileAsText(profile) {
  const rendered = renderProfile(profile);
  let text = '═══════════════════════════════════════════════════════════════\n';
  text += '                    YOUR COGNITIVE PROFILE\n';
  text += '═══════════════════════════════════════════════════════════════\n\n';

  // Sections
  for (const section of rendered.sections) {
    text += `▓▓▓ ${section.domain.toUpperCase()} ▓▓▓\n`;
    text += `${section.title}\n`;
    text += '───────────────────────────────────────────────────────────────\n';
    text += `${section.description}\n\n`;

    if (section.explains?.length) {
      text += 'This explains:\n';
      for (const point of section.explains) {
        text += `  • ${point}\n`;
      }
      text += '\n';
    }

    if (section.helps?.length) {
      text += 'This helps:\n';
      for (const point of section.helps) {
        text += `  → ${point}\n`;
      }
      text += '\n';
    }

    if (section.details?.length) {
      for (const detail of section.details) {
        if (detail.note) {
          text += `${detail.label}: ${detail.note}\n`;
        } else if (detail.items) {
          text += `${detail.label}: ${detail.items.join(', ')}\n`;
        }
      }
      text += '\n';
    }

    text += '\n';
  }

  // Emergent insights
  if (rendered.emergentInsights.length > 0) {
    text += '═══════════════════════════════════════════════════════════════\n';
    text += '                    EMERGENT PATTERNS\n';
    text += '═══════════════════════════════════════════════════════════════\n\n';

    for (const insight of rendered.emergentInsights) {
      text += `★ ${insight.title}\n`;
      text += '───────────────────────────────────────────────────────────────\n';
      text += `${insight.description}\n\n`;

      text += 'What this means:\n';
      for (const impl of insight.implications) {
        text += `  • ${impl}\n`;
      }
      text += '\n\n';
    }
  }

  // Footer
  text += '═══════════════════════════════════════════════════════════════\n';
  text += `Profile completeness: ${rendered.completeness.percentage}% `;
  text += `(${rendered.completeness.domainsExplored}/${rendered.completeness.totalDomains} domains)\n`;
  text += `Questions answered: ${rendered.metadata.questionsAnswered}\n`;
  text += `Last updated: ${rendered.metadata.lastUpdated}\n`;
  text += '═══════════════════════════════════════════════════════════════\n';

  return text;
}

export default {
  renderProfile,
  renderProfileAsText
};
