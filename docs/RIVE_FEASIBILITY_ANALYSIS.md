# Rive Feasibility Analysis for The Translators

## Executive Summary

**Verdict: HYBRID APPROACH RECOMMENDED**

Rive is excellent for designed, pre-authored animations but cannot replace the procedural generation that makes the Translators garden unique. A Claude Code → Rive bridge is **feasible for runtime control** but **not feasible for asset generation**.

---

## What Is Rive?

[Rive](https://rive.app/) is a real-time interactive animation tool:
- Vector-based animations with state machines
- GPU-accelerated [web runtime](https://help.rive.app/runtimes/overview/web-js) (WASM/Canvas/WebGL)
- Binary `.riv` file format ([documented but complex](https://help.rive.app/runtimes/advanced_topics/format))
- Desktop app for visual authoring
- Low-level API for [game development](https://help.rive.app/runtimes/overview/web-js/low-level-api-usage)

---

## The Core Tension

### What Makes Translators Special (PROCEDURAL)

```javascript
// Every fern is UNIQUE - generated at runtime
const lsys = new LSystem(preset.axiom, preset.rules, preset.angle);
const segments = lsys.toSegments(lstring, baseAngle, length, scale);

// Every flower has DIFFERENT petal arrangement
const angle = i * GOLDEN_ANGLE + this.angleOffset;  // 137.5° spiral

// Plants respond to PROFILE VALUES
const type = this.selectPlantByTraits(questionId, traitValue);

// Plants lean toward CURSOR in real-time
this.leanTarget = Math.sign(dx) * intensity * 8 * IMPACT.LEAN_MULTIPLIER;
```

The garden's magic is **procedural variation**:
- No two ferns look alike (L-system + noise)
- Flower petals follow golden ratio math
- Plant types reflect personality profile
- Real-time cursor interactivity

### What Rive Does (PRE-AUTHORED)

```
┌─────────────────────────────────────────────────────────┐
│  Rive Workflow                                          │
├─────────────────────────────────────────────────────────┤
│  1. Designer creates animation in Rive Editor           │
│  2. Export as .riv binary file                          │
│  3. Runtime loads and plays the SAME animation          │
│  4. State machines can switch between pre-made states   │
│  5. Inputs can trigger transitions (but not generation) │
└─────────────────────────────────────────────────────────┘
```

Rive animations are **deterministic playback** of authored content.

---

## Feasibility Matrix

| Feature | Rive Capability | Translators Need | Match? |
|---------|-----------------|------------------|--------|
| Mac computer graphic | ✅ Perfect | Static asset | ✅ GREAT |
| UI buttons/transitions | ✅ Perfect | Designed animation | ✅ GREAT |
| Seed fall animation | ✅ Perfect | Pre-authored effect | ✅ GREAT |
| Firefly particles | ⚠️ Possible | Ambient effect | ⚠️ OK |
| Fern L-system branching | ❌ Impossible | Procedural at runtime | ❌ NO |
| Golden angle petals | ❌ Impossible | Math-driven arrangement | ❌ NO |
| Cursor-responsive lean | ⚠️ Limited | Real-time physics | ⚠️ PARTIAL |
| Profile-driven variety | ❌ Impossible | Per-instance uniqueness | ❌ NO |

---

## What a "Claude Code → Rive Bridge" Could Do

### FEASIBLE: Runtime Control

```javascript
// Rive's JS API allows controlling state machines
import { Rive } from '@rive-app/canvas';

const rive = new Rive({
  src: 'mac_computer.riv',
  canvas: document.getElementById('riveCanvas'),
  autoplay: true,
  stateMachines: 'MacStates',
  onLoad: () => {
    // Get input handles
    const screenGlow = rive.stateMachineInputs('MacStates')
      .find(i => i.name === 'screenGlow');

    // Claude Code can SET inputs based on game state
    screenGlow.value = evolution;  // 0-1 as game progresses
  }
});
```

**Bridge capabilities:**
- Trigger state machine transitions
- Set numeric inputs (evolution, brightness)
- Fire triggers (plantSeed, celebrate)
- Synchronize with game logic

### NOT FEASIBLE: Asset Generation

```
❌ Cannot generate .riv files from code
   - Binary format with no public creation API
   - Would need to reverse-engineer the format
   - Rive editor is the only authoring tool

❌ Cannot create procedural geometry in Rive
   - No "draw line from A to B" API
   - No "create 50 branches with L-system" API
   - All shapes must be pre-authored
```

---

## Recommended Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RENDERING STACK                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LAYER 1: Canvas 2D (Current)                                       │
│  ├── Procedural plants (fern, flower, grass, vine, etc.)            │
│  ├── Golden angle math, L-systems, simplex noise                    │
│  ├── Real-time cursor response                                      │
│  └── Profile-driven variation                                       │
│                                                                      │
│  LAYER 2: Rive Overlays (NEW)                                       │
│  ├── Mac computer (pre-authored, state machine for screen states)   │
│  ├── UI elements (buttons, transitions, progress indicators)        │
│  ├── Seed spawn effects (particle burst, glow trails)               │
│  └── Ambient polish (vignette, CRT scanlines, lens flare)           │
│                                                                      │
│  LAYER 3: Claude Code Bridge                                        │
│  ├── Sync game state → Rive inputs                                  │
│  ├── evolution (0-1) → Rive "brightness" input                      │
│  ├── answer event → Rive "plantSeed" trigger                        │
│  └── stage changes → Rive state machine transitions                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Rive Runtime Integration (2-4 hours)

```bash
npm install @rive-app/canvas
```

```javascript
// src/game/systems/RiveBridge.js
import { Rive } from '@rive-app/canvas';

export class RiveBridge {
  constructor(canvas) {
    this.rive = null;
    this.inputs = {};
  }

  async loadMac(canvas) {
    this.rive = new Rive({
      src: '/assets/mac_computer.riv',
      canvas: canvas,
      autoplay: true,
      stateMachines: 'MacStates'
    });
  }

  setEvolution(value) {
    if (this.inputs.evolution) {
      this.inputs.evolution.value = value;
    }
  }

  triggerPlantSeed() {
    if (this.inputs.plantSeed) {
      this.inputs.plantSeed.fire();
    }
  }
}
```

### Phase 2: Design Rive Assets (4-8 hours in Rive Editor)

**mac_computer.riv:**
- Artboard: Mac128k style computer
- States: off → booting → idle → active → glowing
- Inputs:
  - `screenBrightness` (number 0-1)
  - `evolution` (number 0-1)
  - `plantSeed` (trigger)
  - `celebrate` (trigger)
- Animations:
  - Screen flicker
  - Breathing glow
  - Celebration burst

**seed_effects.riv:**
- Particle trail animation
- Landing burst
- Glow pulse

### Phase 3: Bridge Integration (2-4 hours)

```javascript
// In CalibrationState.js
import { RiveBridge } from '../systems/RiveBridge.js';

enter(game) {
  // ... existing code ...

  // Initialize Rive for Mac
  this.riveBridge = new RiveBridge();
  this.riveCanvas = document.createElement('canvas');
  this.riveCanvas.id = 'riveOverlay';
  this.riveCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
  game.ui.appendChild(this.riveCanvas);

  this.riveBridge.loadMac(this.riveCanvas);
}

evolve(game, depth, traitValue, questionId) {
  // ... existing code ...

  // Sync to Rive
  this.riveBridge.setEvolution(this.targetEvolution);
  this.riveBridge.triggerPlantSeed();
}
```

---

## What You'd Gain

| Benefit | Impact |
|---------|--------|
| **Polish** | Mac computer looks professionally animated |
| **Performance** | Rive is GPU-accelerated, lighter than Canvas for complex shapes |
| **Iteration** | Designers can tweak animations without code changes |
| **Effects** | Pre-authored particle effects look better than procedural |
| **Consistency** | Mac always looks the same (intentional) |

## What You'd Lose

| Loss | Impact |
|------|--------|
| **Procedural magic** | Plants must stay Canvas-based |
| **Single renderer** | Now managing two rendering systems |
| **Complexity** | Bridge code adds maintenance burden |
| **File size** | .riv files add to bundle |

---

## Verdict

### DO Use Rive For:
1. ✅ Mac computer (perfect use case)
2. ✅ UI transitions
3. ✅ Seed spawn effects
4. ✅ Ambient overlays

### DON'T Use Rive For:
1. ❌ Procedural plants (impossible)
2. ❌ Real-time cursor physics (limited)
3. ❌ Profile-driven variation (impossible)
4. ❌ L-systems, noise, golden angle (impossible)

### Bridge Feasibility:
- **Runtime control**: ✅ FEASIBLE (state machines, inputs, triggers)
- **Asset generation**: ❌ NOT FEASIBLE (no creation API)

---

## Next Steps If You Proceed

1. **Download Rive Desktop** → [rive.app/downloads](https://rive.app/downloads)
2. **Design Mac128k asset** → Create state machine with inputs
3. **Install runtime** → `npm install @rive-app/canvas`
4. **Build RiveBridge.js** → Sync game state to Rive inputs
5. **Layer canvases** → Rive overlay on top of Canvas garden

---

## References

- [Rive Web JS Runtime](https://help.rive.app/runtimes/overview/web-js)
- [Rive Low-Level API](https://help.rive.app/runtimes/overview/web-js/low-level-api-usage)
- [Rive File Format](https://help.rive.app/runtimes/advanced_topics/format)
- [Rive Code Generator (experimental)](https://github.com/rive-app/rive-code-generator-wip)
- [Rive React Integration](https://help.rive.app/runtimes/overview/react)
