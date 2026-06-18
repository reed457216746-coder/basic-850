import { groups, words } from './wordData.js';

const STORE_KEY = 'basic-850-progress-v1';
const state = {
  tab: 'learn',
  groupId: 'all',
  currentIndex: 0,
  query: '',
  testChoiceId: null,
  voices: [],
  progress: readProgress(),
};

const root = document.getElementById('root');

const icons = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/><path d="M9 12h12"/></svg>',
  headphones: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14a9 9 0 0 1 18 0"/><path d="M7 14h2v6H7a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z"/><path d="M17 14h-2v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v14"/><path d="M3 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2V5Z"/><path d="M21 5a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v16a2 2 0 0 1 2-2h5a2 2 0 0 0 2-2V5Z"/></svg>',
  review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.5 1.7c-.8.7-1.6 1.2-1.9 2.3"/><path d="M12 17h.01"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M8 17V9"/><path d="M13 17V5"/><path d="M18 17v-4"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>',
};

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { known: [], unsure: [], accent: 'en-US' };
  } catch {
    return { known: [], unsure: [], accent: 'en-US' };
  }
}

function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.progress));
}

function icon(name) {
  return `<span class="svg-icon">${icons[name]}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function knownSet() {
  return new Set(state.progress.known);
}

function unsureSet() {
  return new Set(state.progress.unsure);
}

function filteredWords() {
  const keyword = state.query.trim().toLowerCase();
  return words.filter((item) => {
    const groupMatch = state.groupId === 'all' || item.groupId === state.groupId;
    const queryMatch = !keyword || item.word.toLowerCase().includes(keyword) || item.zh.includes(state.query);
    return groupMatch && queryMatch;
  });
}

function reviewWords() {
  const unsure = unsureSet();
  return words.filter((item) => unsure.has(item.id));
}

function activeList() {
  return state.tab === 'review' ? reviewWords() : filteredWords();
}

function activeWord() {
  const list = activeList();
  return list[state.currentIndex % Math.max(list.length, 1)] || words[0];
}

function voiceName() {
  const voice = selectedVoice();
  return voice ? voice.name : '系统语音';
}

function selectedVoice() {
  return (
    state.voices.find((voice) => voice.lang === state.progress.accent) ||
    state.voices.find((voice) => voice.lang?.startsWith(state.progress.accent))
  );
}

function render() {
  const known = knownSet();
  const unsure = unsureSet();
  const percent = Math.round((known.size / words.length) * 100);

  root.innerHTML = `
    <main class="app-shell">
      <section class="phone-canvas" aria-label="Basic 850 vocabulary app">
        <header class="topbar">
          <button class="icon-button" type="button" data-action="noop" aria-label="返回">${icon('back')}</button>
          <div>
            <h1>Basic 850</h1>
            <p>${state.progress.accent} · ${escapeHtml(voiceName())}</p>
          </div>
          <button class="icon-button warm" type="button" data-action="speak" aria-label="播放当前词">${icon('headphones')}</button>
        </header>

        <section class="progress-panel">
          <div class="progress-copy">
            <span>今日进度</span>
            <strong>${percent}%</strong>
          </div>
          <div class="progress-track" aria-label="已掌握 ${known.size} 个，共 ${words.length} 个">
            <div style="width: ${percent}%"></div>
          </div>
          <div class="progress-stats">
            <span>${known.size}/${words.length} 已掌握</span>
            <span>${unsure.size} 个待复习</span>
          </div>
        </section>

        ${renderCurrentTab()}

        <nav class="bottom-nav" aria-label="底部导航">
          ${renderNavButton('learn', '学习', 'book')}
          ${renderNavButton('review', '复习', 'review')}
          ${renderNavButton('test', '测试', 'quiz')}
          ${renderNavButton('profile', '我的', 'user')}
        </nav>
      </section>
    </main>
  `;
}

function renderCurrentTab() {
  if (state.tab === 'review') return renderReview();
  if (state.tab === 'test') return renderTest();
  if (state.tab === 'profile') return renderProfile();
  return renderLearn();
}

function renderLearn() {
  const list = filteredWords();
  const word = activeWord();
  return `
    <div class="search-row">
      ${icon('search')}
      <input value="${escapeHtml(state.query)}" data-action="search" placeholder="搜索单词 / 中文" aria-label="搜索单词或中文释义" />
    </div>
    ${renderCategoryTabs()}
    ${renderStudyCard(word)}
    ${renderWordRail(list.slice(0, 24))}
  `;
}

function renderCategoryTabs() {
  const buttons = [
    `<button class="${state.groupId === 'all' ? 'active' : ''}" type="button" data-action="group" data-group-id="all">全部 <span>${words.length}</span></button>`,
    ...groups.map(
      (group) =>
        `<button class="${state.groupId === group.id ? 'active' : ''}" type="button" data-action="group" data-group-id="${group.id}">${group.label} <span>${group.count}</span></button>`,
    ),
  ];
  return `<div class="category-tabs" aria-label="单词分类">${buttons.join('')}</div>`;
}

function renderStudyCard(word) {
  const known = knownSet().has(word.id);
  const unsure = unsureSet().has(word.id);
  return `
    <article class="study-card" style="--tone: ${word.tone}">
      <div class="card-head">
        <span>${word.groupLabel}</span>
        <button class="speaker-button" type="button" data-action="speak" data-word-id="${word.id}" aria-label="播放 ${escapeHtml(word.word)}">${icon('volume')}</button>
      </div>
      <div class="word-block">
        <h2>${escapeHtml(word.word)}</h2>
        <p>${word.ipa || 'IPA 待补充'}</p>
        <strong>${escapeHtml(word.zh)}</strong>
      </div>
      <div class="example-line">
        ${icon('sparkle')}
        <span>${escapeHtml(makeExample(word.speakWord))}</span>
      </div>
      <div class="action-grid">
        <button class="soft-action ${unsure ? 'selected' : ''}" type="button" data-action="${unsure ? 'clear' : 'unsure'}">${icon('star')} 不熟</button>
        <button class="primary-action ${known ? 'selected' : ''}" type="button" data-action="known">${icon('check')} 掌握</button>
      </div>
      <button class="next-button" type="button" data-action="next">下一个 ${icon('next')}</button>
    </article>
  `;
}

function renderWordRail(items) {
  const known = knownSet();
  const unsure = unsureSet();
  const buttons = items.map((item, index) => {
    const klass = known.has(item.id) ? 'done' : unsure.has(item.id) ? 'flagged' : '';
    return `<button class="${klass}" type="button" data-action="select-word" data-index="${index}">${escapeHtml(item.word)}</button>`;
  });
  return `<div class="word-rail" aria-label="单词列表">${buttons.join('')}</div>`;
}

function renderReview() {
  const list = reviewWords();
  if (!list.length) {
    return `
      <section class="empty-state">
        ${icon('book')}
        <h2>没有待复习词</h2>
        <p>把不熟的词标记后，会出现在这里。</p>
      </section>
    `;
  }
  return `
    <section class="review-panel">
      <div class="section-title">
        <h2>复习队列</h2>
        <span>${list.length} 个</span>
      </div>
      ${renderStudyCard(activeWord())}
    </section>
  `;
}

function renderTest() {
  const word = activeWord();
  const choice = words.find((item) => item.id === state.testChoiceId);
  const correct = choice?.id === word.id;
  return `
    <section class="test-panel">
      <div class="section-title">
        <h2>听音选词</h2>
        <button type="button" class="mini-play" data-action="speak">${icon('volume')} 播放</button>
      </div>
      <div class="meaning-card">
        <span>中文释义</span>
        <strong>${escapeHtml(word.zh)}</strong>
      </div>
      <div class="choice-list">
        ${testOptions(word)
          .map((option) => {
            const selected = state.testChoiceId === option.id;
            const klass = selected ? (correct ? 'correct' : 'wrong') : '';
            const resultIcon = selected ? (correct ? icon('check') : icon('close')) : '';
            return `<button class="${klass}" type="button" data-action="choice" data-choice-id="${option.id}"><span>${escapeHtml(option.word)}</span>${resultIcon}</button>`;
          })
          .join('')}
      </div>
      ${choice ? `<button class="next-button" type="button" data-action="next">下一题 ${icon('next')}</button>` : ''}
    </section>
  `;
}

function renderProfile() {
  return `
    <section class="profile-panel">
      <div class="section-title">
        <h2>发音设置</h2>
        ${icon('headphones')}
      </div>
      <div class="accent-switch">
        ${renderAccent('en-US', '美音')}
        ${renderAccent('en-GB', '英音')}
      </div>
      <div class="profile-grid">
        <div>${icon('chart')}<strong>${state.progress.known.length}</strong><span>已掌握</span></div>
        <div>${icon('star')}<strong>${state.progress.unsure.length}</strong><span>待复习</span></div>
      </div>
      <button class="danger-button" type="button" data-action="reset">清空进度</button>
    </section>
  `;
}

function renderAccent(id, label) {
  return `<button class="${state.progress.accent === id ? 'active' : ''}" type="button" data-action="accent" data-accent="${id}">${label}<span>${id}</span></button>`;
}

function renderNavButton(id, label, iconName) {
  return `<button type="button" class="${state.tab === id ? 'active' : ''}" data-action="tab" data-tab="${id}">${icon(iconName)}<span>${label}</span></button>`;
}

function testOptions(word) {
  const seed = word.word.length + state.currentIndex;
  const pool = words.filter((item) => item.id !== word.id);
  return [pool[(seed * 7) % pool.length], pool[(seed * 13) % pool.length], word]
    .filter(Boolean)
    .sort((a, b) => a.word.localeCompare(b.word));
}

function makeExample(word) {
  const examples = {
    come: 'Come here, please.',
    get: 'I get a book.',
    give: 'Give me a cup.',
    go: 'We go home.',
    water: 'The water is cold.',
    apple: 'The apple is red.',
  };
  return examples[word] || `This word is "${word}".`;
}

function speak(item = activeWord()) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.speakWord);
  utterance.lang = state.progress.accent;
  utterance.rate = 0.82;
  utterance.pitch = 1;
  const voice = selectedVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function updateWord(id, status) {
  const known = new Set(state.progress.known);
  const unsure = new Set(state.progress.unsure);
  if (status === 'known') {
    known.add(id);
    unsure.delete(id);
  }
  if (status === 'unsure') {
    unsure.add(id);
    known.delete(id);
  }
  if (status === 'clear') {
    known.delete(id);
    unsure.delete(id);
  }
  state.progress.known = [...known];
  state.progress.unsure = [...unsure];
  saveProgress();
}

function nextWord() {
  state.currentIndex = (state.currentIndex + 1) % Math.max(activeList().length, 1);
  state.testChoiceId = null;
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  if (action === 'tab') {
    state.tab = button.dataset.tab;
    state.currentIndex = 0;
    state.testChoiceId = null;
  }
  if (action === 'group') {
    state.groupId = button.dataset.groupId;
    state.currentIndex = 0;
  }
  if (action === 'select-word') state.currentIndex = Number(button.dataset.index || 0);
  if (action === 'speak') {
    const item = words.find((word) => word.id === button.dataset.wordId) || activeWord();
    speak(item);
  }
  if (action === 'known') updateWord(activeWord().id, 'known');
  if (action === 'unsure') updateWord(activeWord().id, 'unsure');
  if (action === 'clear') updateWord(activeWord().id, 'clear');
  if (action === 'choice') state.testChoiceId = button.dataset.choiceId;
  if (action === 'accent') {
    state.progress.accent = button.dataset.accent;
    saveProgress();
  }
  if (action === 'reset') {
    state.progress = { known: [], unsure: [], accent: state.progress.accent };
    saveProgress();
  }
  if (action === 'next') nextWord();

  if (action !== 'speak' && action !== 'noop') render();
});

root.addEventListener('input', (event) => {
  if (event.target.dataset.action !== 'search') return;
  state.query = event.target.value;
  state.currentIndex = 0;
  render();
  const input = root.querySelector('[data-action="search"]');
  input?.focus();
  input?.setSelectionRange(state.query.length, state.query.length);
});

function syncVoices() {
  state.voices = window.speechSynthesis?.getVoices?.() || [];
  render();
}

window.speechSynthesis?.addEventListener?.('voiceschanged', syncVoices);
syncVoices();
render();
