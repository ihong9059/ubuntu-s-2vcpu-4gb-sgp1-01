# 배드민턴 동호회 프로젝트 (원격 서버)

## 폴더 구조

```
동호회/
├── scheduler-main/     # 대진표 생성기 (메인 버전)
├── scheduler-general/  # 대진표 생성기 (일반 버전)
├── club/               # 동호회 웹사이트 (종합)
├── docs/               # 문서 및 기획서
├── venv/               # Python 가상환경
└── README.md           # 이 파일
```

## 서버 정보

### 1. scheduler-main (대진표 생성기 - 메인)
- **포트**: 7000
- **URL**: http://178.128.90.37:7000
- **설명**: 동호회 회원 데이터 기반 대진표 생성
- **실행**: `cd scheduler-main && python app.py`

### 2. scheduler-general (대진표 생성기 - 일반)
- **포트**: 7001
- **URL**: http://178.128.90.37:7001
- **설명**: 샘플 데이터로 테스트 가능한 일반 버전
- **실행**: `cd scheduler-general && python app.py`

### 3. club (동호회 웹사이트)
- **포트**: 7002
- **URL**: http://178.128.90.37:7002
- **기본 계정**: admin@club.com / admin123
- **실행**: `cd club && python run.py`

## 실행 방법

```bash
# 가상환경 활성화
source ~/동호회/venv/bin/activate

# 대진표 생성기 (메인) - 포트 7000
cd ~/동호회/scheduler-main && python app.py

# 대진표 생성기 (일반) - 포트 7001
cd ~/동호회/scheduler-general && python app.py

# 동호회 웹사이트 - 포트 7002
cd ~/동호회/club && unset DATABASE_URL && python run.py
```

## 최종 수정일
2026-02-01
