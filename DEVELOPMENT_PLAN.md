# The Translators — Development Plan v2.0

**Focus Areas:**
1. Psychology-based question framework
2. CRT typography enhancement
3. Semantic garden-question coupling

---

## 1. PSYCHOLOGY-BASED QUESTION FRAMEWORK

### Current State

8 questions mapping to 8 dimensions:
- pace, thoroughness, organization, exploration
- communication, ambiguity, rhythm, tangents

### The Problem

Questions are functional but not deeply grounded in psychology. They feel like preferences rather than revealing cognitive/emotional patterns that matter for AI collaboration.

### Proposed Framework: 4-Stage Depth Model

Drawing from cognitive psychology, attachment theory, and executive function research:

```
Stage 1: PROCESSING (How you receive)
  └─ Cognitive load capacity, modality preference

Stage 2: ENGAGEMENT (How you interact)
  └─ Autonomy vs guidance, exploration style

Stage 3: EMOTIONAL (How you feel)
  └─ Vulnerability tolerance, uncertainty handling

Stage 4: RHYTHM (How you flow)
  └─ Pacing needs, flexibility tolerance
```

### Proposed Questions (8 total, redesigned)

#### Stage 1: Processing Preferences

**Q1: Cognitive Load (→ dimension: density)**
```
"When facing something complex, what helps you most?"

A) "Break it into tiny pieces — one thing at a time"
   → density: 0.2 (minimal chunks)
   VISUAL: Seeds fall slowly, widely spaced

B) "Give me the full picture — I'll find my way through"
   → density: 0.8 (dense presentation)
   VISUAL: Seeds fall in clusters, overlapping

C) "Start simple, let me ask for more when ready"
   → density: 0.5 (adaptive)
   VISUAL: Seeds fall in gentle waves
```

**Q2: Grounding Style (→ dimension: abstraction)**
```
"When learning something new, what anchors you?"

A) "Real examples — show me it working"
   → abstraction: 0.2 (concrete)
   VISUAL: Plants grow thick, grounded, short

B) "The underlying principle — why it works that way"
   → abstraction: 0.8 (conceptual)
   VISUAL: Plants grow tall, reaching upward

C) "Both — concept plus example together"
   → abstraction: 0.5 (balanced)
   VISUAL: Plants vary in height, mixed
```

#### Stage 2: Engagement Patterns

**Q3: Autonomy Spectrum (→ dimension: guidance)**
```
"When you're working on something, you prefer..."

A) "Check in with me often — I like knowing we're aligned"
   → guidance: 0.8 (high touch)
   VISUAL: Garden grows toward Mac, vines reach in

B) "Let me drive — come back when I call"
   → guidance: 0.2 (autonomous)
   VISUAL: Garden spreads outward, away from Mac

C) "Read the room — sometimes I need space, sometimes support"
   → guidance: 0.5 (adaptive)
   VISUAL: Garden maintains balanced distance
```

**Q4: Problem Space (→ dimension: exploration)**
```
"When you don't know the answer yet, you tend to..."

A) "Explore widely — the answer might be somewhere unexpected"
   → exploration: 0.9 (divergent)
   VISUAL: Vines spread chaotically, roots branch wildly

B) "Focus narrow — eliminate what it's not"
   → exploration: 0.2 (convergent)
   VISUAL: Growth is linear, direct, minimal branching

C) "Trust the process — it'll emerge"
   → exploration: 0.6 (intuitive)
   VISUAL: Organic growth with some structure
```

#### Stage 3: Emotional Landscape

**Q5: Receiving Correction (→ dimension: vulnerability)**
```
"When you've made a mistake, the best response is..."

A) "Just tell me — I'd rather know than wonder"
   → vulnerability: 0.2 (direct)
   VISUAL: Flowers open fully, exposed

B) "Lead me to see it myself — questions help"
   → vulnerability: 0.5 (guided)
   VISUAL: Flowers open partially, layered petals

C) "Be gentle — I'm harder on myself than you know"
   → vulnerability: 0.8 (protected)
   VISUAL: Flowers stay more closed, sheltered by leaves
```

**Q6: Sitting with Unknown (→ dimension: uncertainty)**
```
"When there's no clear answer, you feel..."

A) "Uncomfortable — give me your best guess so I can move"
   → uncertainty: 0.2 (needs closure)
   VISUAL: Garden becomes more structured, geometric

B) "Fine — I can hold ambiguity while we figure it out"
   → uncertainty: 0.8 (tolerates uncertainty)
   VISUAL: Garden becomes more wild, overlapping, mysterious

C) "Depends — some things need answers, others can wait"
   → uncertainty: 0.5 (contextual)
   VISUAL: Mixed structure and organic elements
```

#### Stage 4: Rhythm & Flow

**Q7: Processing Time (→ dimension: pace)**
```
"In conversation, silence feels..."

A) "Uncomfortable — keep things moving"
   → pace: 0.2 (fast)
   VISUAL: Animation speeds up, more particles

B) "Natural — good thinking needs quiet"
   → pace: 0.8 (deliberate)
   VISUAL: Animation slows, breathing rhythm

C) "Contextual — sometimes quick, sometimes slow"
   → pace: 0.5 (adaptive)
   VISUAL: Animation varies with content
```

**Q8: Thread Following (→ dimension: tangents)**
```
"When a conversation wanders off-topic, you usually..."

A) "Follow it — connections happen in unexpected places"
   → tangents: 0.9 (embraces)
   VISUAL: Mycelium explodes with connections, sprawling

B) "Redirect — let's finish what we started"
   → tangents: 0.2 (focused)
   VISUAL: Mycelium stays contained, direct paths only

C) "Depends — interesting tangents yes, boring tangents no"
   → tangents: 0.6 (selective)
   VISUAL: Some mycelium growth, but pruned
```

### Dimension Renaming (for profile output)

| Old Name | New Name | Measures |
|----------|----------|----------|
| pace | processing_pace | Speed of information exchange |
| thoroughness | cognitive_density | How much detail at once |
| organization | abstraction_level | Concepts vs examples |
| exploration | problem_approach | Divergent vs convergent |
| communication | guidance_need | Autonomy vs check-in |
| ambiguity | uncertainty_tolerance | Comfort with unknowns |
| rhythm | pace_preference | Conversation tempo |
| tangents | thread_flexibility | Tangent tolerance |

---

## 2. CRT TYPOGRAPHY ENHANCEMENT

### Current State

The Mac screen has:
- Green text (#6c6 family)
- Basic scanlines (every 2px)
- Simple phosphor glow (radial gradient)
- Chicago-style bitmap font

### Target Aesthetic (inferred from CRT/terminal references)

**Key Elements:**
1. **Phosphor bloom** — Dramatic glow bleeding from text
2. **Scanline depth** — More visible, varied intensity
3. **Text animation** — Typewriter effect, subtle flicker
4. **Color fringing** — Chromatic aberration at edges
5. **Screen curvature** — Slight barrel distortion
6. **Refresh artifacts** — Subtle horizontal scan line
7. **Vignette** — Darker corners/edges
8. **Glow pulse** — Text brightness responds to garden state

### Implementation Plan

#### Phase 2A: Enhanced Glow System

```javascript
// Multi-layer phosphor glow
renderTextWithPhosphorGlow(ctx, text, x, y, color) {
  // Layer 1: Outer bloom (large, soft)
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.globalAlpha = 0.3;
  ctx.fillText(text, x, y);

  // Layer 2: Middle glow
  ctx.shadowBlur = 10;
  ctx.globalAlpha = 0.5;
  ctx.fillText(text, x, y);

  // Layer 3: Inner glow
  ctx.shadowBlur = 4;
  ctx.globalAlpha = 0.8;
  ctx.fillText(text, x, y);

  // Layer 4: Core text
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
  ctx.fillText(text, x, y);
}
```

#### Phase 2B: Scanline Enhancement

```javascript
// Variable intensity scanlines with flicker
renderScanlines(ctx, bounds, time) {
  const scanlineHeight = 2;
  const flickerSpeed = 0.1;

  for (let y = bounds.y; y < bounds.y + bounds.height; y += scanlineHeight) {
    // Alternating intensity
    const baseAlpha = (y / scanlineHeight) % 2 === 0 ? 0.08 : 0.15;

    // Subtle flicker
    const flicker = Math.sin(time * 30 + y * 0.1) * 0.02;

    ctx.fillStyle = `rgba(0, 0, 0, ${baseAlpha + flicker})`;
    ctx.fillRect(bounds.x, y, bounds.width, 1);
  }

  // Moving refresh line
  const refreshY = (time * 50) % bounds.height;
  ctx.fillStyle = 'rgba(100, 200, 100, 0.03)';
  ctx.fillRect(bounds.x, bounds.y + refreshY, bounds.width, 3);
}
```

#### Phase 2C: Typewriter Text Animation

```javascript
// Typewriter effect for questions
class TypewriterText {
  constructor(text, speed = 30) {
    this.fullText = text;
    this.visibleChars = 0;
    this.charDelay = 1000 / speed; // chars per second
    this.elapsed = 0;
    this.complete = false;
  }

  update(dt) {
    if (this.complete) return;

    this.elapsed += dt * 1000;
    this.visibleChars = Math.floor(this.elapsed / this.charDelay);

    if (this.visibleChars >= this.fullText.length) {
      this.visibleChars = this.fullText.length;
      this.complete = true;
    }
  }

  getText() {
    return this.fullText.substring(0, this.visibleChars);
  }

  getCursor() {
    // Blinking cursor
    return this.complete ? '' : (Math.floor(Date.now() / 500) % 2 ? '█' : ' ');
  }
}
```

#### Phase 2D: Chromatic Aberration

```javascript
// RGB separation for CRT effect
renderWithChromaticAberration(ctx, text, x, y, offset = 1) {
  // Red channel (shifted left)
  ctx.fillStyle = 'rgba(255, 80, 80, 0.3)';
  ctx.fillText(text, x - offset, y);

  // Blue channel (shifted right)
  ctx.fillStyle = 'rgba(80, 80, 255, 0.3)';
  ctx.fillText(text, x + offset, y);

  // Green channel (center, dominant)
  ctx.fillStyle = '#5c5';
  ctx.fillText(text, x, y);
}
```

#### Phase 2E: Screen Curvature (Optional - More Complex)

```javascript
// Barrel distortion via pixel manipulation
// This would require rendering to offscreen canvas first
// then applying distortion
// Simpler alternative: CSS border-radius + box-shadow
```

### CSS Enhancements

```css
.mac-question-overlay {
  /* Subtle CRT curvature illusion */
  border-radius: 8px;

  /* Inner glow */
  box-shadow:
    inset 0 0 30px rgba(100, 200, 100, 0.1),
    inset 0 0 60px rgba(100, 200, 100, 0.05);

  /* Vignette via gradient */
  background:
    radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
}

.question-text {
  /* Text glow */
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px rgba(100, 200, 100, 0.5);

  /* Slight blur for phosphor effect */
  filter: blur(0.3px);
}

/* Flicker animation */
@keyframes crt-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.98; }
  75% { opacity: 0.99; }
}

.mac-question-overlay {
  animation: crt-flicker 0.1s infinite;
}
```

---

## 3. SEMANTIC GARDEN-QUESTION COUPLING

### Core Concept

Each question has a **visual metaphor** that the garden responds to based on the answer chosen. The garden doesn't just evolve linearly — it evolves *meaningfully*.

### Question → Visual Mapping

| Question | Visual Metaphor | Behavior |
|----------|-----------------|----------|
| Q1: Cognitive Load | Seed spacing | Clustered vs scattered |
| Q2: Abstraction | Plant height | Tall/reaching vs short/grounded |
| Q3: Autonomy | Garden proximity | Toward Mac vs away |
| Q4: Exploration | Branching | Chaotic vs linear |
| Q5: Vulnerability | Flower openness | Open vs protected |
| Q6: Uncertainty | Structure | Geometric vs organic |
| Q7: Pace | Animation speed | Fast particles vs slow breathing |
| Q8: Tangents | Mycelium | Explosive vs contained |

### Implementation Architecture

```javascript
// In CalibrationState.js

// Each question defines its visual behavior
const QUESTION_VISUALS = {
  cognitive_load: {
    dimension: 'density',
    visualize: (game, state, traitValue) => {
      // Low value (0.2) = sparse, separated
      // High value (0.8) = dense, clustered
      const spacing = lerp(80, 20, traitValue);
      const count = lerp(4, 12, traitValue);
      state.spawnSeedsWithSpacing(game, count, spacing);
    }
  },

  abstraction: {
    dimension: 'abstraction',
    visualize: (game, state, traitValue) => {
      // Low value = short, grounded plants
      // High value = tall, reaching plants
      state.plants.forEach(p => {
        p.targetHeight *= lerp(0.5, 1.5, traitValue);
      });
      // New plants follow the pattern
      state.defaultPlantHeight = lerp(30, 100, traitValue);
    }
  },

  autonomy: {
    dimension: 'guidance',
    visualize: (game, state, traitValue) => {
      // High value (wants guidance) = garden grows toward Mac
      // Low value (autonomous) = garden spreads away
      const macCenter = state.macBounds.x + state.macBounds.width / 2;

      if (traitValue > 0.6) {
        // Attract toward Mac
        state.gardenAttractor = { x: macCenter, strength: 0.3 };
      } else if (traitValue < 0.4) {
        // Repel from Mac
        state.gardenAttractor = { x: macCenter, strength: -0.2 };
      }

      // Vines reach toward/away from Mac
      state.vineDirectionBias = traitValue > 0.5 ? 'inward' : 'outward';
    }
  },

  exploration: {
    dimension: 'exploration',
    visualize: (game, state, traitValue) => {
      // High value = chaotic branching, wild roots
      // Low value = linear, direct growth
      state.branchProbability = lerp(0.1, 0.6, traitValue);
      state.rootSpread = lerp(0.2, 0.8, traitValue);

      // Trigger immediate branching
      state.roots.forEach(root => {
        if (traitValue > 0.6) {
          state.growRoot(root);
          state.growRoot(root);
        }
      });
    }
  },

  vulnerability: {
    dimension: 'vulnerability',
    visualize: (game, state, traitValue) => {
      // Low value (direct) = flowers open fully
      // High value (protected) = flowers stay more closed
      state.maxFlowerOpenness = lerp(1.0, 0.5, traitValue);

      // Existing flowers adjust
      state.flowers.forEach(f => {
        f.targetOpenProgress = state.maxFlowerOpenness;
      });

      // Add protective leaves if high vulnerability
      if (traitValue > 0.6) {
        state.spawnProtectiveLeaves();
      }
    }
  },

  uncertainty: {
    dimension: 'uncertainty',
    visualize: (game, state, traitValue) => {
      // High value (tolerates) = wild, overlapping, mysterious
      // Low value (needs closure) = structured, geometric

      if (traitValue > 0.6) {
        // Organic chaos
        state.growthRandomness = 0.8;
        state.overlapAllowed = true;
        state.ambientGlow += 0.1; // More mystery glow
      } else if (traitValue < 0.4) {
        // Structured
        state.growthRandomness = 0.2;
        state.overlapAllowed = false;
        state.gridSnap = true; // Plants align to grid
      }
    }
  },

  pace: {
    dimension: 'pace',
    visualize: (game, state, traitValue) => {
      // Low value (fast) = quick animations, more particles
      // High value (slow) = breathing rhythm, fewer particles

      state.globalAnimationSpeed = lerp(1.5, 0.6, traitValue);
      state.particleDensity = lerp(1.5, 0.5, traitValue);

      // Breathing effect for slow pace
      if (traitValue > 0.6) {
        state.breathingEnabled = true;
        state.breathingPeriod = 4; // 4 second breath cycle
      }
    }
  },

  tangents: {
    dimension: 'tangents',
    visualize: (game, state, traitValue) => {
      // High value (embraces) = mycelium explosion
      // Low value (redirect) = contained mycelium

      const connectionCount = Math.floor(lerp(1, 6, traitValue));
      for (let i = 0; i < connectionCount; i++) {
        state.spawnMycelium(game);
      }

      state.myceliumSpreadRate = lerp(0.2, 1.0, traitValue);

      // Trigger pulses for high tangent tolerance
      if (traitValue > 0.7) {
        for (let i = 0; i < 3; i++) {
          state.pulseMycelium();
        }
      }
    }
  }
};
```

### Answer Selection Flow

```javascript
selectAnswer(game, question, data) {
  // Record answer (unchanged)
  this.answers[question.id] = {
    value: data.value,
    trait: parseFloat(data.trait),
    dimension: question.dimension,
    depth: question.depth
  };

  // Get semantic visualizer for this question
  const visualizer = QUESTION_VISUALS[question.id];
  if (visualizer) {
    visualizer.visualize(game, this, parseFloat(data.trait));
  }

  // Stage-based evolution (existing logic)
  this.evolve(game, question.depth, parseFloat(data.trait));

  // Continue to next question
  this.currentQuestionIndex++;
  const pauseDuration = 200 + question.depth * 100;
  setTimeout(() => {
    this.showQuestion(game, this.currentQuestionIndex);
  }, pauseDuration);
}
```

---

## IMPLEMENTATION PHASES

### Phase 1: Questions (Estimated effort: Medium)

1. Replace QUESTIONS array with new psychology-grounded questions
2. Update dimension names in DeterministicProfileEngine
3. Test determinism (same answers → same checksum)
4. Update ProfileState to display new dimension names

### Phase 2: Typography (Estimated effort: Medium)

1. Add TypewriterText class for animated question display
2. Implement multi-layer phosphor glow rendering
3. Enhance scanline system with flicker
4. Add chromatic aberration for CRT authenticity
5. Update CSS for vignette and inner glow

### Phase 3: Semantic Garden (Estimated effort: High)

1. Add QUESTION_VISUALS mapping object
2. Create new visual behaviors for each question:
   - Garden attractor system (toward/away from Mac)
   - Variable flower openness
   - Grid snap vs organic growth modes
   - Animation speed modulation
   - Breathing effect system
3. Integrate visualizers into selectAnswer flow
4. Test all 8 questions with extreme answers
5. Fine-tune visual parameters

---

## DETERMINISM GUARANTEE

All changes must preserve:

```
Same answers → Same checksum → Same profile
```

**Visual elements are aesthetic only.** The profile checksum is computed from:
- Dimension values (0-1)
- NOT from garden state
- NOT from animation parameters
- NOT from random visual variations

The garden can vary wildly while the profile stays invariant.

---

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/game/states/CalibrationState.js` | Questions, visuals, typography |
| `src/game/systems/DeterministicProfileEngine.js` | Dimension names (if changed) |
| `src/game/systems/USDExporter.js` | Update dimension labels |
| `src/game/config/dialogue.js` | New question text |
| `src/game/config/timing.js` | Animation timing values |

---

## OPEN QUESTIONS

1. **Typography reference**: Can you describe or share another link to the CRT aesthetic you want? The Pinterest link resolved to documentation.

2. **Question wording**: Should we workshop the exact question text together, or iterate after seeing it in-game?

3. **Visual intensity**: How dramatic should the garden responses be? Subtle (10-20% variation) or dramatic (50%+ variation)?

4. **Mobile priority**: Should we optimize for mobile performance first, or desktop polish first?

---

*Plan version: 2.0*
*Created: 2026-01-16*
*Status: Awaiting approval*
