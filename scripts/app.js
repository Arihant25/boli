/*
 * Boli — the interface.
 *
 * A small hash-routed set of views built with a tiny element helper.
 *
 *   #/                       home, choose a script
 *   #/learn/<lang>           the lesson path for a language
 *   #/lesson/<lang>/<index>  play one lesson
 *   #/browse/<lang>          the full specimen chart, for reference
 *   #/review/<lang>          spaced-repetition practice of learned letters
 *   #/progress               the ledger
 *   #/settings               settings
 */
(function () {
  'use strict';

  var DATA = window.BOLI_DATA;
  var Store = window.BoliStore;
  var SRS = window.BoliSRS;
  var Lessons = window.BoliLessons;

  var view = document.getElementById('view');
  var topNav = document.getElementById('topNav');
  var tabNav = document.getElementById('tabNav');

  // -------------------------------------------------------------- helpers
  function h(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null) return;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function mount(node) { clear(view); view.appendChild(node); window.scrollTo(0, 0); }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var ICONS = {
    learn: '<svg viewBox="0 0 24 24"><path d="M12 6c-1.8-1.2-4-1.6-6-1.1v12c2-.5 4.2-.1 6 1.1 1.8-1.2 4-1.6 6-1.1V5c-2-.5-4.2-.1-6 1.1z"/><path d="M12 6v12"/></svg>',
    review: '<svg viewBox="0 0 24 24"><path d="M4 10a8 8 0 0 1 13.5-3.5L20 9"/><path d="M20 14a8 8 0 0 1-13.5 3.5L4 15"/><path d="M20 5v4h-4"/><path d="M4 19v-4h4"/></svg>',
    progress: '<svg viewBox="0 0 24 24"><path d="M5 20V11"/><path d="M12 20V4"/><path d="M19 20v-6"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><path d="M4 7h9"/><path d="M18 7h2"/><circle cx="15.5" cy="7" r="2"/><path d="M4 17h3"/><path d="M12 17h8"/><circle cx="9" cy="17" r="2"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path d="M5 9v6h4l5 4V5L9 9z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>'
  };

  // -------------------------------------------------------------- audio
  // Pronunciation comes from a free, keyless text-to-speech endpoint at
  // the moment of playback. Telugu and Punjabi have their own voices;
  // Odia is transliterated to the aligned Devanagari and read with the
  // Hindi voice, which lands on the same sounds.
  function toDevanagari(s) {
    // The Hindi voice reads the vocalic r (Devanagari ऋ / ृ) as "ri",
    // but Odia says it "ru". Spell it out phonetically so the voice
    // lands on the Odia sound before the general block shift runs.
    s = s.replace(/ଋ/g, 'रु')                    // vowel: "ru"
         .replace(/ୃ/g, '्रु');   // sign: virama + ra + u -> "-ru"
    return s.replace(/[଀-୿]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0x200);
    });
  }
  function ttsUrl(text, tl) {
    return 'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=' +
      tl + '&q=' + encodeURIComponent(text);
  }
  var currentAudio = null;
  function speak(text, langId) {
    var tl = 'hi', say = text;
    if (langId === 'telugu') tl = 'te';
    else if (langId === 'punjabi') tl = 'pa';
    else if (langId === 'odia') { tl = 'hi'; say = toDevanagari(text); }
    try {
      if (currentAudio) currentAudio.pause();
      currentAudio = new Audio(ttsUrl(say, tl));
      currentAudio.play().catch(function () { /* a blocked autoplay is fine */ });
    } catch (e) { /* audio is a nicety, never a requirement */ }
  }

  function iconSpan(name) {
    var span = h('span');
    span.innerHTML = ICONS[name];
    return span.firstChild;
  }

  // ---------------------------------------------------------------- router
  function parseHash() {
    var raw = (location.hash || '#/').replace(/^#\/?/, '');
    var parts = raw.split('?');
    var path = parts[0].split('/').filter(Boolean);
    var query = {};
    (parts[1] || '').split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return { path: path, query: query };
  }
  function go(hash) { location.hash = hash; }

  function route() {
    var r = parseHash();
    var head = r.path[0] || 'home';
    switch (head) {
      case 'home': renderHome(); break;
      case 'learn': r.path[1] ? renderLearn(r.path[1]) : renderHome(); break;
      case 'lesson': r.path[1] && r.path[2] != null ? renderLesson(r.path[1], parseInt(r.path[2], 10)) : renderHome(); break;
      case 'browse': r.path[1] ? renderBrowse(r.path[1]) : renderHome(); break;
      case 'review': r.path[1] ? renderReview(r.path[1]) : renderHome(); break;
      case 'progress': renderProgress(); break;
      case 'settings': renderSettings(); break;
      default: renderHome();
    }
    renderNav(head);
  }

  // ------------------------------------------------------------------- nav
  function navTarget(kind) {
    var last = Store.settings().lastLanguage;
    if (kind === 'learn') return last ? '#/learn/' + last : '#/';
    if (kind === 'review') return last ? '#/review/' + last : '#/';
    return '#/' + kind;
  }
  function navActive(head) {
    if (head === 'lesson' || head === 'browse') return 'learn';
    return head;
  }
  function renderNav(head) {
    var active = navActive(head);
    var items = [
      { kind: 'learn', label: 'Learn' },
      { kind: 'review', label: 'Review' },
      { kind: 'progress', label: 'Progress' },
      { kind: 'settings', label: 'Settings' }
    ];
    clear(tabNav);
    items.forEach(function (it) {
      tabNav.appendChild(h('a', {
        href: navTarget(it.kind),
        class: active === it.kind ? 'active' : '',
        html: ICONS[it.kind] + '<span>' + it.label + '</span>'
      }));
    });
    clear(topNav);
    topNav.appendChild(h('a', { href: '#/', class: head === 'home' ? 'active' : '' }, ['Home']));
    items.forEach(function (it) {
      topNav.appendChild(h('a', {
        href: navTarget(it.kind),
        class: active === it.kind ? 'active' : ''
      }, [it.label]));
    });
  }

  // ------------------------------------------------------------------ home
  function renderHome() {
    var root = h('div', { class: 'view' });

    var hero = h('section', { class: 'hero' });
    hero.appendChild(h('div', { class: 'label eyebrow' }, ['A reading primer']));
    hero.appendChild(h('h1', null, [
      h('span', { class: 'say' }, ['बोली']),
      document.createTextNode('Read what you already speak.')
    ]));
    hero.appendChild(h('p', { class: 'lede', html:
      'Plenty of people speak their mother tongue fluently and never learned to read it. ' +
      '<b>Boli is for them.</b> Learn the letters and the vowel signs a few at a time, then start sounding out words.' }));
    root.appendChild(hero);

    root.appendChild(h('div', { class: 'specimen-strip' }, [
      specimenSample('odia'), specimenSample('telugu'), specimenSample('punjabi')
    ]));

    root.appendChild(h('div', { class: 'section-head' }, [
      h('h2', null, ['Pick a script']), h('span', { class: 'rule' })
    ]));

    var list = h('div', { class: 'lang-list' });
    DATA.languages.forEach(function (lang) { list.appendChild(languageCard(lang)); });
    root.appendChild(list);

    root.appendChild(footer());
    mount(root);
  }

  function specimenSample(langId) {
    var lang = DATA.lang(langId);
    return h('div', { class: 'sp script' }, [
      document.createTextNode(lang.sample),
      h('small', null, [lang.name])
    ]);
  }

  function languageCard(lang) {
    var lessons = Lessons.build(lang.id);
    var done = countDone(lang.id, lessons);
    var coverage = pct(done, lessons.length);
    var card = h('button', { class: 'lang-card', onclick: function () { go('#/learn/' + lang.id); } });
    card.appendChild(h('span', { class: 'big script' }, [lang.sample]));
    card.appendChild(h('span', null, [
      h('div', { class: 'native script' }, [lang.native]),
      h('div', { class: 'name' }, [lang.name]),
      h('div', { class: 'desc' }, [lang.blurb])
    ]));
    card.appendChild(h('span', { class: 'go' }, [done ? done + ' / ' + lessons.length + ' lessons' : 'Begin']));
    card.appendChild(h('span', { class: 'prog-bar' }, [h('span', { style: 'width:' + coverage + '%' })]));
    return card;
  }

  function countDone(langId, lessons) {
    var done = Store.lessonsDone(langId);
    var n = 0;
    lessons.forEach(function (l) { if (done[l.id]) n++; });
    return n;
  }

  // ----------------------------------------------------------- learn path
  function renderLearn(langId) {
    var lang = DATA.lang(langId);
    if (!lang) { renderHome(); return; }
    var s = Store.settings(); s.lastLanguage = langId; Store.saveSettings();

    var lessons = Lessons.build(langId);
    var done = Store.lessonsDone(langId);
    var currentIndex = lessons.length;
    for (var i = 0; i < lessons.length; i++) {
      if (!done[lessons[i].id]) { currentIndex = i; break; }
    }

    var root = h('div', { class: 'view' });
    root.appendChild(languageHeader(lang));

    root.appendChild(h('p', { class: 'group-note', style: 'margin:0.9rem 0 0.9rem' }, [
      'Work down the path. Each lesson teaches a few new letters, then has you read them back.'
    ]));

    root.appendChild(h('div', { class: 'cta-row' }, [
      h('button', { class: 'btn ghost', onclick: function () { go('#/browse/' + langId); } },
        ['All letters']),
      h('button', { class: 'btn ghost', onclick: function () { go('#/review/' + langId); } },
        [iconSpan('review'), 'Review learned'])
    ]));

    var path = h('div', { class: 'path' });
    lessons.forEach(function (lesson, idx) {
      var isDone = !!done[lesson.id];
      var available = idx <= currentIndex;
      var isCurrent = idx === currentIndex;
      var state = isDone ? 'done' : (available ? 'current' : 'locked');

      var row = h('div', { class: 'lesson-row ' + state });
      row.appendChild(h('div', { class: 'seal', html: isDone ? ICONS.check : String(idx + 1) }));
      row.appendChild(h('div', { class: 'lesson-body' }, [
        h('div', { class: 'lesson-title' }, [
          lesson.type === 'reading' ? h('span', { class: 'tag' }, ['Reading']) : null,
          h('span', { class: lesson.type === 'letters' ? 'script' : '' }, [lesson.title])
        ]),
        h('div', { class: 'lesson-sub' }, [
          isDone ? 'Done' : (isCurrent ? lesson.subtitle : (available ? lesson.subtitle : 'Locked'))
        ])
      ]));
      if (available) {
        row.setAttribute('role', 'button');
        row.addEventListener('click', function () { go('#/lesson/' + langId + '/' + idx); });
        row.appendChild(h('div', { class: 'lesson-go' }, [isDone ? 'Redo' : 'Start']));
      }
      path.appendChild(row);
    });
    root.appendChild(path);
    root.appendChild(footer());
    mount(root);
  }

  function languageHeader(lang) {
    return h('div', { class: 'lang-header' }, [
      h('div', null, [
        h('div', { class: 'native script' }, [lang.native]),
        h('h1', null, [lang.name]),
        h('div', { class: 'region' }, ['Spoken across ' + lang.region])
      ]),
      h('button', { class: 'lang-switch', onclick: function () { go('#/'); } }, ['Switch'])
    ]);
  }

  // -------------------------------------------------------------- lesson
  function renderLesson(langId, index) {
    var lang = DATA.lang(langId);
    if (!lang) { renderHome(); return; }
    var lessons = Lessons.build(langId);
    var lesson = lessons[index];
    if (!lesson) { renderLearn(langId); return; }

    // Do not let a locked lesson open through a stale link.
    var done = Store.lessonsDone(langId);
    for (var i = 0; i < index; i++) {
      if (!done[lessons[i].id]) { renderLearn(langId); return; }
    }

    var pool = DATA.all(langId);
    var steps = buildSteps(lesson, pool);
    var stepIndex = 0, correct = 0, quizzes = 0, locked = false;

    var root = h('div', { class: 'view' });
    var wrap = h('div', { class: 'review-wrap' });
    root.appendChild(wrap);
    mount(root);

    function frame(body) {
      clear(wrap);
      wrap.appendChild(h('div', { class: 'review-top' }, [
        h('button', { class: 'quit', onclick: function () { go('#/learn/' + langId); } }, ['Close']),
        h('div', { class: 'progress-track' }, [h('span', { style: 'width:' + pct(stepIndex, steps.length) + '%' })]),
        h('div', { class: 'tally' }, [lesson.type === 'reading' ? 'Reading' : lesson.title])
      ]));
      body.forEach(function (n) { wrap.appendChild(n); });
    }

    function advance() { stepIndex++; showStep(); }

    function showStep() {
      locked = false;
      if (stepIndex >= steps.length) { finish(); return; }
      var step = steps[stepIndex];
      if (step.kind === 'teach') showTeach(step.card);
      else if (step.kind === 'quiz') showQuiz(step.card);
      else if (step.kind === 'read') showRead(step.item);
      else if (step.kind === 'intro') showIntro(step);
    }

    function showTeach(card) {
      var body = h('div', { class: 'teach-card' }, [
        h('div', { class: 'label' }, ['New letter']),
        h('div', { class: 'teach-glyph script' }, [card.glyph]),
        h('div', { class: 'teach-roman' }, [card.roman]),
        card.name ? h('div', { class: 'detail-name' }, ['called ' + card.name]) : null,
        h('div', { class: 'detail-hint' }, [card.hint || 'A letter of the ' + lang.name + ' script.']),
        h('div', { class: 'detail-actions' }, [
          h('button', { class: 'btn ghost', onclick: function () { speak(card.glyph, langId); } },
            [iconSpan('sound'), 'Hear it again']),
          h('button', { class: 'btn primary', onclick: advance }, ['Got it'])
        ])
      ]);
      frame([body]);
      speak(card.glyph, langId);
    }

    function showIntro(step) {
      frame([h('div', { class: 'teach-card' }, [
        h('div', { class: 'label' }, ['Reading']),
        h('div', { class: 'teach-glyph script', style: 'font-size:3.4rem' }, [step.sample]),
        h('div', { class: 'detail-hint', style: 'margin-top:1rem' }, [
          'Sound out each letter in turn, then run them together. Pick the reading that matches.'
        ]),
        h('div', { class: 'detail-actions' }, [
          h('button', { class: 'btn primary block', onclick: advance }, ['Begin'])
        ])
      ])]);
    }

    function showQuiz(card) {
      var options = SRS.options(pool, card);
      renderChoice({
        ask: 'Which sound is this?',
        glyph: card.glyph,
        options: options,
        answer: card.roman,
        hintAfter: card.hint,
        onGrade: function (right) {
          SRS.answerCard(langId, card, right ? 'good' : 'again');
          speak(card.glyph, langId);
        }
      });
    }

    function showRead(item) {
      renderChoice({
        ask: 'Read this',
        glyph: item.glyph,
        options: item.options,
        answer: item.roman,
        onGrade: function (right) {
          Store.logReview(right);
          Store.saveProgress();
          speak(item.glyph, langId);
        }
      });
    }

    // Shared prompt-plus-four-choices screen for quizzes and reading.
    function renderChoice(cfg) {
      var card = h('div', { class: 'prompt-card' }, [
        h('div', { class: 'label ask' }, [cfg.ask]),
        h('div', { class: 'prompt-glyph script' }, [cfg.glyph]),
        h('div', { class: 'prompt-hint' }, [''])
      ]);
      var options = h('div', { class: 'options' });
      var feedback = h('div', { class: 'review-feedback' });
      var nextRow = h('div', { class: 'next-row hidden' });

      cfg.options.forEach(function (opt) {
        options.appendChild(h('button', { class: 'option', onclick: function () {
          if (locked) return;
          locked = true;
          var right = opt === cfg.answer;
          quizzes++;
          if (right) correct++;
          cfg.onGrade(right);

          Array.prototype.forEach.call(options.children, function (b) {
            b.disabled = true;
            if (b.textContent === cfg.answer) b.classList.add('correct');
            else if (b === this) b.classList.add('wrong');
            else b.classList.add('muted');
          }, this);

          if (cfg.hintAfter) card.querySelector('.prompt-hint').textContent = cfg.hintAfter;

          clear(feedback);
          feedback.appendChild(right
            ? h('span', { class: 'fb-right' }, ['Right.'])
            : h('span', { class: 'fb-wrong', html:
                '<b class="script">' + cfg.glyph + '</b> reads ' + cfg.answer + '.' }));

          nextRow.classList.remove('hidden');
          clear(nextRow);
          var nextBtn = h('button', { class: 'btn primary block', onclick: advance },
            [stepIndex + 1 >= steps.length ? 'Finish' : 'Next']);
          nextRow.appendChild(nextBtn);
          nextBtn.focus();
        } }, [opt]));
      });

      frame([card, options, feedback, nextRow]);
    }

    function finish() {
      Store.markLessonDone(langId, lesson.id);
      var acc = quizzes ? pct(correct, quizzes) : null;
      var next = lessons[index + 1];
      frame([h('div', { class: 'session-done' }, [
        h('div', { class: 'done-seal', html: ICONS.check }),
        h('h2', null, ['Lesson complete']),
        h('p', null, [
          quizzes ? 'You read ' + correct + ' of ' + quizzes + ' right' + (acc != null ? ' (' + acc + '%).' : '.')
                  : 'Nicely done.'
        ]),
        h('div', { class: 'cta-row', style: 'justify-content:center;margin-top:1.2rem' }, [
          next
            ? h('button', { class: 'btn primary', onclick: function () { go('#/lesson/' + langId + '/' + (index + 1)); } }, ['Next lesson'])
            : h('button', { class: 'btn primary', onclick: function () { go('#/learn/' + langId); } }, ['Back to path']),
          h('button', { class: 'btn ghost', onclick: function () { go('#/learn/' + langId); } }, ['The path'])
        ])
      ])]);
    }

    showStep();
  }

  // Turn a lesson into an ordered list of steps.
  function buildSteps(lesson, pool) {
    var steps = [];
    if (lesson.type === 'reading') {
      var set = Lessons.makeReadingSet(lesson.consonants, lesson.matras, 8);
      steps.push({ kind: 'intro', sample: set.length ? set[0].glyph : '' });
      set.forEach(function (item) { steps.push({ kind: 'read', item: item }); });
      return steps;
    }
    // A letters lesson: teach each new letter then quiz it, then a mixed
    // round so they are not just answered in the order they were shown.
    lesson.items.forEach(function (card) {
      steps.push({ kind: 'teach', card: card });
      steps.push({ kind: 'quiz', card: card });
    });
    shuffle(lesson.items).forEach(function (card) { steps.push({ kind: 'quiz', card: card }); });
    return steps;
  }

  // -------------------------------------------------------------- browse
  function renderBrowse(langId) {
    var lang = DATA.lang(langId);
    if (!lang) { renderHome(); return; }
    var root = h('div', { class: 'view' });
    root.appendChild(languageHeader(lang));

    var all = DATA.all(langId);
    var started = 0, mastered = 0;
    all.forEach(function (c) {
      var st = Store.getCardState(langId, c.id);
      if (SRS.isMastered(st)) mastered++;
      else if (st && st.stage !== 'new') started++;
    });

    root.appendChild(h('p', { class: 'group-note', style: 'margin:0.9rem 0 0.6rem' }, [
      'The whole script on one page. Tap any letter to hear it.'
    ]));
    root.appendChild(h('div', { class: 'chart-legend' }, [
      h('span', null, [h('i', { class: 'lg-new' }), 'Not started']),
      h('span', null, [h('i', { class: 'lg-seen' }), (started) + ' learning']),
      h('span', null, [h('i', { class: 'lg-mastered' }), (mastered) + ' mastered'])
    ]));

    DATA.groups.forEach(function (g) {
      var list = DATA.chars[langId][g.key];
      if (!list || !list.length) return;
      var section = h('section', { class: 'group' });
      section.appendChild(h('div', { class: 'section-head' }, [
        h('h3', null, [g.label]), h('span', { class: 'rule' }),
        h('span', { class: 'count' }, [list.length + ' letters'])
      ]));
      section.appendChild(h('p', { class: 'group-note' }, [g.note]));
      var grid = h('div', { class: 'chart-grid' });
      list.forEach(function (c) { grid.appendChild(tile(lang, c)); });
      section.appendChild(grid);
      root.appendChild(section);
    });

    root.appendChild(footer());
    mount(root);
  }

  function tile(lang, c) {
    var state = Store.getCardState(lang.id, c.id);
    var cls = 'tile';
    if (SRS.isMastered(state)) cls += ' mastered';
    else if (state && state.stage !== 'new') cls += ' seen';
    var showRoman = Store.settings().showRoman;
    // Tap plays the sound straight away, so you can run down the chart
    // and hear the whole script without a dialog in the way.
    var btn = h('button', { class: cls, onclick: function () {
      speak(c.glyph, lang.id);
      btn.classList.add('playing');
      setTimeout(function () { btn.classList.remove('playing'); }, 600);
    } }, [
      h('span', { class: 'pip' }),
      h('span', { class: 'g script' }, [c.glyph]),
      showRoman ? h('span', { class: 'r' }, [c.roman]) : null
    ]);
    return btn;
  }

  // ---------------------------------------------------------------- review
  function renderReview(langId) {
    var lang = DATA.lang(langId);
    if (!lang) { renderHome(); return; }
    Store.settings().lastLanguage = langId; Store.saveSettings();

    var pool = DATA.all(langId);
    // Review never introduces a letter you have not been taught; it only
    // brings back what a lesson has already shown you.
    var scheduler = SRS.Scheduler(langId, { cards: pool, newPerSession: 0 });
    var session = { answered: 0, correct: 0, locked: false, current: null, qid: 0 };

    var root = h('div', { class: 'view' });
    var wrap = h('div', { class: 'review-wrap' });
    root.appendChild(wrap);
    mount(root);

    function coverageWidth() {
      var s = SRS.summarise(langId, pool);
      return pct(s.mastered + s.review + s.learning, s.total);
    }
    function drawFrame(body) {
      clear(wrap);
      wrap.appendChild(h('div', { class: 'review-top' }, [
        h('button', { class: 'quit', onclick: function () { go('#/learn/' + langId); } }, ['Close']),
        h('div', { class: 'progress-track' }, [h('span', { style: 'width:' + coverageWidth() + '%' })]),
        h('div', { class: 'tally' }, [session.answered ? session.correct + ' / ' + session.answered + ' right' : lang.name])
      ]));
      body.forEach(function (n) { wrap.appendChild(n); });
    }

    function loadNext() {
      session.locked = false; session.qid += 1;
      var pick = scheduler.next();
      if (!pick) { showDone(); return; }
      session.current = pick;
      var card = h('div', { class: 'prompt-card' }, [
        h('div', { class: 'label ask' }, ['Which sound is this?']),
        h('div', { class: 'prompt-glyph script' }, [pick.card.glyph]),
        h('div', { class: 'prompt-hint' }, [''])
      ]);
      var options = h('div', { class: 'options' });
      pick.options.forEach(function (opt) {
        options.appendChild(h('button', { class: 'option', onclick: function () { answer(opt, this, options, card); } }, [opt]));
      });
      var feedback = h('div', { class: 'review-feedback' });
      var nextRow = h('div', { class: 'next-row hidden' });
      drawFrame([card, options, feedback, nextRow]);
      wrap._feedback = feedback; wrap._nextRow = nextRow;
    }

    function answer(choice, btn, options, card) {
      if (session.locked) return;
      session.locked = true;
      var pick = session.current;
      var right = choice === pick.card.roman;
      session.answered += 1;
      if (right) session.correct += 1;
      scheduler.answer(pick.card, right ? 'good' : 'again');
      speak(pick.card.glyph, langId);

      Array.prototype.forEach.call(options.children, function (b) {
        b.disabled = true;
        if (b.textContent === pick.card.roman) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
        else b.classList.add('muted');
      });
      card.querySelector('.prompt-hint').textContent = pick.card.hint || '';

      clear(wrap._feedback);
      wrap._feedback.appendChild(right
        ? h('span', { class: 'fb-right' }, ['Right.'])
        : h('span', { class: 'fb-wrong', html: '<b class="script">' + pick.card.glyph + '</b> is ' + pick.card.roman + '.' }));

      wrap._nextRow.classList.remove('hidden');
      clear(wrap._nextRow);
      var nextBtn = h('button', { class: 'btn primary block', onclick: loadNext }, ['Next']);
      wrap._nextRow.appendChild(nextBtn);
      if (right) {
        var thisQ = session.qid;
        setTimeout(function () { if (session.locked && session.qid === thisQ) loadNext(); }, 750);
      } else {
        nextBtn.focus();
      }
    }

    function showDone() {
      var seen = SRS.summarise(langId, pool);
      var everSeen = seen.total - seen.unseen;
      drawFrame([h('div', { class: 'session-done' }, [
        h('div', { class: 'done-seal', html: ICONS.check }),
        h('h2', null, [session.answered ? 'All caught up' : 'Nothing due yet']),
        h('p', null, [
          session.answered
            ? 'You cleared everything due for now. Come back later and the letters you fumbled will resurface first.'
            : (everSeen ? 'Nothing is due right now. Learn a lesson or check back later.'
                        : 'Start on the path first, then the letters you learn will show up here for review.')
        ]),
        h('div', { class: 'cta-row', style: 'justify-content:center;margin-top:1.2rem' }, [
          h('button', { class: 'btn primary', onclick: function () { go('#/learn/' + langId); } }, ['To the path'])
        ])
      ])]);
    }

    loadNext();
  }

  // -------------------------------------------------------------- progress
  function renderProgress() {
    var root = h('div', { class: 'view' });
    root.appendChild(h('div', { class: 'section-head' }, [h('h2', null, ['Your progress']), h('span', { class: 'rule' })]));

    var meta = Store.meta();
    var today = Store.today();
    var todayCount = (meta.days[today] && meta.days[today].reviews) || 0;
    var totalMastered = 0;
    DATA.languages.forEach(function (l) { totalMastered += SRS.summarise(l.id, DATA.all(l.id)).mastered; });

    root.appendChild(h('div', { class: 'streak-band' }, [
      statCell(meta.streak || 0, 'day streak'),
      statCell(todayCount, 'read today'),
      statCell(totalMastered, 'letters mastered')
    ]));

    var ledger = h('div', { class: 'ledger' });
    DATA.languages.forEach(function (lang) {
      var cards = DATA.all(lang.id);
      var s = SRS.summarise(lang.id, cards);
      var lessons = Lessons.build(lang.id);
      var lessonsDone = countDone(lang.id, lessons);
      var seg = function (n) { return pct(n, s.total) + '%'; };

      var row = h('div', { class: 'row', onclick: function () { go('#/learn/' + lang.id); } });
      row.appendChild(h('div', { class: 'lname' }, [
        h('span', { class: 'native script' }, [lang.native]),
        h('span', { class: 'en' }, [lang.name])
      ]));
      row.appendChild(h('div', { class: 'stat-num' }, [
        document.createTextNode(lessonsDone + '/' + lessons.length),
        h('small', null, ['lessons'])
      ]));
      row.appendChild(h('div', { class: 'bar' }, [
        h('i', { class: 'm', style: 'width:' + seg(s.mastered) }),
        h('i', { class: 'r', style: 'width:' + seg(s.review) }),
        h('i', { class: 'l', style: 'width:' + seg(s.learning) })
      ]));
      row.appendChild(h('div', { class: 'legend' }, [
        legend('m', 'Mastered'), legend('r', 'Known'), legend('l', 'Learning'), legend('u', s.unseen + ' new'),
        s.accuracy != null ? h('span', null, [s.accuracy + '% accuracy']) : null
      ]));
      ledger.appendChild(row);
    });
    root.appendChild(ledger);
    root.appendChild(footer());
    mount(root);
  }

  function statCell(n, label) {
    return h('div', { class: 'cell' }, [
      h('div', { class: 'n' }, [h('span', { class: 'accent' }, [String(n)])]),
      h('div', { class: 'label' }, [label])
    ]);
  }
  function legend(kind, text) { return h('span', null, [h('i', { class: kind }), text]); }

  // -------------------------------------------------------------- settings
  function renderSettings() {
    var s = Store.settings();
    var root = h('div', { class: 'view' });
    root.appendChild(h('div', { class: 'section-head' }, [h('h2', null, ['Settings']), h('span', { class: 'rule' })]));

    root.appendChild(settingRow('Appearance', 'Follow the device, or hold it light or dark.',
      segmented(['auto', 'light', 'dark'], s.theme, function (val) { s.theme = val; Store.saveSettings(); applyTheme(); },
        { auto: 'Auto', light: 'Light', dark: 'Dark' })));

    root.appendChild(settingRow('New letters per round', 'How many unseen letters a lesson introduces at most.',
      stepper(s.newPerSession, 2, 20, function (val) { s.newPerSession = val; Store.saveSettings(); })));

    root.appendChild(settingRow('Sound under each letter', 'Show the pronunciation on the chart while you browse.',
      segmented(['on', 'off'], s.showRoman ? 'on' : 'off', function (val) { s.showRoman = val === 'on'; Store.saveSettings(); },
        { on: 'Show', off: 'Hide' })));

    var dz = h('div', { class: 'danger-zone' });
    dz.appendChild(h('h3', null, ['Reset progress']));
    dz.appendChild(h('p', null, ['Erase every lesson, letter score, streak and history on this device. This cannot be undone.']));
    var dzActions = h('div', { class: 'confirm-actions' });
    dzActions.appendChild(h('button', { class: 'btn danger', onclick: function () {
      clear(dzActions);
      dzActions.appendChild(h('button', { class: 'btn danger', onclick: function () { Store.resetAll(); renderSettings(); } }, ['Yes, erase everything']));
      dzActions.appendChild(h('button', { class: 'btn ghost', onclick: renderSettings }, ['Keep it']));
    } }, ['Reset progress']));
    dz.appendChild(dzActions);
    root.appendChild(dz);

    root.appendChild(h('div', { class: 'about', html:
      '<p>Boli keeps your progress on this device. There is no account and none of it is sent anywhere.</p>' +
      '<p>Pronunciation is fetched from a public text-to-speech service the moment you tap listen, so audio needs a connection.</p>' +
      '<p>The review uses spaced repetition: letters you miss return sooner and often, the ones you know drift further apart.</p>' }));

    root.appendChild(footer());
    mount(root);
  }

  function settingRow(title, note, control) {
    return h('div', { class: 'setting' }, [
      h('div', { class: 's-text' }, [h('div', { class: 's-title' }, [title]), h('div', { class: 's-note' }, [note])]),
      control
    ]);
  }
  function segmented(values, current, onPick, labels) {
    var seg = h('div', { class: 'seg' });
    values.forEach(function (v) {
      var b = h('button', { class: v === current ? 'on' : '', onclick: function () {
        onPick(v);
        Array.prototype.forEach.call(seg.children, function (c) { c.classList.remove('on'); });
        b.classList.add('on');
      } }, [labels[v]]);
      seg.appendChild(b);
    });
    return seg;
  }
  function stepper(value, min, max, onChange) {
    var val = h('span', { class: 'val' }, [String(value)]);
    function set(n) { value = Math.max(min, Math.min(max, n)); val.textContent = String(value); onChange(value); }
    return h('div', { class: 'stepper' }, [
      h('button', { onclick: function () { set(value - 1); } }, ['−']),
      val,
      h('button', { onclick: function () { set(value + 1); } }, ['+'])
    ]);
  }

  // --------------------------------------------------------------- shared
  function footer() { return h('footer', { class: 'foot' }, ['Boli · read what you already speak']); }
  function applyTheme() { document.documentElement.setAttribute('data-theme', Store.settings().theme); }

  // ----------------------------------------------------------------- start
  applyTheme();
  window.addEventListener('hashchange', route);
  route();
})();
