# SAM AI v3 - 멀티 AI 채팅 웹 애플리케이션

## 개요

SAM AI v3는 여러 AI 서비스(Claude, GPT, Gemini, Ollama)를 하나의 웹 인터페이스에서 사용할 수 있는 멀티 AI 채팅 애플리케이션입니다. Flask 백엔드와 반응형 웹 프론트엔드로 구성되어 있으며, PWA(Progressive Web App)를 지원합니다.

---

## 주요 기능

### 1. 멀티 AI 프로바이더 지원
| 프로바이더 | 기본 모델 | 설명 |
|-----------|----------|------|
| Claude | claude-sonnet-4-20250514 | Anthropic AI |
| GPT | gpt-4o | OpenAI |
| Gemini | gemini-2.5-flash | Google AI |
| Ollama | gemma3:4b | 로컬 AI (무료) |

### 2. 세 가지 채팅 모드
| 모드 | 설명 |
|------|------|
| **Single** | 선택한 하나의 AI와 대화 |
| **Compare** | 모든 온라인 AI에게 동시에 질문하고 응답 비교 |
| **Smart** | 여러 AI 응답을 수집 후 최적의 답변으로 통합 (Synthesizer) |

### 3. 실시간 스트리밍
- SSE(Server-Sent Events) 기반 실시간 토큰 스트리밍
- 응답 중 Stop 버튼으로 생성 중단 가능

### 4. 파일 첨부 지원
| 유형 | 지원 확장자 |
|------|------------|
| 이미지 | .png, .jpg, .jpeg, .gif, .webp |
| 문서 | .pdf, .txt, .md, .csv, .docx |

최대 파일 크기: 20MB

### 5. PWA 지원
- 홈 화면에 앱 추가 가능
- 오프라인 캐싱 (Service Worker)
- iPad/iPhone 최적화

---

## 폴더 구조

```
SAM_AI_v3/
├── app.py                 # Flask 메인 애플리케이션
├── config.py              # 설정 파일 (포트, 모델, 프롬프트 등)
├── requirements.txt       # Python 의존성
├── start_sam_v3.bat       # Windows 실행 스크립트
│
├── services/              # 백엔드 서비스 모듈
│   ├── ai_dispatcher.py       # AI 프로바이더 라우팅
│   ├── claude_service.py      # Claude API 연동
│   ├── openai_service.py      # OpenAI API 연동
│   ├── gemini_service.py      # Gemini API 연동
│   ├── ollama_service.py      # Ollama 로컬 AI 연동
│   ├── conversation_manager.py # 대화 관리
│   ├── config_manager.py      # 설정 관리
│   ├── file_service.py        # 파일 업로드 처리
│   └── provider_base.py       # 프로바이더 베이스 클래스
│
├── templates/             # HTML 템플릿
│   └── index.html             # 메인 페이지
│
├── static/                # 정적 파일
│   ├── css/
│   │   ├── style.css          # 메인 스타일
│   │   └── markdown.css       # 마크다운 렌더링 스타일
│   ├── js/
│   │   ├── app.js             # 앱 초기화
│   │   ├── api.js             # API 통신
│   │   ├── chat.js            # 채팅 기능
│   │   ├── conversations.js   # 대화 목록 관리
│   │   ├── settings.js        # 설정 관리
│   │   └── markdown.js        # 마크다운 렌더링
│   ├── lib/                   # 외부 라이브러리
│   │   ├── marked.min.js      # 마크다운 파서
│   │   ├── highlight.min.js   # 코드 하이라이팅
│   │   └── highlight.css
│   ├── icons/                 # PWA 아이콘
│   ├── manifest.json          # PWA 매니페스트
│   └── sw.js                  # Service Worker
│
├── data/                  # 데이터 저장소
│   ├── config.json            # API 키 및 설정
│   ├── conversations/         # 대화 기록 (JSON)
│   └── uploads/               # 업로드된 파일
│
└── docs/                  # 문서
```

---

## API 엔드포인트

### 채팅
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/chat` | Single 모드 채팅 (SSE 스트리밍) |
| POST | `/api/chat/multi` | Compare 모드 (다중 AI 병렬) |
| POST | `/api/chat/smart` | Smart 모드 (수집 + 통합) |
| POST | `/api/chat/stop` | 응답 생성 중단 |

### 대화 관리
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/conversations` | 대화 목록 조회 |
| POST | `/api/conversations` | 새 대화 생성 |
| GET | `/api/conversations/<id>` | 특정 대화 조회 |
| PUT | `/api/conversations/<id>` | 대화 수정 (제목 등) |
| DELETE | `/api/conversations/<id>` | 대화 삭제 |

### 파일 업로드
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/upload` | 파일 업로드 |
| GET | `/api/uploads/<conv_id>/<filename>` | 업로드 파일 조회 |

### 설정
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/config` | 설정 조회 (API 키 마스킹) |
| POST | `/api/config/keys` | API 키 저장 |
| POST | `/api/config/preferences` | 환경설정 저장 |
| GET | `/api/providers/status` | 프로바이더 상태 조회 |

### 유틸리티
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/clear-cache` | 브라우저 캐시 초기화 |

---

## 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 실행
```bash
python app.py
```

또는 Windows에서:
```bash
start_sam_v3.bat
```

### 3. 접속
```
http://localhost:5050
```

---

## 설정

### API 키 설정
웹 UI의 Settings 메뉴에서 각 프로바이더의 API 키를 입력합니다:
- **Claude**: Anthropic API 키 (sk-ant-...)
- **OpenAI**: OpenAI API 키 (sk-...)
- **Gemini**: Google AI API 키 (AI...)
- **Ollama**: 로컬 실행 (API 키 불필요)

### Ollama 로컬 AI 사용
```bash
# Ollama 설치 후
ollama pull gemma3:4b
ollama serve
```

---

## Smart 모드 동작 원리

1. **Phase 1 (Gathering)**: 모든 온라인 AI에게 동시에 질문을 전송
2. 각 AI의 응답을 실시간으로 수집
3. **Phase 2 (Synthesizing)**: 수집된 응답들을 종합하여 최적의 답변 생성
4. Synthesizer AI 우선순위: Claude > Gemini > OpenAI

---

## 기술 스택

### 백엔드
- Python 3.9+
- Flask (웹 프레임워크)
- Flask-CORS (크로스 도메인)
- SSE (Server-Sent Events)

### 프론트엔드
- Vanilla JavaScript (프레임워크 없음)
- CSS3 (다크 모드 UI)
- Marked.js (마크다운 렌더링)
- Highlight.js (코드 하이라이팅)

### AI SDK
- anthropic (Claude)
- openai (GPT)
- google-generativeai (Gemini)
- ollama (로컬 AI)

---

## 특징

- **다크 모드 UI**: 눈의 피로를 줄이는 어두운 테마
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 지원
- **iPad 최적화**: 홈 화면 앱, 키보드 처리 최적화
- **대화 기록 저장**: JSON 파일 기반 영구 저장
- **실시간 스트리밍**: 타이핑 효과로 응답 표시
- **코드 하이라이팅**: 프로그래밍 코드 자동 하이라이팅

---

*문서 작성일: 2026-02-11*
*버전: SAM AI v3*
