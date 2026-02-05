#!/usr/bin/env python3
"""
MP3 TTS Generator for English Words project.
Parses words.js and generates MP3 files using gTTS.
"""

import os
import re
import sys
import time
from gtts import gTTS

WORDS_JS_PATH = "/root/englishWords/public/words.js"
AUDIO_DIR = "/root/englishWords/public/audio"
WORDS_DIR = os.path.join(AUDIO_DIR, "words")
EXAMPLES_DIR = os.path.join(AUDIO_DIR, "examples")


def parse_words_js(filepath):
    """Parse words.js and extract word/example pairs."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Match each entry: { word: "...", ..., example: "..." }
    pattern = r'\{\s*word:\s*"([^"]+)"[^}]*example:\s*"([^"]+)"'
    matches = re.findall(pattern, content)

    words = []
    seen = set()
    for word, example in matches:
        if word not in seen:
            seen.add(word)
            words.append({"word": word, "example": example})

    return words


def generate_mp3(text, filepath, retries=3):
    """Generate an MP3 file from text using gTTS."""
    for attempt in range(retries):
        try:
            tts = gTTS(text=text, lang="en", tld="com")
            tts.save(filepath)
            return True
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** attempt
                print(f"  Retry in {wait}s: {e}")
                time.sleep(wait)
            else:
                print(f"  FAILED: {e}")
                return False


def main():
    # Parse words
    print("Parsing words.js...")
    words = parse_words_js(WORDS_JS_PATH)
    total = len(words)
    print(f"Found {total} unique words.\n")

    # Create output directories
    os.makedirs(WORDS_DIR, exist_ok=True)
    os.makedirs(EXAMPLES_DIR, exist_ok=True)

    # Generate word MP3s
    print("=== Generating word MP3s ===")
    word_created = 0
    word_skipped = 0
    for i, entry in enumerate(words, 1):
        word = entry["word"]
        filename = f"{word}.mp3"
        filepath = os.path.join(WORDS_DIR, filename)

        if os.path.exists(filepath):
            word_skipped += 1
            print(f"[{i}/{total}] SKIP (exists): {word}")
            continue

        print(f"[{i}/{total}] Generating word: {word}")
        if generate_mp3(word, filepath):
            word_created += 1
        # Small delay to avoid rate limiting
        time.sleep(0.3)

    print(f"\nWords: {word_created} created, {word_skipped} skipped\n")

    # Generate example MP3s
    print("=== Generating example MP3s ===")
    example_created = 0
    example_skipped = 0
    for i, entry in enumerate(words, 1):
        word = entry["word"]
        example = entry["example"]
        filename = f"{word}.mp3"
        filepath = os.path.join(EXAMPLES_DIR, filename)

        if os.path.exists(filepath):
            example_skipped += 1
            print(f"[{i}/{total}] SKIP (exists): {word}")
            continue

        print(f"[{i}/{total}] Generating example: {word} -> {example}")
        if generate_mp3(example, filepath):
            example_created += 1
        time.sleep(0.3)

    print(f"\nExamples: {example_created} created, {example_skipped} skipped\n")

    # Summary
    print("=" * 50)
    print("DONE!")
    print(f"Total unique words: {total}")
    print(f"Word MP3s: {len(os.listdir(WORDS_DIR))}")
    print(f"Example MP3s: {len(os.listdir(EXAMPLES_DIR))}")
    print(f"Output directory: {AUDIO_DIR}")


if __name__ == "__main__":
    main()
