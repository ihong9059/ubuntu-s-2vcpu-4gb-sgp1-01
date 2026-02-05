#!/usr/bin/env python3
"""
MP3 TTS Generator for Universal Language Learning project.
Parses words.js and generates MP3 files for all 7 languages using gTTS.
"""

import os
import re
import sys
import time
import hashlib
from gtts import gTTS

WORDS_JS_PATH = "/root/universal/public/words.js"
AUDIO_DIR = "/root/universal/public/audio"

# gTTS language codes matching the app's target languages
GTTS_LANG_MAP = {
    "ko": "ko",
    "en": "en",
    "ja": "ja",
    "zh": "zh-CN",
    "es": "es",
    "fr": "fr",
    "de": "de",
}


def parse_words_js(filepath):
    """Parse words.js and extract unique words/examples per target language."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all word entries with their word and example fields
    # We need to identify which target language each word belongs to
    # Structure: wordPacks: { nativeLang: { targetLang: [ {word, example, ...}, ... ] } }

    results = {}  # {target_lang: {word: example}}

    # Find wordPacks section
    packs_match = re.search(r"wordPacks:\s*\{", content)
    if not packs_match:
        print("ERROR: Could not find wordPacks section")
        return results

    packs_content = content[packs_match.start():]

    # For each native language section, find each target language array
    for native_lang in ["ko", "en", "ja", "zh", "es", "fr", "de"]:
        for target_lang in ["ko", "en", "ja", "zh", "es", "fr", "de"]:
            if native_lang == target_lang:
                continue

            if target_lang not in results:
                results[target_lang] = {}

            # Find entries: word: '...' ... example: '...'
            # We need to find the section for this native->target pair
            # Pattern: nativeLang: { ... targetLang: [ ... ] ... }

    # Simpler approach: find ALL word entries and determine their target language
    # by looking at the surrounding context

    # Find all target language array starts
    # Pattern like:  en: [  or  ja: [  within wordPacks
    target_sections = []
    for m in re.finditer(
        r"//\s*(?:.*?학습|.*?Learning|.*?lernen|.*?学習|.*?aprender|.*?학ぶ).*?\n\s*(\w+):\s*\[",
        packs_content,
    ):
        lang = m.group(1)
        target_sections.append((lang, m.start(), m.end()))

    # Alternative: find all lang: [ patterns within wordPacks
    # More reliable approach
    target_sections = []
    for m in re.finditer(r"\n\s+(\w{2}):\s*\[", packs_content):
        lang = m.group(1)
        if lang in GTTS_LANG_MAP:
            target_sections.append((lang, m.end()))

    # For each section, find the closing ] and extract words
    for i, (lang, start_pos) in enumerate(target_sections):
        # Find the matching closing bracket
        bracket_depth = 1
        pos = start_pos
        while pos < len(packs_content) and bracket_depth > 0:
            if packs_content[pos] == "[":
                bracket_depth += 1
            elif packs_content[pos] == "]":
                bracket_depth -= 1
            pos += 1

        section = packs_content[start_pos:pos]

        if lang not in results:
            results[lang] = {}

        # Extract word and example from this section
        # Handle both single and double quotes
        entries = re.findall(
            r"word:\s*['\"](.+?)['\"].*?example:\s*['\"](.+?)['\"]",
            section,
        )
        for word, example in entries:
            # Unescape JS string escapes
            word = word.replace("\\'", "'").replace('\\"', '"')
            example = example.replace("\\'", "'").replace('\\"', '"')
            if word not in results[lang]:
                results[lang][word] = example

    return results


def safe_filename(text):
    """Create a safe filename from text using MD5 hash for long/special texts."""
    # For short, simple text, use the text directly
    safe = re.sub(r'[<>:"/\\|?*]', "_", text)
    if len(safe) <= 80 and safe == text:
        return text
    # For text with special chars or very long, use hash
    return hashlib.md5(text.encode("utf-8")).hexdigest()[:16] + "_" + re.sub(
        r"[^a-zA-Z0-9]", "_", text[:30]
    )


def generate_mp3(text, filepath, lang, retries=3):
    """Generate an MP3 file from text using gTTS."""
    for attempt in range(retries):
        try:
            tts = gTTS(text=text, lang=lang)
            tts.save(filepath)
            return True
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry in {wait}s: {e}")
                time.sleep(wait)
            else:
                print(f"  FAILED: {e}")
                return False


def main():
    # Parse words
    print("Parsing words.js...")
    lang_words = parse_words_js(WORDS_JS_PATH)

    total_words = 0
    for lang, words in lang_words.items():
        count = len(words)
        total_words += count
        print(f"  {lang}: {count} unique words")
    print(f"  Total: {total_words} unique words across all languages\n")

    # Generate MP3s for each language
    grand_total_created = 0
    grand_total_skipped = 0

    for lang_code in ["ko", "en", "ja", "zh", "es", "fr", "de"]:
        if lang_code not in lang_words or not lang_words[lang_code]:
            print(f"\n=== {lang_code}: No words found, skipping ===")
            continue

        words = lang_words[lang_code]
        gtts_lang = GTTS_LANG_MAP[lang_code]
        words_dir = os.path.join(AUDIO_DIR, lang_code, "words")
        examples_dir = os.path.join(AUDIO_DIR, lang_code, "examples")
        os.makedirs(words_dir, exist_ok=True)
        os.makedirs(examples_dir, exist_ok=True)

        word_list = list(words.items())
        total = len(word_list)
        created = 0
        skipped = 0

        print(f"\n=== {lang_code.upper()} ({gtts_lang}): {total} words ===")

        # Generate word MP3s
        print(f"--- Generating word MP3s ---")
        for i, (word, example) in enumerate(word_list, 1):
            filename = safe_filename(word) + ".mp3"
            filepath = os.path.join(words_dir, filename)

            if os.path.exists(filepath):
                skipped += 1
                continue

            print(f"  [{i}/{total}] Word: {word}")
            if generate_mp3(word, filepath, gtts_lang):
                created += 1
            time.sleep(0.3)

        print(f"  Words: {created} created, {skipped} skipped")

        # Generate example MP3s
        created_ex = 0
        skipped_ex = 0
        print(f"--- Generating example MP3s ---")
        for i, (word, example) in enumerate(word_list, 1):
            filename = safe_filename(word) + ".mp3"
            filepath = os.path.join(examples_dir, filename)

            if os.path.exists(filepath):
                skipped_ex += 1
                continue

            print(f"  [{i}/{total}] Example ({word}): {example}")
            if generate_mp3(example, filepath, gtts_lang):
                created_ex += 1
            time.sleep(0.3)

        print(f"  Examples: {created_ex} created, {skipped_ex} skipped")

        grand_total_created += created + created_ex
        grand_total_skipped += skipped + skipped_ex

    # Also generate a word-to-filename mapping JSON for the frontend
    import json

    mapping = {}
    for lang_code, words in lang_words.items():
        mapping[lang_code] = {}
        for word in words:
            mapping[lang_code][word] = safe_filename(word)

    mapping_path = os.path.join(AUDIO_DIR, "mapping.json")
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    print(f"\nMapping saved to {mapping_path}")

    # Summary
    print("\n" + "=" * 50)
    print("DONE!")
    print(f"Total created: {grand_total_created}")
    print(f"Total skipped: {grand_total_skipped}")
    print(f"Output directory: {AUDIO_DIR}")

    for lang_code in ["ko", "en", "ja", "zh", "es", "fr", "de"]:
        words_dir = os.path.join(AUDIO_DIR, lang_code, "words")
        examples_dir = os.path.join(AUDIO_DIR, lang_code, "examples")
        if os.path.exists(words_dir):
            wc = len(os.listdir(words_dir))
            ec = len(os.listdir(examples_dir))
            print(f"  {lang_code}: {wc} words, {ec} examples")


if __name__ == "__main__":
    main()
