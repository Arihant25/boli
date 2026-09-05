/*
 * The learning path.
 *
 * Instead of dropping the learner in front of the whole alphabet, Boli
 * lays the script out as an ordered path of small lessons. A lesson
 * teaches a handful of new letters, one at a time, then drills them.
 * Once enough consonants and vowel signs are known, reading lessons
 * unlock: the learner reads real, everyday words made only from letters
 * they have already met.
 *
 * The path is built the same way every time, so a lesson's position is
 * its identity and completed lessons stay completed across reloads.
 */
(function () {
  'use strict';

  var DATA = window.BOLI_DATA;
  var MIN_WORDS = 4;   // a reading lesson needs at least this many readable words

  function chunk(arr, size) {
    var out = [];
    for (var i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Which of a language's consonants appear in a word. Cached on the word.
  function consonantsOf(langId, word) {
    if (word._cons) return word._cons;
    var found = [];
    DATA.chars[langId].consonants.forEach(function (c) {
      if (word.w.indexOf(c.glyph) !== -1) found.push(c.glyph);
    });
    word._cons = found;
    return found;
  }

  // The words a learner can already read: every consonant in them is known.
  function readableWords(langId, learnedConsonants) {
    var known = {};
    learnedConsonants.forEach(function (c) { known[c.glyph] = true; });
    return (DATA.words[langId] || []).filter(function (word) {
      return consonantsOf(langId, word).every(function (g) { return known[g]; });
    });
  }

  // A reading set: real words with four romanised choices each.
  function makeWordSet(langId, learnedConsonants, count) {
    var pool = readableWords(langId, learnedConsonants);
    var chosen = shuffle(pool).slice(0, count);
    var romans = pool.map(function (w) { return w.r; });
    return chosen.map(function (word) {
      var opts = [word.r];
      shuffle(romans).forEach(function (r) {
        if (opts.length < 4 && opts.indexOf(r) === -1) opts.push(r);
      });
      return { glyph: word.w, roman: word.r, meaning: word.m, options: shuffle(opts) };
    });
  }

  // Build the ordered path for a language.
  function build(langId) {
    var g = DATA.chars[langId];
    var vowelSets = chunk(g.vowels, 5);
    var consonantSets = chunk(g.consonants, 5);
    var matraSets = chunk(g.matras, 6);

    var lessons = [];
    var learnedConsonants = [];

    vowelSets.forEach(function (set, i) {
      lessons.push({ type: 'letters', title: i === 0 ? 'Vowels' : 'More vowels',
        subtitle: 'The standalone vowels', items: set });
    });

    // The first consonant set, so ka exists before the vowel signs.
    if (consonantSets.length) {
      learnedConsonants = learnedConsonants.concat(consonantSets[0]);
      lessons.push(consonantLesson(consonantSets[0]));
    }

    matraSets.forEach(function (set, i) {
      lessons.push({ type: 'letters', title: i === 0 ? 'Vowel signs' : 'More signs',
        subtitle: 'Signs that ride on a consonant', items: set });
    });
    var matrasKnown = matraSets.length > 0;

    for (var k = 1; k < consonantSets.length; k++) {
      learnedConsonants = learnedConsonants.concat(consonantSets[k]);
      lessons.push(consonantLesson(consonantSets[k]));
      // Slip in a reading lesson whenever enough real words have become
      // readable with the letters learned so far.
      if (matrasKnown && k % 2 === 0 && readableWords(langId, learnedConsonants).length >= MIN_WORDS) {
        lessons.push(readingLesson(langId, learnedConsonants));
      }
    }
    // A closing reading lesson over the whole word bank, unless the loop
    // just added one at the very end.
    if (matrasKnown && readableWords(langId, learnedConsonants).length >= MIN_WORDS &&
        lessons[lessons.length - 1].type !== 'reading') {
      lessons.push(readingLesson(langId, learnedConsonants));
    }

    lessons.forEach(function (l, i) { l.index = i; l.id = langId + '#' + i; });
    return lessons;
  }

  function consonantLesson(set) {
    return { type: 'letters', title: set[0].roman + ' … ' + set[set.length - 1].roman,
      subtitle: 'New consonants', items: set };
  }

  // Reading lessons keep a snapshot of what was learnable at that point;
  // the actual words are drawn fresh each time it is played.
  function readingLesson(langId, consonants) {
    return { type: 'reading', title: 'Reading', subtitle: 'Read real words',
      lang: langId, consonants: consonants.slice() };
  }

  window.BoliLessons = { build: build, makeWordSet: makeWordSet };
})();
