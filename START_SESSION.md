# Quick Session Start

## Option 1: One-Liner (Copy & Paste into Claude Code)

```
Read HANDOFF.md and continue The Translators project. Status: Web functional, need to deploy. Checksum: 101bfab5
```

## Option 2: Full Context Prompt

```
I'm continuing The Translators project — a cognitive profiling game that exports USD for CLAUDE.md integration.

Key context:
- Project: C:\Users\User\Downloads\translators-game\translators-game\
- Status: Web version functional, UE5.7 version planned
- Checksum: 101bfab5
- Anchor: [TRANSLATORS:101bfab5]

Read HANDOFF.md for architecture. Read PARALLEL_TRACK_PLAN.md for strategy.

Today's focus: [YOUR TASK HERE]
```

## Option 3: Shell Command

```powershell
cd "C:\Users\User\Downloads\translators-game\translators-game" && claude --resume
```

Or start fresh:
```powershell
cd "C:\Users\User\Downloads\translators-game\translators-game" && claude
```

## Files Claude Should Read

In priority order:
1. `HANDOFF.md` — Full context
2. `PARALLEL_TRACK_PLAN.md` — Strategy
3. `src/game/systems/DeterministicProfileEngine.js` — Core logic
4. `src/game/systems/USDExporter.js` — Export formats

## Verify Session Restored

Ask Claude:
```
What is the checksum for The Translators test profile?
```

Expected answer: `101bfab5`

If Claude knows this, context is restored.
