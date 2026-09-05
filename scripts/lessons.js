/*
 * The learning path.
 *
 * Instead of dropping the learner in front of the whole alphabet, Boli
 * lays the script out as an ordered path of small lessons. A lesson
 * teaches a handful of new letters, one at a time, then drills them.
 * Once enough consonants and vowel signs are known, reading lessons
 * unlock: the learner sounds out short built-up syllables and words
 * made only from letters they have already met.
 *
 * The path is built the same way every time, so a lesson's position is
 * its identity and completed lessons stay completed across reloads.
 */
(function () {
  'use strict';

  var DATA = window.BOLI_DATA;

  function chunk(arr, size) {
    var out = [];
    for (var i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // One syllable: a consonant carrying a vowel sound (its own built-in a,
  // or a vowel sign). Returns the written form and how it reads.
  function syllable(consonants, matras) {
    var c = pick(consonants);
    var m = pick(matras);
    return { glyph: c.glyph + m.sign, roman: c.base + m.vowel };
  }

  // A short readable string of two or three syllables.
  function word(consonants, matras, syllableCount) {
    var glyph = '', roman = '';
    for (var i = 0; i < syllableCount; i++) {
      var s = syllable(consonants, matras);
      glyph += s.glyph;
      roman += s.roman;
    }
    return { glyph: glyph, roman: roman };
  }

  // A set of reading prompts, each with four romanised choices. Every
  // prompt is built only from the letters the learner has reached.
  function makeReadingSet(consonants, matras, count) {
    // Keep the built words readable: skip letters that almost never start
    // a syllable (nga, nya) and the vocalic ru sign, and let the plain
    // built-in a turn up more often, the way it does in real words.
    var cons = consonants.filter(function (c) { return c.base !== 'ng' && c.base !== 'ny'; });
    if (cons.length < 2) cons = consonants;
    var mats = matras.filter(function (m) { return m.vowel !== 'ru'; });
    var bare = mats.filter(function (m) { return m.vowel === 'a'; });
    var weighted = mats.concat(bare, bare);   // the inherent a, weighted up
    consonants = cons;
    matras = weighted;

    var items = [], used = {}, guard = 0;
    while (items.length < count && guard++ < count * 30) {
      var n = 2 + (Math.random() < 0.35 ? 1 : 0);
      var w = word(consonants, matras, n);
      if (used[w.roman]) continue;
      used[w.roman] = true;
      items.push(w);
    }
    items.forEach(function (it) {
      var opts = [it.roman], g = 0;
      var len = Math.max(2, Math.min(3, Math.round(it.roman.length / 3)));
      while (opts.length < 4 && g++ < 80) {
        var d = word(consonants, matras, len).roman;
        if (opts.indexOf(d) === -1) opts.push(d);
      }
      it.options = shuffle(opts);
    });
    return items;
  }

  // Build the ordered path for a language.
  function build(langId) {
    var g = DATA.chars[langId];
    var vowelSets = chunk(g.vowels, 5);
    var consonantSets = chunk(g.consonants, 5);
    var matraSets = chunk(g.matras, 6);

    var lessons = [];
    var learnedConsonants = [];
    var matrasKnown = false;

    vowelSets.forEach(function (set, i) {
      lessons.push({
        type: 'letters',
        title: i === 0 ? 'Vowels' : 'More vowels',
        subtitle: 'The standalone vowels',
        items: set
      });
    });

    // The first consonant set, so ka exists before the vowel signs.
    if (consonantSets.length) {
      learnedConsonants = learnedConsonants.concat(consonantSets[0]);
      lessons.push(consonantLesson(consonantSets[0]));
    }

    matraSets.forEach(function (set, i) {
      lessons.push({
        type: 'letters',
        title: i === 0 ? 'Vowel signs' : 'More signs',
        subtitle: 'Signs that ride on a consonant',
        items: set
      });
    });
    matrasKnown = matraSets.length > 0;

    for (var k = 1; k < consonantSets.length; k++) {
      learnedConsonants = learnedConsonants.concat(consonantSets[k]);
      lessons.push(consonantLesson(consonantSets[k]));
      // After the learner has some consonants and the signs, slip in a
      // reading lesson every couple of new sets.
      if (matrasKnown && k % 2 === 0) {
        lessons.push(readingLesson(learnedConsonants, g.matras));
      }
    }
    if (matrasKnown) lessons.push(readingLesson(learnedConsonants, g.matras));

    lessons.forEach(function (l, i) {
      l.index = i;
      l.id = langId + '#' + i;
    });
    return lessons;
  }

  function consonantLesson(set) {
    return {
      type: 'letters',
      title: set[0].roman + ' … ' + set[set.length - 1].roman,
      subtitle: 'New consonants',
      items: set
    };
  }

  // Reading lessons keep a snapshot of what was learnable at that point;
  // the actual prompts are generated fresh each time it is played.
  function readingLesson(consonants, matras) {
    return {
      type: 'reading',
      title: 'Reading',
      subtitle: 'Sound out the letters you know',
      consonants: consonants.slice(),
      matras: matras.slice()
    };
  }

  window.BoliLessons = {
    build: build,
    makeReadingSet: makeReadingSet
  };
})();
