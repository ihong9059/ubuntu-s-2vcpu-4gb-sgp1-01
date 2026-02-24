# SKZ AI - JYP 아이돌(Stray Kids) AI 프로젝트 제안서

## Context
사용자가 Stray Kids 컨셉의 AI 챗봇 웹앱을 요청함. Gemini API 기반으로, 멤버별 캐릭터 AI 대화 + 음성 입출력 + 아이돌 소식 패널을 구현하는 프로젝트.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | SKZ AI (Stray Kids AI) |
| **위치** | `C:\Users\user\SKZ_AI\` |
| **포트** | 5060 (SAM AI v3의 5050과 충돌 방지) |
| **AI 엔진** | Google Gemini API |
| **TTS** | edge-tts (무료, 한국어 고품질) |
| **STT** | Web Speech API (브라우저 내장) |
| **뉴스** | RSS 피드 + 정적 JSON 일정 |

---

## 핵심 기능

### 1. 멤버별 AI 대화
- 8명 멤버(방찬, 리노, 창빈, 현진, 한, 필릭스, 승민, 아이엔) 선택
- 멤버별 성격/말투를 시스템 프롬프트로 반영
- Gemini API SSE 스트리밍 실시간 응답
- 대화 내역 저장/관리

### 2. 음성 입출력
- **음성 입력**: 마이크 버튼 → Web Speech API로 한국어 음성 인식 → 텍스트 변환
- **음성 출력**: AI 응답 옆 스피커 버튼 → edge-tts 한국어 음성 재생
- edge-tts 음성: `ko-KR-InJoonNeural`(남성), `ko-KR-SunHiNeural`(여성)

### 3. 아이돌 소식 패널
- 생일 D-day 카운트다운
- 콘서트/컴백 일정 표시
- Soompi/AllKPop RSS 뉴스 자동 수집 (Stray Kids 필터)

### 4. K-pop 테마 UI
- 다크 퍼플 기반 K-pop 스타일
- 멤버 선택 시 테마 색상 자동 변경
- AI 생성 멤버 프로필 이미지
- iPad/모바일 반응형 + PWA 지원

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Backend | Flask (Python 3.11) |
| AI | Gemini API (google-genai) |
| TTS | edge-tts |
| STT | Web Speech API (브라우저) |
| Frontend | Vanilla JS (모듈 패턴) |
| 스타일 | CSS Custom Properties |
| 마크다운 | marked.js + highlight.js |
| 뉴스 | feedparser (RSS) |
| 저장 | JSON 파일 |
| PWA | manifest.json + Service Worker |

---

## 프로젝트 구조

```
C:\Users\user\SKZ_AI\
├── app.py                      # Flask 메인 (라우트 + SSE 스트리밍)
├── config.py                   # 설정 상수
├── requirements.txt            # 의존성
├── start_skz.bat               # 실행 배치
├── services/
│   ├── gemini_service.py       # Gemini AI 스트리밍
│   ├── tts_service.py          # edge-tts 한국어 음성
│   ├── conversation_manager.py # 대화 저장/관리
│   ├── config_manager.py       # API 키 관리
│   ├── news_service.py         # RSS 뉴스 + 일정
│   └── member_data.py          # 멤버 프로필/프롬프트
├── data/
│   ├── config.json             # API 키 (자동 생성)
│   ├── conversations/          # 대화 JSON 파일
│   ├── tts_cache/              # TTS 오디오 캐시
│   └── schedules.json          # 생일/일정 데이터
├── static/
│   ├── css/
│   │   ├── style.css           # K-pop 다크 테마
│   │   └── markdown.css        # 마크다운 스타일
│   ├── js/
│   │   ├── app.js              # 앱 초기화
│   │   ├── api.js              # API 통신 (SSE)
│   │   ├── chat.js             # 채팅 UI
│   │   ├── members.js          # 멤버 선택
│   │   ├── voice.js            # STT + TTS
│   │   ├── news.js             # 뉴스 패널
│   │   ├── conversations.js    # 대화 목록
│   │   ├── settings.js         # 설정
│   │   └── markdown.js         # 마크다운 렌더링
│   ├── lib/                    # marked.js, highlight.js
│   ├── icons/                  # PWA 아이콘
│   ├── manifest.json
│   └── sw.js
├── templates/
│   └── index.html              # SPA 메인 페이지
└── docs/
    ├── proposal.md             # 이 제안서
    └── work_log_*.md
```

---

## UI 레이아웃

```
+------------------+----------------------------------+------------------+
|    사이드바       |         메인 채팅 영역            |   뉴스 패널      |
|                  |                                  |                  |
|  [+ 새 대화]     |  [방찬][리노][창빈][현진]...      |  🎂 생일         |
|                  |      (멤버 선택 바)               |  아이엔 D-5     |
|  대화1           |                                  |                  |
|  대화2           |  👤 안녕하세요!                   |  📅 일정         |
|  대화3           |                                  |  Concert 6/15   |
|  ...             |  🐺 안녕 STAY! 방찬이야~          |                  |
|                  |       [🔊]                       |  📰 뉴스         |
|                  |                                  |  [Soompi] ...   |
|                  |  [🎤] [메시지 입력...    ] [전송] |  [AllKPop] ...  |
|  [⚙️ 설정]       |                                  |                  |
+------------------+----------------------------------+------------------+
```

---

## 개발 단계

### Phase 1: 코어 채팅 + 멤버 선택 + 기본 UI ✅
- 프로젝트 구조 생성
- Gemini API 연동 + SSE 스트리밍
- 8명 멤버 프로필 + 시스템 프롬프트
- K-pop 다크 테마 UI
- 대화 저장/관리
- 멤버별 테마 색상 전환

### Phase 2: 음성 입출력 ✅
- edge-tts 설치 + TTS 서비스 구현
- `/api/tts` 라우트 + 오디오 캐싱
- Web Speech API 음성 입력
- 마이크 버튼 + 스피커 버튼 UI

### Phase 3: 아이돌 소식 패널 ✅
- schedules.json (생일/일정 데이터)
- RSS 뉴스 수집 (feedparser)
- 뉴스 패널 UI + 자동 새로고침
- 모바일 토글 버튼

### Phase 4: 마무리 ✅
- PWA (manifest + Service Worker)
- iPad 최적화
- 반응형 레이아웃

---

## 필요 패키지

```
flask
flask-cors
google-generativeai
google-genai
edge-tts
feedparser
```

---

## 검증 방법
1. `pip install -r requirements.txt`로 의존성 설치
2. `start_skz.bat` 또는 `python app.py`로 서버 시작
3. `http://localhost:5060`에서 접속
4. 멤버 선택 → 대화 → 스트리밍 응답 확인
5. 음성 입력(마이크) → 텍스트 변환 확인
6. 음성 출력(스피커) → 한국어 음성 재생 확인
7. 뉴스 패널 → 생일/일정/뉴스 표시 확인
8. iPad에서 `http://192.168.0.83:5060` 접속 테스트
