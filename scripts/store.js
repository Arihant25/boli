/*
 * Persistence. Progress and settings live in localStorage on this
 * device. No network, no account, nothing leaves the browser. The
 * reset button clears both keys completely.
 */
(function () {
  'use strict';

  var KEY_PROGRESS = 'boli.progress.v2';
  var KEY_SETTINGS = 'boli.settings.v1';

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function defaultProgress() {
    return {
      version: 2,
      languages: {},   // langId -> { cards: { cardId: state } }
      lessons: {},     // langId -> { done: { lessonId: true } }
      meta: {
        streak: 0,
        lastStudyDay: null,
        days: {}       // 'YYYY-MM-DD' -> { reviews, correct }
      }
    };
  }

  function defaultSettings() {
    return {
      theme: 'auto',        // auto | light | dark
      newPerSession: 6,     // how many unseen letters to introduce per sitting
      showRoman: true,      // show the sound under the glyph while browsing
      lastLanguage: null
    };
  }

  var progress = migrate(read(KEY_PROGRESS, null));
  var settings = Object.assign(defaultSettings(), read(KEY_SETTINGS, {}));

  function migrate(p) {
    if (!p || typeof p !== 'object') return defaultProgress();
    if (!p.languages) p.languages = {};
    if (!p.lessons) p.lessons = {};
    if (!p.meta) p.meta = { streak: 0, lastStudyDay: null, days: {} };
    if (!p.meta.days) p.meta.days = {};
    return p;
  }

  function langBucket(langId) {
    if (!progress.languages[langId]) {
      progress.languages[langId] = { cards: {} };
    }
    return progress.languages[langId];
  }

  function lessonBucket(langId) {
    if (!progress.lessons[langId]) progress.lessons[langId] = { done: {} };
    return progress.lessons[langId];
  }

  function saveProgress() { write(KEY_PROGRESS, progress); }
  function saveSettings() { write(KEY_SETTINGS, settings); }

  // Record that a review happened, keep the daily tally and the streak.
  function logReview(correct) {
    var t = today();
    var meta = progress.meta;
    if (!meta.days[t]) meta.days[t] = { reviews: 0, correct: 0 };
    meta.days[t].reviews += 1;
    if (correct) meta.days[t].correct += 1;

    if (meta.lastStudyDay !== t) {
      var y = new Date();
      y.setDate(y.getDate() - 1);
      var yStr = y.getFullYear() + '-' +
        String(y.getMonth() + 1).padStart(2, '0') + '-' +
        String(y.getDate()).padStart(2, '0');
      if (meta.lastStudyDay === yStr) meta.streak += 1;
      else meta.streak = 1;
      meta.lastStudyDay = t;
    }
  }

  window.BoliStore = {
    today: today,
    getCardState: function (langId, cardId) {
      return langBucket(langId).cards[cardId] || null;
    },
    setCardState: function (langId, cardId, state) {
      langBucket(langId).cards[cardId] = state;
    },
    allCardStates: function (langId) {
      return langBucket(langId).cards;
    },
    meta: function () { return progress.meta; },
    logReview: logReview,
    saveProgress: saveProgress,
    markLessonDone: function (langId, lessonId) {
      lessonBucket(langId).done[lessonId] = true;
      saveProgress();
    },
    isLessonDone: function (langId, lessonId) {
      return !!lessonBucket(langId).done[lessonId];
    },
    lessonsDone: function (langId) {
      return lessonBucket(langId).done;
    },
    settings: function () { return settings; },
    saveSettings: saveSettings,
    resetAll: function () {
      progress = defaultProgress();
      write(KEY_PROGRESS, progress);
    },
    resetLanguage: function (langId) {
      progress.languages[langId] = { cards: {} };
      progress.lessons[langId] = { done: {} };
      saveProgress();
    }
  };
})();
