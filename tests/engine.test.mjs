import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, collectClue, askQuestion, solveDeduction, canAccuse, accuse, restoreState, exportJournal } from '../dist/engine.js';

const caseData = { id: 'test-case', culpritId: 'reed', requiredClues: ['cup','ledger','telegram'], requiredDeductions: ['time','motive','access'] };
test('collecting the same clue twice is idempotent', () => {
  const s = createState();
  collectClue(s, 'cup'); collectClue(s, 'cup');
  assert.deepEqual(s.clues, ['cup']);
  assert.equal(s.events.filter(e => e.type === 'clue').length, 1);
});
test('question records are unique and unlock new evidence once', () => {
  const s = createState();
  askQuestion(s, 'reed', { id:'alibi', unlocks:['telegram'] });
  askQuestion(s, 'reed', { id:'alibi', unlocks:['telegram'] });
  assert.equal(s.questions.length, 1); assert.deepEqual(s.clues, ['telegram']);
});
test('wrong deductions never complete a deduction and locked deductions cannot be solved', () => {
  const s = createState();
  const d = { id:'time', requires:['cup'], answerId:'correct' };
  assert.equal(solveDeduction(s, d, 'correct'), 'locked');
  collectClue(s, 'cup');
  assert.equal(solveDeduction(s, d, 'wrong'), 'incorrect');
  assert.equal(s.deductions.length, 0);
  assert.equal(solveDeduction(s, d, 'correct'), 'correct');
  assert.deepEqual(s.deductions, ['time']);
});
test('final judgement requires discovered evidence and all reasoning', () => {
  const s = createState();
  assert.equal(canAccuse(s, caseData), false);
  assert.equal(accuse(s, caseData, 'reed', caseData.requiredClues), 'locked');
  s.clues = [...caseData.requiredClues]; s.deductions = [...caseData.requiredDeductions];
  assert.equal(canAccuse(s, caseData), true);
  assert.equal(accuse(s, caseData, 'reed', ['cup','ledger','unseen']), 'invalid');
  assert.equal(accuse(s, caseData, 'eleanor', caseData.requiredClues), 'incorrect');
  assert.equal(accuse(s, caseData, 'reed', ['cup','ledger']), 'invalid');
  assert.equal(accuse(s, caseData, 'reed', caseData.requiredClues), 'correct');
});
test('corrupt and stale saves recover to valid state', () => {
  for (const input of ['bad-json','null','[]','{"version":0}', '{"version":1,"clues":"broken"}']) {
    const s = restoreState(input);
    assert.ok(Array.isArray(s.clues)); assert.equal(s.version, 1);
  }
  const s = createState(); s.clues = ['cup']; s.notes = 'My theory';
  assert.deepEqual(restoreState(JSON.stringify(s)).clues, ['cup']);
  assert.equal(restoreState(JSON.stringify(s)).notes, 'My theory');
});
test('Markdown export includes evidence timeline and personal notes', () => {
  const s = createState(); collectClue(s, 'cup'); s.notes = 'A contradiction.';
  const md = exportJournal(s);
  assert.match(md, /cup/); assert.match(md, /A contradiction/); assert.match(md, /Baker Street/);
});
