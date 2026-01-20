# The Translators — Architecture

## Overview

This is a modular JavaScript game built with Vite for fast development. The architecture follows a state pattern for game flow and separates configuration from logic for predictable builds.

## Directory Structure

```
translators-game/
├── .cursorrules           # Claude Code instructions (READ FIRST)
├── package.json           # Dependencies and scripts
├── vite.config.js         # Build configuration
├── index.html             # Entry HTML
│
├── docs/
│   ├── GAME_SPEC.md       # Authoritative game specification
│   └── ARCHITECTURE.md    # This file
│
├── public/                # Static assets (if needed)
│
└── src/
    ├── main.js            # Application entry point
    ├── styles/
    │   └── main.css       # UI styles (not canvas)
    │
    └── game/
        ├── Game.js        # Main controller
        │
        ├── config/        # ALL configuration
        │   ├── index.js   # Re-exports all config
        │   ├── palette.js # Colors
        │   ├── layers.js  # Layer definitions
        │   ├── dialogue.js # All text
        │   ├── physics.js # Physics constants
        │   └── timing.js  # Timing constants
        │
        ├── states/        # Game states
        │   ├── TitleState.js
        │   ├── LayerIntroState.js
        │   ├── ExploreState.js    # Layer 1
        │   ├── ArrangeState.js    # Layer 2
        │   ├── SignalState.js     # Layer 3
        │   └── ProfileState.js
        │
        ├── entities/      # Game objects
        │   ├── Octopus.js
        │   ├── Orb.js
        │   ├── Element.js
        │   └── Particle.js
        │
        └── systems/       # Cross-cutting concerns
            ├── Renderer.js
            ├── Input.js
            ├── DialogueSystem.js
            ├── BehaviorTracker.js
            └── ProfileGenerator.js
```

## Core Patterns

### State Pattern

The game uses a state machine. Each state has a consistent interface:

```javascript
class SomeState {
  enter(game, data) {}    // Called when entering
  exit(game) {}           // Called when leaving
  update(game, dt) {}     // Called every frame
  render(game, ctx) {}    // Called every frame
  
  // Optional input handlers
  onPointerDown(game, x, y) {}
  onPointerMove(game, x, y) {}
  onPointerUp(game) {}
  onClick(game, x, y) {}
  onResize(game) {}
}
```

State transitions are controlled by `game.changeState(stateName, data)`.

### Configuration-Driven

All magic numbers, colors, text, and timing values live in `config/`. This ensures:

1. Changes are localized to one place
2. Different instances behave identically
3. Easy to tune without hunting through code

```javascript
// Import from config
import { PALETTE, PHYSICS, DIALOGUE, TIMING } from './config/index.js';

// Use in code
ctx.fillStyle = PALETTE.glowCyan;
octo.vx *= PHYSICS.octopus.drag;
game.dialogue.show(DIALOGUE.explore.intro);
```

### Behavior Tracking

All measurements go through `BehaviorTracker`. States call tracker methods rather than modifying data directly:

```javascript
// In ExploreState
game.behavior.trackPath(x, y);
game.behavior.collectOrb();

// In ArrangeState
game.behavior.recordArrangeAction();

// In SignalState
game.behavior.recordSignalResponse(type, responseTime);
```

This centralizes measurement logic and makes profile generation straightforward.

### Profile Generation

`ProfileGenerator` is a static utility class that:
1. Takes behavior data and computes traits
2. Generates insights from rules (defined in GAME_SPEC.md)
3. Produces markdown output for clipboard

## Data Flow

```
User Input
    ↓
Input System → routes to current state
    ↓
State → updates entities, tracks behavior
    ↓
BehaviorTracker → accumulates measurements
    ↓
ProfileGenerator → computes traits & insights
    ↓
ProfileState → displays & copies to clipboard
```

## Key Files to Understand

1. **`.cursorrules`** — Read this first. Defines what can/cannot change.
2. **`docs/GAME_SPEC.md`** — Authoritative game specification.
3. **`src/game/Game.js`** — Main controller, state machine, coordination.
4. **`src/game/config/`** — All configuration in one place.
5. **`src/game/states/ExploreState.js`** — Example of a complete state.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Features

### New Verbal Cue
1. Add text to `config/dialogue.js`
2. Add trigger logic in appropriate state
3. Update `docs/GAME_SPEC.md`

### New Measurement
1. Add to `BehaviorTracker`
2. Add to trait computation in `ProfileGenerator`
3. Update `docs/GAME_SPEC.md`

### Visual Tweak
1. Check if it's in config first (`palette.js`, `physics.js`)
2. If not, modify the appropriate entity or state
3. Verify against GAME_SPEC.md

## Debugging

The game instance is exposed globally in dev mode:

```javascript
// In browser console
game.currentState           // Current state object
game.behavior               // All tracked behavior data
game.octopus                // Octopus entity
game.changeState('profile') // Skip to profile (for testing)
```
