import { CASE, PEOPLE, CLUES, WORDS, DEDUCTIONS } from './case-data.js';
import { STORAGE_KEY, createState, record, collectClue, askQuestion, solveDeduction, canAccuse, accuse, restoreState, exportJournal } from './engine.js';

const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const toastElement = document.querySelector('#toast');
let storageAvailable = true;
let saved = null;
try { saved = localStorage.getItem(STORAGE_KEY); } catch { storageAvailable = false; }
let state = saved ? restoreState(saved) : createState();
if(state.started) record(state,'resume','Resumed The Last Letter from this browser’s saved progress.');
const safeIds = { clues:CLUES, words:WORDS, deductions:DEDUCTIONS };
for (const [key, data] of Object.entries(safeIds)) state[key] = state[key].filter(id => data.some(item => item.id === id));
if (!PEOPLE.some(p => p.id === state.person)) state.person = PEOPLE[0].id;
let toastTimer, currentModalRenderer = null, modalStack = [], audioContext = null, ambientOn = false, lastModalOpener = null, lastRecordedNotes = state.notes;
const portraitPositions = { reed:'0%', eleanor:'33.333%', finch:'66.667%', mercer:'100%' };
const iconPaths = {
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  case:'<path d="M4 5h6l2 3h8v12H4z"/><path d="M4 8h8M8 12h8M8 16h5"/>',
  people:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
  board:'<rect x="3" y="3" width="18" height="15" rx="1"/><path d="M8 22l4-4 4 4M7 8h4v4H7zM16 7v6M11 10h5"/>',
  notebook:'<path d="M5 3h15v18H5zM2 7h6M2 12h6M2 17h6M11 7h5M11 11h5M11 15h3"/>',
  location:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2.5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book:'<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1v15"/>',
  sound:'<path d="M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14"/>',
  mute:'<path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1-1 2M12 17h.01"/>',
  settings:'<path d="m10 3-.5 3-2 .9-2.5-1L3 9l2.5 1.8v2.4L3 15l2 3.1 2.5-1 2 .9.5 3h4l.5-3 2-.9 2.5 1 2-3.1-2.5-1.8v-2.4L21 9l-2-3.1-2.5 1-2-.9L14 3z"/><circle cx="12" cy="12" r="3"/>',
  check:'<path d="m5 12 4 4L20 5"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  letter:'<path d="M4 4h16v16H4zM4 5l8 7 8-7M4 20l6-8M20 20l-6-8"/>',
  cup:'<path d="M5 7h12v6a6 6 0 0 1-12 0zM17 8h2a3 3 0 0 1 0 6h-2M3 21h17M8 3v1M13 2v2"/>',
  watch:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 2v3M12 8v5l3 2M18 6l2-2"/>',
  ledger:'<path d="M5 3h15v18H5zM8 3v18M11 7h6M11 11h6M11 15h6M11 18h3"/>',
  telegram:'<path d="M3 4h18v16H3zM6 7h7M6 11h12M6 14h12M6 17h7M17 6v2"/>',
  thread:'<path d="M8 4h8v3H8zM8 17h8v3H8zM9 7v10M15 7v10M9 9h6M9 12h6M9 15h6M15 16c5 0 7 4 3 6"/>',
  feather:'<path d="M4 21 18 7M8 17l-1-5c-1-6 6-10 14-10 0 8-4 15-10 14zM12 10h5"/>',
  diamond:'<path d="m12 2 9 10-9 10L3 12zM3 12h18M12 2l4 10-4 10-4-10z"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v3a5 5 0 0 0 5 5M17 5h4v3a5 5 0 0 1-5 5M12 14v5M7 22h10M9 19h6v3"/>',
  translate:'<path d="M3 5h12M9 2v3M5 5c0 5 4 8 8 10M13 5c0 5-4 8-8 10M14 21l4-11 4 11M16 17h4"/>',
  reset:'<path d="M4 9a8 8 0 1 1 0 7M4 3v6h6"/>',
};
const icon = (name, cls='') => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${iconPaths[name] || iconPaths.search}</svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const regexEscape = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const wordPattern = new RegExp(`\\b(${WORDS.map(w => regexEscape(w.word)).sort((a,b)=>b.length-a.length).join('|')})\\b`, 'gi');
function wordify(text) { return esc(text).replace(wordPattern, match => { const w = WORDS.find(w => w.word.toLowerCase() === match.toLowerCase()); return w ? `<button class="word-link" data-act="word" data-id="${w.id}" aria-label="Meaning of ${esc(match)}">${match}</button>` : match; }); }
const portrait = (p, cls='') => `<div class="portrait ${cls}" style="--position:${portraitPositions[p.id]}" role="img" aria-label="Portrait of ${esc(p.name)}"></div>`;
const clueById = id => CLUES.find(c => c.id === id);
const hasClue = id => state.clues.includes(id);
const percent = () => state.outcome==='correct'?100:Math.round((state.clues.length + state.deductions.length + Math.min(state.questions.length,12)/4)/13*100);
function toast(text) { toastElement.textContent = text; toastElement.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>toastElement.classList.remove('show'),3000); }
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { if(storageAvailable) toast('Storage is unavailable. Export your journal to keep your notes.'); storageAvailable=false; } }
function findEquivalent(element) { if(!element?.dataset)return null;return [...app.querySelectorAll('button,a')].find(el=>el.dataset.act===element.dataset.act && el.dataset.id===element.dataset.id && el.dataset.view===element.dataset.view); }
function saveAndRender() { const focused=document.activeElement;persist();render();if(!modal.open)findEquivalent(focused)?.focus({preventScroll:true}); }
function navigate(view) { if(state.view!==view)record(state,'navigation',`Opened ${view==='case'?'the investigation':view==='board'?'the evidence board':view}.`);state.view = view; persist(); render();window.scrollTo({top:0,behavior:'instant'});const h=app.querySelector('.content h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});} }
function commitNotes() { if(state.notes!==lastRecordedNotes){record(state,'note',state.notes?`Working theory: ${state.notes}`:'Cleared the working theory.');lastRecordedNotes=state.notes;persist();} }
function startCase() {
  if (!state.started) { state.started = true; record(state,'start','Opened The Last Letter — the investigation begins.'); persist(); briefing(); }
  else navigate('locations');
}
function sidebar() {
  const nav = [ ['case','case','The investigation',''], ['locations','location','Locations','3'], ['people','people','Suspects',`${PEOPLE.length}`], ['board','board','Evidence board',`${state.clues.length}`], ['notebook','notebook','My notebook',`${state.words.length}`] ];
  return `<aside class="sidebar" id="sidebar"><a class="brand" href="#case" data-view="case" aria-label="Baker Street home"><div class="brand-mark">${icon('search')}</div><div class="brand-name">BAKER STREET</div><small>ENGLISH DETECTIVE CLUB</small></a><p class="nav-label">YOUR DESK</p><nav class="nav" aria-label="Main navigation">${nav.map(([id,i,label,count])=>`<button class="nav-button ${state.view===id?'active':''}" data-view="${id}" ${state.view===id?'aria-current="page"':''}>${icon(i)}<span>${label}</span>${count!==''?`<span class="nav-count">${count}</span>`:''}</button>`).join('')}</nav><div class="side-bottom"><div class="quote">“The smallest detail can change the whole story.”<cite>THE DETECTIVE’S MINDSET</cite></div><div class="profile"><div class="profile-avatar">${icon('feather')}</div><div><strong>${state.outcome==='correct'?'Consulting detective':'Apprentice detective'}</strong><span>${state.outcome==='correct'?'First case solved':`${state.words.length} words collected`}</span></div></div></div></aside><div class="mobile-overlay" data-act="menu-close"></div>`;
}
function render() {
  const view = {case:overview,locations:locations,people:people,board:board,notebook:notebook}[state.view] || overview;
  app.innerHTML = `<div class="shell">${sidebar()}<main class="main"><header class="topbar"><button class="menu-toggle" data-act="menu" aria-label="Open navigation">${icon('menu')}</button><span class="mobile-brand">Baker Street</span><div class="breadcrumb"><span>THE CASE FILES</span><span>/</span><b>CASE NO. 001</b></div><div class="top-actions"><span class="level-pill">B1 · Intermediate</span><button class="top-icon" data-act="audio" title="${ambientOn?'Turn ambience off':'Turn ambience on'}" aria-label="${ambientOn?'Turn ambience off':'Turn ambience on'}" aria-pressed="${ambientOn}">${icon(ambientOn?'sound':'mute')}</button><button class="top-icon help-btn" data-act="help" aria-label="How to play">${icon('help')}</button><button class="top-icon" data-act="settings" aria-label="Settings">${icon('settings')}</button></div></header><div class="content">${view()}<footer class="bottom-note"><span>${icon('book')} A little English. A little mystery. A sharper mind.</span><span>${storageAvailable?'Progress saved on this device':'Session only · export your journal'}</span></footer></div></main></div>`;
}
function overview() {
  const nextChapter = state.clues.length<4 ? ['CHAPTER 01','A most unusual evening','A letter left unfinished. A life cut short. Step inside Ashford House and find what everyone else missed.','Visit the crime scene','locations'] : state.questions.length<5 ? ['CHAPTER 02','Everyone has a story','Four people. Four versions of the evening. Listen carefully: the truth hides between their words.','Question the suspects','people'] : ['CHAPTER 03','The facts never lie','You have the evidence. Now connect the facts and put your theory to the test.','Make your deductions','board'];
  return `<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><div class="eyebrow">SHERLOCK HOLMES · AN ORIGINAL MYSTERY</div><h1 id="hero-title">The Last<br><em>Letter.</em></h1><p>A quiet house. An unfinished letter.<br>And four people with something to hide.</p><button class="primary" data-act="${state.outcome==='correct'?'result':'start'}">${state.outcome==='correct'?'Review your case':state.started?'Continue investigation':'Begin investigation'} ${icon('arrow')}</button></div><div class="hero-bottom"><span>${icon('clock')} 20–30 min</span><span>${icon('people')} 4 suspects</span><span>${icon('search')} 6 clues</span></div><div class="hero-stamp">LONDON, NOVEMBER 1891<b>The Ashford Affair</b></div></section>
  <div class="dashboard"><div><div class="section-heading"><div><h2>Your next chapter</h2><p>Every discovery brings you closer.</p></div><span class="micro">${state.outcome==='correct'?'CASE CLOSED':'IN PROGRESS'}</span></div><article class="story-card"><div class="story-visual" aria-hidden="true"></div><div class="chapter-content"><div class="chapter-card-title"><span class="dot"></span><span class="micro">${nextChapter[0]}</span></div><h3>${nextChapter[1]}</h3><p>${nextChapter[2]}</p><button class="ghost" data-view="${nextChapter[4]}">${nextChapter[3]} ${icon('arrow')}</button></div></article><div class="progress-card">${icon('diamond')}<div class="progress-text"><div class="progress-top"><span>Investigation progress</span><b>${Math.min(percent(),100)}%</b></div><div class="track"><div style="width:${Math.min(percent(),100)}%"></div></div></div><span class="micro">${state.clues.length}/6 CLUES</span></div></div><div><div class="section-heading people-heading"><div><h2>Persons of interest</h2><p>Everyone knows more than they say.</p></div><button class="ghost" data-view="people">View all ${icon('arrow')}</button></div><div class="people-card">${PEOPLE.map(p=>`<button class="suspect-row" data-act="person" data-id="${p.id}">${portrait(p)}<div class="person-copy"><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span></div>${state.questions.some(q=>q.startsWith(`${p.id}:`))?`<span class="status-dot" title="Questioned"></span>`:icon('chevron')}</button>`).join('')}</div></div></div>
  <div class="section-heading"><div><h2>Small details. Big discoveries.</h2><p>Look closer. Something doesn’t quite add up.</p></div><button class="ghost" data-view="board">Evidence board ${icon('arrow')}</button></div><div class="clue-grid">${['letter','cup','watch'].map(id=>{const c=clueById(id);return `<button class="clue-card ${hasClue(id)?'':'locked'}" data-act="clue" data-id="${id}"><div class="clue-object">${icon(id)}</div><div class="clue-copy"><h3>${esc(c.title)}</h3><p>${esc(c.location)}</p><span class="micro">${hasClue(id)?'✓ ADDED TO EVIDENCE':'EXAMINE THE OBJECT'}</span></div>${icon(hasClue(id)?'check':'search')}</button>`;}).join('')}</div>`;
}
const LOCATIONS = [
  {id:'study',name:'The study',label:'ASHFORD HOUSE',description:'The fire is low. A cold cup sits beside a letter that will never be finished.',clues:['letter','cup'],pos:'78%'},
  {id:'hall',name:'The entrance hall',label:'ASHFORD HOUSE',description:'A stopped watch. A loose thread. Even a quiet hallway has a story to tell.',clues:['watch','thread'],pos:'47%'},
  {id:'station',name:'Scotland Yard',label:'THE POLICE RECORDS',description:'Receipts and accounts are waiting in the inspector’s office. Paper remembers.',clues:['telegram','ledger'],pos:'20%'},
];
function locations() {
  return `<div class="page-intro"><div class="eyebrow">CHAPTER 01 · EXAMINE THE SCENE</div><h1>Leave no detail unnoticed.</h1><p>Visit each location and examine the objects. Read carefully — an ordinary detail may change everything.</p></div><div class="location-grid">${LOCATIONS.map(l=>`<article class="location-card"><div class="location-scene" style="--scene-pos:${l.pos}"><span>${l.label}</span></div><div class="location-body"><h2>${l.name}</h2><p>${l.description}</p>${l.clues.map(id=>`<button class="inspect-target" data-act="clue" data-id="${id}" data-location="${l.id}">${icon(id)}<span>${esc(clueById(id).title)}</span><span class="target-status">${hasClue(id)?'✓ Found':'Inspect →'}</span></button>`).join('')}</div></article>`).join('')}</div><div class="helper-strip">${icon('book')}<span>You don’t need to know every word. Click an <button class="word-link" data-act="word" data-id="evidence">underlined word</button> to discover its meaning, or use the Russian translation. Stay curious.</span></div><div class="section-heading"><h2>The next lead</h2><button class="outline" data-view="people">Meet the suspects ${icon('arrow')}</button></div>`;
}
function people() {
  const p=PEOPLE.find(p=>p.id===state.person)||PEOPLE[0];
  return `<div class="page-intro"><div class="eyebrow">CHAPTER 02 · HEAR THEIR STORIES</div><h1>Someone isn’t telling the truth.</h1><p>Ask questions. Listen to the answers. Compare what people say with what the evidence shows.</p></div><div class="interview-layout"><div class="people-list">${PEOPLE.map(p=>`<button class="person-select ${state.person===p.id?'selected':''}" data-act="person" data-id="${p.id}">${portrait(p)}<div class="person-copy"><strong>${esc(p.name)}</strong><span>${p.questions.filter(q=>state.questions.includes(`${p.id}:${q.id}`)).length}/3 questions asked</span></div></button>`).join('')}</div><article class="interview"><header class="interview-header">${portrait(p)}<div><div class="eyebrow">${esc(p.role)}</div><h2>${esc(p.name)}</h2><p>${wordify(p.description)}</p>${state.translate?`<p class="translation">${esc(p.descriptionRu)}</p>`:''}</div></header><div class="interview-body"><div class="micro">YOUR QUESTIONS</div>${p.questions.map((q,i)=>{const asked=state.questions.includes(`${p.id}:${q.id}`);return `<button class="question ${asked?'asked':''}" data-act="ask" data-id="${q.id}"><span>${String(i+1).padStart(2,'0')} &nbsp; ${esc(q.text)}</span>${icon(asked?'check':'arrow')}</button>${asked?`<div class="answer">${wordify(q.answer)}${state.translate?`<div class="translation">${esc(q.answerRu)}</div>`:''}<div class="answer-actions"><button class="ghost" data-act="question-translate" data-id="${q.id}">${icon('translate')} ${state.translate?'Hide Russian':'Show Russian'}</button><button class="ghost" data-act="speak-question" data-id="${q.id}">${icon('sound')} Listen</button></div></div>`:''}`;}).join('')}</div></article></div><div class="section-heading"><span class="language-tip">${icon('book')} ${state.questions.length}/12 questions explored</span><button class="outline" data-view="board">Connect the evidence ${icon('arrow')}</button></div>`;
}
function board() {
  return `<div class="board-top"><div class="page-intro"><div class="eyebrow">CHAPTER 03 · CONNECT THE FACTS</div><h1>Build your case.</h1><p>A good detective follows the evidence. Find the connections, then make your accusation.</p></div><span class="level-pill">${state.clues.length}/6 evidence collected</span></div><div class="board-clues">${CLUES.map((c,i)=>`<button class="evidence-paper ${hasClue(c.id)?'':'missing'}" style="--tilt:${[.6,-.8,1,-.6,.7,-1][i]}deg" data-act="${hasClue(c.id)?'clue':'missing'}" data-id="${c.id}"><span class="micro">EXHIBIT ${String(i+1).padStart(2,'0')} · ${hasClue(c.id)?'COLLECTED':'UNDISCOVERED'}</span><div class="clue-object">${icon(hasClue(c.id)?c.id:'lock')}</div><h3>${hasClue(c.id)?esc(c.title):'A missing piece'}</h3><p>${hasClue(c.id)?esc(c.description):`Search ${esc(c.location)} to find this evidence.`}</p></button>`).join('')}</div><div class="section-heading"><div><h2>Follow the chain of reasoning</h2><p>Three deductions stand between a suspicion and the truth.</p></div><span class="micro">${state.deductions.length}/3 SOLVED</span></div><div class="deductions">${DEDUCTIONS.map((d,i)=>{const solved=state.deductions.includes(d.id),ready=d.requires.every(hasClue);return `<article class="deduction-card ${solved?'solved':''}"><span class="micro">DEDUCTION 0${i+1} ${solved?'· COMPLETE':''}</span><h3>${esc(d.title)}</h3><p>${solved?'The evidence supports your reasoning.':ready?'You have the evidence. What does it tell you?':`Find: ${d.requires.filter(id=>!hasClue(id)).map(id=>clueById(id).title).join(', ')}.`}</p><button class="outline" data-act="deduction" data-id="${d.id}" ${ready?'':'disabled'}>${solved?'Review':ready?'Connect':'Locked'} ${icon(solved?'check':ready?'arrow':'lock')}</button></article>`;}).join('')}</div><div class="accuse-banner"><div><div class="micro">THE FINAL QUESTION</div><h2>Who silenced the last letter?</h2><p>${canAccuse(state,CASE)?'Choose a suspect. Support your accusation with three pieces of evidence.':'Collect the evidence and complete all three deductions to present your case.'}</p></div><button class="primary" data-act="${state.outcome?'result':'accuse'}" ${canAccuse(state,CASE)?'':'disabled'}>${state.outcome?'Review verdict':'Make an accusation'} ${icon(canAccuse(state,CASE)?'arrow':'lock')}</button></div>`;
}
function notebook() {
  const words=WORDS.filter(w=>state.words.includes(w.id));
  return `<div class="page-intro"><div class="eyebrow">YOUR PERSONAL CASEBOOK</div><h1>A detective always takes notes.</h1><p>Keep your theories in English. Collect useful words. Build the habit of thinking like a detective.</p></div><div class="notebook-grid"><div><section class="panel"><h2>My working theory</h2><p>Try: “I suspect … because …” or “This contradicts …”</p><textarea id="notes" aria-label="My investigation notes" placeholder="I noticed that…&#10;&#10;The evidence suggests…&#10;&#10;I suspect… because…">${esc(state.notes)}</textarea><div class="notes-footer"><span id="notes-status">${storageAvailable?'Saved on this device':'Session only'}</span><button class="ghost" data-act="save-notes">Save a journal entry ${icon('feather')}</button></div></section><section class="panel" style="margin-top:22px"><div class="section-heading no-margin"><h2>Investigation journal</h2><button class="ghost" data-act="export">Export .md ${icon('download')}</button></div><p style="margin-top:10px">Every lead, question and discovery — in one timeline.</p><div class="journal-list">${state.events.length?state.events.slice().reverse().map(e=>`<div class="journal-item"><small>#${e.seq} · ${new Date(e.at).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${esc(e.type.toUpperCase())}</small>${esc(e.text)}</div>`).join(''):'<p class="empty">Your first discovery will start the story.</p>'}</div></section></div><section class="panel"><div class="section-heading no-margin"><h2>My word collection</h2><span class="level-pill">${words.length} words</span></div><p style="margin-top:10px">Words from your investigation, with meaning and context.</p>${words.length?words.map(w=>`<div class="vocab-row saved">${icon('check')}<div><strong>${esc(w.word)}</strong><small>${esc(w.phonetic)}</small><p>${esc(w.translation)}</p></div><button class="ghost" data-act="word" data-id="${w.id}">Review ${icon('arrow')}</button></div>`).join(''):'<div class="empty">Click underlined words while you investigate, then save them here.</div>'}<div class="intro-divider"></div><div class="micro">WORDS TO GET YOU STARTED</div>${WORDS.filter(w=>!state.words.includes(w.id)).slice(0,4).map(w=>`<div class="vocab-row"><div><strong>${esc(w.word)}</strong><p>${esc(w.definition)}</p></div><button class="ghost" data-act="word" data-id="${w.id}" aria-label="Learn ${esc(w.word)}">${icon('arrow')}</button></div>`).join('')}</section></div>`;
}
function showModal(body, renderer=null, nested=false) {
  if(!modal.open)lastModalOpener=document.activeElement;
  if(nested && modal.open && currentModalRenderer) modalStack.push(currentModalRenderer);
  else if(!modal.open) modalStack=[];
  currentModalRenderer=renderer;
  modal.innerHTML=`<div class="modal-top"><span class="eyebrow">BAKER STREET · CASE 001</span><button class="close" data-act="modal-close" aria-label="${modalStack.length?'Back':'Close dialog'}">${icon('close')}</button></div><div class="modal-content">${body}</div>`;
  if(!modal.open) modal.showModal();
  modal.scrollTop=0;
  const title=modal.querySelector('#dialog-title');
  if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
}
function closeModal() { if(modalStack.length){const previous=modalStack.pop();const retained=modalStack.slice();previous();modalStack=retained;} else {modal.close();currentModalRenderer=null;} }
function briefing() {
  showModal(`<div class="eyebrow">A MESSAGE FROM 221B BAKER STREET</div><h2 id="dialog-title">The game is afoot.</h2><p>${wordify(CASE.briefing)}</p>${state.translate?`<div class="translation">${esc(CASE.briefingRu)}</div>`:''}<div class="modal-actions"><button class="ghost" data-act="briefing-translate">${icon('translate')} ${state.translate?'Hide Russian':'Show Russian'}</button><button class="primary" data-act="enter">Enter Ashford House ${icon('arrow')}</button></div>`,briefing);
}
function inspectClue(id,location) {
  const c=clueById(id);if(!c)return;
  if(!state.started){state.started=true;record(state,'start','Began investigating The Last Letter.');}
  if(location) record(state,'location',`Examined ${LOCATIONS.find(l=>l.id===location)?.name || location}.`);
  const isNew=collectClue(state,id);if(!isNew)record(state,'inspect',`Re-examined ${c.title}.`);saveAndRender();
  if(isNew) toast('Evidence added to your caseboard');
  renderClue(id);
}
function renderClue(id) {
  const c=clueById(id);
  showModal(`<div class="modal-meta"><span>${esc(c.type).toUpperCase()} · EVIDENCE ${String(CLUES.indexOf(c)+1).padStart(2,'0')}</span><span>✓ IN YOUR CASEBOARD</span></div><div class="modal-object">${icon(id)}</div><h2 id="dialog-title">${esc(c.title)}</h2><p>${wordify(c.detail)}</p>${state.translate?`<div class="translation">${esc(c.detailRu)}</div>`:''}<div class="modal-words">${c.wordIds.map(id=>{const w=WORDS.find(w=>w.id===id);return w?`<button class="word-chip" data-act="word" data-id="${id}">${esc(w.word)} +</button>`:'';}).join('')}</div><div class="modal-actions"><button class="ghost" data-act="clue-translate" data-id="${id}">${icon('translate')} ${state.translate?'Hide Russian':'Show Russian'}</button><button class="ghost" data-act="speak-clue" data-id="${id}">${icon('sound')} Listen</button><button class="outline" data-act="clue-done">Keep investigating ${icon('arrow')}</button></div>`,()=>renderClue(id));
}
function showWord(id) {
  const w=WORDS.find(w=>w.id===id);if(!w)return;
  renderWord(id,modal.open);
}
function renderWord(id,nested=false) {
  const w=WORDS.find(w=>w.id===id);if(!w)return;
  showModal(`<div class="eyebrow">A WORD WORTH KEEPING</div><h2 id="dialog-title">${esc(w.word)}</h2><p style="color:var(--gold);margin-top:-10px">${esc(w.phonetic)} · ${esc(w.translation)}</p><div class="intro-divider"></div><p>${esc(w.definition)}</p><h3>In context</h3><p style="font-family:var(--serif);font-size:20px">“${esc(w.example)}”</p><div class="modal-actions"><button class="ghost" data-act="speak-word" data-id="${id}">${icon('sound')} Listen & repeat</button><button class="${state.words.includes(id)?'outline':'primary'}" data-act="${state.words.includes(id)?'remove-word':'save-word'}" data-id="${id}">${state.words.includes(id)?'Remove from notebook':'Save to my notebook'} ${icon(state.words.includes(id)?'close':'notebook')}</button></div>`,()=>renderWord(id,false),nested);
}
function deductionModal(id,feedback='') {
  const d=DEDUCTIONS.find(d=>d.id===id);if(!d || !d.requires.every(hasClue))return;
  const solved=state.deductions.includes(id);
  showModal(`<div class="eyebrow">DEDUCTION 0${DEDUCTIONS.indexOf(d)+1} · ${solved?'SOLVED':'FOLLOW THE EVIDENCE'}</div><h2 id="dialog-title">${esc(d.title)}</h2><p>${wordify(d.prompt)}</p><div class="modal-words">${d.requires.map(id=>`<button class="word-chip" data-act="reference-clue" data-id="${id}">${icon('case')} ${esc(clueById(id).title)}</button>`).join('')}</div>${solved?`<div class="feedback">${icon('check')} ${wordify(d.explanation)}${state.translate?`<div class="translation">${esc(d.explanationRu)}</div>`:''}</div><div class="modal-actions"><button class="ghost" data-act="deduction-translate" data-id="${id}">${icon('translate')} ${state.translate?'Hide Russian':'Show Russian'}</button><button class="primary" data-act="deduction-done">${state.deductions.length===3?'Ready to present your case':'Back to the board'} ${icon('arrow')}</button></div>`:d.options.map((o,i)=>`<button class="option" data-act="answer-deduction" data-deduction="${id}" data-id="${o.id}"><span>${'ABC'[i]}.</span><span>${esc(o.text)}</span></button>`).join('')}${feedback?`<div class="feedback error" role="status">${esc(feedback)}</div>`:''}`,()=>deductionModal(id));
}
function accusationModal() {
  if(!canAccuse(state,CASE)){toast('Complete all three deductions first.');return;}
  showModal(`<div class="eyebrow">PRESENT YOUR CASE</div><h2 id="dialog-title">Make every fact count.</h2><p>Who killed Sir Edmund Ashford? Choose a suspect and the <strong>three pieces of evidence</strong> that prove the method, opportunity and motive.</p><form id="accusation-form" style="margin-top:20px"><label class="form-label" for="suspect-choice">I accuse…</label><select id="suspect-choice" name="suspect" required><option value="" disabled selected>Choose a suspect</option>${PEOPLE.map(p=>`<option value="${p.id}">${esc(p.name)} · ${esc(p.role)}</option>`).join('')}</select><fieldset style="padding:0;border:0;margin:0"><legend class="form-label">My three key pieces of evidence</legend>${CLUES.filter(c=>hasClue(c.id)).map(c=>`<label class="check-evidence"><input type="checkbox" name="evidence" value="${c.id}"> ${esc(c.title)}</label>`).join('')}</fieldset><div id="accusation-feedback" role="status"></div><div class="modal-actions"><span class="language-tip">Make your case. The evidence decides.</span><button class="primary" type="submit">Confirm accusation ${icon('arrow')}</button></div></form>`,accusationModal);
}
function showResult() {
  if(!state.outcome)return;
  const won=state.outcome==='correct';
  showModal(`<div class="result-medal">${icon(won?'trophy':'search')}</div><div class="result-heading"><div class="eyebrow">${won?'CASE CLOSED · WELL DEDUCED':'THE CASE REMAINS OPEN'}</div><h2 id="dialog-title">${won?'Elementary, detective.':'A theory isn’t proof.'}</h2></div><p>${won?wordify(CASE.explanation):'Lestrade cannot accept this accusation. Your suspect or your chosen evidence does not establish the method, opportunity and motive. An innocent person could pay for a mistake. Revisit the statements and try again.'}</p>${state.translate?`<div class="translation">${won?esc(CASE.explanationRu):'Лестрейд не может принять это обвинение. Выбранный подозреваемый или набор улик не доказывают способ, возможность и мотив. Вернитесь к показаниям и попробуйте снова.'}</div>`:''}<div class="result-stats"><div><b>${state.clues.length}/6</b>Clues discovered</div><div><b>${state.questions.length}/12</b>Questions explored</div><div><b>${state.words.length}</b>Words collected</div></div><div class="modal-actions"><button class="ghost" data-act="result-translate">${icon('translate')} ${state.translate?'Hide Russian':'Show Russian'}</button><button class="ghost" data-act="export">${icon('download')} Case journal</button><button class="primary" data-act="${won?'result-notebook':'reopen'}">${won?'Your detective notebook':'Reopen the case'} ${icon('arrow')}</button></div>`,showResult);
}
function help() {
  showModal(`<div class="eyebrow">LESS STUDYING. MORE DISCOVERING.</div><h2 id="dialog-title">Learn English.<br>Think like a detective.</h2><p>Это полноценное небольшое расследование на английском. Читайте, задавайте вопросы, замечайте противоречия — и постепенно начинайте думать на английском.</p><div class="welcome-steps"><div class="welcome-step"><span class="step-number">1</span><div><h3>Explore & read</h3><p>Осмотрите шесть предметов в трёх локациях. Всё важное попадёт на доску улик.</p></div></div><div class="welcome-step"><span class="step-number">2</span><div><h3>Ask & compare</h3><p>Допросите четырёх подозреваемых. Сравнивайте их ответы с документами.</p></div></div><div class="welcome-step"><span class="step-number">3</span><div><h3>Connect & accuse</h3><p>Решите три логические задачи. Затем выберите виновного и три ключевые улики.</p></div></div></div><div class="intro-divider"></div><p>Нажимайте подчёркнутые слова, слушайте английскую речь и сохраняйте слова в блокнот. Перевод доступен по кнопке <strong>Show Russian</strong>. Звук необязателен. Прогресс сохраняется в этом браузере.</p><div class="modal-actions"><button class="ghost" data-act="settings">${icon('settings')} Learning settings</button><button class="primary" data-act="help-done">Let’s investigate ${icon('arrow')}</button></div>`,help);
}
function settings() {
  showModal(`<div class="eyebrow">MAKE YOURSELF AT HOME</div><h2 id="dialog-title">Your detective desk.</h2><label class="switch-line"><div><strong>Russian translations</strong><p>Show Russian alongside English when reading evidence and answers.</p></div><input id="translation-setting" type="checkbox" ${state.translate?'checked':''}></label><div class="switch-line"><div><strong>Sound & narration</strong><p>Ambience starts only when you turn it on. “Listen” uses your browser’s English voice.</p></div><button class="outline" data-act="audio">${icon(ambientOn?'sound':'mute')} ${ambientOn?'On':'Off'}</button></div><div class="switch-line"><div><strong>Your progress</strong><p>${storageAvailable?'Saved locally in this browser.':'Browser storage is unavailable; keep this tab open and export your journal.'} Export a Markdown copy any time.</p></div><button class="ghost" data-act="export">${icon('download')} Export</button></div><div class="modal-actions"><button class="ghost" data-act="confirm-reset">${icon('reset')} Start this case again</button><button class="primary" data-act="close-all">Back to the case ${icon('arrow')}</button></div>`,settings);
}
function confirmReset() {
  showModal(`<div class="eyebrow">A FRESH PAIR OF EYES</div><h2 id="dialog-title">Start the case again?</h2><p>This clears the evidence, notes, word collection and timeline saved on this device. You can export your journal first.</p><div class="modal-actions"><button class="ghost" data-act="export">${icon('download')} Export my journal</button><button class="outline" data-act="settings">Keep my progress</button><button class="primary" data-act="reset">Start again</button></div>`,confirmReset);
}
function speak(text) {
  if(!('speechSynthesis' in window)){toast('Narration is unavailable in this browser. You can still read everything.');return;}
  speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=.87;
  const voice=speechSynthesis.getVoices().find(v=>v.lang==='en-GB') || speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(voice)utterance.voice=voice;
  utterance.onerror=()=>toast('This voice is unavailable. Try another browser for narration.');speechSynthesis.speak(utterance);
}
async function toggleAudio() {
  try {
    if(ambientOn){await audioContext.suspend();ambientOn=false;}
    else {
      if(!audioContext){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('Audio unavailable');audioContext=new AudioCtx();const buffer=audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate);const channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=Math.random()*2-1;const noise=audioContext.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;const gain=audioContext.createGain();gain.gain.value=.055;noise.connect(filter).connect(gain).connect(audioContext.destination);noise.start();}
      await audioContext.resume();ambientOn=true;
    }
    record(state,'settings',`Ambient sound ${ambientOn?'enabled':'disabled'}.`);persist();render();if(modal.open && currentModalRenderer===settings)settings();toast(ambientOn?'Rain on the windows. Ambience on.':'Ambience off.');
  } catch {toast('Ambience is unavailable in this browser.');}
}
function downloadJournal() {
  const humanReadable=exportJournal(state)+`\n## Evidence key\n\n${CLUES.map(c=>`- ${c.id}: ${c.title}`).join('\n')}\n\n## Saved words\n\n${WORDS.filter(w=>state.words.includes(w.id)).map(w=>`- **${w.word}** — ${w.translation}. ${w.example}`).join('\n')}\n`;
  const blob=new Blob([humanReadable],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='baker-street-investigation.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your case journal has been exported.');
}
function toggleTranslate(renderer) {state.translate=!state.translate;record(state,'settings',`Russian translations ${state.translate?'enabled':'disabled'}.`);persist();render();renderer?.();}
function handleClick(event) {
  const el=event.target.closest('button,a,[data-act]');if(!el)return;
  if(el.dataset.view){event.preventDefault();navigate(el.dataset.view);return;}
  const action=el.dataset.act,id=el.dataset.id;
  switch(action){
    case 'start':startCase();break;
    case 'enter':modal.close();navigate('locations');break;
    case 'person':state.person=id;navigate('people');break;
    case 'clue':inspectClue(id,el.dataset.location);break;
    case 'reference-clue':{const previous=currentModalRenderer;renderClue(id);modalStack.push(previous);break;}
    case 'missing':navigate('locations');toast('Follow the location hints to discover this piece.');break;
    case 'clue-done':case 'close-all':case 'help-done':modal.close();currentModalRenderer=null;modalStack=[];break;
    case 'modal-close':closeModal();break;
    case 'ask':{const p=PEOPLE.find(p=>p.id===state.person),q=p.questions.find(q=>q.id===id);const before=state.clues.length;if(!state.started){state.started=true;record(state,'start','Began investigating The Last Letter.');}askQuestion(state,p.id,q);saveAndRender();if(state.clues.length>before)toast('A new lead has been added to your evidence board.');break;}
    case 'question-translate':toggleTranslate();break;
    case 'clue-translate':toggleTranslate(()=>renderClue(id));break;
    case 'briefing-translate':toggleTranslate(briefing);break;
    case 'word':showWord(id);break;
    case 'save-word':if(!state.words.includes(id)){state.words.push(id);record(state,'word',`Saved word: ${WORDS.find(w=>w.id===id).word}`);saveAndRender();}renderWord(id,false);break;
    case 'remove-word':state.words=state.words.filter(wordId=>wordId!==id);record(state,'word',`Removed word: ${WORDS.find(w=>w.id===id).word}`);saveAndRender();renderWord(id,false);break;
    case 'speak-question':speak(PEOPLE.find(p=>p.id===state.person).questions.find(q=>q.id===id).answer);break;
    case 'speak-clue':speak(clueById(id).detail);break;
    case 'speak-word':{const w=WORDS.find(w=>w.id===id);speak(`${w.word}. ${w.definition}. ${w.example}`);break;}
    case 'deduction':deductionModal(id);break;
    case 'answer-deduction':{const d=DEDUCTIONS.find(d=>d.id===el.dataset.deduction);const result=solveDeduction(state,d,id);saveAndRender();deductionModal(d.id,result==='incorrect'?'That doesn’t follow from the evidence. Read the exhibits again and try another explanation.':'');break;}
    case 'deduction-translate':toggleTranslate(()=>deductionModal(id));break;
    case 'deduction-done':modal.close();navigate('board');break;
    case 'accuse':accusationModal();break;
    case 'result':showResult();break;
    case 'result-translate':toggleTranslate(showResult);break;
    case 'reopen':state.outcome=null;record(state,'reopen','Reopened the case to reconsider the accusation.');modal.close();navigate('board');break;
    case 'result-notebook':modal.close();navigate('notebook');break;
    case 'save-notes':commitNotes();saveAndRender();toast('Theory saved in your investigation journal.');break;
    case 'export':downloadJournal();break;
    case 'audio':toggleAudio();break;
    case 'help':help();break;
    case 'settings':settings();break;
    case 'confirm-reset':confirmReset();break;
    case 'reset':state=createState();persist();modal.close();render();toast('A fresh case. Good luck, detective.');break;
    case 'menu':document.querySelector('#sidebar').classList.toggle('open');document.querySelector('.mobile-overlay').classList.toggle('open');break;
    case 'menu-close':document.querySelector('#sidebar').classList.remove('open');document.querySelector('.mobile-overlay').classList.remove('open');break;
  }
}
document.addEventListener('click',handleClick);
document.addEventListener('input',event=>{if(event.target.id==='notes'){state.notes=event.target.value;persist();document.querySelector('#notes-status').textContent=storageAvailable?'Saved just now':'Session only';}});
document.addEventListener('focusout',event=>{if(event.target.id==='notes')commitNotes();});
document.addEventListener('change',event=>{if(event.target.id==='translation-setting'){state.translate=event.target.checked;record(state,'settings',`Russian translations ${state.translate?'enabled':'disabled'}.`);persist();render();}});
document.addEventListener('submit',event=>{
  if(event.target.id!=='accusation-form')return;event.preventDefault();
  const data=new FormData(event.target);const suspect=data.get('suspect');const evidence=data.getAll('evidence');
  if(!suspect || evidence.length!==3){document.querySelector('#accusation-feedback').innerHTML='<div class="feedback error">Choose a suspect and exactly three pieces of evidence.</div>';return;}
  const result=accuse(state,CASE,suspect,evidence);persist();render();
  if(result==='correct'||result==='incorrect')showResult();
});
modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){modal.close();modalStack=[];}}});
modal.addEventListener('close',()=>{if('speechSynthesis' in window)speechSynthesis.cancel();const target=lastModalOpener?.isConnected?lastModalOpener:findEquivalent(lastModalOpener)||app.querySelector('.content h1');if(target){target.setAttribute('tabindex',target.tagName==='H1'?'-1':target.getAttribute('tabindex')||'0');target.focus({preventScroll:true});}});
window.addEventListener('beforeunload',()=>{commitNotes();persist();});
render();
