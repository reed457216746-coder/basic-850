import { groups, words } from './wordData.js';

const STORE_KEY = 'basic-850-progress-v1';
const root = document.getElementById('root');

const state = {
  tab: 'learn',
  groupId: 'all',
  currentIndex: 0,
  query: '',
  testChoiceId: null,
  openExampleIndex: null,
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
      <button class="next-button" type="button" data-action="next">下一个 ${icon('next')}</button>
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
              <button class="example-main" type="button" data-action="toggle-example" data-example-index="${index}">
                <small>${example.label}</small>
                <strong>${escapeHtml(example.en)}</strong>
                ${state.openExampleIndex === index ? `<span>${escapeHtml(example.zh)}</span>` : ''}
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

function getExamples(item) {
  const word = item.speakWord;
  if (exampleBank[word]) return exampleBank[word];
  const meaning = item.zh.includes('词') ? item.word : item.zh;
  if (item.groupId === 'things' || item.groupId === 'pictured') {
    return [
      { label: '基础理解', en: `This ${word} is useful.`, zh: `这个“${meaning}”很有用。` },
      { label: '生活场景', en: `I see the ${word} every day.`, zh: `我每天都会看到这个“${meaning}”。` },
      { label: '问句练习', en: `Where is the ${word}?`, zh: `这个“${meaning}”在哪里？` },
      { label: '常见搭配', en: `Put the ${word} on the table.`, zh: `把这个“${meaning}”放在桌子上。` },
      { label: '对比感知', en: `This is ${word}, not another thing.`, zh: `这是“${meaning}”，不是别的东西。` },
    ];
  }
  if (item.groupId === 'qualities' || item.groupId === 'opposites') {
    return [
      { label: '基础理解', en: `The room is ${word}.`, zh: `这个房间是“${meaning}”的。` },
      { label: '生活场景', en: `I feel ${word} today.`, zh: `我今天感觉“${meaning}”。` },
      { label: '问句练习', en: `Is this answer ${word}?`, zh: `这个答案是“${meaning}”的吗？` },
      { label: '常见搭配', en: `A ${word} day can change your plan.`, zh: `“${meaning}”的一天会改变你的计划。` },
      { label: '对比感知', en: `It is ${word}, not the same as before.`, zh: `它是“${meaning}”的，和以前不一样。` },
    ];
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

function nextWord() {
  state.currentIndex = (state.currentIndex + 1) % Math.max(activeList().length, 1);
  state.testChoiceId = null;
  state.openExampleIndex = null;
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
    const index = Number(button.dataset.exampleIndex || 0);
    state.openExampleIndex = state.openExampleIndex === index ? null : index;
  }
  if (action === 'speak-example') {
    const example = getExamples(activeWord())[Number(button.dataset.exampleIndex || 0)];
    if (example) speakText(example.en);
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
    state.notice = '进度已清空。';
    saveProgress();
  }
  if (action === 'next') nextWord();
  if (action === 'export-progress') exportProgress();
  if (action === 'import-progress') root.querySelector('[data-action="import-file"]')?.click();

  if (!['speak', 'speak-example', 'noop', 'import-progress'].includes(action)) render();
});

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
