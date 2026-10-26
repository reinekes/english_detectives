export const STORAGE_KEY = 'baker-street:v1';
export function createState() {
  return { version:1, started:false, clues:[], questions:[], deductions:[], words:[], notes:'', events:[], outcome:null, translate:false, view:'case', person:'reed' };
}
export function record(state, type, text) {
  state.events.push({ seq:state.events.length+1, at:new Date().toISOString(), type, text });
}
export function collectClue(state, id) {
  if (!state.clues.includes(id)) { state.clues.push(id); record(state, 'clue', `Evidence discovered: ${id}`); return true; }
  return false;
}
export function askQuestion(state, personId, question) {
  const key = `${personId}:${question.id}`;
  if (!state.questions.includes(key)) {
    state.questions.push(key); record(state, 'question', `${personId}: ${question.text || question.id}`);
    for (const id of question.unlocks || []) collectClue(state, id);
  }
}
export function solveDeduction(state, deduction, optionId) {
  if (!deduction.requires.every(id => state.clues.includes(id))) return 'locked';
  const correct = optionId === deduction.answerId;
  record(state, 'deduction', `${deduction.title || deduction.id}: ${optionId} — ${correct ? 'correct' : 'try again'}`);
  if (correct && !state.deductions.includes(deduction.id)) state.deductions.push(deduction.id);
  return correct ? 'correct' : 'incorrect';
}
export function canAccuse(state, data) {
  return data.requiredClues.every(id => state.clues.includes(id)) && data.requiredDeductions.every(id => state.deductions.includes(id));
}
export function accuse(state, data, personId, evidenceIds) {
  if (!canAccuse(state, data)) return 'locked';
  if (new Set(evidenceIds).size !== data.requiredClues.length || evidenceIds.length !== data.requiredClues.length || evidenceIds.some(id => !state.clues.includes(id))) return 'invalid';
  const correct = personId === data.culpritId && data.requiredClues.every(id => evidenceIds.includes(id));
  state.outcome = correct ? 'correct' : 'incorrect';
  record(state, 'accusation', `${personId}; evidence: ${evidenceIds.join(', ')} — ${state.outcome}`);
  return state.outcome;
}
export function restoreState(raw) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || ['clues','questions','deductions','words','events'].some(k => !Array.isArray(s[k]))) return createState();
    const clean = createState();
    for (const key of ['clues','questions','deductions','words']) clean[key] = [...new Set(s[key].filter(v => typeof v === 'string'))];
    clean.events = s.events.filter(e => e && typeof e.at === 'string' && typeof e.type === 'string' && typeof e.text === 'string').map((e,i)=>({...e,seq:i+1}));
    clean.notes = typeof s.notes === 'string' ? s.notes : '';
    clean.started = s.started === true; clean.translate = s.translate === true;
    clean.outcome = ['correct','incorrect'].includes(s.outcome) ? s.outcome : null;
    clean.view = ['case','locations','people','board','notebook'].includes(s.view) ? s.view : 'case';
    clean.person = typeof s.person === 'string' ? s.person : 'reed';
    return clean;
  } catch { return createState(); }
}
export function exportJournal(state) {
  return `# Baker Street — Investigation journal\n\nCase: The Last Letter — The Ashford Affair\nExported: ${new Date().toISOString()}\n\n## Progress\n\nEvidence: ${state.clues.length}/6\nDeductions: ${state.deductions.length}/3\nSaved words: ${state.words.length}\nResult: ${state.outcome || 'in progress'}\n\n## Timeline\n\n${state.events.map((e,i) => `${i+1}. ${e.at} | ${e.type} | ${e.text.replaceAll('\n',' ')}`).join('\n') || 'No actions yet.'}\n\n## Personal notes\n\n${state.notes || 'No notes yet.'}\n`;
}
