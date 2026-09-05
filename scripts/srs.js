/*
 * Spaced repetition.
 *
 * A pared-down SM-2 with short learning steps so a freshly missed
 * letter comes back inside the same sitting, then stretches out as it
 * sticks. Cards you get wrong lose ease and drop back to relearning,
 * so the deck naturally leans on your weak spots.
 *
 *   stage        new -> learning -> review
 *   learningStep index into LEARN_STEPS while in learning/relearning
 *   ease         multiplier for review intervals (min 1.3)
 *   interval     days until next due, once in review
 *   due          timestamp (ms) it becomes available again
 *   reps         successful reviews in a row
 *   lapses       times a known card was missed
 *   seen         total times shown
 *   correct      total correct
 */
(function () {
  'use strict';

  var MIN = 60 * 1000;
  var DAY = 24 * 60 * MIN;
  var LEARN_STEPS = [1 * MIN, 10 * MIN];   // graduate after these
  var GRAD_INTERVAL = 1;                    // days, first review interval
  var EASY_BONUS = 1.3;
  var MASTER_DAYS = 21;                     // interval that counts as mastered

  function freshState() {
    return {
      stage: 'new',
      learningStep: 0,
      ease: 2.5,
      interval: 0,
      due: 0,
      reps: 0,
      lapses: 0,
      seen: 0,
      correct: 0
    };
  }

  // Grade one answer. quality is a small hint: 'again' | 'good' | 'easy'.
  function grade(state, quality) {
    var now = Date.now();
    state.seen += 1;
    var correct = quality !== 'again';
    if (correct) state.correct += 1;

    if (state.stage === 'new' || state.stage === 'learning') {
      if (!correct) {
        state.learningStep = 0;
        state.reps = 0;
        state.due = now + LEARN_STEPS[0];
        state.stage = 'learning';
        return state;
      }
      var next = state.learningStep + (quality === 'easy' ? 2 : 1);
      if (next >= LEARN_STEPS.length) {
        // Graduate into the review pool.
        state.stage = 'review';
        state.reps = 1;
        state.interval = quality === 'easy' ? GRAD_INTERVAL * 2 : GRAD_INTERVAL;
        state.due = now + state.interval * DAY;
      } else {
        state.learningStep = next;
        state.stage = 'learning';
        state.due = now + LEARN_STEPS[next];
      }
      return state;
    }

    // stage === 'review'
    if (!correct) {
      state.lapses += 1;
      state.reps = 0;
      state.stage = 'learning';
      state.learningStep = 0;
      state.ease = Math.max(1.3, state.ease - 0.2);
      state.interval = 0;
      state.due = now + LEARN_STEPS[0];
      return state;
    }

    state.reps += 1;
    if (quality === 'easy') state.ease += 0.15;
    var factor = state.ease * (quality === 'easy' ? EASY_BONUS : 1);
    state.interval = Math.max(1, Math.round(state.interval * factor));
    state.due = now + state.interval * DAY;
    return state;
  }

  function isMastered(state) {
    return state && state.stage === 'review' && state.interval >= MASTER_DAYS;
  }

  // Grade one specific card and persist it. Used by both the review
  // scheduler and the guided lessons.
  function answerCard(langId, card, quality) {
    var store = window.BoliStore;
    var s = store.getCardState(langId, card.id) || freshState();
    grade(s, quality);
    store.setCardState(langId, card.id, s);
    store.logReview(quality !== 'again');
    store.saveProgress();
    return s;
  }

  // Four choices for a card: the answer plus three plausible neighbours,
  // drawn first from the same group and topped up from the wider pool.
  function buildOptions(pool, card) {
    var sameGroup = pool.filter(function (c) {
      return c.group === card.group && c.roman !== card.roman;
    });
    var wider = pool.filter(function (c) { return c.roman !== card.roman; });
    var picks = shuffle(sameGroup).slice(0, 3);
    var seen = {};
    picks.forEach(function (c) { seen[c.roman] = true; });
    var wshuf = shuffle(wider);
    for (var i = 0; picks.length < 3 && i < wshuf.length; i++) {
      if (!seen[wshuf[i].roman]) { picks.push(wshuf[i]); seen[wshuf[i].roman] = true; }
    }
    var opts = picks.map(function (c) { return c.roman; });
    opts.push(card.roman);
    return shuffle(opts);
  }

  /*
   * A scheduler bound to one language (optionally one group). It hands
   * out the next card to show and keeps light per-session counters so
   * new letters trickle in rather than flooding.
   */
  function Scheduler(langId, opts) {
    opts = opts || {};
    var store = window.BoliStore;
    var pool = opts.cards.slice();          // ordered list of card objects
    var newBudget = opts.newPerSession != null ? opts.newPerSession : 6;
    var introduced = 0;
    var lastId = null;

    function stateFor(card) {
      var s = store.getCardState(langId, card.id);
      if (!s) { s = freshState(); store.setCardState(langId, card.id, s); }
      return s;
    }

    function next() {
      var now = Date.now();
      var dueCards = [];
      var newCards = [];
      var futureLearning = [];

      pool.forEach(function (card) {
        var s = stateFor(card);
        if (s.stage === 'new') { newCards.push(card); return; }
        if (s.due <= now) { dueCards.push({ card: card, due: s.due }); return; }
        if (s.stage === 'learning') futureLearning.push({ card: card, due: s.due });
      });

      // Prefer whatever is actually due, soonest first, but avoid
      // repeating the very last card back to back when we can.
      dueCards.sort(function (a, b) { return a.due - b.due; });
      var pick = firstDifferent(dueCards);
      if (pick) return build(pick, stateFor(pick));

      // Trickle in a new letter.
      if (newCards.length && introduced < newBudget) {
        introduced += 1;
        return build(newCards[0], stateFor(newCards[0]));
      }

      // Nothing strictly due: keep a learning card moving so the sitting
      // does not stall waiting on a one minute step timer.
      futureLearning.sort(function (a, b) { return a.due - b.due; });
      var lp = firstDifferent(futureLearning);
      if (lp) return build(lp, stateFor(lp));

      // Budget spent and nothing waiting. The round is done; the rest of
      // the deck is left for a later sitting, which is the whole point of
      // spacing it out.
      return null;
    }

    function firstDifferent(arr) {
      if (!arr.length) return null;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].card.id !== lastId) return arr[i].card;
      }
      return arr[0].card;
    }

    function build(card, state) {
      lastId = card.id;
      return { card: card, state: state, options: buildOptions(pool, card) };
    }

    function answer(card, quality) {
      return answerCard(langId, card, quality);
    }

    return { next: next, answer: answer, introducedCount: function () { return introduced; } };
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Roll-up stats for a language, for the progress ledger.
  function summarise(langId, cards) {
    var store = window.BoliStore;
    var out = { total: cards.length, mastered: 0, review: 0, learning: 0, unseen: 0, correct: 0, seen: 0, due: 0 };
    var now = Date.now();
    cards.forEach(function (card) {
      var s = store.getCardState(langId, card.id);
      if (!s || s.stage === 'new') { out.unseen += 1; return; }
      out.seen += s.seen;
      out.correct += s.correct;
      if (isMastered(s)) out.mastered += 1;
      else if (s.stage === 'review') out.review += 1;
      else out.learning += 1;
      if (s.due <= now) out.due += 1;
    });
    out.accuracy = out.seen ? Math.round((out.correct / out.seen) * 100) : null;
    return out;
  }

  window.BoliSRS = {
    Scheduler: Scheduler,
    isMastered: isMastered,
    summarise: summarise,
    options: buildOptions,
    answerCard: answerCard
  };
})();
