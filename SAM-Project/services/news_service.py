"""RSS 뉴스 수집 + 생일/일정 관리"""
import json
import os
from datetime import datetime, date
from config import SCHEDULES_FILE

_news_cache = {'items': [], 'fetched_at': None}
_translation_cache = {}  # title -> korean title
_CACHE_TTL = 600  # 10분


def load_schedules():
    """schedules.json 로드"""
    if not os.path.exists(SCHEDULES_FILE):
        return {'birthdays': [], 'events': []}
    with open(SCHEDULES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_upcoming_birthdays(limit=3):
    """다가오는 생일 D-day 계산"""
    schedules = load_schedules()
    today = date.today()
    results = []

    for b in schedules.get('birthdays', []):
        month, day = map(int, b['date'].split('-'))
        # 올해 생일
        bday_this_year = date(today.year, month, day)
        if bday_this_year < today:
            # 이미 지났으면 내년
            bday_this_year = date(today.year + 1, month, day)
        delta = (bday_this_year - today).days
        results.append({
            'name': b['name'],
            'emoji': b.get('emoji', '🎂'),
            'date': b['date'],
            'dday': delta,
            'member': b.get('member', ''),
        })

    results.sort(key=lambda x: x['dday'])
    return results[:limit]


def get_upcoming_events(limit=5):
    """다가오는 이벤트/일정"""
    schedules = load_schedules()
    today = date.today()
    results = []

    for e in schedules.get('events', []):
        try:
            event_date = datetime.strptime(e['date'], '%Y-%m-%d').date()
        except (ValueError, KeyError):
            continue
        if event_date >= today:
            delta = (event_date - today).days
            results.append({
                'title': e['title'],
                'emoji': e.get('emoji', '📅'),
                'date': e['date'],
                'type': e.get('type', 'event'),
                'dday': delta,
            })

    results.sort(key=lambda x: x['dday'])
    return results[:limit]


def fetch_news(limit=10):
    """Stray Kids 관련 뉴스 RSS 수집"""
    import time

    now = time.time()
    if _news_cache['fetched_at'] and (now - _news_cache['fetched_at']) < _CACHE_TTL:
        return _news_cache['items'][:limit]

    items = []
    feeds = [
        ('Soompi', 'https://www.soompi.com/feed'),
        ('AllKPop', 'https://www.allkpop.com/feed'),
    ]

    keywords = ['stray kids', 'skz', '스트레이 키즈', 'bangchan', 'hyunjin',
                'felix', 'han jisung', 'lee know', 'changbin', 'seungmin', 'i.n']

    try:
        import feedparser
        for source_name, url in feeds:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:30]:
                    title_lower = entry.get('title', '').lower()
                    summary_lower = entry.get('summary', '').lower()
                    text = title_lower + ' ' + summary_lower

                    if any(kw in text for kw in keywords):
                        items.append({
                            'source': source_name,
                            'title': entry.get('title', ''),
                            'link': entry.get('link', ''),
                            'published': entry.get('published', ''),
                        })
            except Exception:
                continue
    except ImportError:
        pass

    # SKZ 관련 뉴스가 없으면 빈 리스트 반환 (Stray Kids 전용)
    if not items:
        pass

    # 뉴스 제목 한국어 번역
    items = _translate_titles(items)

    _news_cache['items'] = items
    _news_cache['fetched_at'] = now
    return items[:limit]


def _translate_titles(items):
    """Gemini API로 영어 뉴스 제목들을 한국어로 번역"""
    to_translate = []
    for item in items:
        title = item['title']
        if title not in _translation_cache and _is_english(title):
            to_translate.append(title)

    if not to_translate:
        # 캐시에서 적용만
        for item in items:
            if item['title'] in _translation_cache:
                item['title'] = _translation_cache[item['title']]
        return items

    try:
        from services.config_manager import get_api_key
        from google import genai

        api_key = get_api_key('gemini')
        if not api_key:
            return items

        numbered = '\n'.join(f'{i+1}. {t}' for i, t in enumerate(to_translate))
        prompt = (
            "다음 K-pop 뉴스 제목들을 자연스러운 한국어로 번역해주세요. "
            "번호와 번역만 출력하세요. 형식: 번호. 번역\n\n"
            + numbered
        )

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        if response.text:
            lines = response.text.strip().split('\n')
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                # "1. 번역된 제목" 파싱
                dot_idx = line.find('.')
                if dot_idx > 0:
                    try:
                        idx = int(line[:dot_idx].strip()) - 1
                        translated = line[dot_idx+1:].strip()
                        if 0 <= idx < len(to_translate) and translated:
                            _translation_cache[to_translate[idx]] = translated
                    except ValueError:
                        continue

    except Exception as e:
        print(f"[Translation Error] {e}")

    # 번역 결과 적용
    for item in items:
        if item['title'] in _translation_cache:
            item['title'] = _translation_cache[item['title']]
    return items


def _is_english(text):
    """텍스트가 영어인지 간단히 판별"""
    ascii_count = sum(1 for c in text if ord(c) < 128)
    return ascii_count / max(len(text), 1) > 0.7
