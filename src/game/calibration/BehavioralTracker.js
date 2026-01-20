/**
 * BehavioralTracker.js - Implicit Signal Capture
 *
 * Beyond what people SAY about themselves (self-report), we observe
 * HOW they behave during the calibration process. This is the "implicit
 * layer" that validates and enriches the explicit responses.
 *
 * Key insight: Someone with ADHD may answer "I focus fine" while their
 * behavioral data shows high response time variability. This discrepancy
 * IS the signal.
 *
 * ThinkingMachines Compliance: All measurements are deterministic and
 * reproducible. Same behavioral sequence → same signal extraction.
 */

// ============================================================================
// BEHAVIORAL SIGNAL TYPES
// ============================================================================

/**
 * Signal categories we track
 */
export const SignalType = {
  RESPONSE_TIME: 'responseTime',           // How long to answer
  RESPONSE_VARIABILITY: 'responseVariability', // Consistency of timing
  REVISION_PATTERN: 'revisionPattern',     // Changed answers
  READING_BEHAVIOR: 'readingBehavior',     // Scanned vs. quick select
  ENGAGEMENT_CURVE: 'engagementCurve',     // How engagement changes over time
  SESSION_PATTERN: 'sessionPattern',       // When they engage, breaks, returns
  COMPLETION_PATTERN: 'completionPattern'  // Do they finish sessions?
};

/**
 * What behavioral patterns might indicate
 */
export const BehavioralIndicators = {
  ATTENTION_VARIABILITY: 'attentionVariability',
  IMPULSIVITY: 'impulsivity',
  DELIBERATION: 'deliberation',
  FATIGUE: 'fatigue',
  ENGAGEMENT: 'engagement',
  DISENGAGEMENT: 'disengagement',
  PERFECTIONISM: 'perfectionism',
  DECISIVENESS: 'decisiveness',
  INDECISIVENESS: 'indecisiveness'
};

// ============================================================================
// BEHAVIORAL TRACKER CLASS
// ============================================================================

export class BehavioralTracker {
  constructor() {
    // Raw data collection
    this.responses = [];                    // { questionId, optionIndex, timestamp, responseTime }
    this.revisions = [];                    // { questionId, fromOption, toOption, timestamp }
    this.sessionEvents = [];                // { type: 'start'|'pause'|'resume'|'end', timestamp }
    this.optionHovers = [];                 // { questionId, optionIndex, duration } (if trackable)

    // Computed signals (updated in real-time)
    this.signals = {
      averageResponseTime: null,
      responseTimeStdDev: null,
      responseTimeVariability: null,        // CV (coefficient of variation)
      quickResponses: 0,                    // < 2 seconds (impulsive?)
      slowResponses: 0,                     // > 30 seconds (deliberating?)
      totalRevisions: 0,
      revisionRate: 0,                      // revisions / responses
      engagementTrend: [],                  // Response times over session
      sessionBreaks: 0,
      totalTimeInSession: 0,
      timeOfDay: null,                      // When they prefer to calibrate
      completedSessions: 0,
      abandonedSessions: 0
    };

    // Session state
    this.sessionStart = null;
    this.lastActivityTime = null;
    this.isPaused = false;
    this.currentQuestionStart = null;
  }

  // ==========================================================================
  // SESSION LIFECYCLE
  // ==========================================================================

  startSession() {
    this.sessionStart = Date.now();
    this.lastActivityTime = this.sessionStart;
    this.isPaused = false;

    this.sessionEvents.push({
      type: 'start',
      timestamp: this.sessionStart,
      timeOfDay: this.getTimeOfDay(this.sessionStart)
    });

    // Track preferred time of day
    this.updateTimeOfDayPreference();
  }

  pauseSession() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.signals.sessionBreaks++;

      this.sessionEvents.push({
        type: 'pause',
        timestamp: Date.now(),
        duration: Date.now() - this.lastActivityTime
      });
    }
  }

  resumeSession() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastActivityTime = Date.now();

      this.sessionEvents.push({
        type: 'resume',
        timestamp: Date.now()
      });
    }
  }

  endSession(completed = true) {
    const endTime = Date.now();
    const duration = endTime - this.sessionStart;

    this.signals.totalTimeInSession += duration;

    if (completed) {
      this.signals.completedSessions++;
    } else {
      this.signals.abandonedSessions++;
    }

    this.sessionEvents.push({
      type: 'end',
      timestamp: endTime,
      completed,
      duration
    });

    // Compute final session signals
    this.computeEngagementCurve();
  }

  // ==========================================================================
  // QUESTION INTERACTION
  // ==========================================================================

  questionPresented(questionId) {
    this.currentQuestionStart = Date.now();
    this.lastActivityTime = this.currentQuestionStart;
  }

  optionSelected(questionId, optionIndex, isFinal = true) {
    const now = Date.now();
    const responseTime = this.currentQuestionStart
      ? (now - this.currentQuestionStart) / 1000  // Convert to seconds
      : null;

    this.lastActivityTime = now;

    // Check if this is a revision
    const existingResponse = this.responses.find(r => r.questionId === questionId);

    if (existingResponse && !isFinal) {
      // This is a hover/consideration, not tracked as revision yet
      return;
    }

    if (existingResponse && isFinal) {
      // This is a revision
      this.revisions.push({
        questionId,
        fromOption: existingResponse.optionIndex,
        toOption: optionIndex,
        timestamp: now,
        timeSinceOriginal: (now - existingResponse.timestamp) / 1000
      });

      existingResponse.optionIndex = optionIndex;
      existingResponse.revised = true;
      this.signals.totalRevisions++;
    } else if (isFinal) {
      // New response
      this.responses.push({
        questionId,
        optionIndex,
        timestamp: now,
        responseTime
      });
    }

    // Update computed signals
    this.updateResponseTimeSignals();
    this.categorizeResponseSpeed(responseTime);
  }

  // ==========================================================================
  // SIGNAL COMPUTATION
  // ==========================================================================

  updateResponseTimeSignals() {
    const times = this.responses
      .map(r => r.responseTime)
      .filter(t => t !== null && t > 0);

    if (times.length === 0) return;

    // Average
    const sum = times.reduce((a, b) => a + b, 0);
    this.signals.averageResponseTime = sum / times.length;

    // Standard deviation
    if (times.length > 1) {
      const mean = this.signals.averageResponseTime;
      const squareDiffs = times.map(t => Math.pow(t - mean, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / times.length;
      this.signals.responseTimeStdDev = Math.sqrt(avgSquareDiff);

      // Coefficient of variation (normalized variability)
      // High CV = high variability = potential attention fluctuation
      this.signals.responseTimeVariability =
        this.signals.responseTimeStdDev / this.signals.averageResponseTime;
    }

    // Revision rate
    this.signals.revisionRate = this.responses.length > 0
      ? this.signals.totalRevisions / this.responses.length
      : 0;
  }

  categorizeResponseSpeed(responseTime) {
    if (responseTime === null) return;

    if (responseTime < 2) {
      this.signals.quickResponses++;
    } else if (responseTime > 30) {
      this.signals.slowResponses++;
    }
  }

  computeEngagementCurve() {
    // Break responses into windows to see engagement trend
    const windowSize = 3;
    const times = this.responses.map(r => r.responseTime).filter(t => t !== null);

    if (times.length < windowSize) return;

    const curve = [];
    for (let i = 0; i <= times.length - windowSize; i++) {
      const window = times.slice(i, i + windowSize);
      const avgTime = window.reduce((a, b) => a + b, 0) / windowSize;
      curve.push({
        position: i,
        averageTime: avgTime,
        trend: i > 0 ? avgTime - curve[i - 1].averageTime : 0
      });
    }

    this.signals.engagementTrend = curve;
  }

  // ==========================================================================
  // PATTERN INTERPRETATION
  // ==========================================================================

  /**
   * Extract behavioral indicators from raw signals.
   * These are probabilistic interpretations, not diagnoses.
   */
  extractIndicators() {
    const indicators = {};

    // Response time variability → Attention pattern
    if (this.signals.responseTimeVariability !== null) {
      if (this.signals.responseTimeVariability > 0.8) {
        indicators[BehavioralIndicators.ATTENTION_VARIABILITY] = {
          strength: Math.min(this.signals.responseTimeVariability, 1),
          interpretation: 'Highly variable response times may indicate attention fluctuations'
        };
      }
    }

    // Quick responses → Impulsivity or clarity
    const quickRate = this.responses.length > 0
      ? this.signals.quickResponses / this.responses.length
      : 0;

    if (quickRate > 0.4) {
      indicators[BehavioralIndicators.IMPULSIVITY] = {
        strength: quickRate,
        interpretation: 'Frequent quick responses may indicate impulsive decision-making or high clarity'
      };
    } else if (quickRate < 0.1 && this.signals.averageResponseTime > 15) {
      indicators[BehavioralIndicators.DELIBERATION] = {
        strength: 1 - quickRate,
        interpretation: 'Consistently slow responses suggest careful deliberation'
      };
    }

    // Revision rate → Perfectionism or uncertainty
    if (this.signals.revisionRate > 0.2) {
      indicators[BehavioralIndicators.PERFECTIONISM] = {
        strength: Math.min(this.signals.revisionRate * 2, 1),
        interpretation: 'Frequent answer changes may indicate perfectionism or uncertainty'
      };
      indicators[BehavioralIndicators.INDECISIVENESS] = {
        strength: Math.min(this.signals.revisionRate * 2, 1),
        interpretation: 'Multiple revisions suggest difficulty with decisions'
      };
    } else if (this.signals.revisionRate < 0.05 && this.responses.length > 10) {
      indicators[BehavioralIndicators.DECISIVENESS] = {
        strength: 1 - this.signals.revisionRate,
        interpretation: 'Rarely changing answers suggests confident decision-making'
      };
    }

    // Engagement curve → Fatigue or sustained attention
    if (this.signals.engagementTrend.length >= 3) {
      const trend = this.signals.engagementTrend;
      const lastThird = trend.slice(-Math.ceil(trend.length / 3));
      const avgTrendLastThird = lastThird.reduce((a, b) => a + b.trend, 0) / lastThird.length;

      if (avgTrendLastThird > 3) {
        // Responses getting slower → fatigue
        indicators[BehavioralIndicators.FATIGUE] = {
          strength: Math.min(avgTrendLastThird / 10, 1),
          interpretation: 'Slowing responses toward end of session suggest fatigue'
        };
      } else if (avgTrendLastThird < -2) {
        // Responses getting faster → engagement or rushing
        const isRushing = this.signals.quickResponses >
          this.responses.length * 0.3 * (trend.length / this.responses.length);

        if (isRushing) {
          indicators[BehavioralIndicators.DISENGAGEMENT] = {
            strength: Math.min(Math.abs(avgTrendLastThird) / 5, 1),
            interpretation: 'Rapid responses at end may indicate rushing to finish'
          };
        } else {
          indicators[BehavioralIndicators.ENGAGEMENT] = {
            strength: Math.min(Math.abs(avgTrendLastThird) / 5, 1),
            interpretation: 'Faster responses toward end suggest increasing engagement'
          };
        }
      }
    }

    // Session patterns → Self-regulation
    if (this.signals.abandonedSessions > 0 &&
        this.signals.abandonedSessions >= this.signals.completedSessions) {
      indicators.sessionAbandonment = {
        strength: this.signals.abandonedSessions /
          (this.signals.abandonedSessions + this.signals.completedSessions),
        interpretation: 'Difficulty completing sessions may indicate executive function challenges'
      };
    }

    return indicators;
  }

  // ==========================================================================
  // PROFILE INTEGRATION
  // ==========================================================================

  /**
   * Apply behavioral signals to cognitive profile.
   * Behavioral data can confirm, contradict, or add nuance to self-report.
   */
  applyToProfile(profile) {
    const indicators = this.extractIndicators();

    // Attention variability → attention style
    if (indicators[BehavioralIndicators.ATTENTION_VARIABILITY]) {
      const current = profile.attention.attentionVariability || 0;
      const observed = indicators[BehavioralIndicators.ATTENTION_VARIABILITY].strength;

      // Weight behavioral data with existing profile data
      profile.attention.attentionVariability = (current + observed) / 2;

      // If variability is high, this supports interest-driven attention
      if (observed > 0.6) {
        profile.emergentPatterns.interestDrivenNervousSystem =
          (profile.emergentPatterns.interestDrivenNervousSystem || 0) + 0.2;
      }
    }

    // Impulsivity signal
    if (indicators[BehavioralIndicators.IMPULSIVITY]) {
      profile.behavioralSignals.impulsivityIndicator =
        indicators[BehavioralIndicators.IMPULSIVITY].strength;
    }

    // Store raw behavioral signals
    profile.behavioralSignals.averageResponseTime = this.signals.averageResponseTime;
    profile.behavioralSignals.responseTimeVariability = this.signals.responseTimeVariability;
    profile.behavioralSignals.revisionsCount = this.signals.totalRevisions;
    profile.behavioralSignals.sessionEngagementCurve = this.signals.engagementTrend;

    // Time of day preference
    if (this.signals.timeOfDay) {
      profile.behavioralSignals.preferredTimeOfDay = this.signals.timeOfDay;
    }

    // Cross-reference: Check for discrepancies
    this.detectDiscrepancies(profile, indicators);

    return profile;
  }

  /**
   * Detect discrepancies between self-report and behavior.
   * These are often the most revealing signals.
   */
  detectDiscrepancies(profile, indicators) {
    const discrepancies = [];

    // Example: Person says they're focused, but behavioral variability is high
    if (profile.attention.style === 'sustained' &&
        indicators[BehavioralIndicators.ATTENTION_VARIABILITY]?.strength > 0.6) {
      discrepancies.push({
        type: 'attention_perception_mismatch',
        selfReport: 'Claims sustained focus',
        observed: 'High response time variability',
        significance: 'May not recognize attention fluctuations as abnormal'
      });

      // This is a strong signal for unrecognized patterns
      profile.emergentPatterns.selfAwarenessGap = true;
    }

    // Example: Person says time estimation is accurate, but session shows rushing at end
    if (profile.timePerception.accuracy === 'accurate' &&
        indicators[BehavioralIndicators.DISENGAGEMENT]) {
      discrepancies.push({
        type: 'time_perception_mismatch',
        selfReport: 'Claims accurate time perception',
        observed: 'Rushing behavior suggests time pressure',
        significance: 'May underestimate session duration'
      });
    }

    // Example: Person says low perfectionism, but high revision rate
    if (profile.motivation.perfectionismLevel < 0.3 &&
        indicators[BehavioralIndicators.PERFECTIONISM]?.strength > 0.5) {
      discrepancies.push({
        type: 'perfectionism_mismatch',
        selfReport: 'Low perfectionism self-rating',
        observed: 'Frequent answer revisions',
        significance: 'May have perfectionist tendencies without awareness'
      });
    }

    profile.behavioralSignals.discrepancies = discrepancies;
    return discrepancies;
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  updateTimeOfDayPreference() {
    const times = this.sessionEvents
      .filter(e => e.type === 'start')
      .map(e => e.timeOfDay);

    if (times.length === 0) return;

    // Find most common
    const counts = times.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    this.signals.timeOfDay = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Export for persistence (ThinkingMachines compliant - deterministic)
   */
  toJSON() {
    return {
      responses: this.responses,
      revisions: this.revisions,
      sessionEvents: this.sessionEvents,
      signals: this.signals,
      checksum: this.computeChecksum()
    };
  }

  /**
   * Restore from persistence
   */
  static fromJSON(data) {
    const tracker = new BehavioralTracker();
    tracker.responses = data.responses || [];
    tracker.revisions = data.revisions || [];
    tracker.sessionEvents = data.sessionEvents || [];
    tracker.signals = data.signals || tracker.signals;
    return tracker;
  }

  /**
   * Checksum for consistency validation
   */
  computeChecksum() {
    const data = {
      responseCount: this.responses.length,
      revisionCount: this.revisions.length,
      avgResponseTime: this.signals.averageResponseTime,
      variability: this.signals.responseTimeVariability
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

  /**
   * Get current signals summary for UI
   */
  getSignalsSummary() {
    return {
      questionsAnswered: this.responses.length,
      revisionsMode: this.signals.totalRevisions,
      averageTimePerQuestion: this.signals.averageResponseTime
        ? `${this.signals.averageResponseTime.toFixed(1)}s`
        : null,
      variabilityLevel: this.signals.responseTimeVariability
        ? (this.signals.responseTimeVariability > 0.6 ? 'high' :
           this.signals.responseTimeVariability > 0.3 ? 'moderate' : 'low')
        : null,
      sessionTime: this.sessionStart
        ? `${Math.round((Date.now() - this.sessionStart) / 60000)} min`
        : null
    };
  }
}

export default BehavioralTracker;
