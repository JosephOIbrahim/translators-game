/**
 * Determinism Test for The Translators Profile Engine
 *
 * This test verifies that:
 * 1. Same answers → Same traits
 * 2. Same traits → Same checksum
 * 3. Same checksum → Verified integrity
 *
 * Run with: node test-determinism.js
 */

// Import the engine (ESM)
import { DeterministicProfileEngine, DIMENSION_CONFIG } from './src/game/systems/DeterministicProfileEngine.js';
import { USDExporter } from './src/game/systems/USDExporter.js';

// Test answers - simulates a complete interview
const TEST_ANSWERS = {
  pace: { value: 'fast', trait: 0.2, dimension: 'pace', depth: 1 },
  detail: { value: 'overview', trait: 0.3, dimension: 'thoroughness', depth: 1 },
  structure: { value: 'structured', trait: 0.8, dimension: 'organization', depth: 2 },
  exploration: { value: 'divergent', trait: 0.9, dimension: 'exploration', depth: 2 },
  feedback: { value: 'direct', trait: 0.2, dimension: 'communication', depth: 3 },
  uncertainty: { value: 'thorough', trait: 0.8, dimension: 'ambiguity', depth: 3 },
  silence: { value: 'comfortable', trait: 0.8, dimension: 'rhythm', depth: 4 },
  tangent: { value: 'embrace', trait: 0.9, dimension: 'tangents', depth: 4 }
};

console.log('='.repeat(60));
console.log('THE TRANSLATORS — Determinism Test');
console.log('='.repeat(60));
console.log('');

// Test 1: Profile generation determinism
console.log('TEST 1: Profile Generation Determinism');
console.log('-'.repeat(40));

const profile1 = DeterministicProfileEngine.buildProfile(TEST_ANSWERS);
const profile2 = DeterministicProfileEngine.buildProfile(TEST_ANSWERS);
const profile3 = DeterministicProfileEngine.buildProfile(TEST_ANSWERS);

console.log(`Profile 1 checksum: ${profile1.checksum}`);
console.log(`Profile 2 checksum: ${profile2.checksum}`);
console.log(`Profile 3 checksum: ${profile3.checksum}`);

const checksumMatch = profile1.checksum === profile2.checksum && profile2.checksum === profile3.checksum;
console.log(`\nChecksums match: ${checksumMatch ? '✓ PASS' : '✗ FAIL'}`);
console.log('');

// Test 2: Trait computation determinism
console.log('TEST 2: Trait Computation Determinism');
console.log('-'.repeat(40));

const traits1 = DeterministicProfileEngine.computeTraits(TEST_ANSWERS);
const traits2 = DeterministicProfileEngine.computeTraits(TEST_ANSWERS);

let traitMatch = true;
Object.keys(traits1).forEach(dim => {
  const match = traits1[dim].value === traits2[dim].value && traits1[dim].label === traits2[dim].label;
  if (!match) traitMatch = false;
  console.log(`${dim}: ${traits1[dim].value} (${traits1[dim].label}) ${match ? '✓' : '✗'}`);
});

console.log(`\nTraits deterministic: ${traitMatch ? '✓ PASS' : '✗ FAIL'}`);
console.log('');

// Test 3: Integrity verification
console.log('TEST 3: Integrity Verification');
console.log('-'.repeat(40));

const verified = DeterministicProfileEngine.verifyIntegrity(profile1);
console.log(`Profile integrity verified: ${verified ? '✓ PASS' : '✗ FAIL'}`);

// Tamper with profile and verify detection
const tamperedProfile = JSON.parse(JSON.stringify(profile1));
tamperedProfile.traits.pace.value = 0.99; // Tamper!
const tamperedVerified = DeterministicProfileEngine.verifyIntegrity(tamperedProfile);
console.log(`Tampered profile detected: ${!tamperedVerified ? '✓ PASS' : '✗ FAIL'}`);
console.log('');

// Test 4: Insight generation determinism
console.log('TEST 4: Insight Generation Determinism');
console.log('-'.repeat(40));

const insights1 = DeterministicProfileEngine.generateInsights(traits1);
const insights2 = DeterministicProfileEngine.generateInsights(traits2);

const insightsMatch = JSON.stringify(insights1) === JSON.stringify(insights2);
console.log(`Insights: ${insights1.length} items`);
insights1.forEach((insight, i) => console.log(`  ${i + 1}. ${insight}`));
console.log(`\nInsights deterministic: ${insightsMatch ? '✓ PASS' : '✗ FAIL'}`);
console.log('');

// Test 5: Export format generation
console.log('TEST 5: Export Formats');
console.log('-'.repeat(40));

const markdown = USDExporter.toMarkdown(profile1, { includeUSDA: false });
const usda = USDExporter.toUSDA(profile1);
const jsonLD = USDExporter.toJSONLD(profile1);

console.log(`Markdown length: ${markdown.length} chars`);
console.log(`USDA length: ${usda.length} chars`);
console.log(`JSON-LD keys: ${Object.keys(jsonLD).join(', ')}`);
console.log(`\nAnchor in markdown: ${markdown.includes(profile1.anchor) ? '✓ PASS' : '✗ FAIL'}`);
console.log(`Checksum in USDA: ${usda.includes(profile1.checksum) ? '✓ PASS' : '✗ FAIL'}`);
console.log('');

// Summary
console.log('='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));

const allPassed = checksumMatch && traitMatch && verified && !tamperedVerified && insightsMatch;
console.log(`\nAll tests: ${allPassed ? '✓ PASSED' : '✗ SOME FAILED'}`);
console.log(`\nProfile anchor: ${profile1.anchor}`);
console.log(`Profile checksum: ${profile1.checksum}`);
console.log('');

// Output sample USDA
console.log('='.repeat(60));
console.log('SAMPLE USDA OUTPUT');
console.log('='.repeat(60));
console.log(usda.slice(0, 800) + '\n...\n');

// Output JSON-LD
console.log('='.repeat(60));
console.log('SAMPLE JSON-LD OUTPUT');
console.log('='.repeat(60));
console.log(JSON.stringify(jsonLD, null, 2).slice(0, 600) + '\n...\n');

process.exit(allPassed ? 0 : 1);
