/**
 * Color Palette — The Translators v2
 * Warm Parchment Edition — Cozy watercolor aesthetic
 *
 * Darker warm backgrounds + punchy earthy accents
 * References: Sprite sheet watercolor style, aged paper feel
 *
 * DO NOT hardcode colors elsewhere. Import from here.
 */

export const PALETTE = {
  // Backgrounds — aged parchment (darker, warmer)
  bgPrimary: '#ddd4c4',     // Main canvas - warm parchment
  bgSecondary: '#d0c7b6',   // Cards, containers - aged paper
  bgCard: '#ebe6db',        // Elevated cards - cream

  // Accent colors — SATURATED earthy (the pop)
  sage: '#6b9b5d',          // Primary — forest green
  coral: '#d97a5d',         // Secondary — warm terracotta
  gold: '#c9a04a',          // Tertiary — antique gold
  teal: '#5a9a8a',          // Info — sea green
  plum: '#8b6a8c',          // Special — soft plum

  // Legacy aliases (for existing code)
  accentSage: '#6b9b5d',
  accentTeal: '#5a9a8a',
  accentCoral: '#d97a5d',
  accentPeach: '#d97a5d',
  accentGold: '#c9a04a',
  accentCream: '#ddd4c4',
  glowCyan: '#6b9b5d',
  glowTeal: '#5a9a8a',
  glowPurple: '#d97a5d',
  glowPink: '#d97a5d',
  glowGold: '#c9a04a',

  // Text — warm brown for cozy feel
  text: '#4a4035',          // Primary text
  textDim: '#7a6f60',       // Muted text
  textMuted: '#7a6f60',     // Alias

  // UI elements
  border: '#b8ad9c',
  shadow: 'rgba(74, 64, 53, 0.12)',
  pixelOutline: '#4a4035',

  // Base creature colors (watercolor style)
  creatureBody: '#c4a882',      // Warm tan base
  creatureLight: '#e8d5b8',     // Highlight
  creatureDark: '#8a7560',      // Shadow/outline
  creatureAccent: '#d97a5d'     // Coral accent
};

/**
 * Creature-specific palettes for each companion type
 * Based on sprite sheet reference
 */
export const CREATURE_PALETTES = {
  // Hermit Crab — The Collector
  hermitCrab: {
    shell: '#c4a882',         // Tan shell
    shellLight: '#e8d5b8',    // Shell highlight
    shellDark: '#8a7560',     // Shell shadow
    body: '#d97a5d',          // Coral body
    bodyLight: '#e8a088',     // Body highlight
    claws: '#c4a882',         // Tan claws
    eyes: '#4a4035',          // Dark eyes
    outline: '#6a5a48'        // Warm outline
  },

  // Chameleon — The Wanderer
  chameleon: {
    body: '#8ab877',          // Sage green body
    bodyLight: '#b5d4a0',     // Lighter green
    bodyDark: '#5a8a4e',      // Darker green
    belly: '#e8d5b8',         // Cream belly
    eye: '#4a4035',           // Dark eye
    eyeRing: '#c9a04a',       // Gold eye ring
    tail: '#6b9b5d',          // Green tail
    outline: '#4a6840'        // Green outline
  },

  // Cockatiel — The Caretaker
  cockatiel: {
    body: '#e8d5b8',          // Cream body
    bodyLight: '#f5ebe0',     // Light cream
    wing: '#c4a882',          // Tan wing
    crest: '#c9a04a',         // Gold crest
    cheek: '#d97a5d',         // Coral cheek patch
    beak: '#8a7560',          // Brown beak
    eye: '#4a4035',           // Dark eye
    outline: '#8a7560'        // Brown outline
  },

  // Octopus — The Architect
  octopus: {
    body: '#d97a5d',          // Coral body
    bodyLight: '#e8a088',     // Light coral
    bodyDark: '#b86048',      // Dark coral
    spots: '#c4a882',         // Tan spots
    suckers: '#e8d5b8',       // Cream suckers
    eye: '#4a4035',           // Dark eye
    eyeHighlight: '#f5ebe0',  // Eye highlight
    outline: '#8a5540'        // Dark coral outline
  }
};

/**
 * Island Palette — Floating Garden Aesthetic
 * Cool sage background + warm terracotta depth
 * Reference: Isometric pixel art island style
 *
 * Philosophy: Temperature contrast creates visual interest
 * Cool sage background makes warm terracotta accents POP
 */
export const ISLAND_PALETTE = {
  // Background — Cool sage (FLAT, not gradient)
  skyBase: '#9eb8a8',           // Main sage background
  skyAlt: '#92b09c',            // Subtle variation

  // Island Surface — Lush grass greens
  grassLight: '#7ab877',        // Highlight grass (sun-facing)
  grassMid: '#5a9a5d',          // Main grass tone
  grassDark: '#4a8a4d',         // Shadow grass
  grassEdge: '#3a7a3d',         // Edge definition

  // Island Depth — Terracotta/coral sides (THE KEY visual)
  dirtTop: '#c9a882',           // Topsoil showing at edge
  terracottaLight: '#d97a5d',   // Lit side (warm coral)
  terracottaMid: '#b86048',     // Main terracotta
  terracottaDark: '#8a4a38',    // Shadow side
  terracottaDeep: '#6a3a28',    // Bottom/underside

  // Island Underside — Rock/shadow
  rockLight: '#8a7a68',         // Hanging rock detail
  rockDark: '#5a4a38',          // Deep shadow

  // Shadow for floating effect
  shadowColor: 'rgba(58, 48, 38, 0.25)'
};

/**
 * Color relationships for Layer 3 signals
 * Warm palette version — earth tones harmonize differently
 */
export const COLOR_RELATIONSHIPS = {
  accentSage: {
    similar: 'accentTeal',
    complement: 'accentCoral',
    contrast: 'accentGold'
  },
  accentCoral: {
    similar: 'accentPeach',
    complement: 'accentSage',
    contrast: 'accentTeal'
  },
  accentPeach: {
    similar: 'accentCoral',
    complement: 'accentTeal',
    contrast: 'accentSage'
  },
  accentGold: {
    similar: 'accentPeach',
    complement: 'accentTeal',
    contrast: 'accentSage'
  },
  // Legacy aliases
  glowCyan: { similar: 'glowTeal', complement: 'glowPink', contrast: 'glowGold' },
  glowPurple: { similar: 'glowPink', complement: 'glowGold', contrast: 'glowCyan' },
  glowPink: { similar: 'glowPurple', complement: 'glowCyan', contrast: 'glowGold' },
  glowGold: { similar: 'glowPink', complement: 'glowPurple', contrast: 'glowCyan' }
};

/**
 * Signal colors used in Layer 3 (in order)
 * Using warm palette names
 */
export const SIGNAL_COLORS = ['accentSage', 'accentCoral', 'accentPeach', 'accentGold'];

// Legacy alias
export const SIGNAL_COLORS_LEGACY = ['glowCyan', 'glowPurple', 'glowPink', 'glowGold'];

/**
 * Orb colors for Layer 1
 */
export const ORB_COLORS = [
  'accentCoral', 'accentPeach', 'accentGold', 'accentSage',
  'accentTeal', 'accentCoral', 'accentPeach', 'accentGold'
];
