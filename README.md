# The Translators

A gamified cognitive profiling tool that generates personalized LLM communication preferences through gameplay.

## The Concept

**The Law:**
- Each game stage = different mechanic
- Profile emerges from play, not questionnaires
- LLM uses profile for real-life help
- The 4th dimension: game extends into life

You play through three layers, each with a different mechanic. An octopus guide observes how you play. What it learns becomes communication guidance for AI systems like Claude.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

## Game Structure

### Layer 1: Twilight Zone (Exploration)
- Guide the octopus through the environment
- Optionally collect scattered orbs
- Reach the goal beacon

**Measures:** Path directness, thoroughness, exploration drive

### Layer 2: Midnight Zone (Arrangement)
- Elements from Layer 1 float in space
- Arrange them however you want (or don't)
- Continue when ready

**Measures:** Organization style, action count, deliberation time

### Layer 3: The Abyss (Communication)
- Octopus signals with colors
- Choose how to respond (echo, harmony, balance, contrast)

**Measures:** Communication style, response speed

### Profile Output
The game generates a markdown profile you can paste into Claude's custom instructions or any LLM settings.

## Project Structure

```
translators-game/
├── .cursorrules       # Claude Code instructions
├── docs/
│   ├── GAME_SPEC.md   # Authoritative specification
│   └── ARCHITECTURE.md
└── src/
    ├── main.js
    ├── styles/main.css
    └── game/
        ├── Game.js
        ├── config/     # All configuration
        ├── states/     # Game states
        ├── entities/   # Game objects
        └── systems/    # Systems
```

## Development with Cursor/Claude Code

This project is designed for development with Cursor and Claude Code. The `.cursorrules` file provides context and constraints.

**Before making changes:**
1. Read `.cursorrules`
2. Check `docs/GAME_SPEC.md` for gameplay details
3. Look for relevant config in `src/game/config/`

**Key principle:** Predictable builds through explicit specification.

## Commands

```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run preview  # Preview production build
```

## License

MIT
