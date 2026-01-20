/**
 * Layer Definitions — The Translators
 * Source: GAME_SPEC.md Game Structure
 * 
 * Each layer has a different mechanic measuring different cognitive dimensions.
 */

import { PALETTE } from './palette.js';

export const LAYERS = [
  {
    id: 'explore',
    name: 'Twilight Zone',
    mechanic: 'Exploration',
    background: PALETTE.murk,
    stateClass: 'ExploreState',
    measures: ['pathLength', 'orbsCollected', 'edgeTime']
  },
  {
    id: 'arrange',
    name: 'Midnight Zone',
    mechanic: 'Arrangement',
    background: PALETTE.deep,
    stateClass: 'ArrangeState',
    measures: ['arrangeActions', 'organizationStyle', 'firstActionTime']
  },
  {
    id: 'signal',
    name: 'The Abyss',
    mechanic: 'Communication',
    background: PALETTE.void,
    stateClass: 'SignalState',
    measures: ['mirrorCount', 'interpretCount', 'contrastCount', 'responseTimes']
  }
];

/**
 * Orb positions for Layer 1 (normalized 0-1)
 * Source: GAME_SPEC.md Layer 1 Environment Layout
 * 
 * Positioned at EDGES, not on direct path from bottom-center to top-center
 */
export const ORB_POSITIONS = [
  { x: 0.12, y: 0.25 },
  { x: 0.88, y: 0.28 },
  { x: 0.08, y: 0.45 },
  { x: 0.92, y: 0.42 },
  { x: 0.15, y: 0.60 },
  { x: 0.85, y: 0.58 },
  { x: 0.10, y: 0.78 },
  { x: 0.90, y: 0.75 }
];

export const TOTAL_ORBS = ORB_POSITIONS.length;

/**
 * Goal beacon position (normalized)
 */
export const GOAL_POSITION = { x: 0.5, y: 0.12 };

/**
 * Octopus start positions per layer (normalized)
 */
export const OCTOPUS_POSITIONS = {
  explore: { x: 0.5, y: 0.75 },
  arrange: { x: 0.5, y: 0.88 },
  signal: { x: 0.5, y: 0.35 }
};
