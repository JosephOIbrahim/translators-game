/**
 * Character Definitions — The Translators v2
 *
 * Each character represents a different cognitive archetype.
 * Character selection is the FIRST profiling data point.
 * Stories have 5-7 "moments" where player arranges objects.
 */

export const CHARACTERS = {
  collector: {
    id: 'collector',
    name: 'The Collector',
    tagline: 'You notice what others overlook',
    description: 'Gathering treasures, building a home for memories',

    colors: {
      primary: '#6b9b5d',    // Sage green
      secondary: '#d4a84b',  // Gold
      accent: '#4a9b8c'      // Teal
    },

    // Initial trait signals from character choice
    initialSignals: {
      exploration: 0.65,      // Collectors explore to find things
      thoroughness: 0.75,     // High completionist drive
      organization: 0.5,      // Varies - could be organized or chaotic
      pace: null,             // No initial signal
      ambiguityComfort: 0.4   // Prefers knowing what they're looking for
    },

    story: {
      intro: "Your garden overflows with found things. Each one holds a story only you remember.",

      moments: [
        {
          index: 0,
          prompt: "Every collection starts somewhere. Where does your first treasure belong?",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.15, y: 0.3 },
            emotion: 'curious',
            dialogue: [
              "I found this long ago...",
              "It was the first thing I kept.",
              "Where should it live?"
            ]
          },
          objects: {
            available: ['smooth_stone', 'old_key', 'pressed_leaf'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 1,
          prompt: "Light finds its way into every collection. Where does yours shine?",
          promptType: 'specific',
          companion: {
            position: { x: 0.8, y: 0.25 },
            emotion: 'pleased',
            dialogue: [
              "These glow when I'm not looking.",
              "Where should the light gather?"
            ]
          },
          objects: {
            available: ['jar_fireflies', 'crystal_shard', 'lantern'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 2,
          prompt: "Some things come in pairs. Do these belong together?",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.2, y: 0.6 },
            emotion: 'thoughtful',
            dialogue: [
              "I found them separately...",
              "But they feel connected somehow."
            ]
          },
          objects: {
            available: ['brass_compass', 'faded_map', 'worn_notebook'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        },
        {
          index: 3,
          prompt: "Nature always finds its way in. Let it.",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.75, y: 0.5 },
            emotion: 'neutral',
            dialogue: [
              "These grew while I wasn't watching.",
              "They seem to know where they belong."
            ]
          },
          objects: {
            available: ['dried_flowers', 'seed_pod', 'moss_stone', 'feather'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 4,
          prompt: "What doesn't fit anywhere might be the most important thing.",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.5, y: 0.35 },
            emotion: 'curious',
            dialogue: [
              "I don't know what this is.",
              "But I couldn't leave it behind."
            ]
          },
          objects: {
            available: ['strange_artifact', 'glass_orb', 'unknown_fragment'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        }
      ],

      outro: "Your collection tells a story. Not of what you found, but of how you see."
    },

    objects: [
      'smooth_stone', 'old_key', 'pressed_leaf', 'jar_fireflies',
      'crystal_shard', 'lantern', 'brass_compass', 'faded_map',
      'worn_notebook', 'dried_flowers', 'seed_pod', 'moss_stone',
      'feather', 'strange_artifact', 'glass_orb', 'unknown_fragment'
    ]
  },

  wanderer: {
    id: 'wanderer',
    name: 'The Wanderer',
    tagline: 'The path is the destination',
    description: 'Following threads, seeing where they lead',

    colors: {
      primary: '#4a9b8c',    // Teal
      secondary: '#e07c5f',  // Coral
      accent: '#d4a84b'      // Gold
    },

    initialSignals: {
      exploration: 0.85,      // Very high - wanderers explore everything
      thoroughness: 0.35,     // Low - move on before completing
      organization: 0.25,     // Fluid, not structured
      pace: null,
      ambiguityComfort: 0.8   // Very comfortable with uncertainty
    },

    story: {
      intro: "You've been walking for a while. Not lost—never lost. Just... going.",

      moments: [
        {
          index: 0,
          prompt: "You found these along the way. Where did they come from?",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.2, y: 0.4 },
            emotion: 'curious',
            dialogue: [
              "I don't remember picking these up.",
              "They just... arrived.",
              "Where do you think they're from?"
            ]
          },
          objects: {
            available: ['wind_chime', 'worn_coin', 'ribbon'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 1,
          prompt: "Crossroads. Some paths glow brighter than others.",
          promptType: 'specific',
          companion: {
            position: { x: 0.7, y: 0.3 },
            emotion: 'thoughtful',
            dialogue: [
              "Every direction leads somewhere.",
              "Which light calls to you?"
            ]
          },
          objects: {
            available: ['north_star', 'sunset_shard', 'moonbeam'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 2,
          prompt: "Sounds travel far out here. Where do they settle?",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.15, y: 0.65 },
            emotion: 'pleased',
            dialogue: [
              "Listen...",
              "Do you hear that too?"
            ]
          },
          objects: {
            available: ['singing_shell', 'wind_whistle', 'echo_stone'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        },
        {
          index: 3,
          prompt: "Some things want to be left behind. Let them stay or take them with?",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.8, y: 0.55 },
            emotion: 'neutral',
            dialogue: [
              "I've carried these long enough.",
              "Maybe they belong here.",
              "Or maybe they come with us."
            ]
          },
          objects: {
            available: ['heavy_memory', 'light_hope', 'quiet_fear'],
            minPlacements: 0,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 18000, max: 60000 }
        },
        {
          index: 4,
          prompt: "The horizon holds something. What do you see?",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.5, y: 0.25 },
            emotion: 'curious',
            dialogue: [
              "I've been walking toward this.",
              "I think.",
              "What's waiting there?"
            ]
          },
          objects: {
            available: ['distant_mountain', 'setting_sun', 'rising_moon', 'open_door'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        }
      ],

      outro: "You don't collect places. They collect you. And now I see how you travel."
    },

    objects: [
      'wind_chime', 'worn_coin', 'ribbon', 'north_star',
      'sunset_shard', 'moonbeam', 'singing_shell', 'wind_whistle',
      'echo_stone', 'heavy_memory', 'light_hope', 'quiet_fear',
      'distant_mountain', 'setting_sun', 'rising_moon', 'open_door'
    ]
  },

  caretaker: {
    id: 'caretaker',
    name: 'The Caretaker',
    tagline: 'What matters is who it matters to',
    description: 'Tending to others, growing connections',

    colors: {
      primary: '#e07c5f',    // Coral
      secondary: '#6b9b5d',  // Sage
      accent: '#8b6a8c'      // Plum
    },

    initialSignals: {
      exploration: 0.4,       // Moderate - explores for others
      thoroughness: 0.6,      // Completes what's needed
      organization: 0.55,     // Somewhat organized for others' sake
      pace: null,
      ambiguityComfort: 0.5   // Depends on who's affected
    },

    story: {
      intro: "Your garden isn't for you. It's for everyone who might need a place to rest.",

      moments: [
        {
          index: 0,
          prompt: "Someone left this behind. Where should it wait for them?",
          promptType: 'specific',
          companion: {
            position: { x: 0.25, y: 0.35 },
            emotion: 'thoughtful',
            dialogue: [
              "They'll come back for it.",
              "I know they will.",
              "Where will they look first?"
            ]
          },
          objects: {
            available: ['lost_letter', 'forgotten_toy', 'waiting_gift'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 1,
          prompt: "Growing things need tending. What deserves your attention?",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.7, y: 0.4 },
            emotion: 'pleased',
            dialogue: [
              "Everything here is alive.",
              "What should we help grow?"
            ]
          },
          objects: {
            available: ['young_seedling', 'blooming_flower', 'ancient_tree'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 2,
          prompt: "Rest comes in many forms. Where do they belong?",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.2, y: 0.6 },
            emotion: 'neutral',
            dialogue: [
              "Some need shade.",
              "Some need warmth.",
              "Some just need to be seen."
            ]
          },
          objects: {
            available: ['soft_cushion', 'warm_blanket', 'cool_shade', 'gentle_light'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        },
        {
          index: 3,
          prompt: "Memories of others. They trusted you with these.",
          promptType: 'specific',
          companion: {
            position: { x: 0.75, y: 0.55 },
            emotion: 'thoughtful',
            dialogue: [
              "Someone shared this with me once.",
              "Where should their story live?"
            ]
          },
          objects: {
            available: ['shared_secret', 'gifted_moment', 'borrowed_joy'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        },
        {
          index: 4,
          prompt: "A place for gathering. Where does everyone meet?",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.5, y: 0.3 },
            emotion: 'curious',
            dialogue: [
              "When they come—",
              "—and they will come—",
              "where will we all be?"
            ]
          },
          objects: {
            available: ['round_table', 'circle_of_stones', 'welcoming_fire'],
            minPlacements: 1,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        }
      ],

      outro: "You build for others. And in doing so, you show me how you love."
    },

    objects: [
      'lost_letter', 'forgotten_toy', 'waiting_gift', 'young_seedling',
      'blooming_flower', 'ancient_tree', 'soft_cushion', 'warm_blanket',
      'cool_shade', 'gentle_light', 'shared_secret', 'gifted_moment',
      'borrowed_joy', 'round_table', 'circle_of_stones', 'welcoming_fire'
    ]
  },

  architect: {
    id: 'architect',
    name: 'The Architect',
    tagline: 'Structure reveals truth',
    description: 'Building systems, finding patterns',

    colors: {
      primary: '#8b6a8c',    // Plum
      secondary: '#4a9b8c',  // Teal
      accent: '#d4a84b'      // Gold
    },

    initialSignals: {
      exploration: 0.3,       // Low - focused on what's needed
      thoroughness: 0.7,      // High - completes fully
      organization: 0.85,     // Very high - needs structure
      pace: null,
      ambiguityComfort: 0.25  // Low - prefers clarity
    },

    story: {
      intro: "Every space has a structure waiting to emerge. You're here to find it.",

      moments: [
        {
          index: 0,
          prompt: "Foundation first. What holds everything else?",
          promptType: 'specific',
          companion: {
            position: { x: 0.2, y: 0.45 },
            emotion: 'neutral',
            dialogue: [
              "Before we build up...",
              "...we must build from.",
              "What's the base?"
            ]
          },
          objects: {
            available: ['cornerstone', 'anchor_point', 'center_pillar'],
            minPlacements: 1,
            maxPlacements: 1
          },
          duration: { min: 3000, suggested: 10000, max: 45000 }
        },
        {
          index: 1,
          prompt: "Connections matter. How do these relate?",
          promptType: 'specific',
          companion: {
            position: { x: 0.75, y: 0.35 },
            emotion: 'curious',
            dialogue: [
              "Things connect.",
              "Always.",
              "Show me how these do."
            ]
          },
          objects: {
            available: ['bridge', 'pathway', 'linking_thread'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 2,
          prompt: "Hierarchy emerges. What rises, what supports?",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.3, y: 0.6 },
            emotion: 'thoughtful',
            dialogue: [
              "Some things lead.",
              "Some things follow.",
              "Some things... neither."
            ]
          },
          objects: {
            available: ['tower', 'platform', 'hidden_foundation', 'floating_element'],
            minPlacements: 2,
            maxPlacements: 4
          },
          duration: { min: 3000, suggested: 15000, max: 45000 }
        },
        {
          index: 3,
          prompt: "Boundaries define. Where does inside become outside?",
          promptType: 'open-ended',
          companion: {
            position: { x: 0.7, y: 0.55 },
            emotion: 'neutral',
            dialogue: [
              "Edges matter.",
              "What's in? What's out?"
            ]
          },
          objects: {
            available: ['wall', 'gate', 'threshold', 'window'],
            minPlacements: 1,
            maxPlacements: 3
          },
          duration: { min: 3000, suggested: 12000, max: 45000 }
        },
        {
          index: 4,
          prompt: "The system is complete. Or is something missing?",
          promptType: 'ambiguous',
          companion: {
            position: { x: 0.5, y: 0.3 },
            emotion: 'curious',
            dialogue: [
              "Step back.",
              "Look at what you've built.",
              "Is it finished? Does it need finishing?"
            ]
          },
          objects: {
            available: ['final_piece', 'empty_space', 'question_mark'],
            minPlacements: 0,
            maxPlacements: 2
          },
          duration: { min: 3000, suggested: 18000, max: 60000 }
        }
      ],

      outro: "You build to understand. And now I see how you think."
    },

    objects: [
      'cornerstone', 'anchor_point', 'center_pillar', 'bridge',
      'pathway', 'linking_thread', 'tower', 'platform',
      'hidden_foundation', 'floating_element', 'wall', 'gate',
      'threshold', 'window', 'final_piece', 'empty_space', 'question_mark'
    ]
  }
};

/**
 * Get character by ID
 */
export function getCharacter(id) {
  return CHARACTERS[id] || null;
}

/**
 * Get all character IDs
 */
export function getCharacterIds() {
  return Object.keys(CHARACTERS);
}

/**
 * Character order for display
 */
export const CHARACTER_ORDER = ['collector', 'wanderer', 'caretaker', 'architect'];
