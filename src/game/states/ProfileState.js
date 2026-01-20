/**
 * Profile State — The Translators v5
 *
 * DETERMINISTIC COGNITIVE PROFILE
 *
 * Display profile built from interview answers.
 * Export options: Markdown (with anchor), JSON, USDA (USD format)
 *
 * DETERMINISM: Same answers → Same profile → Same checksum
 * The checksum allows verification of profile integrity.
 */

import { DIALOGUE } from '../config/index.js';
import { TIMING } from '../config/timing.js';
import { ProfileGenerator } from '../systems/ProfileGenerator.js';
import { USDExporter } from '../systems/USDExporter.js';
import { renderProfile } from '../calibration/index.js';

export class ProfileState {
  constructor() {
    this.overlay = null;
    this.profile = null;
    this.cognitiveProfile = null;
    this.renderedCognitive = null;
  }

  enter(game) {
    // Use gameplay-derived profile from calibration
    if (game.calibrationProfile) {
      this.profile = game.calibrationProfile;
    } else {
      // Fallback: Generate from behavior tracker (legacy flow)
      this.profile = ProfileGenerator.generate(
        game.behavior,
        game.directDistance || game.height * 0.63
      );
    }

    // Extract and render cognitive profile if present
    if (this.profile.cognitive) {
      this.cognitiveProfile = this.profile.cognitive;
      try {
        this.renderedCognitive = renderProfile(this.cognitiveProfile);
      } catch (e) {
        console.warn('Failed to render cognitive profile:', e);
        this.renderedCognitive = null;
      }
    }

    this.createOverlay(game);
  }

  exit(game) {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
      setTimeout(() => this.overlay.remove(), 400);
    }
  }

  createOverlay(game) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';

    // Build traits HTML (all content is internally generated, not user input)
    const traitsHTML = this.buildTraitsHTML();
    const insightsHTML = this.buildInsightsHTML();
    const sourcesHTML = this.buildSourcesHTML();
    const cognitiveHTML = this.buildCognitiveHTML();

    this.overlay.innerHTML = `
      <div class="subtitle">${DIALOGUE.profile.subtitle}</div>
      <div class="title" style="font-size: 1.6rem; margin-top: 8px;">${DIALOGUE.profile.title}</div>

      <div class="profile-card">
        <div class="profile-section">
          <div class="section-title">${DIALOGUE.profile.patternsHeader}</div>
          <div class="traits-container">${traitsHTML}</div>
        </div>
        <div class="profile-section">
          <div class="section-title">${DIALOGUE.profile.insightsHeader}</div>
          <div class="insights-container">${insightsHTML}</div>
        </div>
        ${cognitiveHTML}
        ${sourcesHTML}
      </div>

      ${this.buildChecksumHTML()}

      <button class="btn" id="copyBtn" style="margin-top: 20px;">${DIALOGUE.ui.copyButton}</button>
      <div class="copy-msg" id="copyMsg">${DIALOGUE.ui.copySuccess}</div>

      <div class="export-options" style="margin-top: 16px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        <button class="btn small accent" id="copyAnchorBtn" title="Copy anchor for AI recognition">Copy Anchor</button>
        <button class="btn small" id="downloadMdBtn" title="Download Markdown with anchor">Markdown</button>
        <button class="btn small" id="downloadUsdaBtn" title="Download as USD (Universal Scene Description)">USDA</button>
        <button class="btn small" id="downloadJsonBtn" title="Download as JSON">JSON</button>
      </div>

      <button class="btn secondary" id="restartBtn" style="margin-top: 16px;">${DIALOGUE.ui.restartButton}</button>
    `;

    game.ui.appendChild(this.overlay);

    // Trigger reflow then add visible class
    this.overlay.offsetHeight;
    this.overlay.classList.add('visible');

    // Bind buttons
    this.overlay.querySelector('#copyBtn').onclick = () => this.copyProfile(game);
    this.overlay.querySelector('#copyAnchorBtn').onclick = () => this.copyAnchor();
    this.overlay.querySelector('#downloadMdBtn').onclick = () => this.downloadMarkdown();
    this.overlay.querySelector('#downloadUsdaBtn').onclick = () => this.downloadUSDA();
    this.overlay.querySelector('#downloadJsonBtn').onclick = () => this.downloadJSON();
    this.overlay.querySelector('#restartBtn').onclick = () => game.restart();
  }

  buildTraitsHTML() {
    const { traits } = this.profile;

    // Dynamic trait order based on what dimensions were measured
    const allDimensions = [
      { key: 'pace', name: 'Pace' },
      { key: 'thoroughness', name: 'Detail Preference' },
      { key: 'organization', name: 'Structure' },
      { key: 'exploration', name: 'Problem Solving' },
      { key: 'communication', name: 'Feedback Style' },
      { key: 'ambiguity', name: 'Uncertainty' },
      { key: 'rhythm', name: 'Conversation Rhythm' },
      { key: 'tangents', name: 'Tangents' }
    ];

    return allDimensions.map(t => {
      const trait = traits[t.key];
      if (!trait) return '';
      return `
        <div class="trait">
          <span class="trait-name">${t.name}</span>
          <span class="trait-value">${trait.label || 'Balanced'}</span>
        </div>
      `;
    }).join('');
  }

  buildInsightsHTML() {
    if (!this.profile.insights || this.profile.insights.length === 0) {
      return '<div class="insight">Your communication style adapts to context</div>';
    }
    return this.profile.insights.map(i => `
      <div class="insight">${i}</div>
    `).join('');
  }

  /**
   * Build visual signature display
   * The ambient graphics during calibration accumulated into a color/energy signature
   */
  buildSourcesHTML() {
    const signature = this.profile.visualSignature;

    if (signature) {
      const hue = signature.hue || 200;
      const energy = signature.energy || 0.3;
      const saturation = 60 + energy * 30;
      const lightness = 45 + energy * 20;

      return `
        <div class="profile-section signature-section">
          <div class="section-title" style="font-size: 0.85rem; color: var(--text-muted);">Your Visual Signature</div>
          <div class="signature-preview" style="
            background: linear-gradient(135deg,
              hsl(${hue - 20}, ${saturation}%, ${lightness}%) 0%,
              hsl(${hue}, ${saturation}%, ${lightness + 10}%) 50%,
              hsl(${hue + 20}, ${saturation}%, ${lightness}%) 100%
            );
            height: 40px;
            border-radius: 8px;
            margin-top: 8px;
          "></div>
          <div class="signature-desc" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; font-style: italic;">
            ${energy > 0.6 ? 'Warm and energetic' : energy < 0.4 ? 'Cool and contemplative' : 'Balanced and adaptive'}
          </div>
        </div>
      `;
    }

    return '';
  }

  /**
   * Build cognitive profile insights display
   * Shows empowering insights from deep cognitive profiling
   */
  buildCognitiveHTML() {
    if (!this.renderedCognitive || !this.renderedCognitive.sections.length) {
      return '';
    }

    const { sections, emergentInsights, completeness } = this.renderedCognitive;

    let html = `
      <div class="profile-section cognitive-section" style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        <div class="section-title" style="font-size: 1rem; color: var(--accent); margin-bottom: 12px;">
          Cognitive Insights
          <span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 8px;">
            ${completeness.percentage}% explored
          </span>
        </div>
    `;

    // Render top 3 domain sections (most confident)
    const topSections = sections.slice(0, 3);
    for (const section of topSections) {
      html += `
        <div class="cognitive-domain" style="margin-bottom: 16px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text);">${section.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
            ${this.truncateText(section.description, 150)}
          </div>
      `;

      // Show "explains" bullets
      if (section.explains && section.explains.length > 0) {
        html += `<div style="margin-top: 8px;">`;
        html += `<div style="font-size: 0.7rem; color: var(--accent); margin-bottom: 4px;">This explains:</div>`;
        const topExplains = section.explains.slice(0, 2);
        for (const explain of topExplains) {
          html += `<div style="font-size: 0.7rem; color: var(--text-muted); padding-left: 8px;">• ${explain}</div>`;
        }
        html += `</div>`;
      }

      html += `</div>`;
    }

    // Render emergent patterns (the big insights)
    if (emergentInsights && emergentInsights.length > 0) {
      html += `
        <div class="emergent-patterns" style="margin-top: 12px; padding: 12px; background: linear-gradient(135deg, rgba(92,255,219,0.1), rgba(150,100,255,0.1)); border-radius: 8px; border: 1px solid rgba(92,255,219,0.2);">
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--accent); margin-bottom: 8px;">Pattern Recognition</div>
      `;

      for (const insight of emergentInsights.slice(0, 2)) {
        const strength = Math.round(insight.strength * 100);
        html += `
          <div style="margin-bottom: 8px;">
            <div style="font-size: 0.75rem; font-weight: 500; color: var(--text);">
              ${insight.title}
              <span style="font-size: 0.65rem; color: var(--text-muted);">(${strength}% signal)</span>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; line-height: 1.4;">
              ${this.truncateText(insight.description, 120)}
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    // Show remaining sections count
    if (sections.length > 3) {
      html += `
        <div style="font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 8px; font-style: italic;">
          +${sections.length - 3} more domains explored • Export for full profile
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Build checksum and anchor display
   * Shows the deterministic verification info
   */
  buildChecksumHTML() {
    const { checksum, anchor, confidence } = this.profile;

    if (!checksum) return '';

    const confidencePercent = Math.round((confidence || 0.85) * 100);

    return `
      <div class="profile-section checksum-section" style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
        <div class="section-title" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Profile Integrity</div>
        <div style="font-family: 'SF Mono', 'Consolas', monospace; font-size: 0.7rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">Checksum:</span>
            <span style="color: var(--accent);">${checksum}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">Anchor:</span>
            <span style="color: var(--accent); word-break: break-all;">${anchor}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Confidence:</span>
            <span style="color: var(--accent);">${confidencePercent}%</span>
          </div>
        </div>
        <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 8px; font-style: italic;">
          Same answers will always produce this exact checksum
        </div>
      </div>
    `;
  }

  copyProfile(game) {
    try {
      const markdown = this.generateMarkdown();

      navigator.clipboard.writeText(markdown).then(() => {
        const copyMsg = this.overlay.querySelector('#copyMsg');
        copyMsg.classList.add('visible');
        setTimeout(() => {
          copyMsg.classList.remove('visible');
        }, TIMING.profile.copyMessageDuration);
      }).catch(err => {
        console.error('Failed to copy:', err);
        this.showCopyMessage('Copy failed. Try download.');
      });
    } catch (err) {
      console.error('Profile error:', err);
      this.showCopyMessage('Profile error. Try restart.');
    }
  }

  /**
   * Copy just the anchor for quick AI integration
   */
  copyAnchor() {
    if (!this.profile?.anchor) {
      this.showCopyMessage('No anchor available');
      return;
    }

    navigator.clipboard.writeText(this.profile.anchor).then(() => {
      this.showCopyMessage('Anchor copied!');
    }).catch(err => {
      console.error('Failed to copy anchor:', err);
      this.showCopyMessage('Copy failed');
    });
  }

  /**
   * Generate markdown from profile
   * Uses USDExporter for proper anchor embedding
   */
  generateMarkdown() {
    // Use USDExporter for consistent, anchored output
    return USDExporter.toMarkdown(this.profile, {
      includeUSDA: false, // Markdown-only version
      title: 'Communication Preferences'
    });
  }

  /**
   * Generate full markdown with embedded USDA
   * Uses combined export when cognitive profile is available
   */
  generateFullMarkdown() {
    if (this.cognitiveProfile) {
      return USDExporter.toFullProfile(this.profile, {
        includeUSDA: true,
        title: 'Cognitive Profile'
      });
    }
    return USDExporter.toMarkdown(this.profile, {
      includeUSDA: true,
      title: 'Cognitive Profile'
    });
  }

  /**
   * Download profile as Markdown file with anchor
   */
  downloadMarkdown() {
    try {
      const markdown = this.generateFullMarkdown();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `cognitive_profile_${this.profile.checksum || 'export'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showCopyMessage('Downloaded!');
    } catch (err) {
      console.error('Markdown export failed:', err);
      this.showCopyMessage('Export failed. Check console.');
    }
  }

  /**
   * Download profile as USDA (Universal Scene Description)
   * Compatible with CLAUDE.md Cognitive Substrate
   * Includes cognitive profile when available
   */
  downloadUSDA() {
    try {
      let usda = USDExporter.toUSDA(this.profile, {
        includeRaw: true,
        referencePath: '/CognitiveSubstrate/Profile'
      });

      // Append cognitive profile if available
      if (this.cognitiveProfile) {
        usda += '\n\n# ═══════════════════════════════════════════════════════════════\n';
        usda += '# DEEP COGNITIVE PROFILE\n';
        usda += '# ═══════════════════════════════════════════════════════════════\n\n';
        usda += USDExporter.toCognitiveUSDA(this.cognitiveProfile, {
          includeRaw: true,
          referencePath: '/CognitiveSubstrate/CognitiveProfile'
        });
      }

      const blob = new Blob([usda], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `translators_profile_${this.profile.checksum || 'export'}.usda`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showCopyMessage('USDA Downloaded!');
    } catch (err) {
      console.error('USDA export failed:', err);
      this.showCopyMessage('Export failed. Check console.');
    }
  }

  /**
   * Download profile as JSON file
   * Includes cognitive profile when available
   */
  downloadJSON() {
    try {
      // Include JSON-LD format for semantic web compatibility
      const jsonLD = USDExporter.toJSONLD(this.profile);

      // Add cognitive profile if available
      if (this.cognitiveProfile) {
        jsonLD.cognitiveProfile = USDExporter.toCognitiveJSONLD(this.cognitiveProfile);
      }

      const json = JSON.stringify(jsonLD, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `cognitive_profile_${this.profile.checksum || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showCopyMessage('JSON Downloaded!');
    } catch (err) {
      console.error('JSON export failed:', err);
      this.showCopyMessage('Export failed. Check console.');
    }
  }

  /**
   * Show brief success message
   * @param {string} message - Custom message to display
   */
  showCopyMessage(message = 'Downloaded!') {
    const copyMsg = this.overlay.querySelector('#copyMsg');
    copyMsg.textContent = message;
    copyMsg.classList.add('visible');
    setTimeout(() => {
      copyMsg.classList.remove('visible');
      copyMsg.textContent = DIALOGUE.ui.copySuccess;
    }, TIMING.profile.copyMessageDuration);
  }

  update(game, dt) {
    // No updates needed
  }

  render(game, ctx) {
    // Background rendered by Renderer.clear()
  }
}
