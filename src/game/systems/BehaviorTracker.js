/**
 * Behavior Tracker — The Translators
 * Source: GAME_SPEC.md "What Gets Measured" sections
 * 
 * Central system for tracking all player behaviors across layers.
 * States should call tracker methods, not modify data directly.
 */

import { PHYSICS } from '../config/physics.js';

export class BehaviorTracker {
  constructor() {
    this.reset();
  }

  /**
   * Reset all tracking data
   */
  reset() {
    // === v2: Character Selection ===
    this.selectedCharacter = null;
    this.characterSelectTime = 0;
    this.characterHoverHistory = [];

    // === v2: Garden Moments ===
    this.momentData = []; // Array of moment recordings
    this.placements = []; // All object placements
    this.placementSpeeds = [];
    this.momentDurations = [];
    this.revisionCounts = [];
    this.categorySelections = {};
    this.firstChoices = [];

    // Legacy: Layer 1: Exploration
    this.pathLength = 0;
    this.lastPosition = { x: 0, y: 0 };
    this.orbsCollected = 0;
    this.orbsTotal = 8;

    // Legacy: Layer 2: Arrangement
    this.arrangeActions = 0;
    this.firstActionTime = null;
    this.layerStartTime = 0;
    this.elementPositions = []; // For analysis

    // Legacy: Layer 3: Communication
    this.mirrorCount = 0;
    this.interpretCount = 0;
    this.contrastCount = 0;
    this.responseTimes = [];
  }

  // === v2: Character Selection Methods ===

  /**
   * Record character selection with timing and hover data
   * @param {string} characterId - Selected character ID
   * @param {number} selectTime - Time to select (ms from start)
   * @param {Array} hoverHistory - Array of hover events
   */
  recordCharacterSelection(characterId, selectTime, hoverHistory) {
    this.selectedCharacter = characterId;
    this.characterSelectTime = selectTime;
    this.characterHoverHistory = hoverHistory;
  }

  /**
   * Analyze hover behavior for exploration signal
   * Higher exploration = more hovering before deciding
   */
  getCharacterExplorationSignal() {
    if (!this.characterHoverHistory.length) return 0.5;

    const uniqueHovers = new Set(this.characterHoverHistory.map(h => h.characterId)).size;
    const totalHoverTime = this.characterHoverHistory.reduce((sum, h) => sum + h.duration, 0);
    const hoverCount = this.characterHoverHistory.length;

    // More unique characters hovered = more exploration
    // More total hover time = more exploration
    // Quick decision = less exploration

    const explorationScore = Math.min(1, (
      (uniqueHovers / 4) * 0.4 +              // Coverage factor
      Math.min(1, totalHoverTime / 5000) * 0.3 + // Time factor
      Math.min(1, hoverCount / 6) * 0.3        // Revisit factor
    ));

    return explorationScore;
  }

  // === v2: Garden Placement Methods ===

  /**
   * Record an object placement
   * @param {object} data - Placement data
   */
  recordPlacement(data) {
    const { objectId, category, position, momentIndex, timestamp, isFirst } = data;

    this.placements.push({
      objectId,
      category,
      position,
      momentIndex,
      timestamp
    });

    // Track category selections
    if (!this.categorySelections[category]) {
      this.categorySelections[category] = 0;
    }
    this.categorySelections[category]++;

    // Track first choices
    if (isFirst) {
      this.firstChoices.push({ objectId, category, momentIndex });
    }
  }

  /**
   * Record placement speed (time between placements)
   * @param {number} speed - Time in ms
   */
  recordPlacementSpeed(speed) {
    this.placementSpeeds.push(speed);
  }

  /**
   * Record moment completion
   * @param {object} data - Moment data
   */
  recordMomentComplete(data) {
    const { momentIndex, duration, placementCount, revisions, ambiguityResponse } = data;

    this.momentData.push({
      momentIndex,
      duration,
      placementCount,
      revisions,
      ambiguityResponse
    });

    this.momentDurations.push(duration);
    this.revisionCounts.push(revisions || 0);
  }

  // === v2: Analysis Methods ===

  /**
   * Get placement style based on spatial distribution
   * @returns {string} 'clustered' | 'spread' | 'structured' | 'organic'
   */
  getPlacementStyle() {
    if (this.placements.length < 3) return 'organic';

    const positions = this.placements.map(p => p.position);

    // Calculate centroid
    const cx = positions.reduce((s, p) => s + p.x, 0) / positions.length;
    const cy = positions.reduce((s, p) => s + p.y, 0) / positions.length;

    // Calculate spread from centroid
    const avgDist = positions.reduce((s, p) => {
      return s + Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    }, 0) / positions.length;

    // Check for alignment (structured)
    let alignedH = 0, alignedV = 0;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (Math.abs(positions[i].y - positions[j].y) < 40) alignedH++;
        if (Math.abs(positions[i].x - positions[j].x) < 40) alignedV++;
      }
    }

    const pairCount = (positions.length * (positions.length - 1)) / 2;
    const alignmentRatio = (alignedH + alignedV) / (pairCount * 2);

    if (alignmentRatio > 0.4) return 'structured';
    if (avgDist < 100) return 'clustered';
    if (avgDist > 250) return 'spread';
    return 'organic';
  }

  /**
   * Get decision speed category
   * @returns {string} 'quick' | 'measured' | 'deliberate'
   */
  getDecisionSpeed() {
    if (this.placementSpeeds.length < 2) {
      // Fall back to moment durations
      if (this.momentDurations.length === 0) return 'measured';
      const avgDuration = this.momentDurations.reduce((a, b) => a + b, 0) / this.momentDurations.length;
      if (avgDuration < 8000) return 'quick';
      if (avgDuration > 20000) return 'deliberate';
      return 'measured';
    }

    const avgSpeed = this.placementSpeeds.reduce((a, b) => a + b, 0) / this.placementSpeeds.length;

    if (avgSpeed < 2000) return 'quick';
    if (avgSpeed > 5000) return 'deliberate';
    return 'measured';
  }

  /**
   * Get iteration style based on revision behavior
   * @returns {string} 'iterative' | 'decisive' | 'exploratory'
   */
  getIterationStyle() {
    if (this.revisionCounts.length === 0) return 'decisive';

    const avgRevisions = this.revisionCounts.reduce((a, b) => a + b, 0) / this.revisionCounts.length;

    if (avgRevisions < 0.5) return 'decisive';
    if (avgRevisions > 2) return 'exploratory';
    return 'iterative';
  }

  /**
   * Get edge preference (placements near canvas edges)
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @returns {number} 0-1 score (higher = more edge preference)
   */
  getEdgePreference(canvasWidth, canvasHeight) {
    if (this.placements.length === 0) return 0.5;

    const edgeThreshold = 100;
    let edgePlacements = 0;

    this.placements.forEach(p => {
      if (p.position.x < edgeThreshold ||
          p.position.x > canvasWidth - edgeThreshold ||
          p.position.y < edgeThreshold ||
          p.position.y > canvasHeight - edgeThreshold) {
        edgePlacements++;
      }
    });

    return edgePlacements / this.placements.length;
  }

  // === Layer 1 Methods ===

  /**
   * Initialize path tracking
   */
  initPathTracking(x, y) {
    this.lastPosition = { x, y };
  }

  /**
   * Track movement for path length calculation
   */
  trackPath(x, y) {
    const dx = x - this.lastPosition.x;
    const dy = y - this.lastPosition.y;
    this.pathLength += Math.sqrt(dx * dx + dy * dy);
    this.lastPosition = { x, y };
  }

  /**
   * Record orb collection
   */
  collectOrb() {
    this.orbsCollected++;
  }

  /**
   * Get exploration score (0-1)
   * Higher = more exploration (less direct path)
   */
  getExplorationScore(directDistance) {
    const efficiency = directDistance / Math.max(this.pathLength, directDistance);
    return 1 - efficiency;
  }

  /**
   * Get thoroughness score (0-1)
   */
  getThoroughnessScore() {
    return this.orbsCollected / this.orbsTotal;
  }

  // === Layer 2 Methods ===

  /**
   * Start arrangement layer timing
   */
  startArrangeLayer() {
    this.layerStartTime = Date.now();
  }

  /**
   * Record an arrange action (drag)
   */
  recordArrangeAction() {
    this.arrangeActions++;
    if (this.firstActionTime === null) {
      this.firstActionTime = Date.now() - this.layerStartTime;
    }
  }

  /**
   * Store final element positions for analysis
   */
  storeElementPositions(elements) {
    this.elementPositions = elements.map(e => ({ x: e.x, y: e.y }));
  }

  /**
   * Analyze organization style
   * Source: GAME_SPEC.md "Organization Style Classification"
   */
  getOrganizationStyle() {
    const { analysis } = PHYSICS;
    
    if (this.arrangeActions < analysis.minimalActionsThreshold) {
      return 'minimal';
    }
    
    if (this.elementPositions.length < 2) {
      return 'distributed';
    }
    
    // Check for linear alignment
    let horizontalAligned = 0;
    let verticalAligned = 0;
    
    for (let i = 0; i < this.elementPositions.length; i++) {
      for (let j = i + 1; j < this.elementPositions.length; j++) {
        const a = this.elementPositions[i];
        const b = this.elementPositions[j];
        
        if (Math.abs(a.y - b.y) < analysis.alignmentThreshold) {
          horizontalAligned++;
        }
        if (Math.abs(a.x - b.x) < analysis.alignmentThreshold) {
          verticalAligned++;
        }
      }
    }
    
    if (horizontalAligned > analysis.linearAlignmentThreshold || 
        verticalAligned > analysis.linearAlignmentThreshold) {
      return 'linear';
    }
    
    // Check for clustering
    const cx = this.elementPositions.reduce((s, e) => s + e.x, 0) / this.elementPositions.length;
    const cy = this.elementPositions.reduce((s, e) => s + e.y, 0) / this.elementPositions.length;
    
    const clustered = this.elementPositions.filter(e => {
      const dist = Math.sqrt((e.x - cx) ** 2 + (e.y - cy) ** 2);
      return dist < analysis.clusterThreshold;
    }).length;
    
    if (clustered / this.elementPositions.length > analysis.clusterRatioThreshold) {
      return 'clustered';
    }
    
    return 'distributed';
  }

  // === Layer 3 Methods ===

  /**
   * Record a signal response
   * @param {string} type - 'mirror', 'similar', 'complement', or 'contrast'
   * @param {number} responseTime - Time in ms to respond
   */
  recordSignalResponse(type, responseTime) {
    this.responseTimes.push(responseTime);
    
    if (type === 'mirror') {
      this.mirrorCount++;
    } else if (type === 'similar' || type === 'complement') {
      this.interpretCount++;
    } else if (type === 'contrast') {
      this.contrastCount++;
    }
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    if (this.responseTimes.length === 0) return 3000;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  /**
   * Get communication style
   * Source: GAME_SPEC.md "Communication Style Classification"
   */
  getCommunicationStyle() {
    if (this.mirrorCount >= 2) return 'reflective';
    if (this.interpretCount >= 2) return 'interpretive';
    if (this.contrastCount >= 2) return 'independent';
    return 'adaptive';
  }

  // === Wolfram Lens Integration ===

  /**
   * Get signals for Wolfram Lens calibration
   * Maps behavioral data to lens parameters
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @returns {object} Lens calibration signals (0-1 normalized)
   */
  getLensSignals(canvasWidth = 800, canvasHeight = 600) {
    // Exploration: from character selection + edge preference
    const charExploration = this.getCharacterExplorationSignal();
    const edgePref = this.getEdgePreference(canvasWidth, canvasHeight);
    const exploration = charExploration * 0.6 + edgePref * 0.4;

    // Organization: from placement style
    const styleToOrg = {
      'structured': 0.9,
      'clustered': 0.6,
      'organic': 0.4,
      'spread': 0.3
    };
    const organization = styleToOrg[this.getPlacementStyle()] || 0.5;

    // Thoroughness: from placement count and object coverage
    const avgPlacements = this.momentData.length > 0
      ? this.momentData.reduce((s, m) => s + m.placementCount, 0) / this.momentData.length
      : 2;
    const thoroughness = Math.min(1, avgPlacements / 4);

    // Pace: from decision speed
    const speedToScore = {
      'quick': 0.8,
      'measured': 0.5,
      'deliberate': 0.2
    };
    const pace = speedToScore[this.getDecisionSpeed()] || 0.5;

    // Consistency: from iteration style (decisive = consistent)
    const iterToConsist = {
      'decisive': 0.8,
      'iterative': 0.5,
      'exploratory': 0.3
    };
    const consistency = iterToConsist[this.getIterationStyle()] || 0.5;

    // Aesthetic: from category preferences
    const categories = this.categorySelections;
    const totalSelections = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    const lightPref = (categories['light'] || 0) / totalSelections;
    const naturePref = (categories['nature'] || 0) / totalSelections;
    // Higher light preference = bold, higher nature = harmonious
    const aesthetic = lightPref > 0.4 ? 0.8 : naturePref > 0.4 ? 0.3 : 0.5;

    // Intensity: inversely related to moment durations (quick = intense)
    const avgDuration = this.momentDurations.length > 0
      ? this.momentDurations.reduce((a, b) => a + b, 0) / this.momentDurations.length
      : 10000;
    const intensity = Math.max(0.2, Math.min(1, 1 - (avgDuration - 5000) / 20000));

    // Connection: from revision counts (more revisions = more care = more connection)
    const avgRevisions = this.revisionCounts.length > 0
      ? this.revisionCounts.reduce((a, b) => a + b, 0) / this.revisionCounts.length
      : 0;
    const connection = Math.min(1, 0.3 + avgRevisions * 0.2);

    // Confidence: based on data quantity
    const dataPoints = this.placements.length + this.momentData.length;
    const confidence = Math.min(0.95, 0.3 + dataPoints * 0.05);

    return {
      exploration,
      organization,
      thoroughness,
      pace,
      consistency,
      aesthetic,
      intensity,
      connection,
      confidence
    };
  }
}
