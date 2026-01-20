/**
 * ScoringEngine.js - Maps Answers to Profile
 *
 * This engine processes question responses and updates the cognitive
 * profile using triangulated scoring. Multiple questions measuring the
 * same construct increase confidence; conflicting answers reduce it.
 *
 * ThinkingMachines Compliance: Deterministic scoring.
 * Same answers + same prior profile → same resulting profile.
 */

import { createEmptyProfile, computeProfileChecksum } from './ProfileSchema.js';
import { getQuestionById, ALL_QUESTIONS } from './QuestionBank.js';

// ============================================================================
// SCORING CONFIGURATION
// ============================================================================

/**
 * How much weight a single answer has on profile values.
 * Multiple triangulated answers compound toward higher confidence.
 */
const SINGLE_ANSWER_WEIGHT = 0.25;

/**
 * Confidence boost when triangulated answers agree.
 */
const TRIANGULATION_BONUS = 0.15;

/**
 * Confidence penalty when triangulated answers conflict.
 */
const CONFLICT_PENALTY = 0.2;

/**
 * Minimum confidence to consider a dimension "measured".
 */
const MINIMUM_CONFIDENCE = 0.3;

// ============================================================================
// SCORING ENGINE CLASS
// ============================================================================

export class ScoringEngine {
  constructor() {
    this.answeredQuestions = new Map();  // questionId → { optionIndex, scores }
    this.triangulationCache = new Map(); // construct → [questionIds with answers]
  }

  /**
   * Score a single response and update profile.
   * @param {Object} profile - Current cognitive profile
   * @param {string} questionId - Question ID
   * @param {number} optionIndex - Selected option index
   * @returns {Object} Updated profile
   */
  scoreResponse(profile, questionId, optionIndex) {
    const question = getQuestionById(questionId);
    if (!question) {
      console.warn(`Unknown question: ${questionId}`);
      return profile;
    }

    const option = question.options[optionIndex];
    if (!option) {
      console.warn(`Invalid option index ${optionIndex} for question ${questionId}`);
      return profile;
    }

    // Store the answer
    this.answeredQuestions.set(questionId, {
      optionIndex,
      scores: option.scores,
      domain: question.domain,
      triangulatesWith: question.triangulatesWith || []
    });

    // Apply scores to profile
    profile = this.applyScores(profile, question.domain, option.scores);

    // Update confidence based on triangulation
    profile = this.updateTriangulationConfidence(profile, question);

    // Increment question count
    profile.questionsAnswered = (profile.questionsAnswered || 0) + 1;
    profile.lastUpdated = Date.now();

    return profile;
  }

  /**
   * Apply option scores to profile dimensions.
   */
  applyScores(profile, domain, scores) {
    for (const [key, value] of Object.entries(scores)) {
      // Handle special keys
      if (key === 'emergentPattern') {
        this.addEmergentPattern(profile, value);
        continue;
      }

      // Map score keys to profile structure
      this.applyScoreToProfile(profile, domain, key, value);
    }

    return profile;
  }

  /**
   * Apply a single score to the appropriate profile location.
   */
  applyScoreToProfile(profile, domain, key, value) {
    // Domain-specific scores
    const domainMap = {
      'attention': {
        'attentionStyle': 'style',
        'attentionVariability': 'variability',
        'triggers': 'triggers',
        'drains': 'drains',
        'hyperfocusCapable': 'hyperfocusCapable'
      },
      'workingMemory': {
        'capacity': 'capacity',
        'scaffoldingNeed': 'scaffoldingNeed',
        'chunkSize': 'optimalChunkSize'
      },
      'timePerception': {
        'timeAccuracy': 'accuracy',
        'deadlineRelationship': 'deadlineRelationship',
        'timeOrientation': 'orientation'
      },
      'energy': {
        'energyPattern': 'pattern',
        'recoveryNeed': 'recoveryNeed',
        'burnoutSignals': 'burnoutSignals',
        'peakTimes': 'peakTimes'
      },
      'motivation': {
        'primaryDriver': 'primaryDriver',
        'noveltyDrive': 'noveltyDrive',
        'completionDrive': 'completionDrive',
        'perfectionismLevel': 'perfectionismLevel'
      },
      'processing': {
        'processingMode': 'mode',
        'processingDepth': 'depth',
        'learningModalities': 'learningModalities'
      },
      'emotional': {
        'emotionalIntensity': 'intensity',
        'emotionalRecovery': 'recovery',
        'frustrationTolerance': 'frustrationTolerance',
        'rejectionSensitivity': 'rejectionSensitivity'
      },
      'social': {
        'socialRecharge': 'rechargeMode',
        'socialCapacity': 'dailyCapacity',
        'maskingLevel': 'maskingLevel'
      }
    };

    // Find the profile location for this score
    const profileKey = domainMap[domain]?.[key];

    if (profileKey && profile[domain]) {
      const currentValue = profile[domain][profileKey];
      const confidenceKey = profileKey + 'Confidence';

      if (Array.isArray(value)) {
        // Merge arrays (triggers, drains, modalities, etc.)
        const existing = currentValue || [];
        const merged = [...new Set([...existing, ...value])];
        profile[domain][profileKey] = merged;
      } else if (typeof value === 'number') {
        // Numeric values: weighted average with existing
        if (currentValue === null) {
          profile[domain][profileKey] = value;
        } else {
          // Weighted average favoring newer data slightly
          profile[domain][profileKey] = currentValue * 0.4 + value * 0.6;
        }
      } else {
        // Categorical values: replace or confirm
        if (currentValue === null || currentValue === value) {
          profile[domain][profileKey] = value;
        } else {
          // Conflict: keep most recent but note the conflict
          profile[domain][profileKey] = value;
          profile[domain].conflictDetected = true;
        }
      }

      // Update confidence
      const currentConfidence = profile[domain][confidenceKey] || 0;
      profile[domain][confidenceKey] = Math.min(
        currentConfidence + SINGLE_ANSWER_WEIGHT,
        1.0
      );
    }

    // Handle cross-domain scores (e.g., deadline relationship appears in both time and motivation)
    if (key === 'deadlineRelationship' && domain !== 'timePerception') {
      this.applyScoreToProfile(profile, 'timePerception', key, value);
    }
  }

  /**
   * Add emergent pattern signal to profile.
   */
  addEmergentPattern(profile, patternName) {
    if (!profile.emergentPatterns[patternName]) {
      profile.emergentPatterns[patternName] = 0;
    }

    // Each signal adds weight toward the pattern
    profile.emergentPatterns[patternName] += 0.2;

    // Clamp to 1.0
    profile.emergentPatterns[patternName] = Math.min(
      profile.emergentPatterns[patternName],
      1.0
    );
  }

  /**
   * Update confidence based on triangulation.
   * When multiple questions targeting the same construct agree, boost confidence.
   * When they conflict, reduce confidence.
   */
  updateTriangulationConfidence(profile, question) {
    const triangulatedIds = question.triangulatesWith || [];
    if (triangulatedIds.length === 0) return profile;

    // Get answers for triangulated questions
    const currentAnswer = this.answeredQuestions.get(question.id);
    const triangulatedAnswers = triangulatedIds
      .map(id => this.answeredQuestions.get(id))
      .filter(Boolean);

    if (triangulatedAnswers.length === 0) return profile;

    // Check for agreement on key dimensions
    for (const [key, value] of Object.entries(currentAnswer.scores)) {
      if (key === 'emergentPattern') continue;

      const agreements = triangulatedAnswers.filter(a =>
        a.scores[key] !== undefined &&
        this.valuesAgree(a.scores[key], value)
      ).length;

      const conflicts = triangulatedAnswers.filter(a =>
        a.scores[key] !== undefined &&
        !this.valuesAgree(a.scores[key], value)
      ).length;

      // Apply confidence adjustments
      const domain = question.domain;
      const profileKey = this.getProfileKeyForScore(domain, key);

      if (profileKey && profile[domain]) {
        const confidenceKey = profileKey + 'Confidence';
        let confidence = profile[domain][confidenceKey] || 0;

        // Boost for agreements
        confidence += agreements * TRIANGULATION_BONUS;

        // Penalty for conflicts
        confidence -= conflicts * CONFLICT_PENALTY;

        // Clamp
        profile[domain][confidenceKey] = Math.max(0, Math.min(confidence, 1.0));
      }
    }

    return profile;
  }

  /**
   * Check if two values agree (considering different value types).
   */
  valuesAgree(a, b) {
    if (a === b) return true;

    // For arrays, check overlap
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.some(item => b.includes(item));
    }

    // For numbers, check if within 0.3
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a - b) < 0.3;
    }

    return false;
  }

  /**
   * Map score key to profile key.
   */
  getProfileKeyForScore(domain, scoreKey) {
    const map = {
      'attention': {
        'attentionStyle': 'style',
        'attentionVariability': 'variability',
        'hyperfocusCapable': 'hyperfocusCapable'
      },
      'workingMemory': {
        'capacity': 'capacity',
        'scaffoldingNeed': 'scaffoldingNeed',
        'chunkSize': 'optimalChunkSize'
      },
      'timePerception': {
        'timeAccuracy': 'accuracy',
        'deadlineRelationship': 'deadlineRelationship',
        'timeOrientation': 'orientation'
      },
      'energy': {
        'energyPattern': 'pattern',
        'recoveryNeed': 'recoveryNeed'
      },
      'motivation': {
        'primaryDriver': 'primaryDriver',
        'noveltyDrive': 'noveltyDrive',
        'completionDrive': 'completionDrive',
        'perfectionismLevel': 'perfectionismLevel'
      },
      'processing': {
        'processingMode': 'mode',
        'processingDepth': 'depth'
      },
      'emotional': {
        'emotionalIntensity': 'intensity',
        'emotionalRecovery': 'recovery',
        'frustrationTolerance': 'frustrationTolerance',
        'rejectionSensitivity': 'rejectionSensitivity'
      },
      'social': {
        'socialRecharge': 'rechargeMode',
        'socialCapacity': 'dailyCapacity',
        'maskingLevel': 'maskingLevel'
      }
    };

    return map[domain]?.[scoreKey];
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Score multiple responses at once.
   */
  scoreResponses(profile, responses) {
    for (const { questionId, optionIndex } of responses) {
      profile = this.scoreResponse(profile, questionId, optionIndex);
    }
    return profile;
  }

  /**
   * Recalculate entire profile from answer history.
   * Useful for consistency verification.
   */
  recalculateProfile(answers) {
    const profile = createEmptyProfile();
    for (const [questionId, optionIndex] of answers) {
      this.scoreResponse(profile, questionId, optionIndex);
    }
    return profile;
  }

  // ==========================================================================
  // PROFILE ANALYSIS
  // ==========================================================================

  /**
   * Analyze emergent patterns and generate insights.
   */
  analyzeEmergentPatterns(profile) {
    const patterns = profile.emergentPatterns;
    const insights = [];

    // Interest-Driven Nervous System (ADHD indicator)
    if (patterns.interestDrivenNervousSystem > 0.5) {
      insights.push({
        pattern: 'interestDrivenNervousSystem',
        strength: patterns.interestDrivenNervousSystem,
        title: 'Interest-Driven Attention',
        description: `Your attention appears to operate on an interest-driven basis rather than pure willpower. When something genuinely engages you, focus comes naturally. When it doesn't, no amount of "trying harder" helps.`,
        implications: [
          'External structure and accountability may help more than self-discipline',
          'Finding ways to make tasks interesting is more effective than forcing focus',
          'Deadlines may be necessary to activate your best work'
        ]
      });
    }

    // Executive Function Challenges
    if (patterns.executiveFunctionChallenges > 0.4) {
      insights.push({
        pattern: 'executiveFunctionChallenges',
        strength: patterns.executiveFunctionChallenges,
        title: 'Executive Function Differences',
        description: `You may experience challenges with planning, prioritizing, or initiating tasks that others find straightforward. This isn't about intelligence or effort—it's about how your brain coordinates complex activities.`,
        implications: [
          'Breaking tasks into smaller steps is essential, not optional',
          'External reminders and systems are tools, not crutches',
          'Starting is often harder than doing—momentum helps'
        ]
      });
    }

    // Rejection Sensitivity
    if (patterns.rejectionSensitivity > 0.5 ||
        (profile.emotional.rejectionSensitivity && profile.emotional.rejectionSensitivity > 0.7)) {
      insights.push({
        pattern: 'rejectionSensitivity',
        strength: patterns.rejectionSensitivity || profile.emotional.rejectionSensitivity,
        title: 'Heightened Rejection Sensitivity',
        description: `You may experience criticism or perceived rejection more intensely than others. What feels like a minor comment to someone else might hit you much harder.`,
        implications: [
          'This is a neurological difference, not oversensitivity',
          'Knowing this pattern helps separate the feeling from the fact',
          'Building support systems and self-compassion is important'
        ]
      });
    }

    // Neurodivergent signals
    const ndSignals = patterns.neurodivergentSignals || [];
    if (ndSignals.length >= 3) {
      insights.push({
        pattern: 'neurodivergentCluster',
        strength: ndSignals.length / 5,
        title: 'Neurodivergent Processing Pattern',
        description: `Your profile shows several patterns commonly associated with neurodivergent processing styles. This isn't a diagnosis—it's an observation that your brain may work differently from neurotypical assumptions.`,
        implications: [
          'Strategies designed for neurotypical minds may not work for you',
          'Understanding your specific patterns enables better self-advocacy',
          'There are strengths in how you process information'
        ]
      });
    }

    return insights;
  }

  /**
   * Generate a human-readable profile summary.
   */
  generateProfileSummary(profile) {
    const sections = [];

    // Attention
    if (profile.attention.styleConfidence >= MINIMUM_CONFIDENCE) {
      sections.push({
        domain: 'Attention',
        style: this.formatAttentionStyle(profile.attention.style),
        details: this.formatAttentionDetails(profile.attention)
      });
    }

    // Working Memory
    if (profile.workingMemory.capacityConfidence >= MINIMUM_CONFIDENCE) {
      sections.push({
        domain: 'Working Memory',
        style: this.formatWorkingMemory(profile.workingMemory),
        details: this.formatWorkingMemoryDetails(profile.workingMemory)
      });
    }

    // Time Perception
    if (profile.timePerception.accuracyConfidence >= MINIMUM_CONFIDENCE) {
      sections.push({
        domain: 'Time Perception',
        style: this.formatTimePerception(profile.timePerception),
        details: this.formatTimePerceptionDetails(profile.timePerception)
      });
    }

    // Energy
    if (profile.energy.patternConfidence >= MINIMUM_CONFIDENCE) {
      sections.push({
        domain: 'Energy',
        style: this.formatEnergy(profile.energy),
        details: this.formatEnergyDetails(profile.energy)
      });
    }

    // Motivation
    if (profile.motivation.driverConfidence >= MINIMUM_CONFIDENCE) {
      sections.push({
        domain: 'Motivation',
        style: this.formatMotivation(profile.motivation),
        details: this.formatMotivationDetails(profile.motivation)
      });
    }

    return {
      sections,
      emergentInsights: this.analyzeEmergentPatterns(profile),
      completeness: this.calculateCompleteness(profile),
      checksum: computeProfileChecksum(profile)
    };
  }

  // Formatting helpers
  formatAttentionStyle(style) {
    const styles = {
      'sustained': 'Sustained Focus',
      'interest-driven': 'Interest-Driven',
      'burst-based': 'Burst Performer',
      'context-dependent': 'Context-Dependent',
      'flexible': 'Flexible'
    };
    return styles[style] || style;
  }

  formatAttentionDetails(attention) {
    const parts = [];
    if (attention.triggers?.length) {
      parts.push(`Activates with: ${attention.triggers.join(', ')}`);
    }
    if (attention.drains?.length) {
      parts.push(`Depleted by: ${attention.drains.join(', ')}`);
    }
    if (attention.hyperfocusCapable) {
      parts.push('Capable of hyperfocus when engaged');
    }
    return parts.join('. ');
  }

  formatWorkingMemory(wm) {
    return `${wm.capacity || 'Unknown'} capacity`;
  }

  formatWorkingMemoryDetails(wm) {
    const parts = [];
    if (wm.scaffoldingNeed) {
      parts.push(`Scaffolding need: ${wm.scaffoldingNeed}`);
    }
    if (wm.optimalChunkSize) {
      parts.push(`Optimal chunk size: ${wm.optimalChunkSize}`);
    }
    return parts.join('. ');
  }

  formatTimePerception(time) {
    return time.accuracy || 'Unknown pattern';
  }

  formatTimePerceptionDetails(time) {
    const parts = [];
    if (time.deadlineRelationship) {
      parts.push(`Deadlines are: ${time.deadlineRelationship}`);
    }
    if (time.orientation) {
      parts.push(`Time orientation: ${time.orientation}`);
    }
    return parts.join('. ');
  }

  formatEnergy(energy) {
    return energy.pattern || 'Unknown pattern';
  }

  formatEnergyDetails(energy) {
    const parts = [];
    if (energy.peakTimes?.length) {
      parts.push(`Peak times: ${energy.peakTimes.join(', ')}`);
    }
    if (energy.recoveryNeed) {
      parts.push(`Recovery need: ${energy.recoveryNeed}`);
    }
    return parts.join('. ');
  }

  formatMotivation(motivation) {
    return motivation.primaryDriver || 'Unknown driver';
  }

  formatMotivationDetails(motivation) {
    const parts = [];
    if (motivation.noveltyDrive !== null) {
      const level = motivation.noveltyDrive > 0.7 ? 'High' :
                    motivation.noveltyDrive > 0.4 ? 'Moderate' : 'Low';
      parts.push(`Novelty drive: ${level}`);
    }
    if (motivation.completionDrive !== null) {
      const level = motivation.completionDrive > 0.7 ? 'High' :
                    motivation.completionDrive > 0.4 ? 'Moderate' : 'Low';
      parts.push(`Completion drive: ${level}`);
    }
    return parts.join('. ');
  }

  calculateCompleteness(profile) {
    const domains = ['attention', 'workingMemory', 'timePerception', 'energy',
                     'motivation', 'processing', 'emotional', 'social'];
    let measured = 0;

    for (const domain of domains) {
      const keys = Object.keys(profile[domain]).filter(k => k.endsWith('Confidence'));
      const confident = keys.filter(k => profile[domain][k] >= MINIMUM_CONFIDENCE);
      if (confident.length > 0) measured++;
    }

    return measured / domains.length;
  }

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  toJSON() {
    return {
      answeredQuestions: Array.from(this.answeredQuestions.entries()),
      checksum: this.computeChecksum()
    };
  }

  static fromJSON(data) {
    const engine = new ScoringEngine();
    engine.answeredQuestions = new Map(data.answeredQuestions || []);
    return engine;
  }

  computeChecksum() {
    const data = {
      answerCount: this.answeredQuestions.size,
      answers: Array.from(this.answeredQuestions.keys()).sort()
    };
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

export default ScoringEngine;
