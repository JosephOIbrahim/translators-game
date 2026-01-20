/**
 * Calibration State — The Translators v5
 *
 * GROWING YOUR GARDEN
 *
 * A vintage Macintosh sits in darkness. You answer questions about yourself.
 * With each answer, life appears:
 *
 * Stage 1 (Q1-2): SEEDS — Glowing motes drift down, plant themselves, wait
 * Stage 2 (Q3-4): SPROUTS — Stems rise from seeds, tendrils reach out, first leaves unfurl
 * Stage 3 (Q5-6): BLOOM — Flowers open their petals, moths flutter in, color arrives
 * Stage 4 (Q7-8): GLOW — Bioluminescence pulses through everything, fireflies dance, the garden breathes
 *
 * The Mac is the seed. The garden is YOU becoming visible.
 * By the end, you're surrounded by a living world you grew from answers.
 *
 * This is not a metaphor. Seeds LITERALLY plant. Stems LITERALLY grow.
 * Flowers LITERALLY open. You watch yourself become a garden.
 *
 * DETERMINISM: The cognitive profile is computed via DeterministicProfileEngine.
 * Same answers → Same profile. Always. The garden can vary (aesthetic),
 * but the traits are invariant.
 */

import { DeterministicProfileEngine } from '../systems/DeterministicProfileEngine.js';
import { PixelGarden, PixelRenderer, PALETTE } from '../systems/PixelGarden.js';
import {
  CognitiveCalibrationManager,
  formatCognitiveQuestionForDisplay,
  getCognitiveDepthLabel
} from '../calibration/index.js';

/**
 * The Questions — Honest calibration for USD Cognitive Substrate
 *
 * Each question maps to a USD parameter:
 * - Q1: LOAD → cognitive_density
 * - Q2: GROUND → home_altitude
 * - Q3: LEASH → guidance_frequency
 * - Q4: LOST → default_paradigm
 * - Q5: WRONG → feedback_expert
 * - Q6: FOG → uncertainty_tolerance
 * - Q7: SILENCE → processing_pace
 * - Q8: WANDER → tangent_budget
 */
const QUESTIONS = [
  // STAGE 1: SURFACE — How your mind works when it's working
  {
    id: 'load',
    text: "How much can you hold at once\nbefore it starts to blur?",
    options: [
      { label: "Not much. One thing at a time.", value: 'low', trait: 0.2 },
      { label: "Quite a lot. I can hold complexity.", value: 'high', trait: 0.8 },
      { label: "It varies. Some days more than others.", value: 'adaptive', trait: 0.5 }
    ],
    dimension: 'cognitive_density',
    depth: 1
  },
  {
    id: 'ground',
    text: "Where does your mind live?",
    options: [
      { label: "In the details. Ground level. Show me the thing.", value: 'ground', trait: 0.2 },
      { label: "In the big picture. Why before how.", value: 'high', trait: 0.8 },
      { label: "I move between them. Zoom in, zoom out.", value: 'mid', trait: 0.5 }
    ],
    dimension: 'home_altitude',
    depth: 1
  },

  // STAGE 2: PATTERNS — How you move when you're stuck
  {
    id: 'leash',
    text: "How long is the leash?",
    options: [
      { label: "Short. Check in often. I like the tether.", value: 'short', trait: 0.8 },
      { label: "Long. Trust me to run. I'll call if I need you.", value: 'long', trait: 0.2 },
      { label: "It depends. Read the situation.", value: 'adaptive', trait: 0.5 }
    ],
    dimension: 'guidance_frequency',
    depth: 2
  },
  {
    id: 'lost',
    text: "When you're lost,\ndo you search wide or dig deep?",
    options: [
      { label: "Wide. The answer might be somewhere unexpected.", value: 'wide', trait: 0.8 },
      { label: "Deep. Narrow down. Eliminate. Focus.", value: 'deep', trait: 0.2 },
      { label: "I feel my way. Intuition guides me.", value: 'intuition', trait: 0.5 }
    ],
    dimension: 'default_paradigm',
    depth: 2
  },

  // STAGE 3: FEELINGS — How you handle the hard parts
  {
    id: 'wrong',
    text: "When you're wrong,\nhow should I tell you?",
    options: [
      { label: "Straight. Just say it.", value: 'direct', trait: 0.2 },
      { label: "Through questions. Help me see it myself.", value: 'socratic', trait: 0.5 },
      { label: "Gently. Wrap it in something soft.", value: 'gentle', trait: 0.8 }
    ],
    dimension: 'feedback_style',
    depth: 3
  },
  {
    id: 'fog',
    text: "Can you sit in the fog?",
    options: [
      { label: "No. It eats at me. Give me something to hold onto.", value: 'no', trait: 0.2 },
      { label: "Yes. I can wait. Clarity comes when it comes.", value: 'yes', trait: 0.8 },
      { label: "Depends what's at stake. Some fog is fine.", value: 'depends', trait: 0.5 }
    ],
    dimension: 'uncertainty_tolerance',
    depth: 3
  },

  // STAGE 4: CORE — How you move through time
  {
    id: 'silence',
    text: "When neither of us is talking,\nis that a problem?",
    options: [
      { label: "Yes. Fill the space. Silence is uncomfortable.", value: 'yes', trait: 0.2 },
      { label: "No. We're thinking. This is productive.", value: 'no', trait: 0.8 },
      { label: "Sometimes. Depends if we're stuck or processing.", value: 'sometimes', trait: 0.5 }
    ],
    dimension: 'processing_pace',
    depth: 4
  },
  {
    id: 'wander',
    text: "When we wander off the path,\nis that discovery or distraction?",
    options: [
      { label: "Discovery. The good stuff lives in the margins.", value: 'discovery', trait: 0.9 },
      { label: "Distraction. Let's finish what we started.", value: 'distraction', trait: 0.2 },
      { label: "Depends. Interesting tangents yes, boring ones no.", value: 'selective', trait: 0.5 }
    ],
    dimension: 'tangent_tolerance',
    depth: 4
  }
];

export class CalibrationState {
  constructor() {
    // UI
    this.container = null;

    // Question state
    this.currentQuestionIndex = 0;
    this.answers = {};

    // Evolution state (0-1, increases with each question)
    this.evolution = 0;
    this.targetEvolution = 0;
    this.stage = 0; // 1-4, which stage of growth

    // === THE PIXEL GARDEN ===
    // GROW-A-GARDEN style with individual plants
    this.garden = null;
    this.pixelRenderer = null;

    // Stars (kept separate - they're sky, not garden)
    this.stars = [];

    // Ambient effects
    this.ambientGlow = 0;
    this.time = 0;

    // Visual parameters that evolve
    this.brightness = 0.1;     // Very dark start
    this.windPhase = 0;

    // Mac bounds
    this.macBounds = { x: 0, y: 0, width: 0, height: 0 };
    this.screenBounds = { x: 0, y: 0, width: 0, height: 0 };

    // Ground line (where plants grow)
    this.groundY = 0;

    // ZEN: Cursor tracking for presence response
    this.cursorX = null;
    this.cursorY = null;

    // === COGNITIVE PROFILING ===
    // Deep cognitive profile built alongside legacy questions
    this.cognitiveManager = null;
    this.phase = 'legacy'; // 'legacy' | 'cognitive' | 'complete'
    this.currentCognitiveQuestion = null;
  }

  enter(game) {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.time = 0;

    // Reset evolution state
    this.evolution = 0;
    this.targetEvolution = 0;
    this.stage = 0;
    this.brightness = 0.1;
    this.windPhase = 0;
    this.ambientGlow = 0;

    // === COGNITIVE PROFILING ===
    // Try to load existing profile, or create new one
    this.cognitiveManager = CognitiveCalibrationManager.loadFromStorage();
    this.cognitiveManager.startSession();
    this.phase = 'legacy';
    this.currentCognitiveQuestion = null;

    this.calculateBounds(game);

    // Ground is lower portion of screen
    this.groundY = game.height * 0.75;

    // === INITIALIZE PIXEL GARDEN ===
    this.garden = new PixelGarden(game.width, game.height, this.groundY);
    // Renderer is set during render() since we need ctx

    // Initialize stars (invisible at first, fade in with evolution)
    this.stars = [];
    this.initStars(game);

    this.createUI(game);
    this.showQuestion(game, 0);
  }

  exit(game) {
    if (this.container) {
      this.container.remove();
    }
  }

  calculateBounds(game) {
    // 2.0x SCALE for LARGER, more prominent Mac (was 1.5x)
    const scale = 2.0;
    const macHeight = Math.min(520, game.height * 0.6) * scale;
    const macWidth = macHeight * 0.85;

    // 3D DEPTH parameters
    this.depthOffset = macHeight * 0.08; // How much depth to show
    this.depthAngle = 0.15; // Slight perspective skew

    this.macBounds = {
      x: (game.width - macWidth) / 2,
      y: (game.height - macHeight) / 2 - this.depthOffset / 2, // Adjust for depth
      width: macWidth,
      height: macHeight
    };

    const bezelTop = macHeight * 0.10;
    const bezelSide = macWidth * 0.08;
    const bezelBottom = macHeight * 0.22;

    this.screenBounds = {
      x: this.macBounds.x + bezelSide,
      y: this.macBounds.y + bezelTop,
      width: macWidth - bezelSide * 2,
      height: macHeight - bezelTop - bezelBottom
    };
  }

  // === STARS ===

  initStars(game) {
    // Stars are always there, but invisible until evolution brings light
    const starCount = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * game.width,
        y: Math.random() * this.groundY * 0.6, // Upper sky only
        size: 0.5 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7
      });
    }
  }

  createUI(game) {
    this.injectStyles();

    this.container = document.createElement('div');
    this.container.className = 'calibration-container';
    this.container.innerHTML = `
      <div class="mac-question-overlay" id="questionOverlay">
        <div class="question-header">
          <div class="question-progress" id="progress"></div>
          <div class="question-depth" id="depth"></div>
        </div>
        <div class="question-text" id="questionText"></div>
        <div class="question-options" id="options"></div>
      </div>
    `;

    game.ui.appendChild(this.container);
  }

  showQuestion(game, index) {
    // Check if we've finished legacy questions
    if (index >= QUESTIONS.length) {
      // Transition to cognitive phase (optional deep questions)
      if (this.phase === 'legacy' && this.cognitiveManager) {
        this.phase = 'cognitive';
        this.showCognitiveQuestion(game);
        return;
      }
      this.finishCalibration(game);
      return;
    }

    const q = QUESTIONS[index];
    const overlay = this.container.querySelector('#questionOverlay');
    const progress = this.container.querySelector('#progress');
    const depth = this.container.querySelector('#depth');
    const text = this.container.querySelector('#questionText');
    const options = this.container.querySelector('#options');

    // Position overlay
    overlay.style.left = `${this.screenBounds.x + 8}px`;
    overlay.style.top = `${this.screenBounds.y + 8}px`;
    overlay.style.width = `${this.screenBounds.width - 16}px`;
    overlay.style.height = `${this.screenBounds.height - 16}px`;

    // Depth indicators
    const depthLabels = ['Surface', 'Patterns', 'Feelings', 'Core'];
    progress.textContent = `${index + 1}/${QUESTIONS.length}`;
    depth.textContent = depthLabels[q.depth - 1];
    depth.className = `question-depth depth-${q.depth}`;

    text.textContent = q.text;

    options.innerHTML = q.options.map((opt, i) => `
      <button class="mac-option" data-index="${i}" data-value="${opt.value}" data-trait="${opt.trait}">
        ${opt.label}
      </button>
    `).join('');

    options.querySelectorAll('.mac-option').forEach(btn => {
      btn.onclick = () => this.selectAnswer(game, q, btn.dataset);
    });

    // Track question presentation for behavioral analysis
    if (this.cognitiveManager) {
      this.cognitiveManager.onLegacyQuestionPresented(q.id);
    }

    // Fade in
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('visible'), 50);
  }

  selectAnswer(game, question, data) {
    const answer = {
      value: data.value,
      trait: parseFloat(data.trait),
      dimension: question.dimension,
      depth: question.depth
    };
    this.answers[question.id] = answer;

    // Track answer in cognitive manager for profile building
    if (this.cognitiveManager) {
      this.cognitiveManager.onLegacyQuestionAnswered(question.id, answer);
    }

    // EVOLVE the graphics — pass question.id for plant type selection
    this.evolve(game, question.depth, parseFloat(data.trait), question.id);

    this.currentQuestionIndex++;

    // Dramatic pause scales with depth
    const pauseDuration = 200 + question.depth * 100;
    setTimeout(() => {
      this.showQuestion(game, this.currentQuestionIndex);
    }, pauseDuration);
  }

  /**
   * CORE EVOLUTION FUNCTION
   * Called after each answer — makes the garden grow
   *
   * MAC-CENTRIC GROWTH: Plants spawn in rings that converge toward the Mac.
   * Earlier questions = plants at edges of screen (large radius)
   * Later questions = plants close to the Mac (small radius)
   *
   * This creates the effect of the garden "enveloping" the computer.
   */
  evolve(game, depth, traitValue, questionId) {
    // Base evolution progress (0 to 1 over all questions)
    this.targetEvolution = (this.currentQuestionIndex + 1) / QUESTIONS.length;

    // Stage-specific evolution (2 questions per stage)
    const newStage = Math.ceil((this.currentQuestionIndex + 1) / 2);
    this.stage = newStage;

    // Brightness increases with evolution
    this.brightness = 0.1 + this.targetEvolution * 0.4;

    // === MAC-CENTRIC PLANT SPAWNING ===
    // Plants grow FROM edges TOWARD the Mac
    // Earlier questions = far from Mac, later questions = close to Mac
    const plantCount = 3 + Math.floor(Math.random() * 2);

    // Mac center (where plants converge)
    const macCenterX = this.macBounds.x + this.macBounds.width / 2;
    const macCenterY = this.macBounds.y + this.macBounds.height;

    // Radius decreases as questions progress (converging on Mac)
    // Q1-2: plants at screen edges (radius ~350-400)
    // Q7-8: plants hugging the Mac (radius ~80-120)
    const progress = this.currentQuestionIndex / (QUESTIONS.length - 1); // 0 to 1
    const maxRadius = Math.min(game.width, game.height) * 0.45;
    const minRadius = this.macBounds.width * 0.6;
    const radius = maxRadius - progress * (maxRadius - minRadius);

    this.garden.addPlantsAroundCenter(questionId, traitValue, macCenterX, macCenterY, radius, plantCount);

    // Stage-specific effects
    switch (newStage) {
      case 1: // SEEDS — First stirrings of life
        // Subtle, just the first plants
        break;

      case 2: // SPROUTS — More growth, some fireflies appear
        if (Math.random() < 0.4) {
          const fx = game.width * 0.2 + Math.random() * game.width * 0.6;
          const fy = this.groundY - 80 - Math.random() * 100;
          this.garden.addFirefly(fx, fy);
        }
        break;

      case 3: // BLOOM — Garden flourishes, more fireflies
        for (let i = 0; i < 2; i++) {
          if (Math.random() < 0.5) {
            const fx = game.width * 0.1 + Math.random() * game.width * 0.8;
            const fy = this.groundY - 60 - Math.random() * 120;
            this.garden.addFirefly(fx, fy);
          }
        }
        this.ambientGlow = 0.1 + traitValue * 0.1;
        break;

      case 4: // GLOW — Full bioluminescence
        this.ambientGlow = 0.3 + traitValue * 0.2;
        // Extra fireflies for the finale
        for (let i = 0; i < 3; i++) {
          const fx = game.width * 0.1 + Math.random() * game.width * 0.8;
          const fy = this.groundY - 50 - Math.random() * 150;
          this.garden.addFirefly(fx, fy);
        }
        break;
    }
  }

  // === COGNITIVE QUESTION PHASE ===
  // Deep cognitive profiling questions (optional, after legacy 8)

  showCognitiveQuestion(game) {
    // Get next cognitive question
    const cogQ = this.cognitiveManager.getNextCognitiveQuestion();

    // If no more questions or profile is viable, finish
    if (!cogQ) {
      this.phase = 'complete';
      this.finishCalibration(game);
      return;
    }

    this.currentCognitiveQuestion = cogQ;
    const formatted = formatCognitiveQuestionForDisplay(cogQ);

    const overlay = this.container.querySelector('#questionOverlay');
    const progress = this.container.querySelector('#progress');
    const depth = this.container.querySelector('#depth');
    const text = this.container.querySelector('#questionText');
    const options = this.container.querySelector('#options');

    // Update UI
    const totalQ = QUESTIONS.length + this.cognitiveManager.profile.questionsAnswered + 1;
    const currentQ = QUESTIONS.length + this.cognitiveManager.profile.questionsAnswered + 1;
    progress.textContent = `${currentQ}/${totalQ}+`;

    depth.textContent = getCognitiveDepthLabel(cogQ.tier);
    depth.className = `question-depth depth-${formatted.depth}`;

    text.textContent = formatted.text;

    // Create option buttons
    options.textContent = ''; // Clear existing
    formatted.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'mac-option';
      btn.dataset.index = i;
      btn.textContent = opt.label;
      btn.onclick = () => this.selectCognitiveAnswer(game, cogQ.id, i);
      options.appendChild(btn);
    });

    // Fade in
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('visible'), 50);
  }

  selectCognitiveAnswer(game, questionId, optionIndex) {
    // Score the answer
    this.cognitiveManager.answerCognitiveQuestion(questionId, optionIndex);

    // Continue garden evolution (smaller increments for cognitive questions)
    const depth = 3; // Treat as mid-depth
    const trait = 0.5; // Neutral trait for visual
    this.evolve(game, depth, trait, `cognitive_${questionId}`);

    // Show next question after pause
    setTimeout(() => {
      this.showCognitiveQuestion(game);
    }, 400);
  }

  finishCalibration(game) {
    // === DETERMINISTIC PROFILE (Legacy) ===
    // Use DeterministicProfileEngine for invariant trait computation
    // Same answers → Same profile. Always.
    const profile = DeterministicProfileEngine.buildProfile(this.answers);

    // Add confidence based on answer completeness
    profile.confidence = DeterministicProfileEngine.computeConfidence(this.answers);

    // === COGNITIVE PROFILE ===
    // End the cognitive session and save to storage
    if (this.cognitiveManager) {
      const cognitiveProfile = this.cognitiveManager.endSession();
      this.cognitiveManager.saveToStorage();

      // Attach cognitive profile to main profile
      profile.cognitive = cognitiveProfile;
      profile.cognitiveInsights = this.cognitiveManager.scoringEngine
        ? this.cognitiveManager.scoringEngine.analyzeEmergentPatterns(cognitiveProfile)
        : [];
    }

    // === AESTHETIC SIGNATURE ===
    // Visual signature is for display only — NOT used in AI behavior
    // Garden metrics are random, so we only capture color state
    profile.visualSignature = {
      hue: this.colorHue,
      saturation: this.colorSaturation,
      brightness: this.brightness,
      stage: this.stage,
      // Note: Garden counts removed from profile — they're non-deterministic
      // The garden is aesthetic pleasure, the profile is behavioral truth
    };

    game.calibrationProfile = profile;
    game.changeState('profile');
  }

  // === UPDATE ===

  update(game, dt) {
    this.time += dt;

    // Smooth evolution interpolation
    this.evolution += (this.targetEvolution - this.evolution) * dt * 2;

    // Wind animation
    this.windPhase += dt * 0.8;

    // Update stars
    this.updateStars(dt);

    // Update pixel garden with cursor position for presence response
    if (this.garden) {
      this.garden.setCursor(this.cursorX, this.cursorY);
      this.garden.update(dt, this.time);
    }
  }

  // ZEN: Track cursor for presence response
  onPointerMove(game, x, y) {
    this.cursorX = x;
    this.cursorY = y;
  }

  updateStars(dt) {
    // Stars twinkle and fade in with evolution
    this.stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed * dt;
    });
  }

  // === RENDER ===

  render(game, ctx) {
    // === BACKGROUND ===
    // Deep void black with subtle green tint
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, game.width, game.height);

    // Stars (fade in with evolution)
    this.renderStars(ctx, game);

    // Subtle glow from garden center (grows with evolution)
    if (this.evolution > 0.2) {
      const gradient = ctx.createRadialGradient(
        game.width / 2, this.groundY, 0,
        game.width / 2, this.groundY, game.height * 0.6
      );
      const glowAlpha = 0.05 + this.evolution * 0.1 + this.ambientGlow * 0.15;
      gradient.addColorStop(0, `rgba(90, 186, 90, ${glowAlpha})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, game.width, game.height);
    }

    // === GROUND ===
    this.renderGround(ctx, game);

    // === PIXEL GARDEN ===
    // Initialize renderer if needed
    if (this.garden && !this.garden.renderer) {
      this.garden.setRenderer(ctx, 3); // 3px pixel size
    }
    if (this.garden) {
      this.garden.render(this.time);
    }

    // === AMBIENT GLOW (stage 4) ===
    if (this.ambientGlow > 0) {
      this.renderBioluminescence(ctx, game);
    }

    // === MAC ===
    this.renderMac(ctx, game);

    // === POST-PROCESSING: VIGNETTE ===
    // Darkens edges to focus attention on center
    this.renderVignette(ctx, game);
  }

  // IMPACT: Post-processing vignette effect
  renderVignette(ctx, game) {
    const gradient = ctx.createRadialGradient(
      game.width / 2, game.height / 2, game.height * 0.25,
      game.width / 2, game.height / 2, game.height * 0.9
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.width, game.height);
  }

  renderGround(ctx, game) {
    // Ground gradient - dark soil fading to black
    const groundGradient = ctx.createLinearGradient(0, this.groundY - 20, 0, game.height);
    groundGradient.addColorStop(0, 'transparent');
    groundGradient.addColorStop(0.1, PALETTE.darkest);
    groundGradient.addColorStop(1, PALETTE.void);

    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, this.groundY - 20, game.width, game.height - this.groundY + 20);

    // Ground line (subtle)
    ctx.fillStyle = PALETTE.darker;
    ctx.fillRect(0, this.groundY, game.width, 3);
  }

  renderBioluminescence(ctx, game) {
    // Overall ambient glow that pulses
    const pulse = 0.7 + Math.sin(this.time * 0.5) * 0.3;

    const gradient = ctx.createRadialGradient(
      game.width / 2, this.groundY - 50, 0,
      game.width / 2, this.groundY - 50, game.width * 0.5
    );
    gradient.addColorStop(0, `rgba(90, 186, 90, ${this.ambientGlow * 0.1 * pulse})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.width, game.height);
  }

  renderStars(ctx, game) {
    // Stars fade in with evolution — the sky awakens
    const starAlpha = Math.max(0, (this.evolution - 0.1) * 1.2);
    if (starAlpha <= 0) return;

    this.stars.forEach(star => {
      const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;
      const alpha = starAlpha * star.brightness * twinkle;

      // Star glow (stage 3+)
      if (this.stage >= 3) {
        ctx.fillStyle = `rgba(170, 255, 170, ${alpha * 0.2})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Star core
      ctx.fillStyle = `rgba(170, 255, 170, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderMac(ctx, game) {
    const m = this.macBounds;
    const s = this.screenBounds;

    // === 3D CABINET PROJECTION ===
    // Depth recedes at 30 degrees up-right (consistent vanishing direction)
    const depth = m.height * 0.12;
    const depthX = depth * 0.866; // cos(30°)
    const depthY = depth * 0.5;   // sin(30°)

    // === 1. GROUND SHADOW ===
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(
      m.x + m.width / 2, m.y + m.height + 8,
      m.width * 0.1,
      m.x + m.width / 2, m.y + m.height + 8,
      m.width * 0.6
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(m.x + m.width / 2, m.y + m.height + 8, m.width * 0.55, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === 2. BACK EDGES (draw first, behind everything) ===
    // These create the illusion of depth by showing where the back of the box would be

    // === 3. RIGHT SIDE PANEL (visible depth - shadow side) ===
    ctx.beginPath();
    ctx.moveTo(m.x + m.width, m.y + 8);                           // Front top-right
    ctx.lineTo(m.x + m.width + depthX, m.y + 8 - depthY);         // Back top-right
    ctx.lineTo(m.x + m.width + depthX, m.y + m.height - 8 - depthY); // Back bottom-right
    ctx.lineTo(m.x + m.width, m.y + m.height - 8);                // Front bottom-right
    ctx.closePath();

    // Gradient from front (lighter) to back (darker)
    const sideGrad = ctx.createLinearGradient(
      m.x + m.width, m.y,
      m.x + m.width + depthX, m.y - depthY
    );
    sideGrad.addColorStop(0, '#c8c0b0');
    sideGrad.addColorStop(1, '#a8a090');
    ctx.fillStyle = sideGrad;
    ctx.fill();
    ctx.strokeStyle = '#706860';
    ctx.lineWidth = 1;
    ctx.stroke();

    // === 4. TOP PANEL (visible depth - lit side) ===
    ctx.beginPath();
    ctx.moveTo(m.x + 8, m.y);                                     // Front top-left
    ctx.lineTo(m.x + 8 + depthX, m.y - depthY);                   // Back top-left
    ctx.lineTo(m.x + m.width - 8 + depthX, m.y - depthY);         // Back top-right
    ctx.lineTo(m.x + m.width + depthX, m.y + 8 - depthY);         // Connect to side
    ctx.lineTo(m.x + m.width, m.y + 8);                           // Front top-right corner
    ctx.lineTo(m.x + m.width - 8, m.y);                           // Front top-right
    ctx.closePath();

    // Top catches light
    const topGrad = ctx.createLinearGradient(
      m.x, m.y,
      m.x + depthX, m.y - depthY
    );
    topGrad.addColorStop(0, '#f0e8d8');
    topGrad.addColorStop(1, '#e0d8c8');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = '#b0a898';
    ctx.lineWidth = 1;
    ctx.stroke();

    // === 5. FRONT FACE (main body) ===
    const bodyGrad = ctx.createLinearGradient(m.x, m.y, m.x, m.y + m.height);
    bodyGrad.addColorStop(0, '#f5ede0');
    bodyGrad.addColorStop(0.4, '#e8e0d0');
    bodyGrad.addColorStop(1, '#d8d0c0');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#504840';
    ctx.lineWidth = 2;
    this.roundRect(ctx, m.x, m.y, m.width, m.height, 8);
    ctx.fill();
    ctx.stroke();

    // Front face bevel highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x + 8, m.y + 2);
    ctx.lineTo(m.x + m.width - 8, m.y + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(m.x + 2, m.y + 8);
    ctx.lineTo(m.x + 2, m.y + m.height - 8);
    ctx.stroke();

    // Front face shadow edges
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x + 8, m.y + m.height - 2);
    ctx.lineTo(m.x + m.width - 8, m.y + m.height - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(m.x + m.width - 2, m.y + 8);
    ctx.lineTo(m.x + m.width - 2, m.y + m.height - 8);
    ctx.stroke();

    // === 6. SCREEN BEZEL (recessed) ===
    // Outer bezel (dark recess)
    ctx.fillStyle = '#0a0a0a';
    this.roundRect(ctx, s.x - 6, s.y - 6, s.width + 12, s.height + 12, 4);
    ctx.fill();

    // Bezel rim with 3D inset effect
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s.x - 5, s.y + s.height + 5);
    ctx.lineTo(s.x - 5, s.y - 5);
    ctx.lineTo(s.x + s.width + 5, s.y - 5);
    ctx.stroke();
    ctx.strokeStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(s.x + s.width + 5, s.y - 5);
    ctx.lineTo(s.x + s.width + 5, s.y + s.height + 5);
    ctx.lineTo(s.x - 5, s.y + s.height + 5);
    ctx.stroke();

    // === 7. CRT SCREEN ===
    ctx.fillStyle = '#0a150a';
    ctx.fillRect(s.x, s.y, s.width, s.height);

    // CRT glass curvature (darker at edges)
    const crtCurve = ctx.createRadialGradient(
      s.x + s.width / 2, s.y + s.height / 2, 0,
      s.x + s.width / 2, s.y + s.height / 2, s.width * 0.7
    );
    crtCurve.addColorStop(0, 'rgba(0,0,0,0)');
    crtCurve.addColorStop(0.6, 'rgba(0,0,0,0.05)');
    crtCurve.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = crtCurve;
    ctx.fillRect(s.x, s.y, s.width, s.height);

    // Glass reflection
    ctx.fillStyle = 'rgba(120, 180, 120, 0.04)';
    ctx.beginPath();
    ctx.ellipse(s.x + s.width * 0.3, s.y + s.height * 0.25, s.width * 0.4, s.height * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // === 8. PHOSPHOR GLOW ===
    const plantCount = this.garden ? this.garden.getMaturePlantCount() : 0;
    const gardenHealth = Math.min(1, plantCount / 6);
    const breath = Math.sin(this.time * 0.17) * 0.5 + 0.5;
    const glowIntensity = 0.03 + gardenHealth * 0.12 + (gardenHealth > 0.3 ? breath * 0.05 : 0);

    const glow = ctx.createRadialGradient(
      s.x + s.width / 2, s.y + s.height / 2, 0,
      s.x + s.width / 2, s.y + s.height / 2, s.width * 0.7
    );
    const warmth = 80 + gardenHealth * 40;
    glow.addColorStop(0, `rgba(${warmth}, ${150 + gardenHealth * 50}, ${warmth}, ${glowIntensity})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(s.x, s.y, s.width, s.height);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = s.y; y < s.y + s.height; y += 3) {
      ctx.fillRect(s.x, y, s.width, 1);
    }

    // === 9. CHIN AREA ===
    const chinY = s.y + s.height + 10;

    // Disk slot (3D inset)
    const slotWidth = m.width * 0.20;
    const slotX = m.x + m.width / 2 - slotWidth / 2;
    ctx.fillStyle = '#1a1a1a';
    this.roundRect(ctx, slotX, chinY + 12, slotWidth, 6, 2);
    ctx.fill();
    // Slot top edge shadow
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slotX + 2, chinY + 12);
    ctx.lineTo(slotX + slotWidth - 2, chinY + 12);
    ctx.stroke();
    // Slot bottom edge highlight
    ctx.strokeStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.moveTo(slotX + 2, chinY + 17);
    ctx.lineTo(slotX + slotWidth - 2, chinY + 17);
    ctx.stroke();

    // === 10. VENTS (3D grooves) ===
    const ventCount = 6;
    const ventSpacing = m.height * 0.015;
    const ventStartY = m.y + m.height * 0.05;

    for (let i = 0; i < ventCount; i++) {
      const vy = ventStartY + i * ventSpacing;

      // Left vents - shadow then highlight for groove effect
      ctx.strokeStyle = '#a09888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x + 6, vy);
      ctx.lineTo(m.x + 16, vy);
      ctx.stroke();
      ctx.strokeStyle = '#e8e0d0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(m.x + 6, vy + 2);
      ctx.lineTo(m.x + 16, vy + 2);
      ctx.stroke();

      // Right vents
      ctx.strokeStyle = '#a09888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x + m.width - 16, vy);
      ctx.lineTo(m.x + m.width - 6, vy);
      ctx.stroke();
      ctx.strokeStyle = '#e8e0d0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(m.x + m.width - 16, vy + 2);
      ctx.lineTo(m.x + m.width - 6, vy + 2);
      ctx.stroke();
    }

    // === 11. SCREEN LIGHT SPILL onto body ===
    if (gardenHealth > 0.2) {
      const spillGrad = ctx.createRadialGradient(
        s.x + s.width / 2, s.y + s.height, 0,
        s.x + s.width / 2, chinY + 40, s.width * 0.4
      );
      spillGrad.addColorStop(0, `rgba(100, 180, 100, ${0.08 * gardenHealth})`);
      spillGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = spillGrad;
      ctx.fillRect(m.x, s.y + s.height, m.width, m.height - (s.y + s.height - m.y));
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  onResize(game) {
    this.calculateBounds(game);
    this.groundY = game.height * 0.7;

    if (this.container) {
      const overlay = this.container.querySelector('#questionOverlay');
      if (overlay) {
        overlay.style.left = `${this.screenBounds.x + 8}px`;
        overlay.style.top = `${this.screenBounds.y + 8}px`;
        overlay.style.width = `${this.screenBounds.width - 16}px`;
        overlay.style.height = `${this.screenBounds.height - 16}px`;
      }
    }
  }

  injectStyles() {
    if (document.getElementById('calibration-mac-styles')) return;

    const style = document.createElement('style');
    style.id = 'calibration-mac-styles';
    style.textContent = `
      /* === CRT PHOSPHOR ANIMATIONS === */
      @keyframes crt-flicker {
        0%, 100% { opacity: 1; }
        92% { opacity: 0.98; }
        94% { opacity: 1; }
        97% { opacity: 0.96; }
      }

      @keyframes text-glow-pulse {
        0%, 100% {
          text-shadow:
            0 0 4px rgba(100, 255, 100, 0.8),
            0 0 8px rgba(100, 200, 100, 0.5),
            0 0 16px rgba(80, 180, 80, 0.3);
        }
        50% {
          text-shadow:
            0 0 6px rgba(100, 255, 100, 0.9),
            0 0 12px rgba(100, 200, 100, 0.6),
            0 0 20px rgba(80, 180, 80, 0.4);
        }
      }

      @keyframes option-scanline {
        0% { background-position: 0 0; }
        100% { background-position: 0 4px; }
      }

      .calibration-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .mac-question-overlay {
        position: absolute;
        display: flex;
        flex-direction: column;
        padding: 12px;
        pointer-events: auto;
        opacity: 0;
        transition: opacity 0.5s ease;
        font-family: 'VT323', 'Chicago', 'Courier New', monospace;
        animation: crt-flicker 4s infinite;
      }

      .mac-question-overlay.visible {
        opacity: 1;
      }

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(100, 200, 100, 0.2);
      }

      .question-progress {
        color: #5a5;
        font-size: 14px;
        letter-spacing: 0.1em;
        text-shadow: 0 0 6px rgba(100, 200, 100, 0.5);
      }

      .question-depth {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 2px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border: 1px solid currentColor;
      }

      .question-depth.depth-1 {
        background: rgba(100, 200, 100, 0.1);
        color: #6c6;
        border-color: rgba(100, 200, 100, 0.3);
      }
      .question-depth.depth-2 {
        background: rgba(100, 180, 200, 0.1);
        color: #6bc;
        border-color: rgba(100, 180, 200, 0.3);
      }
      .question-depth.depth-3 {
        background: rgba(180, 140, 200, 0.1);
        color: #b8a;
        border-color: rgba(180, 140, 200, 0.3);
      }
      .question-depth.depth-4 {
        background: rgba(200, 170, 100, 0.12);
        color: #ca8;
        border-color: rgba(200, 170, 100, 0.3);
      }

      .question-text {
        color: #7d7;
        font-size: 17px;
        line-height: 1.6;
        margin-bottom: 18px;
        letter-spacing: 0.02em;
        white-space: pre-line;
        animation: text-glow-pulse 3s ease-in-out infinite;
      }

      .question-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .mac-option {
        position: relative;
        background: rgba(20, 40, 20, 0.4);
        border: 1px solid #3a3;
        color: #5b5;
        padding: 12px 14px;
        font-family: 'VT323', 'Chicago', 'Courier New', monospace;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
        letter-spacing: 0.01em;
        text-shadow: 0 0 4px rgba(100, 200, 100, 0.3);
      }

      /* Scanline overlay on options */
      .mac-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.15) 2px,
          rgba(0, 0, 0, 0.15) 4px
        );
        pointer-events: none;
        opacity: 0.5;
      }

      .mac-option:hover {
        background: rgba(40, 80, 40, 0.5);
        border-color: #6c6;
        color: #8e8;
        text-shadow:
          0 0 6px rgba(100, 255, 100, 0.6),
          0 0 12px rgba(100, 200, 100, 0.4);
        box-shadow:
          0 0 10px rgba(100, 200, 100, 0.2),
          inset 0 0 20px rgba(100, 200, 100, 0.05);
      }

      .mac-option:active {
        background: rgba(60, 120, 60, 0.5);
        transform: scale(0.99);
        color: #afa;
      }
    `;

    document.head.appendChild(style);
  }
}
