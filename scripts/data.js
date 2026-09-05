/*
 * Boli character data.
 *
 * Each language has three groups: vowels (independent letters),
 * consonants, and matras (vowel signs shown attached to the base
 * consonant "ka" so the learner reads the combined shape).
 *
 * Fields per character:
 *   glyph  the character as it is written
 *   roman  the sound, written the practical way a speaker would say it
 *   name   optional traditional name (used mostly for matras)
 *   hint   a short nudge about the sound; kept plain on purpose
 *
 * Romanisation is deliberately practical, not academic. The learner
 * already speaks the language; the job here is only to hang a known
 * sound onto a shape.
 */
(function () {
  'use strict';

  var languages = [
    {
      id: 'odia',
      name: 'Odia',
      native: 'ଓଡ଼ିଆ',
      speak: 'or-IN',
      sample: 'ଅ',
      region: 'Odisha',
      blurb: 'The round, unbroken lettering of Odisha.'
    },
    {
      id: 'telugu',
      name: 'Telugu',
      native: 'తెలుగు',
      speak: 'te-IN',
      sample: 'అ',
      region: 'Andhra Pradesh and Telangana',
      blurb: 'Looping curves that people call the script of pearls.'
    },
    {
      id: 'punjabi',
      name: 'Punjabi',
      native: 'ਪੰਜਾਬੀ',
      speak: 'pa-IN',
      sample: 'ਅ',
      region: 'Punjab',
      blurb: 'Gurmukhi, hung neatly from its headline.'
    }
  ];

  var chars = {};

  // ---------------------------------------------------------------- Odia
  chars.odia = {
    vowels: [
      { glyph: 'ଅ', roman: 'a', hint: 'short, as in about' },
      { glyph: 'ଆ', roman: 'aa', hint: 'long, as in father' },
      { glyph: 'ଇ', roman: 'i', hint: 'short, as in sit' },
      { glyph: 'ଈ', roman: 'ii', hint: 'long, as in see' },
      { glyph: 'ଉ', roman: 'u', hint: 'short, as in put' },
      { glyph: 'ଊ', roman: 'uu', hint: 'long, as in boot' },
      { glyph: 'ଋ', roman: 'ru', hint: 'the ri in rishi' },
      { glyph: 'ଏ', roman: 'e', hint: 'as in they' },
      { glyph: 'ଐ', roman: 'ai', hint: 'as in eye' },
      { glyph: 'ଓ', roman: 'o', hint: 'as in go' },
      { glyph: 'ଔ', roman: 'au', hint: 'as in cow' }
    ],
    consonants: [
      { glyph: 'କ', roman: 'ka' },
      { glyph: 'ଖ', roman: 'kha', hint: 'with a puff of air' },
      { glyph: 'ଗ', roman: 'ga' },
      { glyph: 'ଘ', roman: 'gha', hint: 'with a puff of air' },
      { glyph: 'ଙ', roman: 'nga', hint: 'as in sing' },
      { glyph: 'ଚ', roman: 'cha' },
      { glyph: 'ଛ', roman: 'chha', hint: 'with a puff of air' },
      { glyph: 'ଜ', roman: 'ja' },
      { glyph: 'ଝ', roman: 'jha', hint: 'with a puff of air' },
      { glyph: 'ଞ', roman: 'nya', hint: 'as in the ny of canyon' },
      { glyph: 'ଟ', roman: 'Ta', hint: 'hard T, tongue curled back' },
      { glyph: 'ଠ', roman: 'Tha', hint: 'hard T with air' },
      { glyph: 'ଡ', roman: 'Da', hint: 'hard D, tongue curled back' },
      { glyph: 'ଢ', roman: 'Dha', hint: 'hard D with air' },
      { glyph: 'ଣ', roman: 'Na', hint: 'hard N, tongue curled back' },
      { glyph: 'ତ', roman: 'ta', hint: 'soft t, tongue on teeth' },
      { glyph: 'ଥ', roman: 'tha', hint: 'soft t with air' },
      { glyph: 'ଦ', roman: 'da', hint: 'soft d, tongue on teeth' },
      { glyph: 'ଧ', roman: 'dha', hint: 'soft d with air' },
      { glyph: 'ନ', roman: 'na', hint: 'soft n' },
      { glyph: 'ପ', roman: 'pa' },
      { glyph: 'ଫ', roman: 'pha', hint: 'with a puff of air' },
      { glyph: 'ବ', roman: 'ba' },
      { glyph: 'ଭ', roman: 'bha', hint: 'with a puff of air' },
      { glyph: 'ମ', roman: 'ma' },
      { glyph: 'ଯ', roman: 'ya', hint: 'often said like ja' },
      { glyph: 'ର', roman: 'ra' },
      { glyph: 'ଲ', roman: 'la' },
      { glyph: 'ଳ', roman: 'La', hint: 'hard l, tongue curled back' },
      { glyph: 'ଵ', roman: 'wa' },
      { glyph: 'ଶ', roman: 'sha' },
      { glyph: 'ଷ', roman: 'Sha', hint: 'hard sh' },
      { glyph: 'ସ', roman: 'sa' },
      { glyph: 'ହ', roman: 'ha' },
      { glyph: 'ଡ଼', roman: 'Ra', hint: 'a flapped hard r' },
      { glyph: 'ୟ', roman: 'ya' }
    ],
    matras: [
      { glyph: 'କ', roman: 'ka', name: 'no sign', hint: 'bare consonant, the built-in a' },
      { glyph: 'କା', roman: 'kaa', name: 'kaara', hint: 'the aa sign' },
      { glyph: 'କି', roman: 'ki', name: 'hrasva i', hint: 'the i sign, sits before' },
      { glyph: 'କୀ', roman: 'kii', name: 'dirgha i', hint: 'the long ii sign' },
      { glyph: 'କୁ', roman: 'ku', name: 'hrasva u', hint: 'the u sign, hangs below' },
      { glyph: 'କୂ', roman: 'kuu', name: 'dirgha u', hint: 'the long uu sign' },
      { glyph: 'କୃ', roman: 'kru', name: 'ru kaara', hint: 'the vocalic r sign' },
      { glyph: 'କେ', roman: 'ke', name: 'e kaara', hint: 'the e sign' },
      { glyph: 'କୈ', roman: 'kai', name: 'ai kaara', hint: 'the ai sign' },
      { glyph: 'କୋ', roman: 'ko', name: 'o kaara', hint: 'the o sign' },
      { glyph: 'କୌ', roman: 'kau', name: 'au kaara', hint: 'the au sign' }
    ]
  };

  // -------------------------------------------------------------- Telugu
  chars.telugu = {
    vowels: [
      { glyph: 'అ', roman: 'a', hint: 'short, as in about' },
      { glyph: 'ఆ', roman: 'aa', hint: 'long, as in father' },
      { glyph: 'ఇ', roman: 'i', hint: 'short, as in sit' },
      { glyph: 'ఈ', roman: 'ii', hint: 'long, as in see' },
      { glyph: 'ఉ', roman: 'u', hint: 'short, as in put' },
      { glyph: 'ఊ', roman: 'uu', hint: 'long, as in boot' },
      { glyph: 'ఋ', roman: 'ru', hint: 'the ri in rishi' },
      { glyph: 'ఎ', roman: 'e', hint: 'short, as in bed' },
      { glyph: 'ఏ', roman: 'ee', hint: 'long, as in they' },
      { glyph: 'ఐ', roman: 'ai', hint: 'as in eye' },
      { glyph: 'ఒ', roman: 'o', hint: 'short, as in for' },
      { glyph: 'ఓ', roman: 'oo', hint: 'long, as in go' },
      { glyph: 'ఔ', roman: 'au', hint: 'as in cow' }
    ],
    consonants: [
      { glyph: 'క', roman: 'ka' },
      { glyph: 'ఖ', roman: 'kha', hint: 'with a puff of air' },
      { glyph: 'గ', roman: 'ga' },
      { glyph: 'ఘ', roman: 'gha', hint: 'with a puff of air' },
      { glyph: 'ఙ', roman: 'nga', hint: 'as in sing' },
      { glyph: 'చ', roman: 'cha' },
      { glyph: 'ఛ', roman: 'chha', hint: 'with a puff of air' },
      { glyph: 'జ', roman: 'ja' },
      { glyph: 'ఝ', roman: 'jha', hint: 'with a puff of air' },
      { glyph: 'ఞ', roman: 'nya', hint: 'as in the ny of canyon' },
      { glyph: 'ట', roman: 'Ta', hint: 'hard T, tongue curled back' },
      { glyph: 'ఠ', roman: 'Tha', hint: 'hard T with air' },
      { glyph: 'డ', roman: 'Da', hint: 'hard D, tongue curled back' },
      { glyph: 'ఢ', roman: 'Dha', hint: 'hard D with air' },
      { glyph: 'ణ', roman: 'Na', hint: 'hard N, tongue curled back' },
      { glyph: 'త', roman: 'ta', hint: 'soft t, tongue on teeth' },
      { glyph: 'థ', roman: 'tha', hint: 'soft t with air' },
      { glyph: 'ద', roman: 'da', hint: 'soft d, tongue on teeth' },
      { glyph: 'ధ', roman: 'dha', hint: 'soft d with air' },
      { glyph: 'న', roman: 'na', hint: 'soft n' },
      { glyph: 'ప', roman: 'pa' },
      { glyph: 'ఫ', roman: 'pha', hint: 'with a puff of air' },
      { glyph: 'బ', roman: 'ba' },
      { glyph: 'భ', roman: 'bha', hint: 'with a puff of air' },
      { glyph: 'మ', roman: 'ma' },
      { glyph: 'య', roman: 'ya' },
      { glyph: 'ర', roman: 'ra' },
      { glyph: 'ల', roman: 'la' },
      { glyph: 'వ', roman: 'wa' },
      { glyph: 'శ', roman: 'sha' },
      { glyph: 'ష', roman: 'Sha', hint: 'hard sh' },
      { glyph: 'స', roman: 'sa' },
      { glyph: 'హ', roman: 'ha' },
      { glyph: 'ళ', roman: 'La', hint: 'hard l, tongue curled back' },
      { glyph: 'క్ష', roman: 'ksha', hint: 'a joined k and sh' }
    ],
    matras: [
      { glyph: 'క', roman: 'ka', name: 'no sign', hint: 'bare consonant, the built-in a' },
      { glyph: 'కా', roman: 'kaa', name: 'aa', hint: 'the aa sign' },
      { glyph: 'కి', roman: 'ki', name: 'i', hint: 'the i sign' },
      { glyph: 'కీ', roman: 'kii', name: 'ii', hint: 'the long ii sign' },
      { glyph: 'కు', roman: 'ku', name: 'u', hint: 'the u sign' },
      { glyph: 'కూ', roman: 'kuu', name: 'uu', hint: 'the long uu sign' },
      { glyph: 'కృ', roman: 'kru', name: 'ru', hint: 'the vocalic r sign' },
      { glyph: 'కె', roman: 'ke', name: 'e', hint: 'the short e sign' },
      { glyph: 'కే', roman: 'kee', name: 'ee', hint: 'the long ee sign' },
      { glyph: 'కై', roman: 'kai', name: 'ai', hint: 'the ai sign' },
      { glyph: 'కొ', roman: 'ko', name: 'o', hint: 'the short o sign' },
      { glyph: 'కో', roman: 'koo', name: 'oo', hint: 'the long oo sign' },
      { glyph: 'కౌ', roman: 'kau', name: 'au', hint: 'the au sign' }
    ]
  };

  // ------------------------------------------------------------- Punjabi
  chars.punjabi = {
    vowels: [
      { glyph: 'ਅ', roman: 'a', name: 'aira', hint: 'short, as in about' },
      { glyph: 'ਆ', roman: 'aa', hint: 'long, as in father' },
      { glyph: 'ਇ', roman: 'i', hint: 'short, as in sit' },
      { glyph: 'ਈ', roman: 'ee', hint: 'long, as in see' },
      { glyph: 'ਉ', roman: 'u', hint: 'short, as in put' },
      { glyph: 'ਊ', roman: 'oo', hint: 'long, as in boot' },
      { glyph: 'ਏ', roman: 'e', hint: 'as in they' },
      { glyph: 'ਐ', roman: 'ai', hint: 'as in air' },
      { glyph: 'ਓ', roman: 'o', hint: 'as in go' },
      { glyph: 'ਔ', roman: 'au', hint: 'as in caught' }
    ],
    consonants: [
      { glyph: 'ਸ', roman: 'sa' },
      { glyph: 'ਹ', roman: 'ha' },
      { glyph: 'ਕ', roman: 'ka' },
      { glyph: 'ਖ', roman: 'kha', hint: 'with a puff of air' },
      { glyph: 'ਗ', roman: 'ga' },
      { glyph: 'ਘ', roman: 'gha', hint: 'with a puff of air' },
      { glyph: 'ਙ', roman: 'nga', hint: 'as in sing' },
      { glyph: 'ਚ', roman: 'cha' },
      { glyph: 'ਛ', roman: 'chha', hint: 'with a puff of air' },
      { glyph: 'ਜ', roman: 'ja' },
      { glyph: 'ਝ', roman: 'jha', hint: 'with a puff of air' },
      { glyph: 'ਞ', roman: 'nya', hint: 'as in the ny of canyon' },
      { glyph: 'ਟ', roman: 'Ta', hint: 'hard T, tongue curled back' },
      { glyph: 'ਠ', roman: 'Tha', hint: 'hard T with air' },
      { glyph: 'ਡ', roman: 'Da', hint: 'hard D, tongue curled back' },
      { glyph: 'ਢ', roman: 'Dha', hint: 'hard D with air' },
      { glyph: 'ਣ', roman: 'Na', hint: 'hard N, tongue curled back' },
      { glyph: 'ਤ', roman: 'ta', hint: 'soft t, tongue on teeth' },
      { glyph: 'ਥ', roman: 'tha', hint: 'soft t with air' },
      { glyph: 'ਦ', roman: 'da', hint: 'soft d, tongue on teeth' },
      { glyph: 'ਧ', roman: 'dha', hint: 'soft d with air' },
      { glyph: 'ਨ', roman: 'na', hint: 'soft n' },
      { glyph: 'ਪ', roman: 'pa' },
      { glyph: 'ਫ', roman: 'pha', hint: 'with a puff of air' },
      { glyph: 'ਬ', roman: 'ba' },
      { glyph: 'ਭ', roman: 'bha', hint: 'with a puff of air' },
      { glyph: 'ਮ', roman: 'ma' },
      { glyph: 'ਯ', roman: 'ya' },
      { glyph: 'ਰ', roman: 'ra' },
      { glyph: 'ਲ', roman: 'la' },
      { glyph: 'ਵ', roman: 'wa' },
      { glyph: 'ੜ', roman: 'Rra', hint: 'a flapped hard r' },
      { glyph: 'ਸ਼', roman: 'sha', hint: 'with the dot below' },
      { glyph: 'ਜ਼', roman: 'za', hint: 'with the dot below' },
      { glyph: 'ਫ਼', roman: 'fa', hint: 'with the dot below' }
    ],
    matras: [
      { glyph: 'ਕ', roman: 'ka', name: 'mukta', hint: 'bare consonant, the built-in a' },
      { glyph: 'ਕਾ', roman: 'kaa', name: 'kanna', hint: 'the aa sign' },
      { glyph: 'ਕਿ', roman: 'ki', name: 'sihari', hint: 'the i sign, sits before' },
      { glyph: 'ਕੀ', roman: 'kee', name: 'bihari', hint: 'the long ee sign' },
      { glyph: 'ਕੁ', roman: 'ku', name: 'aunkar', hint: 'the u sign, hangs below' },
      { glyph: 'ਕੂ', roman: 'koo', name: 'dulainkar', hint: 'the long oo sign' },
      { glyph: 'ਕੇ', roman: 'ke', name: 'laav', hint: 'the e sign' },
      { glyph: 'ਕੈ', roman: 'kai', name: 'dulaav', hint: 'the ai sign' },
      { glyph: 'ਕੋ', roman: 'ko', name: 'hora', hint: 'the o sign' },
      { glyph: 'ਕੌ', roman: 'kau', name: 'kanaura', hint: 'the au sign' }
    ]
  };

  // Real words for the reading lessons. Kept deliberately simple: common,
  // everyday words with no conjuncts, so each one decodes as a plain run of
  // consonants and vowel signs the path has already taught. A reading
  // lesson only shows a word once every consonant in it has been learned.
  //   w  the word, r  how it reads, m  what it means
  var words = {
    odia: [
      { w: 'ଘର', r: 'ghara', m: 'house' },
      { w: 'ପାଣି', r: 'paani', m: 'water' },
      { w: 'ମା', r: 'maa', m: 'mother' },
      { w: 'ବାପା', r: 'baapaa', m: 'father' },
      { w: 'ଭାତ', r: 'bhaata', m: 'rice' },
      { w: 'ହାତ', r: 'haata', m: 'hand' },
      { w: 'ପାଦ', r: 'paada', m: 'foot' },
      { w: 'ଆଖି', r: 'aakhi', m: 'eye' },
      { w: 'କାନ', r: 'kaana', m: 'ear' },
      { w: 'ନାକ', r: 'naaka', m: 'nose' },
      { w: 'ଦିନ', r: 'dina', m: 'day' },
      { w: 'ରାତି', r: 'raati', m: 'night' },
      { w: 'ନାମ', r: 'naama', m: 'name' },
      { w: 'ଜଳ', r: 'jala', m: 'water' },
      { w: 'ଫୁଲ', r: 'phula', m: 'flower' },
      { w: 'ଫଳ', r: 'phala', m: 'fruit' },
      { w: 'ମାଛ', r: 'maachha', m: 'fish' },
      { w: 'ଗାଈ', r: 'gaaii', m: 'cow' },
      { w: 'କୁକୁର', r: 'kukura', m: 'dog' },
      { w: 'ପାଠ', r: 'paatha', m: 'lesson' },
      { w: 'ବହି', r: 'bahi', m: 'book' },
      { w: 'ବାଟ', r: 'baata', m: 'path' },
      { w: 'ପବନ', r: 'pabana', m: 'wind' },
      { w: 'ଦୁଧ', r: 'dudha', m: 'milk' },
      { w: 'ଲୁଣ', r: 'luna', m: 'salt' },
      { w: 'ପିଲା', r: 'pilaa', m: 'child' },
      { w: 'ହରିଣ', r: 'harina', m: 'deer' }
    ],
    telugu: [
      { w: 'నీరు', r: 'niiru', m: 'water' },
      { w: 'పాలు', r: 'paalu', m: 'milk' },
      { w: 'గది', r: 'gadi', m: 'room' },
      { w: 'బడి', r: 'badi', m: 'school' },
      { w: 'కాకి', r: 'kaaki', m: 'crow' },
      { w: 'చేప', r: 'cheepa', m: 'fish' },
      { w: 'పులి', r: 'puli', m: 'tiger' },
      { w: 'మేక', r: 'meeka', m: 'goat' },
      { w: 'నది', r: 'nadi', m: 'river' },
      { w: 'అడవి', r: 'adavi', m: 'forest' },
      { w: 'ఆకు', r: 'aaku', m: 'leaf' },
      { w: 'చెవి', r: 'chevi', m: 'ear' },
      { w: 'నోరు', r: 'nooru', m: 'mouth' },
      { w: 'కాలు', r: 'kaalu', m: 'leg' },
      { w: 'తల', r: 'tala', m: 'head' },
      { w: 'రోజు', r: 'rooju', m: 'day' },
      { w: 'పేరు', r: 'peeru', m: 'name' },
      { w: 'ఊరు', r: 'uuru', m: 'village' },
      { w: 'గాలి', r: 'gaali', m: 'wind' },
      { w: 'వాన', r: 'vaana', m: 'rain' },
      { w: 'చీర', r: 'chiira', m: 'saree' },
      { w: 'గుడి', r: 'gudi', m: 'temple' },
      { w: 'కారు', r: 'kaaru', m: 'car' },
      { w: 'బాట', r: 'baata', m: 'path' }
    ],
    punjabi: [
      { w: 'ਘਰ', r: 'ghar', m: 'house' },
      { w: 'ਪਾਣੀ', r: 'paani', m: 'water' },
      { w: 'ਮਾਤਾ', r: 'maataa', m: 'mother' },
      { w: 'ਪਿਤਾ', r: 'pitaa', m: 'father' },
      { w: 'ਦਿਨ', r: 'din', m: 'day' },
      { w: 'ਰਾਤ', r: 'raat', m: 'night' },
      { w: 'ਨਾਮ', r: 'naam', m: 'name' },
      { w: 'ਕਿਤਾਬ', r: 'kitaab', m: 'book' },
      { w: 'ਕਮਲ', r: 'kamal', m: 'lotus' },
      { w: 'ਸਿਰ', r: 'sir', m: 'head' },
      { w: 'ਪੈਰ', r: 'pair', m: 'foot' },
      { w: 'ਦਾਲ', r: 'daal', m: 'lentils' },
      { w: 'ਰੋਟੀ', r: 'roti', m: 'bread' },
      { w: 'ਚਾਹ', r: 'chaah', m: 'tea' },
      { w: 'ਕਾਰ', r: 'kaar', m: 'car' },
      { w: 'ਦੁਕਾਨ', r: 'dukaan', m: 'shop' },
      { w: 'ਸੂਰਜ', r: 'sooraj', m: 'sun' },
      { w: 'ਤਾਰਾ', r: 'taaraa', m: 'star' },
      { w: 'ਫਲ', r: 'phal', m: 'fruit' },
      { w: 'ਕੁਰਸੀ', r: 'kursi', m: 'chair' },
      { w: 'ਹਵਾ', r: 'hawaa', m: 'wind' },
      { w: 'ਲੜਕਾ', r: 'larkaa', m: 'boy' },
      { w: 'ਲੜਕੀ', r: 'larki', m: 'girl' },
      { w: 'ਸੜਕ', r: 'sarak', m: 'road' },
      { w: 'ਘੋੜਾ', r: 'ghoraa', m: 'horse' }
    ]
  };

  var groupMeta = [
    { key: 'vowels', label: 'Vowels', note: 'The full letters that stand on their own.' },
    { key: 'consonants', label: 'Consonants', note: 'Each one carries a built-in a.' },
    { key: 'matras', label: 'Vowel signs', note: 'What a vowel becomes when it clings to a consonant. Shown here on ka.' }
  ];

  // Attach a stable id to every character so progress survives reloads,
  // and derive the few extra fields the lesson and word-building engine
  // needs. Nothing here is language specific: the vowel-sign character is
  // whatever the matra glyph adds to its base ka, and a consonant's base
  // sound is its name without the built-in trailing a.
  languages.forEach(function (lang) {
    groupMeta.forEach(function (g) {
      var list = chars[lang.id][g.key] || [];
      list.forEach(function (c, i) {
        c.id = lang.id + '.' + g.key + '.' + i;
        c.group = g.key;
        c.lang = lang.id;
        if (g.key === 'matras') {
          c.sign = c.glyph.slice(1);    // drop the leading ka, keep the sign
          c.vowel = c.roman.slice(1);   // "kaa" -> "aa", "ka" -> "a"
        }
        if (g.key === 'consonants') {
          c.base = c.roman.replace(/a$/, '');
        }
      });
    });
  });

  function all(langId) {
    var out = [];
    groupMeta.forEach(function (g) {
      out = out.concat(chars[langId][g.key] || []);
    });
    return out;
  }

  window.BOLI_DATA = {
    languages: languages,
    groups: groupMeta,
    chars: chars,
    words: words,
    all: all,
    lang: function (id) {
      return languages.filter(function (l) { return l.id === id; })[0];
    }
  };
})();
