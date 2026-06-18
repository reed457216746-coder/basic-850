import { groups, words } from './wordData.js?v=data-20260618';

const STORE_KEY = 'basic-850-progress-v1';
const root = document.getElementById('root');

const state = {
  tab: 'learn',
  groupId: 'all',
  currentIndex: 0,
  query: '',
  testChoiceId: null,
  openExampleIndex: null,
  ignoreToggleClick: false,
  voices: [],
  notice: '',
  progress: readProgress(),
};

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
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>',
};

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    return normalizeProgress(saved);
  } catch {
    return normalizeProgress();
  }
}

function normalizeProgress(progress = {}) {
  return {
    known: Array.isArray(progress.known) ? progress.known.filter(Boolean) : [],
    unsure: Array.isArray(progress.unsure) ? progress.unsure.filter(Boolean) : [],
    accent: progress.accent === 'en-GB' ? 'en-GB' : 'en-US',
    soundEnabled: progress.soundEnabled !== false,
  };
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

function selectedVoice() {
  return (
    state.voices.find((voice) => voice.lang === state.progress.accent) ||
    state.voices.find((voice) => voice.lang?.startsWith(state.progress.accent))
  );
}

function voiceName() {
  return selectedVoice()?.name || '系统语音';
}

let audioContext;
const SOUND_FILES = {
  known: './assets/sounds/known.mp3?v=custom-20260618',
  unsure: './assets/sounds/unsure.mp3?v=custom-20260618',
  reveal: './assets/sounds/reveal.mp3?v=custom-20260618',
  correct: './assets/sounds/correct.mp3?v=custom-20260618',
  wrong: './assets/sounds/wrong.mp3?v=custom-20260618',
  milestone5: './assets/sounds/milestone-5.mp3?v=custom-20260618',
  milestone15: './assets/sounds/milestone-15.mp3?v=custom-20260618',
};

const soundCache = new Map();

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(ctx, { start, frequency, duration, type = 'sine', gain = 0.045 }) {
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.015);
}

function playGeneratedSound(kind) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const patterns = {
    known: [
      { start: now, frequency: 660, duration: 0.07 },
      { start: now + 0.065, frequency: 880, duration: 0.09 },
    ],
    unsure: [{ start: now, frequency: 330, duration: 0.08, type: 'triangle', gain: 0.032 }],
    reveal: [{ start: now, frequency: 520, duration: 0.045, type: 'triangle', gain: 0.03 }],
    correct: [
      { start: now, frequency: 740, duration: 0.06 },
      { start: now + 0.055, frequency: 990, duration: 0.12 },
    ],
    wrong: [{ start: now, frequency: 220, duration: 0.11, type: 'triangle', gain: 0.026 }],
    milestone5: [
      { start: now, frequency: 660, duration: 0.07 },
      { start: now + 0.065, frequency: 880, duration: 0.08 },
      { start: now + 0.135, frequency: 1175, duration: 0.13 },
    ],
    milestone15: [
      { start: now, frequency: 660, duration: 0.07 },
      { start: now + 0.065, frequency: 880, duration: 0.08 },
      { start: now + 0.135, frequency: 1175, duration: 0.13 },
      { start: now + 0.23, frequency: 1320, duration: 0.16 },
    ],
    toggle: [{ start: now, frequency: 470, duration: 0.05, type: 'triangle', gain: 0.026 }],
  };
  (patterns[kind] || []).forEach((tone) => playTone(ctx, tone));
}

function playSound(kind) {
  if (!state.progress.soundEnabled) return;
  const source = SOUND_FILES[kind];
  if (!source) {
    playGeneratedSound(kind);
    return;
  }

  if (!soundCache.has(kind)) {
    const audio = new Audio(source);
    audio.preload = 'auto';
    soundCache.set(kind, audio);
  }

  const sound = soundCache.get(kind).cloneNode();
  sound.play().catch(() => playGeneratedSound(kind));
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

        <div class="scroll-content">
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
        </div>

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
  return `
    <div class="search-row">
      ${icon('search')}
      <input value="${escapeHtml(state.query)}" data-action="search" placeholder="搜索单词 / 中文" aria-label="搜索单词或中文释义" />
    </div>
    ${renderCategoryTabs()}
    ${renderStudyCard(activeWord())}
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
      ${renderExamples(word)}
      <div class="action-grid">
        <button class="soft-action ${unsure ? 'selected' : ''}" type="button" data-action="${unsure ? 'clear' : 'unsure'}">${icon('star')} 不熟</button>
        <button class="primary-action ${known ? 'selected' : ''}" type="button" data-action="known">${icon('check')} 掌握</button>
      </div>
    </article>
  `;
}

function renderExamples(word) {
  return `
    <div class="examples-panel">
      <div class="examples-title">
        ${icon('sparkle')}
        <span>应用例句</span>
      </div>
      ${getExamples(word)
        .map(
          (example, index) => `
            <div class="example-item ${state.openExampleIndex === index ? 'open' : ''}">
              <button class="example-main" type="button" data-action="toggle-example" data-example-index="${index}" aria-expanded="${state.openExampleIndex === index}">
                <small>${example.label}</small>
                <strong>${escapeHtml(example.en)}</strong>
                <span>${escapeHtml(example.zh)}</span>
              </button>
              <button class="example-speak" type="button" data-action="speak-example" data-example-index="${index}" aria-label="播放例句 ${index + 1}">
                ${icon('volume')}
              </button>
            </div>
          `,
        )
        .join('')}
    </div>
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
      <div class="sound-panel">
        <div>
          ${icon('volume')}
          <span>学习音效</span>
        </div>
        <button class="${state.progress.soundEnabled ? 'active' : ''}" type="button" data-action="toggle-sound" aria-pressed="${state.progress.soundEnabled}">
          ${state.progress.soundEnabled ? '开启' : '关闭'}
        </button>
      </div>
      <div class="profile-grid">
        <div>${icon('chart')}<strong>${state.progress.known.length}</strong><span>已掌握</span></div>
        <div>${icon('star')}<strong>${state.progress.unsure.length}</strong><span>待复习</span></div>
      </div>
      <div class="backup-panel">
        <h3>进度备份</h3>
        <p>导出文件可以保存到 iCloud、微信文件或电脑。换手机、清理浏览器后，用导入恢复。</p>
        <div class="backup-actions">
          <button class="backup-button" type="button" data-action="export-progress">${icon('download')} 导出进度</button>
          <button class="backup-button" type="button" data-action="import-progress">${icon('upload')} 导入进度</button>
        </div>
        <input class="file-input" type="file" accept="application/json,.json" data-action="import-file" />
        ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ''}
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

const exampleBank = {
  come: [
    { label: '基础理解', en: 'Come here, please.', zh: '请到这里来。' },
    { label: '生活场景', en: 'I come to this place every morning.', zh: '我每天早上来这个地方。' },
    { label: '问句练习', en: 'Did he come with you?', zh: '他和你一起来了吗？' },
    { label: '常见搭配', en: 'Come in and sit down.', zh: '进来坐下。' },
    { label: '对比感知', en: 'Come here, not go there.', zh: '到这里来，不是去那里。' },
  ],
  get: [
    { label: '基础理解', en: 'I get a book.', zh: '我拿到一本书。' },
    { label: '生活场景', en: 'Get your coat before we go.', zh: '我们走之前把你的外套拿上。' },
    { label: '问句练习', en: 'Did you get my note?', zh: '你收到我的留言了吗？' },
    { label: '常见搭配', en: 'Get ready for the test.', zh: '为测试做好准备。' },
    { label: '对比感知', en: 'Get the cup, then give it to me.', zh: '先拿杯子，然后把它给我。' },
  ],
  give: [
    { label: '基础理解', en: 'Give me a cup.', zh: '给我一个杯子。' },
    { label: '生活场景', en: 'She gives help to her friend.', zh: '她帮助她的朋友。' },
    { label: '问句练习', en: 'Can you give him the letter?', zh: '你能把信给他吗？' },
    { label: '常见搭配', en: 'Give your answer clearly.', zh: '清楚地给出你的回答。' },
    { label: '对比感知', en: 'Give more, take less.', zh: '多给予，少索取。' },
  ],
  go: [
    { label: '基础理解', en: 'We go home.', zh: '我们回家。' },
    { label: '生活场景', en: 'I go to school by bus.', zh: '我坐公交去学校。' },
    { label: '问句练习', en: 'Where do you go after work?', zh: '你下班后去哪里？' },
    { label: '常见搭配', en: 'Go on with your reading.', zh: '继续你的阅读。' },
    { label: '对比感知', en: 'Go there, then come back.', zh: '去那里，然后回来。' },
  ],
  water: [
    { label: '基础理解', en: 'The water is cold.', zh: '水是凉的。' },
    { label: '生活场景', en: 'I drink water after a walk.', zh: '散步后我喝水。' },
    { label: '问句练习', en: 'Is there water in the bottle?', zh: '瓶子里有水吗？' },
    { label: '常见搭配', en: 'Clean water is important.', zh: '干净的水很重要。' },
    { label: '对比感知', en: 'Water is clear, but milk is white.', zh: '水是清澈的，但牛奶是白色的。' },
  ],
  apple: [
    { label: '基础理解', en: 'The apple is red.', zh: '这个苹果是红色的。' },
    { label: '生活场景', en: 'I have an apple for breakfast.', zh: '我早餐吃一个苹果。' },
    { label: '问句练习', en: 'Do you want this apple?', zh: '你想要这个苹果吗？' },
    { label: '常见搭配', en: 'Cut the apple into small parts.', zh: '把苹果切成小块。' },
    { label: '对比感知', en: 'An apple is fruit, not bread.', zh: '苹果是水果，不是面包。' },
  ],
};

const operationExampleBank = {
  at: [
    { label: '基础理解', en: 'Meet me at the door.', zh: '在门口见我。' },
    { label: '生活场景', en: 'I am at home now.', zh: '我现在在家。' },
    { label: '问句练习', en: 'Are you at school?', zh: '你在学校吗？' },
    { label: '常见搭配', en: 'Look at the picture.', zh: '看这张图片。' },
    { label: '对比感知', en: 'At points to a place or time.', zh: 'at 指向某个地点或时间点。' },
  ],
  by: [
    { label: '基础理解', en: 'The chair is by the window.', zh: '椅子在窗边。' },
    { label: '生活场景', en: 'I go to school by bus.', zh: '我坐公交去学校。' },
    { label: '问句练习', en: 'Can you stand by me?', zh: '你能站在我旁边吗？' },
    { label: '常见搭配', en: 'The book was written by her father.', zh: '这本书是她父亲写的。' },
    { label: '对比感知', en: 'By can show place, method, or maker.', zh: 'by 可以表示位置、方式或作者。' },
  ],
  in: [
    { label: '基础理解', en: 'The key is in the box.', zh: '钥匙在盒子里。' },
    { label: '生活场景', en: 'She lives in a small town.', zh: '她住在一个小镇里。' },
    { label: '问句练习', en: 'Is there milk in the cup?', zh: '杯子里有牛奶吗？' },
    { label: '常见搭配', en: 'Write your name in this space.', zh: '在这个空白处写你的名字。' },
    { label: '对比感知', en: 'In often means inside something.', zh: 'in 通常表示在某物里面。' },
  ],
  on: [
    { label: '基础理解', en: 'The book is on the table.', zh: '书在桌子上。' },
    { label: '生活场景', en: 'Put your coat on the chair.', zh: '把外套放在椅子上。' },
    { label: '问句练习', en: 'Is the light on?', zh: '灯开着吗？' },
    { label: '常见搭配', en: 'She is on the phone.', zh: '她正在打电话。' },
    { label: '对比感知', en: 'On can mean touching a surface or working.', zh: 'on 可以表示在表面上，也可以表示开启。' },
  ],
  to: [
    { label: '基础理解', en: 'Go to the door.', zh: '走到门那里。' },
    { label: '生活场景', en: 'Give the letter to your mother.', zh: '把信给你妈妈。' },
    { label: '问句练习', en: 'Are you going to school?', zh: '你要去学校吗？' },
    { label: '常见搭配', en: 'Listen to the music.', zh: '听音乐。' },
    { label: '对比感知', en: 'To often shows direction or receiver.', zh: 'to 常表示方向或接受者。' },
  ],
  up: [
    { label: '基础理解', en: 'Look up at the sky.', zh: '抬头看天空。' },
    { label: '生活场景', en: 'Stand up, please.', zh: '请站起来。' },
    { label: '问句练习', en: 'Can you pick it up?', zh: '你能把它捡起来吗？' },
    { label: '常见搭配', en: 'The price went up.', zh: '价格上涨了。' },
    { label: '对比感知', en: 'Up often means higher or more.', zh: 'up 常表示更高或更多。' },
  ],
  for: [
    { label: '基础理解', en: 'This seat is for you.', zh: '这个座位是给你的。' },
    { label: '生活场景', en: 'I waited for my friend.', zh: '我等我的朋友。' },
    { label: '问句练习', en: 'What is this key for?', zh: '这把钥匙是做什么用的？' },
    { label: '常见搭配', en: 'Thank you for your help.', zh: '谢谢你的帮助。' },
    { label: '对比感知', en: 'For can show purpose, reason, or receiver.', zh: 'for 可以表示目的、原因或对象。' },
  ],
  of: [
    { label: '基础理解', en: 'I need a cup of water.', zh: '我需要一杯水。' },
    { label: '生活场景', en: 'The top of the box is open.', zh: '盒子的顶部是开的。' },
    { label: '问句练习', en: 'What is the name of this street?', zh: '这条街叫什么名字？' },
    { label: '常见搭配', en: 'She is a friend of my sister.', zh: '她是我姐姐的朋友。' },
    { label: '对比感知', en: 'Of often shows a part, amount, or relation.', zh: 'of 常表示部分、数量或关系。' },
  ],
  as: [
    { label: '基础理解', en: 'Use this room as an office.', zh: '把这个房间当作办公室用。' },
    { label: '生活场景', en: 'She works as a teacher.', zh: '她是一名教师。' },
    { label: '问句练习', en: 'Can I use this box as a seat?', zh: '我能把这个盒子当座位用吗？' },
    { label: '常见搭配', en: 'As a child, he lived by the sea.', zh: '小时候，他住在海边。' },
    { label: '对比感知', en: 'As can show role, use, or time.', zh: 'as 可以表示角色、用途或时间。' },
  ],
  off: [
    { label: '基础理解', en: 'Take your coat off.', zh: '脱掉你的外套。' },
    { label: '生活场景', en: 'The cup fell off the table.', zh: '杯子从桌上掉下来了。' },
    { label: '问句练习', en: 'Is the light off?', zh: '灯关了吗？' },
    { label: '常见搭配', en: 'Keep off the wet floor.', zh: '不要踩湿地板。' },
    { label: '对比感知', en: 'Off can mean away from or not working.', zh: 'off 可以表示离开，也可以表示关闭。' },
  ],
  about: [
    { label: '基础理解', en: 'This book is about animals.', zh: '这本书是关于动物的。' },
    { label: '生活场景', en: 'We talked about the weather.', zh: '我们聊了天气。' },
    { label: '问句练习', en: 'What is the story about?', zh: '这个故事是关于什么的？' },
    { label: '常见搭配', en: 'Think about your answer first.', zh: '先想一想你的答案。' },
    { label: '对比感知', en: 'I know about it, but I do not know it well.', zh: '我知道这件事，但并不了解得很深。' },
  ],
  across: [
    { label: '基础理解', en: 'We walked across the bridge.', zh: '我们走过了那座桥。' },
    { label: '生活场景', en: 'The shop is across the street.', zh: '商店在街对面。' },
    { label: '问句练习', en: 'Can you swim across the river?', zh: '你能游过这条河吗？' },
    { label: '常见搭配', en: 'She looked across the room.', zh: '她看向房间的另一边。' },
    { label: '对比感知', en: 'Across means from one side to the other.', zh: 'across 表示从一边到另一边。' },
  ],
  after: [
    { label: '基础理解', en: 'We eat after school.', zh: '我们放学后吃饭。' },
    { label: '生活场景', en: 'Call me after dinner.', zh: '晚饭后给我打电话。' },
    { label: '问句练习', en: 'What do you do after work?', zh: '你下班后做什么？' },
    { label: '常见搭配', en: 'After a long day, I need rest.', zh: '漫长的一天之后，我需要休息。' },
    { label: '对比感知', en: 'After is later; before is earlier.', zh: 'after 是之后，before 是之前。' },
  ],
  against: [
    { label: '基础理解', en: 'Put the chair against the wall.', zh: '把椅子靠墙放。' },
    { label: '生活场景', en: 'The rain hit against the window.', zh: '雨打在窗户上。' },
    { label: '问句练习', en: 'Are you against this plan?', zh: '你反对这个计划吗？' },
    { label: '常见搭配', en: 'We must guard against danger.', zh: '我们必须防范危险。' },
    { label: '对比感知', en: 'Against can mean touching or opposing.', zh: 'against 可以表示靠着，也可以表示反对。' },
  ],
  among: [
    { label: '基础理解', en: 'The child stood among the trees.', zh: '那个孩子站在树丛中。' },
    { label: '生活场景', en: 'She found her key among the papers.', zh: '她在一堆纸中找到了钥匙。' },
    { label: '问句练习', en: 'Who is among the group?', zh: '谁在这个群体里？' },
    { label: '常见搭配', en: 'This idea is popular among students.', zh: '这个想法在学生中很受欢迎。' },
    { label: '对比感知', en: 'Among is for a group; between is often for two.', zh: 'among 用于一群之中；between 常用于两者之间。' },
  ],
  before: [
    { label: '基础理解', en: 'Wash your hands before dinner.', zh: '晚饭前洗手。' },
    { label: '生活场景', en: 'I read before sleep.', zh: '我睡前读书。' },
    { label: '问句练习', en: 'Did you call before you came?', zh: '你来之前打电话了吗？' },
    { label: '常见搭配', en: 'Before noon, the room was quiet.', zh: '中午前，房间很安静。' },
    { label: '对比感知', en: 'Before is earlier; after is later.', zh: 'before 是之前，after 是之后。' },
  ],
  between: [
    { label: '基础理解', en: 'The table is between two chairs.', zh: '桌子在两把椅子之间。' },
    { label: '生活场景', en: 'I sit between my friends.', zh: '我坐在朋友们中间。' },
    { label: '问句练习', en: 'What is between the door and the window?', zh: '门和窗之间是什么？' },
    { label: '常见搭配', en: 'Keep this between you and me.', zh: '这件事只在你我之间。' },
    { label: '对比感知', en: 'Between shows a position with clear sides.', zh: 'between 表示处在明确的两边之间。' },
  ],
  through: [
    { label: '基础理解', en: 'The train went through the tunnel.', zh: '火车穿过了隧道。' },
    { label: '生活场景', en: 'We walked through the park.', zh: '我们穿过公园。' },
    { label: '问句练习', en: 'Can light pass through glass?', zh: '光能穿过玻璃吗？' },
    { label: '常见搭配', en: 'Read through the list first.', zh: '先把清单通读一遍。' },
    { label: '对比感知', en: 'Through means going inside and out the other side.', zh: 'through 表示进入内部并从另一边出来。' },
  ],
  under: [
    { label: '基础理解', en: 'The cat is under the table.', zh: '猫在桌子下面。' },
    { label: '生活场景', en: 'Put the bag under your chair.', zh: '把包放在你的椅子下面。' },
    { label: '问句练习', en: 'Is the key under the book?', zh: '钥匙在书下面吗？' },
    { label: '常见搭配', en: 'The road is under repair.', zh: '这条路正在维修中。' },
    { label: '对比感知', en: 'Under is below; over is above.', zh: 'under 是在下面，over 是在上方。' },
  ],
  over: [
    { label: '基础理解', en: 'The bird flew over the house.', zh: '鸟飞过房子上方。' },
    { label: '生活场景', en: 'Put the coat over the chair.', zh: '把外套搭在椅子上。' },
    { label: '问句练习', en: 'Can you jump over the line?', zh: '你能跳过这条线吗？' },
    { label: '常见搭配', en: 'The meeting is over.', zh: '会议结束了。' },
    { label: '对比感知', en: 'Over can mean above or finished.', zh: 'over 可以表示在上方，也可以表示结束。' },
  ],
  with: [
    { label: '基础理解', en: 'I went with my brother.', zh: '我和哥哥一起去了。' },
    { label: '生活场景', en: 'Eat bread with butter.', zh: '面包配黄油吃。' },
    { label: '问句练习', en: 'Who is with you?', zh: '谁和你在一起？' },
    { label: '常见搭配', en: 'Write with a pencil.', zh: '用铅笔写。' },
    { label: '对比感知', en: 'With shows togetherness or a tool.', zh: 'with 表示一起，也可以表示使用工具。' },
  ],
};

const prepositionScenes = {
  at: ['Meet me at the door.', '在门口见我。'],
  by: ['The cup is by the window.', '杯子在窗边。'],
  down: ['Walk down the road.', '沿着这条路往下走。'],
  from: ['This letter is from my mother.', '这封信来自我妈妈。'],
  in: ['The key is in my pocket.', '钥匙在我的口袋里。'],
  off: ['Take your coat off.', '把你的外套脱掉。'],
  on: ['The book is on the table.', '书在桌子上。'],
  to: ['Give the letter to her.', '把信给她。'],
  up: ['Look up at the sky.', '抬头看天空。'],
  for: ['This seat is for you.', '这个座位是给你的。'],
  of: ['A cup of water is on the table.', '一杯水在桌上。'],
  till: ['Wait till tomorrow.', '等到明天。'],
  than: ['This road is longer than that one.', '这条路比那条路长。'],
  as: ['Use this room as an office.', '把这个房间当作办公室用。'],
};

const specificNounExamples = {
  army: [
    { label: '基础理解', en: 'The army protects the country.', zh: '军队保卫这个国家。' },
    { label: '生活场景', en: 'His brother is in the army.', zh: '他的哥哥在军队里。' },
    { label: '问句练习', en: 'Does the army need more food?', zh: '军队需要更多食物吗？' },
    { label: '常见搭配', en: 'The army moved across the bridge.', zh: '军队穿过了那座桥。' },
    { label: '对比感知', en: 'An army is a group of soldiers, not one person.', zh: 'army 是一支军队，不是一个人。' },
  ],
  church: [
    { label: '基础理解', en: 'The church is near the square.', zh: '教堂在广场附近。' },
    { label: '生活场景', en: 'We heard bells from the church.', zh: '我们听到了教堂传来的钟声。' },
    { label: '问句练习', en: 'Is the church open today?', zh: '教堂今天开放吗？' },
    { label: '常见搭配', en: 'They met outside the church door.', zh: '他们在教堂门外见面。' },
    { label: '对比感知', en: 'A church is a building, not just a room.', zh: 'church 是一座建筑，不只是一个房间。' },
  ],
  hospital: [
    { label: '基础理解', en: 'The hospital is on this road.', zh: '医院在这条路上。' },
    { label: '生活场景', en: 'She works at the hospital.', zh: '她在医院工作。' },
    { label: '问句练习', en: 'How far is the hospital?', zh: '医院有多远？' },
    { label: '常见搭配', en: 'He went to the hospital after the accident.', zh: '事故后他去了医院。' },
    { label: '对比感知', en: 'A hospital is for medical care, not ordinary shopping.', zh: 'hospital 是医疗护理的地方，不是普通购物的地方。' },
  ],
};

const abstractNouns = new Set([
  'addition', 'adjustment', 'agreement', 'amount', 'approval', 'argument', 'attempt', 'attention',
  'attraction', 'authority', 'behavior', 'belief', 'cause', 'chance', 'comparison', 'competition',
  'condition', 'connection', 'control', 'credit', 'crime', 'damage', 'danger', 'death', 'debt',
  'decision', 'degree', 'desire', 'destruction', 'development', 'digestion', 'direction', 'discovery',
  'discussion', 'disease', 'disgust', 'distribution', 'division', 'doubt', 'education', 'effect',
  'error', 'event', 'exchange', 'existence', 'expansion', 'experience', 'fact', 'fear', 'feeling',
  'fiction', 'force', 'growth', 'harmony', 'hate', 'hearing', 'help', 'history', 'hope', 'humor',
  'idea', 'impulse', 'increase', 'insurance', 'interest', 'invention', 'knowledge', 'language',
  'law', 'learning', 'limit', 'loss', 'love', 'memory', 'motion', 'music', 'need', 'news',
  'observation', 'operation', 'opinion', 'organization', 'pain', 'payment', 'peace', 'pleasure',
  'position', 'power', 'profit', 'property', 'punishment', 'purpose', 'quality', 'question',
  'reaction', 'reading', 'reason', 'regret', 'relation', 'religion', 'request', 'respect', 'reward',
  'rhythm', 'rule', 'science', 'selection', 'sense', 'shame', 'shock', 'society', 'sound',
  'space', 'statement', 'structure', 'substance', 'suggestion', 'support', 'surprise', 'teaching',
  'tendency', 'theory', 'thought', 'time', 'trade', 'trouble', 'use', 'value', 'view', 'voice',
  'war', 'waste', 'weather', 'weight', 'work', 'writing',
]);

const actionNouns = new Set([
  'act', 'attack', 'bite', 'blow', 'burn', 'burst', 'change', 'cook', 'cough', 'cover', 'crack',
  'crush', 'cry', 'drink', 'driving', 'fall', 'fight', 'flight', 'fold', 'grip', 'guide', 'join',
  'judge', 'jump', 'kick', 'kiss', 'laugh', 'lead', 'lift', 'look', 'measure', 'meeting', 'move',
  'offer', 'paint', 'play', 'polish', 'print', 'protest', 'pull', 'push', 'rest', 'roll', 'rub',
  'run', 'shake', 'slip', 'smash', 'smell', 'smile', 'smoke', 'sneeze', 'start', 'stop', 'stretch',
  'swim', 'talk', 'taste', 'test', 'touch', 'transport', 'trick', 'turn', 'twist', 'walk', 'wash',
  'wave',
]);

const specificQualityExamples = {
  boiling: [
    { label: '基础理解', en: 'The water is boiling.', zh: '水正在沸腾。' },
    { label: '生活场景', en: 'Keep your hand away from boiling water.', zh: '手不要靠近沸水。' },
    { label: '问句练习', en: 'Is the soup boiling?', zh: '汤烧开了吗？' },
    { label: '常见搭配', en: 'Boiling water can burn skin.', zh: '沸水会烫伤皮肤。' },
    { label: '对比感知', en: 'Boiling is hotter than warm.', zh: 'boiling 比 warm 热得多。' },
  ],
  chemical: [
    { label: '基础理解', en: 'This is a chemical change.', zh: '这是化学变化。' },
    { label: '生活场景', en: 'The bottle has a chemical smell.', zh: '这个瓶子有化学气味。' },
    { label: '问句练习', en: 'Is this chemical safe?', zh: '这个化学品安全吗？' },
    { label: '常见搭配', en: 'Chemical waste can damage water.', zh: '化学废料会污染水。' },
    { label: '对比感知', en: 'Chemical points to chemistry or a substance.', zh: 'chemical 指化学相关，或化学物质。' },
  ],
  electric: [
    { label: '基础理解', en: 'This is an electric light.', zh: '这是一盏电灯。' },
    { label: '生活场景', en: 'The electric train is quiet.', zh: '电动火车很安静。' },
    { label: '问句练习', en: 'Is this machine electric?', zh: '这台机器是电动的吗？' },
    { label: '常见搭配', en: 'An electric wire can be dangerous.', zh: '电线可能很危险。' },
    { label: '对比感知', en: 'Electric means using or carrying electricity.', zh: 'electric 表示使用或传导电。' },
  ],
  medical: [
    { label: '基础理解', en: 'She needs medical help.', zh: '她需要医疗帮助。' },
    { label: '生活场景', en: 'The hospital keeps medical records.', zh: '医院保存医疗记录。' },
    { label: '问句练习', en: 'Is this a medical problem?', zh: '这是医疗问题吗？' },
    { label: '常见搭配', en: 'Medical care is important after an accident.', zh: '事故后的医疗护理很重要。' },
    { label: '对比感知', en: 'Medical relates to health and doctors.', zh: 'medical 和健康、医生有关。' },
  ],
  military: [
    { label: '基础理解', en: 'The army has military training.', zh: '军队有军事训练。' },
    { label: '生活场景', en: 'He works at a military base.', zh: '他在军事基地工作。' },
    { label: '问句练习', en: 'Is this a military road?', zh: '这是军用道路吗？' },
    { label: '常见搭配', en: 'Military service can be difficult.', zh: '服兵役可能很辛苦。' },
    { label: '对比感知', en: 'Military relates to soldiers and the army.', zh: 'military 和士兵、军队有关。' },
  ],
  political: [
    { label: '基础理解', en: 'This is a political question.', zh: '这是一个政治问题。' },
    { label: '生活场景', en: 'The news has a political story.', zh: '新闻里有一则政治故事。' },
    { label: '问句练习', en: 'Is the meeting political?', zh: '这场会议有政治性质吗？' },
    { label: '常见搭配', en: 'Political power can change a country.', zh: '政治权力会改变一个国家。' },
    { label: '对比感知', en: 'Political relates to government and public power.', zh: 'political 和政府、公共权力有关。' },
  ],
  opposite: [
    { label: '基础理解', en: 'The two doors are opposite each other.', zh: '两扇门彼此相对。' },
    { label: '生活场景', en: 'The bank is on the opposite side of the street.', zh: '银行在街道对面。' },
    { label: '问句练习', en: 'What is the opposite of hot?', zh: 'hot 的反义词是什么？' },
    { label: '常见搭配', en: 'They walked in opposite directions.', zh: '他们朝相反方向走。' },
    { label: '对比感知', en: 'Opposite means very different or facing the other side.', zh: 'opposite 表示相反，或面对另一边。' },
  ],
};

const colorWords = new Set(['black', 'blue', 'brown', 'green', 'grey', 'red', 'white', 'yellow']);
const temperatureWords = new Set(['cold', 'hot', 'warm', 'wet', 'dry']);
const personStateWords = new Set([
  'able', 'angry', 'awake', 'conscious', 'cruel', 'foolish', 'happy', 'healthy', 'ill', 'kind',
  'living', 'married', 'sad', 'tired', 'violent', 'wise', 'young',
]);
const relationWords = new Set(['different', 'equal', 'parallel', 'same', 'separate']);
const orderTimeWords = new Set(['early', 'first', 'future', 'last', 'late', 'past', 'present', 'second']);
const domainWords = new Set(['chemical', 'electric', 'material', 'medical', 'military', 'natural', 'physical', 'political']);
const textureShapeWords = new Set([
  'bent', 'broken', 'complete', 'delicate', 'elastic', 'fat', 'fixed', 'flat', 'hanging', 'hollow',
  'long', 'loose', 'narrow', 'open', 'round', 'rough', 'sharp', 'short', 'shut', 'small', 'smooth',
  'soft', 'solid', 'sticky', 'stiff', 'straight', 'thick', 'thin', 'tight', 'wide',
]);

function qualityExamples(word, meaning) {
  const article = articleFor(word);
  if (specificQualityExamples[word]) return specificQualityExamples[word];
  if (colorWords.has(word)) {
    return [
      { label: '基础理解', en: `The coat is ${word}.`, zh: `这件外套是“${meaning}”的。` },
      { label: '生活场景', en: `I picked the ${word} cup.`, zh: `我选了那个“${meaning}”杯子。` },
      { label: '问句练习', en: `Is your bag ${word}?`, zh: `你的包是“${meaning}”的吗？` },
      { label: '常见搭配', en: `The ${word} sign is easy to see.`, zh: `那个“${meaning}”标志很容易看见。` },
      { label: '对比感知', en: `${word} names a color, not a size.`, zh: `“${meaning}”表示颜色，不表示大小。` },
    ];
  }
  if (temperatureWords.has(word)) {
    return [
      { label: '基础理解', en: `The water is ${word}.`, zh: `水是“${meaning}”的。` },
      { label: '生活场景', en: `I need a ${word} drink.`, zh: `我需要一杯“${meaning}”饮料。` },
      { label: '问句练习', en: `Is the room ${word}?`, zh: `房间是“${meaning}”的吗？` },
      { label: '常见搭配', en: `A ${word} day can change our plan.`, zh: `“${meaning}”的一天会改变我们的计划。` },
      { label: '对比感知', en: `${word} describes a condition you can feel.`, zh: `“${meaning}”描述能感受到的状态。` },
    ];
  }
  if (personStateWords.has(word)) {
    return [
      { label: '基础理解', en: `The person is ${word}.`, zh: `这个人是“${meaning}”的。` },
      { label: '生活场景', en: `She looked ${word} after the meeting.`, zh: `会议后她看起来很“${meaning}”。` },
      { label: '问句练习', en: `Do you feel ${word} today?`, zh: `你今天感觉“${meaning}”吗？` },
      { label: '常见搭配', en: `${article} ${word} person needs care.`, zh: `“${meaning}”的人需要关心。` },
      { label: '对比感知', en: `${word} describes a person or living thing.`, zh: `“${meaning}”常描述人或有生命的东西。` },
    ];
  }
  if (relationWords.has(word)) {
    return [
      { label: '基础理解', en: `The two lines are ${word}.`, zh: `这两条线是“${meaning}”的。` },
      { label: '生活场景', en: `These two answers are ${word}.`, zh: `这两个答案是“${meaning}”的。` },
      { label: '问句练习', en: `Are the two parts ${word}?`, zh: `这两个部分是“${meaning}”的吗？` },
      { label: '常见搭配', en: `Keep the ideas ${word} in your notes.`, zh: `在笔记里让这些想法保持“${meaning}”。` },
      { label: '对比感知', en: `${word} compares two things or ideas.`, zh: `“${meaning}”用来比较两个事物或想法。` },
    ];
  }
  if (orderTimeWords.has(word)) {
    return [
      { label: '基础理解', en: `This is the ${word} step.`, zh: `这是“${meaning}”的一步。` },
      { label: '生活场景', en: `We talked about the ${word} plan.`, zh: `我们谈到了“${meaning}”的计划。` },
      { label: '问句练习', en: `Is this the ${word} page?`, zh: `这是“${meaning}”的一页吗？` },
      { label: '常见搭配', en: `The ${word} part is easy to remember.`, zh: `“${meaning}”的部分容易记住。` },
      { label: '对比感知', en: `${word} is about time or order.`, zh: `“${meaning}”和时间或顺序有关。` },
    ];
  }
  if (domainWords.has(word)) {
    return [
      { label: '基础理解', en: `This is ${article} ${word} problem.`, zh: `这是一个“${meaning}”问题。` },
      { label: '生活场景', en: `The report used ${word} words.`, zh: `这份报告用了“${meaning}”词汇。` },
      { label: '问句练习', en: `Is this ${article} ${word} question?`, zh: `这是一个“${meaning}”问题吗？` },
      { label: '常见搭配', en: `${article} ${word} change may need expert help.`, zh: `“${meaning}”变化可能需要专家帮助。` },
      { label: '对比感知', en: `${word} points to a field or type.`, zh: `“${meaning}”指向某个领域或类型。` },
    ];
  }
  if (textureShapeWords.has(word)) {
    return [
      { label: '基础理解', en: `The line is ${word}.`, zh: `这条线是“${meaning}”的。` },
      { label: '生活场景', en: `The old box feels ${word}.`, zh: `这个旧盒子摸起来“${meaning}”。` },
      { label: '问句练习', en: `Is the door ${word}?`, zh: `这扇门是“${meaning}”的吗？` },
      { label: '常见搭配', en: `${article} ${word} edge can be dangerous.`, zh: `“${meaning}”的边缘可能很危险。` },
      { label: '对比感知', en: `${word} describes shape, texture, or state.`, zh: `“${meaning}”描述形状、质感或状态。` },
    ];
  }
  return [
    { label: '基础理解', en: `The answer is ${word}.`, zh: `这个答案是“${meaning}”的。` },
    { label: '生活场景', en: `This feels ${word} to me.`, zh: `我觉得这个是“${meaning}”的。` },
    { label: '问句练习', en: `Is this choice ${word}?`, zh: `这个选择是“${meaning}”的吗？` },
    { label: '常见搭配', en: `${article} ${word} change can affect the plan.`, zh: `“${meaning}”的变化会影响计划。` },
    { label: '对比感知', en: `${word} describes a quality, not an object.`, zh: `“${meaning}”描述性质，不是物体。` },
  ];
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function simpleOperationExamples(word, meaning) {
  if (prepositionScenes[word]) {
    const [en, zh] = prepositionScenes[word];
    return [
      { label: '基础理解', en, zh },
      { label: '生活场景', en: `I use ${word} in everyday speech.`, zh: `我会在日常表达里用到“${meaning}”。` },
      { label: '问句练习', en: `Can you make a sentence with ${word}?`, zh: `你能用“${meaning}”造一个句子吗？` },
      { label: '常见搭配', en: en.replace('.', ' today.'), zh: `${zh.replace('。', '')}，就在今天。` },
      { label: '对比感知', en: `${word} changes the relation between two ideas.`, zh: `“${meaning}”会改变两个意思之间的关系。` },
    ];
  }
  return [
    { label: '基础理解', en: `I can use ${word} in a real sentence.`, zh: `我能在真实句子里使用“${meaning}”。` },
    { label: '生活场景', en: `People often use ${word} when they speak simply.`, zh: `人们说简单英语时常会用到“${meaning}”。` },
    { label: '问句练习', en: `Where does ${word} fit in this sentence?`, zh: `“${meaning}”在这个句子里放在哪里？` },
    { label: '常见搭配', en: `${word} helps the sentence show a clear relation.`, zh: `“${meaning}”帮助句子表达清楚的关系。` },
    { label: '对比感知', en: `Change ${word}, and the sentence may change meaning.`, zh: `换掉“${meaning}”，句子的意思可能会变。` },
  ];
}

function getExamples(item) {
  const word = item.speakWord;
  if (exampleBank[word]) return exampleBank[word];
  if (operationExampleBank[word]) return operationExampleBank[word];
  if (specificNounExamples[word]) return specificNounExamples[word];
  const meaning = item.zh.includes('词') ? item.word : item.zh;
  if (item.groupId === 'operations') return simpleOperationExamples(word, meaning);
  if (item.groupId === 'things' || item.groupId === 'pictured') {
    const article = articleFor(word);
    if (abstractNouns.has(word)) {
      return [
        { label: '基础理解', en: `The ${word} is clear now.`, zh: `这个“${meaning}”现在清楚了。` },
        { label: '生活场景', en: `We talked about the ${word} today.`, zh: `我们今天谈到了这个“${meaning}”。` },
        { label: '问句练习', en: `What caused this ${word}?`, zh: `是什么造成了这个“${meaning}”？` },
        { label: '常见搭配', en: `A good ${word} can change the result.`, zh: `好的“${meaning}”会改变结果。` },
        { label: '对比感知', en: `This ${word} is an idea, not a thing you can hold.`, zh: `这个“${meaning}”是一个概念，不是能拿在手里的东西。` },
      ];
    }
    if (actionNouns.has(word)) {
      return [
        { label: '基础理解', en: `The ${word} happened quickly.`, zh: `这个“${meaning}”发生得很快。` },
        { label: '生活场景', en: `I saw the ${word} from the door.`, zh: `我从门口看到了这个“${meaning}”。` },
        { label: '问句练习', en: `Did you notice the ${word}?`, zh: `你注意到这个“${meaning}”了吗？` },
        { label: '常见搭配', en: `That ${word} made everyone stop.`, zh: `那个“${meaning}”让大家都停了下来。` },
        { label: '对比感知', en: `The ${word} is an action, not a fixed object.`, zh: `这个“${meaning}”是动作，不是固定物体。` },
      ];
    }
    return [
      { label: '基础理解', en: `This is ${article} ${word}.`, zh: `这是一个“${meaning}”。` },
      { label: '生活场景', en: `The ${word} is on the table.`, zh: `这个“${meaning}”在桌子上。` },
      { label: '问句练习', en: `Where did you find the ${word}?`, zh: `你在哪里找到这个“${meaning}”？` },
      { label: '常见搭配', en: `Please put the ${word} in a safe place.`, zh: `请把这个“${meaning}”放在安全的地方。` },
      { label: '对比感知', en: `This ${word} is different from the other one.`, zh: `这个“${meaning}”和另一个不一样。` },
    ];
  }
  if (item.groupId === 'qualities' || item.groupId === 'opposites') {
    return qualityExamples(word, meaning);
  }
  return [
    { label: '基础理解', en: `Use "${word}" in a short sentence.`, zh: `在短句里使用“${meaning}”。` },
    { label: '生活场景', en: `I hear "${word}" in simple English.`, zh: `我在简单英语里听到“${meaning}”。` },
    { label: '问句练习', en: `Can you say "${word}" again?`, zh: `你能再说一遍“${meaning}”吗？` },
    { label: '常见搭配', en: `"${word}" often helps connect ideas.`, zh: `“${meaning}”常用来连接意思。` },
    { label: '对比感知', en: `Learn "${word}" today, and review it tomorrow.`, zh: `今天学习“${meaning}”，明天再复习它。` },
  ];
}

function speak(item = activeWord()) {
  speakText(item.speakWord);
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
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
    unsure.delete(id);
    known.delete(id);
  }
  state.progress.known = [...known];
  state.progress.unsure = [...unsure];
  saveProgress();
}

function markAndAdvance(status) {
  const currentId = activeWord().id;
  const knownBefore = knownSet().size;
  updateWord(currentId, status);
  if (status === 'known') {
    const knownAfter = knownSet().size;
    let milestoneSound = 'known';
    if (knownAfter > knownBefore && knownAfter % 15 === 0) milestoneSound = 'milestone15';
    else if (knownAfter > knownBefore && knownAfter % 5 === 0) milestoneSound = 'milestone5';
    playSound(milestoneSound);
  }
  if (status === 'unsure') playSound('unsure');
  if (state.tab === 'review') {
    const list = reviewWords();
    state.currentIndex = list.length ? state.currentIndex % list.length : 0;
    state.openExampleIndex = null;
    return;
  }
  nextWord();
}

function nextWord() {
  state.currentIndex = (state.currentIndex + 1) % Math.max(activeList().length, 1);
  state.testChoiceId = null;
  state.openExampleIndex = null;
}

function toggleExample(button) {
  const scroller = root.querySelector('.scroll-content');
  const scrollTop = scroller?.scrollTop || 0;
  const index = Number(button.dataset.exampleIndex || 0);
  const willOpen = state.openExampleIndex !== index;
  state.openExampleIndex = willOpen ? index : null;

  root.querySelectorAll('.example-item').forEach((item, itemIndex) => {
    const isOpen = itemIndex === state.openExampleIndex;
    item.classList.toggle('open', isOpen);
    item.querySelector('.example-main')?.setAttribute('aria-expanded', String(isOpen));
  });

  button.blur();
  requestAnimationFrame(() => {
    if (scroller) scroller.scrollTop = scrollTop;
  });
  return willOpen;
}

function exportProgress() {
  const payload = {
    app: 'Basic 850',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: state.progress,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `basic-850-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  state.notice = '进度已导出，请把 JSON 文件保存好。';
}

function importProgress(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const incoming = normalizeProgress(payload.progress || payload);
      state.progress = incoming;
      state.notice = '进度已导入并保存。';
      saveProgress();
      render();
    } catch {
      state.notice = '导入失败：请选择 Basic 850 导出的 JSON 文件。';
      render();
    }
  };
  reader.readAsText(file);
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  if (action === 'tab') {
    state.tab = button.dataset.tab;
    state.currentIndex = 0;
    state.testChoiceId = null;
    state.openExampleIndex = null;
  }
  if (action === 'group') {
    state.groupId = button.dataset.groupId;
    state.currentIndex = 0;
    state.openExampleIndex = null;
  }
  if (action === 'select-word') {
    state.currentIndex = Number(button.dataset.index || 0);
    state.openExampleIndex = null;
  }
  if (action === 'speak') {
    const item = words.find((word) => word.id === button.dataset.wordId) || activeWord();
    speak(item);
  }
  if (action === 'toggle-example') {
    event.preventDefault();
    if (state.ignoreToggleClick) {
      state.ignoreToggleClick = false;
      return;
    }
    if (toggleExample(button)) playSound('reveal');
    return;
  }
  if (action === 'speak-example') {
    const example = getExamples(activeWord())[Number(button.dataset.exampleIndex || 0)];
    if (example) speakText(example.en);
  }
  if (action === 'known') markAndAdvance('known');
  if (action === 'unsure') markAndAdvance('unsure');
  if (action === 'clear') updateWord(activeWord().id, 'clear');
  if (action === 'choice') {
    state.testChoiceId = button.dataset.choiceId;
    playSound(state.testChoiceId === activeWord().id ? 'correct' : 'wrong');
  }
  if (action === 'accent') {
    state.progress.accent = button.dataset.accent;
    saveProgress();
  }
  if (action === 'toggle-sound') {
    state.progress.soundEnabled = !state.progress.soundEnabled;
    saveProgress();
    if (state.progress.soundEnabled) playSound('toggle');
  }
  if (action === 'reset') {
    state.progress = { known: [], unsure: [], accent: state.progress.accent, soundEnabled: state.progress.soundEnabled };
    state.notice = '进度已清空。';
    saveProgress();
  }
  if (action === 'next') nextWord();
  if (action === 'export-progress') exportProgress();
  if (action === 'import-progress') root.querySelector('[data-action="import-file"]')?.click();

  if (!['speak', 'speak-example', 'noop', 'import-progress'].includes(action)) render();
});

root.addEventListener(
  'pointerdown',
  (event) => {
    const button = event.target.closest('[data-action="toggle-example"]');
    if (!button) return;
    event.preventDefault();
    state.ignoreToggleClick = true;
    if (toggleExample(button)) playSound('reveal');
  },
  { passive: false },
);

root.addEventListener('input', (event) => {
  if (event.target.dataset.action !== 'search') return;
  state.query = event.target.value;
  state.currentIndex = 0;
  state.openExampleIndex = null;
  render();
  const input = root.querySelector('[data-action="search"]');
  input?.focus();
  input?.setSelectionRange(state.query.length, state.query.length);
});

root.addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'import-file') return;
  importProgress(event.target.files?.[0]);
  event.target.value = '';
});

function syncVoices() {
  state.voices = window.speechSynthesis?.getVoices?.() || [];
  render();
}

window.speechSynthesis?.addEventListener?.('voiceschanged', syncVoices);
syncVoices();
render();
