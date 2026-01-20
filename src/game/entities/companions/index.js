/**
 * Companion Index — The Translators v2
 *
 * Factory for creating character-specific companions.
 */

import { HermitCrab } from './HermitCrab.js';
import { Chameleon } from './Chameleon.js';
import { Cockatiel } from './Cockatiel.js';
import { OctopusCompanion } from './OctopusCompanion.js';

/**
 * Character ID to Companion class mapping
 */
const COMPANION_MAP = {
  collector: HermitCrab,
  wanderer: Chameleon,
  caretaker: Cockatiel,
  architect: OctopusCompanion
};

/**
 * Create a companion for a given character
 * @param {string} characterId - The character ID
 * @param {Game} game - The game instance
 * @returns {Companion} The companion instance
 */
export function createCompanion(characterId, game) {
  const CompanionClass = COMPANION_MAP[characterId];

  if (!CompanionClass) {
    console.warn(`Unknown character ID: ${characterId}, defaulting to HermitCrab`);
    return new HermitCrab(game);
  }

  return new CompanionClass(game);
}

export { HermitCrab, Chameleon, Cockatiel, OctopusCompanion };
