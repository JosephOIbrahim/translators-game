# The Translators — Claude Code Handoff

**Session Anchor:** `[TRANSLATORS:101bfab5]`
**Last Updated:** 2026-01-16
**Status:** Web version functional, UE5.7 version planned

---

## Quick Start for Claude Code

```bash
cd "C:\Users\User\Downloads\translators-game\translators-game"
claude
```

Then paste this at session start:
```
Read HANDOFF.md — this is a continuation of The Translators project.
```

---

## What Is This Project?

**The Translators** is a cognitive profiling game that:
1. Asks 8 honest interview questions
2. Generates a deterministic personality profile
3. Exports as USD (Universal Scene Description) for AI consumption
4. Integrates with CLAUDE.md Cognitive Substrate

**The Thesis:** USD composition semantics (LIVRPS) can describe cognitive state, not just 3D scenes. Same answers → Same profile → Same AI behavior.

---

## Project Location

```
C:\Users\User\Downloads\translators-game\translators-game\
```

---

## Current Architecture

```
src/game/
├── config/
│   ├── index.js          # Questions, dialogue, dimension mappings
│   ├── timing.js         # Animation timings
│   └── version.js        # ← NEW: Centralized version constant
├── states/
│   ├── WelcomeState.js   # Landing screen
│   ├── CalibrationState.js # Garden + 8 questions (modified)
│   └── ProfileState.js   # Results + export (modified)
├── systems/
│   ├── DeterministicProfileEngine.js # ← NEW: Pure profile generation
│   ├── USDExporter.js    # ← NEW: USDA/JSON-LD/Markdown export
│   └── ProfileGenerator.js # Legacy (still used as fallback)
└── Game.js               # State machine

ue-bridge/                # ← NEW: Claude Code ↔ UE5.7 bridge starter
├── ue_claude_bridge.py   # Python server for UE Editor
├── claude_ue_client.mjs  # Node.js client
└── README.md             # Setup instructions
```

---

## Key Innovation: Deterministic Profiles

**Problem:** Random profile generation = unreproducible results
**Solution:** Pure functions with fixed ordering

```javascript
// Same answers ALWAYS produce same checksum
const profile = DeterministicProfileEngine.buildProfile(answers);
// checksum: "101bfab5" (for test answers)
// anchor: "[TRANSLATORS:101bfab5]"
```

**Checksum Algorithm:**
1. Sort dimensions alphabetically
2. Serialize as `dimension:value|dimension:value|...`
3. Prefix with version: `TRL_v1|...`
4. Apply djb2 hash → 8-char hex

---

## Export Formats

| Format | Use Case | Method |
|--------|----------|--------|
| **USDA** | CLAUDE.md integration, USD pipeline | `USDExporter.toUSDA(profile)` |
| **JSON-LD** | Semantic web, API consumption | `USDExporter.toJSONLD(profile)` |
| **Markdown** | Human readable, documentation | `USDExporter.toMarkdown(profile)` |

All exports include the anchor `[TRANSLATORS:checksum]` for AI recognition.

---

## The 8 Dimensions

| Dimension | Question Theme | Spectrum |
|-----------|----------------|----------|
| pace | Speed preference | Quick ↔ Deliberate |
| thoroughness | Detail level | Minimal ↔ Comprehensive |
| organization | Structure preference | Narrative ↔ Structured |
| exploration | Problem approach | Focused ↔ Expansive |
| communication | Feedback style | Direct ↔ Gentle |
| ambiguity | Uncertainty handling | Clarify ↔ Comfortable |
| rhythm | Conversation flow | Continuous ↔ Reflective |
| tangents | Divergence tolerance | Redirect ↔ Embraces |

---

## Parallel Track Plan

### Track 1: Web Version (MUST SHIP)
- **Status:** Functional, needs deployment
- **Stack:** Vanilla JS, Vite, Canvas
- **Remaining:** Deploy to josephibrahim.com, polish, mobile test

### Track 2: UE5.7 Version (BONUS)
- **Status:** Not started, bridge files created
- **Goal:** Native USD manipulation, immersive 3D experience
- **Bridge:** `ue-bridge/` contains starter files

### Timeline
- **Day 7:** Web ships regardless
- **Day 14:** UE ships if ready
- **Soft deadline:** Tuesday Jan 20th

---

## Files to Read First

Priority order for context restoration:

1. `HANDOFF.md` (this file)
2. `PARALLEL_TRACK_PLAN.md` — Full strategy
3. `src/game/systems/DeterministicProfileEngine.js` — Core innovation
4. `src/game/systems/USDExporter.js` — Export formats
5. `src/game/config/index.js` — Questions and mappings
6. `CLAUDE.md` (at `C:\Users\User\CLAUDE.md`) — Behavioral context

---

## Commands

```bash
# Development
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build to dist/

# Testing
node test-determinism.js  # Verify checksum determinism

# Build check
npm run build && echo "Build OK"
```

---

## User Context

- **Role:** VFX Lighting TD
- **Platform:** Windows
- **Hardware:** Threadripper PRO 7965WX, RTX 4090, 128GB DDR5
- **ADHD:** Yes — use Executive Function layer in CLAUDE.md
- **Home Altitude:** 30,000ft (vision/goals level)

---

## What Was Just Completed

1. ✅ Deterministic profile engine (pure functions, no Math.random)
2. ✅ USD export with LIVRPS composition semantics
3. ✅ JSON-LD export for semantic web
4. ✅ Profile anchoring system `[TRANSLATORS:checksum]`
5. ✅ Integrity verification via checksum
6. ✅ Centralized VERSION constant
7. ✅ Export validation guards
8. ✅ Copy Anchor button in UI
9. ✅ UE5.7 bridge starter files

---

## What Comes Next

1. ⏳ Deploy web version to josephibrahim.com
2. ⏳ Test on mobile devices
3. ⏳ Start UE5.7 project with USD Stage Actor
4. ⏳ Test bridge communication
5. ⏳ Implement question flow in UE

---

## Session Continuity

When continuing this project:

```
I'm continuing work on The Translators game.
Read HANDOFF.md for full context.
Current checksum: 101bfab5
Current status: Web functional, deploying next.
```

---

## The Thesis (For AI Understanding)

**USD as Universal State Description**

Pixar's USD uses composition to resolve conflicting opinions about scene data. We repurpose this for cognitive state:

- Scene graph → Cognitive architecture
- Prim attributes → Behavioral parameters
- Composition arcs → Priority resolution
- Variants → Mode switching
- Layers → Cognitive subsystems

The profile exported by The Translators becomes a USD layer that can be referenced by CLAUDE.md, allowing AI to adjust behavior based on deterministic cognitive signals.

**Same query → Same routing → Same behavior**

---

*Handoff generated from VSCode Claude extension session*
*Project anchor: [TRANSLATORS:101bfab5]*
