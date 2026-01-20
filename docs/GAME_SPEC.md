# THE TRANSLATORS — GAME SPECIFICATION v1.0

## Purpose

This document is the **authoritative specification**. All builds must conform to this spec. Changes to this spec require explicit discussion and versioning.

**Why this exists**: To defeat nondeterminism in our development process. Just as the Thinking Machines article describes defeating inference nondeterminism through explicit specification of reduction order, we defeat build nondeterminism through explicit specification of game mechanics.

---

## CORE PRINCIPLES (Immutable)

### The Law (From Memory)
```
Each game stage = different mechanic.
Profile emerges from play.
LLM uses profile for real-life help.
The 4th dimension: game extends into life.
```

### Design Philosophy
1. **Observe, Don't Interrogate**: Profile comes from behavior, not self-report
2. **Each Layer is a Different Game**: Not the same mechanic with different questions
3. **The Creature is Guide, Not Examiner**: Octopus interprets what it sees
4. **The Output Has Real-World Value**: Profile goes into Claude, improves actual help

---

## VISUAL SPECIFICATION

### Palette (From Pinterest References)
```css
/* Pond/Deep Water */
--void: #0a1210;      /* Deepest background */
--deep: #0d1a16;      /* Deep water */
--murk: #132820;      /* Murky mid-tone */
--water: #1a3830;     /* Water surface */
--surface: #254a40;   /* Lighter surface */
--light: #3d6b5a;     /* Light filtering through */

/* Bioluminescence (Accents Only) */
--glow-cyan: #5cffdb;
--glow-teal: #3dffc4;
--glow-purple: #b088f9;
--glow-pink: #ff7eb3;
--glow-gold: #ffd93d;

/* Text */
--text: #c4e0d4;
--text-dim: #5a7a6a;
```

### Typography
- **Display**: VT323 (pixel font) for titles, labels, game UI
- **Body**: Space Grotesk (clean sans) for dialogue, descriptions
- **Sizing**: Generous, readable on mobile

### Style
- Pixel art aesthetic (image-rendering: pixelated)
- Chunky, visible pixels (not retro 8-bit, modern pixel art)
- Atmospheric lighting with bioluminescent accents
- Monument Valley influence: quiet, architectural, responsive

---

## GAME STRUCTURE

### Overview
```
Title Screen → Layer 1 → Layer 2 → Layer 3 → Profile Reveal
```

**Total Duration**: ~3 minutes
**Total Layers**: 3
**Each Layer**: Different mechanic, different cognitive dimension

---

## LAYER 1: TWILIGHT ZONE — Navigation

### Mechanic
**Type**: Exploration/Collection  
**Input**: Touch/Mouse to move creature  
**Duration**: 30-60 seconds

### What Player Does
1. Guide the Octopus through a 2D environment
2. Navigate toward a visible goal (glowing beacon at top)
3. Optionally collect scattered orbs along the way
4. Orbs are positioned OFF the direct path (edges, corners)

### Environment Layout
```
    [GOAL BEACON]
         ↑
   [orb]     [orb]
         ↑
[orb]    PATH    [orb]
         ↑
   [orb]     [orb]
         ↑
    [START - Octopus]
```

### What Gets Measured
| Behavior | Dimension | How Measured |
|----------|-----------|--------------|
| Path length vs. direct distance | Exploration Drive | pathLength / directDistance |
| Orbs collected / total | Thoroughness | orbsCollected / orbsTotal |
| Time spent at edges | Edge Seeking | frames in outer 15% of screen |

### Controls
- **Desktop**: Octopus follows mouse cursor with smooth interpolation
- **Mobile**: Octopus follows touch point
- **Physics**: Velocity-based movement with drag (vx *= 0.92)

### Layer Complete When
- Octopus enters goal beacon radius (center top of screen)

### Verbal Cues
| Trigger | Dialogue |
|---------|----------|
| Layer Start | "Follow me. There are fragments here — collect what calls to you." |
| First Orb Collected | "You found one. Most swim right past." |
| 50%+ Orbs Collected | "You look in the corners." |
| All Orbs Collected | "All of them. You miss nothing." |
| Layer End (high exploration) | "You wander before you arrive. What you found comes with us." |
| Layer End (direct path) | "Direct. You know where you're going." |

---

## LAYER 2: MIDNIGHT ZONE — Arrangement

### Mechanic
**Type**: Spatial Organization  
**Input**: Drag and drop elements  
**Duration**: 30-90 seconds (player-controlled exit)

### What Player Does
1. Elements from Layer 1 float in space
2. Player can drag and arrange them however they want
3. Or leave them alone
4. Continue button appears after 5 seconds
5. Player decides when to continue

### Environment Layout
```
    [Elements floating randomly in center area]
    
    
    
    [Octopus observing at bottom]
    
                        [Continue →]
```

### What Gets Measured
| Behavior | Dimension | How Measured |
|----------|-----------|--------------|
| Number of drag actions | Organization Need | arrangeActions count |
| Horizontal/Vertical alignment | Linear Thinking | elements with similar x or y (±30px) |
| Clustering | Categorical Thinking | elements within 80px of centroid |
| Time before first action | Deliberation | ms before first drag |
| No arrangement | Ambiguity Tolerance | arrangeActions < 3 |

### Organization Style Classification
```javascript
if (arrangeActions < 3) return 'minimal';
if (alignmentScore > 2) return 'linear';
if (clusterScore > 0.6) return 'clustered';
return 'distributed';
```

### Controls
- **Drag**: Touch/click and hold element, move, release
- **Elements**: Slight drift when not being dragged (vx/vy ±0.2)

### Layer Complete When
- Player clicks "Continue" button

### Verbal Cues
| Trigger | Dialogue |
|---------|----------|
| Layer Start | "They float here now. Arrange them if you like. Or don't." |
| After 8s no action | "Stillness is also a choice." |
| Layer End (linear) | "You made order. Structure suits you." |
| Layer End (clustered) | "Grouped by kind. You see categories." |
| Layer End (minimal) | "You let them drift. Ambiguity doesn't trouble you." |
| Layer End (distributed) | "Scattered but intentional." |

---

## LAYER 3: THE ABYSS — Communication

### Mechanic
**Type**: Signal Response  
**Input**: Select from 4 color options  
**Duration**: 4 rounds, ~45 seconds total

### What Player Does
1. Octopus pulses with a color (signal)
2. Four response options appear below
3. Player selects one response
4. Brief acknowledgment, then next round

### Signal-Response Options
For each signal color, player chooses from:
| Option | Meaning | Example |
|--------|---------|---------|
| Echo | Same color back | Cyan → Cyan |
| Harmony | Similar/adjacent color | Cyan → Teal |
| Balance | Complementary color | Cyan → Pink |
| Contrast | Opposing color | Cyan → Gold |

### Color Relationships
```javascript
const relationships = {
  glowCyan: { similar: 'glowTeal', complement: 'glowPink', contrast: 'glowGold' },
  glowPurple: { similar: 'glowPink', complement: 'glowGold', contrast: 'glowCyan' },
  glowPink: { similar: 'glowPurple', complement: 'glowCyan', contrast: 'glowGold' },
  glowGold: { similar: 'glowPink', complement: 'glowPurple', contrast: 'glowCyan' }
};
```

### What Gets Measured
| Behavior | Dimension | How Measured |
|----------|-----------|--------------|
| Echo selections | Reflective Communication | mirrorCount |
| Harmony/Balance selections | Interpretive Communication | interpretCount |
| Contrast selections | Independent Communication | contrastCount |
| Average response time | Processing Speed | sum(responseTimes) / 4 |

### Communication Style Classification
```javascript
if (mirrorCount >= 2) return 'reflective';
if (interpretCount >= 2) return 'interpretive';
if (contrastCount >= 2) return 'independent';
return 'adaptive';
```

### UI Layout
```
        [Octopus pulsing with signal color]
        
        
    [Echo] [Harmony] [Balance] [Contrast]
         (shuffled each round)
```

### Layer Complete When
- All 4 rounds completed

### Verbal Cues
| Trigger | Dialogue |
|---------|----------|
| Layer Start | "No light here but what we make. I'll speak. You answer." |
| After Echo response | "You speak my language back." |
| After Harmony response | "Close, but your own." |
| After Balance response | "You complete the thought." |
| After Contrast response | "You answer with your own voice." |
| Layer End | "I see how you connect." |

---

## PROFILE GENERATION

### Traits Computed
| Trait | Source | Values |
|-------|--------|--------|
| Exploration | Layer 1 | Expansive / Balanced / Direct |
| Thoroughness | Layer 1 | Complete / Selective / Minimal |
| Organization | Layer 2 | Structured / Grouped / Organic / Fluid |
| Communication | Layer 3 | Reflective / Interpretive / Independent / Adaptive |
| Processing Pace | Layer 3 | Quick (<2.5s) / Measured / Deliberate (>4s) |

### Insight Generation Rules
```javascript
const insights = [];

if (exploration > 0.5 && thoroughness > 0.6) {
  insights.push("Explores fully before deciding — values completeness");
}
if (exploration < 0.4 && organization === 'Structured') {
  insights.push("Efficient and organized — clear pathways work best");
}
if (communication === 'Reflective') {
  insights.push("Builds connection through reflection — match their style");
}
if (communication === 'Independent') {
  insights.push("Values independent perspective — don't just echo");
}
if (organization === 'Fluid') {
  insights.push("Comfortable with ambiguity — less structure is fine");
}
if (pace === 'Quick') {
  insights.push("Quick processor — get to the point");
}
if (pace === 'Deliberate') {
  insights.push("Deliberate thinker — provide full context");
}

return insights.slice(0, 3);
```

### Profile Output Format (claude.md)
```markdown
# Communication Profile
## The Translators — Octopus Path

### Observed Patterns
**Exploration**: [value]
**Thoroughness**: [value]
**Organization**: [value]
**Communication**: [value]
**Processing Pace**: [value]

### Insights
- [insight 1]
- [insight 2]
- [insight 3]

### How To Communicate With Me
- [instruction based on exploration]
- [instruction based on organization]
- [instruction based on communication]
- [instruction based on pace]

---
*Profile from The Translators*
```

---

## OCTOPUS SPECIFICATION

### Visual (Pixel Art)
- Body: 6-8 pixels wide, elliptical
- Tentacles: 6, each 3-5 pixels long, wavy animation
- Eyes: 2x2 pixel sockets, 1x1 pixel pupils that track cursor
- Glow: Radial gradient aura, intensity increases with depth
- Colors: Purple body (#7a6a9a), cyan glow (#5cffdb)

### Animation
| Animation | Timing | Description |
|-----------|--------|-------------|
| Tentacle wave | 5s cycle, offset per tentacle | Sine wave on angle |
| Body breathe | 4s cycle | Scale 1.0 → 1.02 |
| Eye tracking | Continuous | Pupils follow cursor (max ±1 pixel) |
| Speaking indicator | When dialogue visible | Bouncing dots above head |
| Signal pulse | During Layer 3 signals | Radial color expansion |

### Movement
```javascript
// Physics
octo.vx += (targetX - octo.x) * 0.02;
octo.vy += (targetY - octo.y) * 0.02;
octo.vx *= 0.92;
octo.vy *= 0.92;
octo.x += octo.vx;
octo.y += octo.vy;
```

---

## DIALOGUE SYSTEM

### Behavior
1. Dialogue appears in box at bottom of screen
2. Tap/click anywhere advances to next line
3. Multiple lines queue and display sequentially
4. Gameplay pauses during dialogue (Layer 1 movement continues)
5. Callback fires after final line dismissed

### Visual
- Box: Dark background with cyan border
- Speaker label: "Octopus" in small caps
- Text: Clean sans-serif, readable size
- Continue indicator: Blinking "▼" when more lines available

---

## BUILD CHECKLIST

Before any build is considered complete, verify:

### Layer 1
- [ ] Octopus follows cursor/touch smoothly
- [ ] Goal beacon visible at top center
- [ ] 8 orbs positioned at edges (not on direct path)
- [ ] Orbs can be collected by proximity (tap/click)
- [ ] Layer ends when reaching goal beacon
- [ ] Collection count visible in HUD

### Layer 2
- [ ] Elements appear from collected orbs (or defaults)
- [ ] Elements can be dragged and dropped
- [ ] Elements drift slightly when not dragged
- [ ] Continue button appears after 5 seconds
- [ ] Octopus observes from bottom

### Layer 3
- [ ] Octopus pulses with signal color
- [ ] 4 response options appear (shuffled)
- [ ] Selection registers and triggers acknowledgment
- [ ] 4 rounds complete the layer
- [ ] Response times are tracked

### Profile
- [ ] All traits calculated from behavior data
- [ ] Insights generated from rules
- [ ] Copy to clipboard works
- [ ] Markdown format is valid

### General
- [ ] All verbal cues trigger at correct moments
- [ ] Transitions between layers are smooth
- [ ] Back/restart functionality works
- [ ] Mobile touch input works
- [ ] Desktop mouse input works

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-01 | Initial specification |

---

## AMENDMENT PROCESS

To change this spec:
1. Propose change with rationale
2. Discuss impact on existing builds
3. Update version number
4. Update all affected sections
5. Rebuild to new spec
