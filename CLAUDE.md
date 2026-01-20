# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Translators** is a cognitive profiling game that generates deterministic personality profiles exportable as USD (Universal Scene Description) for AI consumption. The thesis: USD composition semantics can describe cognitive state, not just 3D scenes.

**The Law (Immutable):**
- Each game stage = different mechanic
- Profile emerges from play, not questionnaires
- LLM uses profile for real-life help
- The 4th dimension: game extends into life

## Commands

```bash
npm run dev       # Dev server at localhost:3000 (hot reload)
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

Testing individual layers:
```bash
npm run dev -- --layer=explore
npm run dev -- --layer=arrange
npm run dev -- --layer=signal
npm run dev -- --skip-to-profile  # Skip with mock data
```

Verify determinism:
```bash
node test-determinism.js  # Same answers must produce same checksum
```

## Architecture

```
src/game/
├── Game.js                 # State machine controller
├── config/                 # ALL magic numbers (single source of truth)
│   ├── index.js            # Re-exports all config
│   ├── palette.js          # Colors
│   ├── layers.js           # Layer definitions, orb positions
│   ├── dialogue.js         # All text
│   ├── physics.js          # Movement constants
│   └── timing.js           # Animation timings
├── states/                 # One file per game state
│   ├── TitleState.js
│   ├── CalibrationState.js # v3: 8 honest questions
│   ├── ProfileState.js     # Results + export
│   └── [Legacy states]     # explore, arrange, signal (kept for reference)
├── entities/               # Game objects (Octopus, Orb, Element)
└── systems/
    ├── DeterministicProfileEngine.js  # Core: pure profile generation
    ├── USDExporter.js                 # Export: USDA/JSON-LD/Markdown
    ├── BehaviorTracker.js             # Centralized measurement
    ├── ProfileGenerator.js            # Legacy fallback
    ├── DialogueSystem.js
    └── Renderer.js
```

### Key Innovation: Deterministic Profiles

Same answers ALWAYS produce the same checksum:
```javascript
const profile = DeterministicProfileEngine.buildProfile(answers);
// checksum: "101bfab5" (test profile anchor)
```

Checksum algorithm: Sort dimensions alphabetically, serialize as `dimension:value|...`, prefix with version `TRL_v1|...`, apply djb2 hash to 8-char hex.

## Critical Files

1. **`docs/GAME_SPEC.md`** - Authoritative specification. Read before gameplay changes.
2. **`src/game/config/`** - Never hardcode values in components.
3. **`src/game/systems/DeterministicProfileEngine.js`** - Profile generation logic.
4. **`src/game/systems/USDExporter.js`** - Export formats (USDA, JSON-LD, Markdown).

## State Pattern

Every state implements:
```javascript
class SomeState {
  enter(game, data) {}
  exit(game) {}
  update(game, dt) {}
  render(game, ctx) {}
  onPointerDown(game, x, y) {}
  onPointerMove(game, x, y) {}
  onPointerUp(game) {}
}
```

State transitions: `game.changeState(stateName, data)`

## Config-Driven Development

```javascript
// BAD - hardcoded
ctx.fillStyle = '#5cffdb';
octo.vx *= 0.92;

// GOOD - config-driven
import { PALETTE, PHYSICS } from './config/index.js';
ctx.fillStyle = PALETTE.glowCyan;
octo.vx *= PHYSICS.octopus.drag;
```

All dialogue text lives in `config/dialogue.js`. All physics in `config/physics.js`.

## What You Can Change Freely

- Bug fixes, performance optimizations
- Code organization/refactoring
- Build configuration

## What Requires Discussion

- New game mechanics or measurements
- Changes to profile generation logic
- New verbal cues or dialogue
- Visual style changes

## What You Cannot Change

- The three-layer structure (explore/arrange/signal)
- The profile output format
- The Law (stated above)
- Determinism requirements (same input = same output)

## Export Formats

| Format | Use Case | Method |
|--------|----------|--------|
| USDA | CLAUDE.md integration, USD pipeline | `USDExporter.toUSDA(profile)` |
| JSON-LD | Semantic web, API consumption | `USDExporter.toJSONLD(profile)` |
| Markdown | Human readable | `USDExporter.toMarkdown(profile)` |

All exports include the anchor `[TRANSLATORS:checksum]` for AI recognition.

## Debug (Dev Mode)

```javascript
// Browser console
game.currentState           // Current state
game.behavior               // Tracked behavior data
game.changeState('profile') // Skip to profile
```
