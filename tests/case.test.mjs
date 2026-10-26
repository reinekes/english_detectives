import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASE, PEOPLE, CLUES, WORDS, DEDUCTIONS } from '../dist/case-data.js';
import { createState, record, collectClue, askQuestion, solveDeduction, canAccuse, accuse, restoreState, exportJournal } from '../dist/engine.js';

function readyCase() {
  const state = createState();
  state.started = true;
  for (const id of ['cup', 'telegram', 'ledger', 'letter']) collectClue(state, id);
  for (const deduction of DEDUCTIONS) solveDeduction(state, deduction, deduction.answerId);
  return state;
}

test('current case references resolve to unique evidence, people, words and deduction options', () => {
  for (const [name, entries] of Object.entries({ PEOPLE, CLUES, WORDS, DEDUCTIONS })) {
    assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length, `${name} has duplicate IDs`);
    assert.ok(entries.every(entry => typeof entry.id === 'string' && entry.id), `${name} has an empty ID`);
  }
  assert.equal(CLUES.length, 6);
  assert.equal(PEOPLE.length, 4);
  assert.equal(DEDUCTIONS.length, 3);
  const clueIds = new Set(CLUES.map(clue => clue.id));
  const wordIds = new Set(WORDS.map(word => word.id));
  assert.ok(PEOPLE.some(person => person.id === CASE.culpritId));
  assert.deepEqual([...CASE.requiredClues].sort(), ['cup', 'ledger', 'telegram']);
  for (const id of [...CASE.initialClues, ...CASE.requiredClues]) assert.ok(clueIds.has(id), `Unknown case clue ${id}`);
  for (const id of CASE.requiredDeductions) assert.ok(DEDUCTIONS.some(deduction => deduction.id === id), `Unknown deduction ${id}`);
  assert.equal(new Set(CASE.requiredDeductions).size, 3);
  for (const clue of CLUES) {
    assert.ok(clue.location && clue.detail && clue.detailRu, `Incomplete evidence ${clue.id}`);
    for (const id of clue.wordIds) assert.ok(wordIds.has(id), `Unknown word ${id} in ${clue.id}`);
  }
  for (const person of PEOPLE) {
    assert.equal(new Set(person.questions.map(question => question.id)).size, person.questions.length, `Duplicate question for ${person.id}`);
    for (const question of person.questions) {
      assert.ok(question.text && question.answer && question.answerRu, `Incomplete question ${question.id}`);
      for (const id of question.unlocks) assert.ok(clueIds.has(id), `Unknown unlock ${id}`);
    }
  }
  for (const deduction of DEDUCTIONS) {
    assert.ok(deduction.requires.length > 0, `${deduction.id} has no evidence prerequisite`);
    for (const id of deduction.requires) assert.ok(clueIds.has(id), `Unknown prerequisite ${id}`);
    assert.equal(new Set(deduction.options.map(option => option.id)).size, deduction.options.length, `Duplicate option in ${deduction.id}`);
    assert.equal(deduction.options.filter(option => option.id === deduction.answerId).length, 1, `Missing correct option in ${deduction.id}`);
  }
});

test('current interview routes discover the intended evidence only once', () => {
  for (const [personId, questionId, expectedClue] of [
    ['reed', 'reed-alibi', 'telegram'],
    ['eleanor', 'eleanor-accounts', 'ledger'],
    ['mercer', 'mercer-death', 'cup']
  ]) {
    const state = createState();
    const question = PEOPLE.find(person => person.id === personId).questions.find(question => question.id === questionId);
    askQuestion(state, personId, question);
    askQuestion(state, personId, question);
    assert.deepEqual(state.clues, [expectedClue]);
    assert.deepEqual(state.questions, [`${personId}:${questionId}`]);
    assert.equal(state.events.filter(event => event.type === 'question').length, 1);
    assert.equal(state.events.filter(event => event.type === 'clue').length, 1);
  }
});

test('the shortest legitimate solution requires the letter and reaches the correct verdict', () => {
  const state = createState();
  for (const id of ['cup', 'telegram', 'ledger']) collectClue(state, id);
  assert.equal(solveDeduction(state, DEDUCTIONS.find(deduction => deduction.id === 'poisoned-cup'), 'cup'), 'correct');
  assert.equal(solveDeduction(state, DEDUCTIONS.find(deduction => deduction.id === 'false-alibi'), 'reed-study'), 'correct');
  const motive = DEDUCTIONS.find(deduction => deduction.id === 'missing-money');
  assert.equal(solveDeduction(state, motive, 'reed-theft'), 'locked');
  assert.equal(canAccuse(state, CASE), false);
  assert.equal(accuse(state, CASE, 'reed', ['cup', 'ledger', 'telegram']), 'locked');
  collectClue(state, 'letter');
  assert.equal(solveDeduction(state, motive, 'reed-theft'), 'correct');
  assert.equal(canAccuse(state, CASE), true);
  assert.equal(accuse(state, CASE, 'reed', ['cup', 'ledger', 'telegram']), 'correct');
  assert.equal(state.outcome, 'correct');
  assert.deepEqual(state.clues, ['cup', 'telegram', 'ledger', 'letter']);
  assert.equal(state.questions.length, 0);
});

test('a wrong suspect preserves the investigation for a corrected accusation', () => {
  const state = readyCase();
  state.words = ['alibi', 'motive'];
  state.notes = 'Compare the receipt with the station story.';
  const before = { clues:[...state.clues], deductions:[...state.deductions], words:[...state.words], notes:state.notes };
  assert.equal(accuse(state, CASE, 'eleanor', ['cup', 'ledger', 'telegram']), 'incorrect');
  assert.equal(state.outcome, 'incorrect');
  for (const [key, expected] of Object.entries(before)) assert.deepEqual(state[key], expected, `${key} changed after a rejected accusation`);
  assert.equal(canAccuse(state, CASE), true);
  assert.equal(accuse(state, CASE, 'reed', ['cup', 'ledger', 'telegram']), 'correct');
  assert.equal(state.events.filter(event => event.type === 'accusation').length, 2);
  assert.match(state.events.at(-2).text, /eleanor.*incorrect/);
  assert.match(state.events.at(-1).text, /reed.*correct/);
});

test('a discovered but irrelevant exhibit cannot replace the three proof exhibits', () => {
  const state = readyCase();
  collectClue(state, 'watch');
  assert.equal(accuse(state, CASE, 'reed', ['cup', 'ledger', 'watch']), 'incorrect');
  assert.equal(accuse(state, CASE, 'reed', ['cup', 'cup', 'telegram']), 'invalid');
  assert.equal(accuse(state, CASE, 'reed', ['cup', 'ledger', 'telegram']), 'correct');
});

test('a real completed case round-trips with notes, vocabulary, settings and event history', () => {
  const state = readyCase();
  const person = PEOPLE.find(person => person.id === 'finch');
  askQuestion(state, person.id, person.questions.find(question => question.id === 'finch-alibi'));
  state.words = ['witness', 'receipt'];
  state.notes = 'Расписка contradicts the alibi.\nCheck the timeline.';
  state.translate = true;
  state.view = 'notebook';
  state.person = 'finch';
  accuse(state, CASE, 'reed', ['cup', 'ledger', 'telegram']);
  const restored = restoreState(JSON.stringify(state));
  assert.deepEqual(restored, state);
  assert.equal(canAccuse(restored, CASE), true);
  assert.equal(restored.outcome, 'correct');
});

test('malformed saved field values cannot corrupt a restored investigation', () => {
  const state = readyCase();
  state.clues.push('cup', null, 17);
  state.questions = ['reed:reed-alibi', 'reed:reed-alibi', {}];
  state.words = ['receipt', 'receipt', false];
  state.events.push(null, {at:'now', type:'clue'}, {at:1, type:'clue', text:'bad timestamp type'});
  state.notes = {};
  state.view = 'unknown-view';
  state.outcome = 'unrecognized-result';
  const restored = restoreState(JSON.stringify(state));
  assert.deepEqual(restored.clues, ['cup', 'telegram', 'ledger', 'letter']);
  assert.deepEqual(restored.questions, ['reed:reed-alibi']);
  assert.deepEqual(restored.words, ['receipt']);
  assert.equal(restored.notes, '');
  assert.equal(restored.view, 'case');
  assert.equal(restored.outcome, null);
  assert.equal(restored.events.length, 7);
  assert.equal(canAccuse(restored, CASE), true);
});

test('vocabulary available before investigating does not identify the culprit', () => {
  for (const word of WORDS) {
    assert.doesNotMatch(`${word.definition} ${word.example}`, /\b(?:Arthur|Reed)\b/i, `${word.id} reveals culprit-specific evidence`);
  }
});

test('legacy journal events regain consecutive sequence numbers before new actions', () => {
  const state = createState();
  state.events = [
    { at:'2026-10-23T10:00:00.000Z', type:'start', text:'Started the case.' },
    null,
    { seq:99, at:'2026-10-23T10:00:01.000Z', type:'clue', text:'Evidence discovered: cup' }
  ];
  const restored = restoreState(JSON.stringify(state));
  record(restored, 'navigation', 'Opened the evidence board.');
  assert.deepEqual(restored.events.map(event => event.seq), [1, 2, 3]);
  assert.equal(restored.events[1].text, 'Evidence discovered: cup');
  assert.ok(!Number.isNaN(Date.parse(restored.events[2].at)));
});

test('case journal exports numbered chronological events without changing progress', () => {
  const state = createState();
  record(state, 'start', 'Started the investigation.');
  collectClue(state, 'letter');
  state.notes = 'Read the missing first line carefully.';
  const before = JSON.stringify(state);
  const journal = exportJournal(state);
  assert.match(journal, /Case: The Last Letter — The Ashford Affair/);
  assert.match(journal, /Evidence: 1\/6/);
  assert.match(journal, /^1\. .* \| start \| Started the investigation\.$/m);
  assert.match(journal, /^2\. .* \| clue \| Evidence discovered: letter$/m);
  assert.ok(journal.indexOf('1. ') < journal.indexOf('2. '));
  assert.match(journal, /Read the missing first line carefully\./);
  assert.equal(JSON.stringify(state), before);
});
