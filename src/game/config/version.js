/**
 * version.js
 *
 * SINGLE SOURCE OF TRUTH for version information.
 *
 * All modules should import VERSION from here instead of hardcoding.
 * This ensures consistency across:
 * - Profile generation
 * - Checksum computation
 * - Export formats
 * - USD metadata
 */

export const VERSION = {
  /**
   * Application version (semver)
   * Matches package.json
   */
  app: '1.0.0',

  /**
   * Profile schema version
   * Increment when trait computation changes
   */
  profile: '1.0',

  /**
   * Checksum prefix for versioned integrity
   * Format: TRL_v{major}
   * Used in checksum computation to allow future migration
   */
  checksumPrefix: 'TRL_v1',

  /**
   * Generator name for export metadata
   */
  generator: 'The Translators'
};

/**
 * Format full generator string for exports
 * @returns {string} e.g., "The Translators v1.0"
 */
export function getGeneratorString() {
  return `${VERSION.generator} v${VERSION.profile}`;
}
