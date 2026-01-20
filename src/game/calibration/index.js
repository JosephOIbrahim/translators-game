/**
 * Cognitive Calibration System - Index
 *
 * Deep cognitive profiling for The Translators game.
 * Surfaces patterns through experience-based questions, not self-assessment.
 */

// Core schema and types
export {
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
} from './ProfileSchema.js';

// Question bank
export {
  QuestionTier,
  ALL_QUESTIONS,
  QUESTIONS_BY_DOMAIN,
  CORE_QUESTIONS,
  DOMAIN_QUESTIONS,
  DEEP_QUESTIONS,
  getNextQuestions,
  getQuestionById
} from './QuestionBank.js';

// Behavioral tracking
export {
  SignalType,
  BehavioralIndicators,
  BehavioralTracker
} from './BehavioralTracker.js';

// Scoring engine
export { ScoringEngine } from './ScoringEngine.js';

// Integration layer
export {
  CognitiveCalibrationManager,
  formatCognitiveQuestionForDisplay,
  getCognitiveDepthLabel
} from './CognitiveCalibrationIntegration.js';

// Profile rendering
export {
  renderProfile,
  renderProfileAsText
} from './ProfileRenderer.js';
