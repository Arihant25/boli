# Boli

**Read what you already speak.**

Plenty of people speak their mother tongue fluently and never learned to
read it. Boli is for them. It teaches the letters and vowel signs of a
script a few at a time, ties each one to a sound the learner already
knows, and then has them start sounding out words.

Three scripts are supported to begin with: **Odia**, **Telugu**, and
**Punjabi (Gurmukhi)**.

## How it works

- **A guided path.** Each language is laid out as an ordered set of small
  lessons. A lesson introduces a handful of new letters one at a time,
  drills them, and mixes them with what came before. New sounds are always
  taught before you are asked to recall them.
- **Reading lessons.** Once you know enough consonants and vowel signs,
  reading lessons unlock. They build short syllables and words out of only
  the letters you have already met, and ask you to sound them out.
- **Spaced repetition.** Review uses a pared-down SM-2 schedule: letters
  you miss come back soon and often, the ones you know drift further
  apart, so your time lands where it is needed.
- **All letters at a glance.** The browse view shows the whole script on
  one page. Tap any letter to hear it; a dot marks what you have started
  and mastered.
- **Audio.** Pronunciation is fetched from a free, keyless text-to-speech
  service when you tap listen. Telugu and Punjabi use their own voices;
  Odia is transliterated to the aligned Devanagari and read with the Hindi
  voice, which lands on the same sounds.

## Your data

Everything is kept in your browser's local storage on this device. There
is no account and no sign-in, and your progress is never sent anywhere.
Settings has a **Reset progress** button that erases all of it.

## Running it

It is a static site with no build step. Open `index.html` in a browser,
or serve the folder:

```
python -m http.server 8000    # then visit http://localhost:8000
```

Audio needs a network connection, since pronunciation is fetched on
demand. Everything else works offline.

## Project layout

```
index.html          markup shell
styles/main.css      all styling
scripts/data.js      the letters, per language, with sounds and hints
scripts/store.js     local-storage persistence
scripts/srs.js       the spaced-repetition engine
scripts/lessons.js   the lesson path and word building
scripts/app.js       views, routing, audio
```

## A note on accuracy

The character sets and romanisations were assembled carefully, but a
native reader of each script is the best check. Corrections are welcome.
The words in reading lessons are generated from learned letters as
decoding practice; they are pronounceable combinations rather than a
curated vocabulary list.
