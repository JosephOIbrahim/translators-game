/**
 * CognitiveCalibrationIntegration.js - Bridge between CalibrationState and Cognitive System
 *
 * This module integrates the deep cognitive profiling system with the existing
 * CalibrationState, allowing gradual adoption and progressive disclosure.
 *
 * Architecture:
 * - CalibrationState continues to use its existing QUESTIONS for the garden growth
 * - This integration adds cognitive depth questions after the initial 8
 * - Behavioral tracking runs throughout all questions
 * - Profile builds from both sources
 */

import { createEmptyProfile, computeProfileChecksum, hasMinimumViableProfile } from './ProfileSchema.js';
import { CORE_QUESTIONS, DOMAIN_QUESTIONS, getNextQuestions, getQuestionById } from './QuestionBank.js';
import { BehavioralTracker } from './BehavioralTracker.js';
import { ScoringEngine } from './ScoringEngine.js';

// ============================================================================
// COGNITIVE CALIBRATION MANAGER
// ============================================================================

export class CognitiveCalibrationManager {
  constructor() {
    // Core systems
    this.profile = createEmptyProfile();
    this.behavioralTracker = new BehavioralTracker();
    this.scoringEngine = new ScoringEngine();

    // State tracking
    this.answeredQuestionIds = new Set();
    this.currentPhase = 'initial'; // 'initial' | 'cognitive_core' | 'cognitive_deep' | 'complete'
    this.sessionCount = 0;

    // Question queue for cognitive phase
    this.cognitiveQuestionQueue = [];
    this.currentCognitiveQuestion = null;
  }

  // ==========================================================================
  // SESSION LIFECYCLE
  // ==========================================================================

  startSession() {
    this.behavioralTracker.startSession();
    this.sessionCount++;
  }

  endSession() {
    this.behavioralTracker.endSession(true);

    // Apply behavioral signals to profile
    this.profile = this.behavioralTracker.applyToProfile(this.profile);

    // Update profile metadata
    this.profile.sessionsCompleted = this.sessionCount;
    this.profile.lastUpdated = Date.now();

    return this.profile;
  }

  // ==========================================================================
  // LEGACY QUESTION HANDLING (CalibrationState's 8 questions)
  // ==========================================================================

  /**
   * Track timing for legacy questions (from CalibrationState).
   * Call when a question is displayed.
   */
  onLegacyQuestionPresented(questionId) {
    this.behavioralTracker.questionPresented(`legacy_${questionId}`);
  }

  /**
   * Record answer for legacy questions.
   * Maps to cognitive dimensions where possible.
   */
  onLegacyQuestionAnswered(questionId, answer) {
    this.behavioralTracker.optionSelected(`legacy_${questionId}`, 0, true);

    // Map legacy questions to cognitive profile dimensions
    this.mapLegacyAnswerToProfile(questionId, answer);
  }

  /**
   * Map legacy CalibrationState questions to cognitive profile.
   */
  mapLegacyAnswerToProfile(questionId, answer) {
    const mappings = {
      'load': (answer) => {
        // "How much can you hold at once" → Working memory capacity
        if (answer.value === 'low') {
          this.profile.workingMemory.capacity = 'low';
          this.profile.workingMemory.capacityConfidence = 0.3;
        } else if (answer.value === 'high') {
          this.profile.workingMemory.capacity = 'high';
          this.profile.workingMemory.capacityConfidence = 0.3;
        } else {
          this.profile.workingMemory.capacity = 'variable';
          this.profile.workingMemory.capacityConfidence = 0.3;
        }
      },

      'ground': (answer) => {
        // "Where does your mind live?" → Processing style depth
        if (answer.value === 'ground') {
          this.profile.processing.depth = 'deep-narrow';
          this.profile.processing.depthConfidence = 0.3;
        } else if (answer.value === 'high') {
          this.profile.processing.depth = 'shallow-broad';
          this.profile.processing.depthConfidence = 0.3;
        } else {
          this.profile.processing.depth = 'context-dependent';
          this.profile.processing.depthConfidence = 0.3;
        }
      },

      'leash': (answer) => {
        // "How long is the leash?" → Scaffolding need
        if (answer.value === 'short') {
          this.profile.workingMemory.scaffoldingNeed = 'significant';
          this.profile.workingMemory.scaffoldingConfidence = 0.25;
        } else if (answer.value === 'long') {
          this.profile.workingMemory.scaffoldingNeed = 'minimal';
          this.profile.workingMemory.scaffoldingConfidence = 0.25;
        } else {
          this.profile.workingMemory.scaffoldingNeed = 'moderate';
          this.profile.workingMemory.scaffoldingConfidence = 0.25;
        }
      },

      'lost': (answer) => {
        // "Search wide or dig deep?" → Processing mode
        if (answer.value === 'wide') {
          this.profile.processing.mode = 'parallel';
          this.profile.processing.modeConfidence = 0.3;
        } else if (answer.value === 'deep') {
          this.profile.processing.mode = 'linear';
          this.profile.processing.modeConfidence = 0.3;
        } else {
          this.profile.processing.mode = 'emergent';
          this.profile.processing.modeConfidence = 0.3;
        }
      },

      'wrong': (answer) => {
        // "When you're wrong, how should I tell you?" → Emotional patterns
        if (answer.value === 'direct') {
          this.profile.emotional.frustrationTolerance = 0.7;
          this.profile.emotional.frustrationConfidence = 0.2;
        } else if (answer.value === 'gentle') {
          this.profile.emotional.rejectionSensitivity = 0.6;
          this.profile.emotional.rsdConfidence = 0.2;
        }
      },

      'fog': (answer) => {
        // "Can you sit in the fog?" → Uncertainty tolerance (maps to frustration)
        if (answer.value === 'no') {
          this.profile.emotional.frustrationTolerance = 0.3;
          this.profile.emotional.frustrationConfidence = 0.25;
        } else if (answer.value === 'yes') {
          this.profile.emotional.frustrationTolerance = 0.8;
          this.profile.emotional.frustrationConfidence = 0.25;
        }
      },

      'silence': (answer) => {
        // "Is silence a problem?" → Social/processing pace
        if (answer.value === 'yes') {
          this.profile.social.rechargeMode = 'social';
          this.profile.social.rechargeConfidence = 0.2;
        } else if (answer.value === 'no') {
          this.profile.social.rechargeMode = 'alone';
          this.profile.social.rechargeConfidence = 0.2;
        }
      },

      'wander': (answer) => {
        // "Wandering: discovery or distraction?" → Novelty drive
        if (answer.value === 'discovery') {
          this.profile.motivation.noveltyDrive = 0.8;
          this.profile.motivation.noveltyConfidence = 0.3;
          this.profile.emergentPatterns.interestDrivenNervousSystem = 0.2;
        } else if (answer.value === 'distraction') {
          this.profile.motivation.noveltyDrive = 0.2;
          this.profile.motivation.noveltyConfidence = 0.3;
        } else {
          this.profile.motivation.noveltyDrive = 0.5;
          this.profile.motivation.noveltyConfidence = 0.3;
        }
      }
    };

    const mapper = mappings[questionId];
    if (mapper) {
      mapper(answer);
    }
  }

  // ==========================================================================
  // COGNITIVE QUESTION HANDLING
  // ==========================================================================

  /**
   * Check if ready to transition to cognitive questions.
   * Called after legacy questions complete.
   */
  shouldStartCognitivePhase() {
    return this.currentPhase === 'initial';
  }

  /**
   * Begin the cognitive question phase.
   * Returns first batch of cognitive questions.
   */
  startCognitivePhase(batchSize = 3) {
    this.currentPhase = 'cognitive_core';

    // Get initial batch of core questions
    this.cognitiveQuestionQueue = getNextQuestions(
      this.profile,
      batchSize,
      Array.from(this.answeredQuestionIds)
    );

    return this.cognitiveQuestionQueue;
  }

  /**
   * Get next cognitive question.
   */
  getNextCognitiveQuestion() {
    if (this.cognitiveQuestionQueue.length === 0) {
      // Refill queue based on profile state
      this.cognitiveQuestionQueue = getNextQuestions(
        this.profile,
        3,
        Array.from(this.answeredQuestionIds)
      );

      // Check if we have enough for deep phase
      if (this.cognitiveQuestionQueue.length === 0 || hasMinimumViableProfile(this.profile)) {
        this.currentPhase = 'complete';
        return null;
      }
    }

    this.currentCognitiveQuestion = this.cognitiveQuestionQueue.shift();
    this.behavioralTracker.questionPresented(this.currentCognitiveQuestion.id);
    return this.currentCognitiveQuestion;
  }

  /**
   * Record answer for cognitive question.
   */
  answerCognitiveQuestion(questionId, optionIndex) {
    this.answeredQuestionIds.add(questionId);
    this.behavioralTracker.optionSelected(questionId, optionIndex, true);

    // Score the response
    this.profile = this.scoringEngine.scoreResponse(this.profile, questionId, optionIndex);

    // Update phase based on progress
    if (this.profile.questionsAnswered >= 12 && this.currentPhase === 'cognitive_core') {
      this.currentPhase = 'cognitive_deep';
    }

    return this.profile;
  }

  // ==========================================================================
  // PROFILE ACCESS
  // ==========================================================================

  /**
   * Get current profile state.
   */
  getProfile() {
    return this.profile;
  }

  /**
   * Get profile summary for display.
   */
  getProfileSummary() {
    return this.scoringEngine.generateProfileSummary(this.profile);
  }

  /**
   * Check if profile has enough data to be meaningful.
   */
  hasViableProfile() {
    return hasMinimumViableProfile(this.profile);
  }

  /**
   * Get current phase.
   */
  getCurrentPhase() {
    return this.currentPhase;
  }

  /**
   * Get behavioral signals summary for UI.
   */
  getBehavioralSummary() {
    return this.behavioralTracker.getSignalsSummary();
  }

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  /**
   * Export state for persistence.
   */
  toJSON() {
    return {
      profile: this.profile,
      behavioralTracker: this.behavioralTracker.toJSON(),
      scoringEngine: this.scoringEngine.toJSON(),
      answeredQuestionIds: Array.from(this.answeredQuestionIds),
      currentPhase: this.currentPhase,
      sessionCount: this.sessionCount,
      checksum: computeProfileChecksum(this.profile)
    };
  }

  /**
   * Restore state from persistence.
   */
  static fromJSON(data) {
    const manager = new CognitiveCalibrationManager();

    if (data.profile) {
      manager.profile = data.profile;
    }
    if (data.behavioralTracker) {
      manager.behavioralTracker = BehavioralTracker.fromJSON(data.behavioralTracker);
    }
    if (data.scoringEngine) {
      manager.scoringEngine = ScoringEngine.fromJSON(data.scoringEngine);
    }
    if (data.answeredQuestionIds) {
      manager.answeredQuestionIds = new Set(data.answeredQuestionIds);
    }
    if (data.currentPhase) {
      manager.currentPhase = data.currentPhase;
    }
    if (data.sessionCount) {
      manager.sessionCount = data.sessionCount;
    }

    return manager;
  }

  /**
   * Save to localStorage.
   */
  saveToStorage() {
    try {
      localStorage.setItem('translators_cognitive_profile', JSON.stringify(this.toJSON()));
      return true;
    } catch (e) {
      console.warn('Failed to save cognitive profile:', e);
      return false;
    }
  }

  /**
   * Load from localStorage.
   */
  static loadFromStorage() {
    try {
      const data = localStorage.getItem('translators_cognitive_profile');
      if (data) {
        return CognitiveCalibrationManager.fromJSON(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Failed to load cognitive profile:', e);
    }
    return new CognitiveCalibrationManager();
  }
}

// ============================================================================
// QUESTION FORMATTER
// ============================================================================

/**
 * Format cognitive questions for display in CalibrationState style.
 */
export function formatCognitiveQuestionForDisplay(question) {
  if (!question) return null;

  return {
    id: question.id,
    text: question.text,
    options: question.options.map((opt, i) => ({
      label: opt.text,
      value: i.toString(),
      index: i
    })),
    dimension: question.domain,
    depth: question.tier === 'core' ? 1 : question.tier === 'domain' ? 2 : 3
  };
}

/**
 * Get depth label for UI.
 */
export function getCognitiveDepthLabel(tier) {
  const labels = {
    'core': 'Foundation',
    'domain': 'Pattern',
    'deep': 'Core'
  };
  return labels[tier] || tier;
}

export default CognitiveCalibrationManager;
