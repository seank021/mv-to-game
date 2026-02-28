# YouTube-to-Frame API Implementation Plan

## Overview

YouTube MV URL을 받아 영상에서 주요 장면(scene) 프레임을 추출하고, GCS에 업로드한 뒤 결과를 반환하는 GCP 기반 API 서비스.

MV Escape 프로젝트의 첫 번째 파이프라인 단계로, 추출된 프레임은 이후 픽셀 아트 변환 및 게임 맵 생성에 사용됨.

---

## Architecture

```
┌──────────┐     POST /extract      ┌──────────────┐
│  Client  │ ──────────────────────→ │  Cloud Run   │
│ (Next.js)│                        │   API Server │
└──────────┘                        └──────┬───────┘
     ↑                                     │
     │  GET /jobs/{id}                     │ enqueue
     │                                     ▼
     │                             ┌──────────────┐
     │                             │ Cloud Tasks  │
     │                             │    Queue     │
     │                             └──────┬───────┘
     │                                     │
     │                                     ▼
     │                             ┌──────────────┐
     │                             │  Cloud Run   │
     │                             │   Worker     │
     │                             └──────┬───────┘
     │                                     │
     │                                     │ 1. yt-dlp download
     │                                     │ 2. scene detection
     │                                     │ 3. frame extraction
     │                                     │ 4. upload frames
     │                                     ▼
     │                             ┌──────────────┐
     └──────── signed URLs ←────── │    GCS       │
                                   │   Bucket     │
                                   └──────────────┘
```

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| API Framework | FastAPI | 비동기 지원, 자동 OpenAPI 문서 |
| Video Download | yt-dlp | YouTube 다운로드 표준 라이브러리 |
| Frame Extraction | FFmpeg + OpenCV | 영상 처리 표준 도구 |
| Scene Detection | PySceneDetect | 장면 전환 감지 |
| Storage | Google Cloud Storage | 프레임 이미지 저장 |
| Task Queue | Google Cloud Tasks | 비동기 작업 처리 |
| Container | Docker (python:3.11-slim + ffmpeg) | Cloud Run 배포 |
| Deploy | Cloud Run | 서버리스, 자동 스케일링 |
| Region | asia-northeast3 (서울) | 한국 타겟 유저 대상 |

---

## Directory Structure

```
youtube-to-frame/
├── README.md
├── implementation_plan.md
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── .env.example
├── main.py                  # FastAPI 앱 엔트리포인트
├── config.py                # 환경 변수, 설정
├── routers/
│   ├── __init__.py
│   ├── extract.py           # POST /extract, GET /jobs/{id}
│   └── health.py            # GET /health
├── services/
│   ├── __init__.py
│   ├── downloader.py        # yt-dlp 비디오 다운로드
│   ├── scene_detector.py    # PySceneDetect 장면 감지
│   ├── frame_extractor.py   # OpenCV 프레임 추출
│   ├── storage.py           # GCS 업로드/URL 생성
│   └── task_queue.py        # Cloud Tasks 연동
├── models/
│   ├── __init__.py
│   └── schemas.py           # Pydantic request/response 모델
└── tests/
    ├── __init__.py
    ├── test_downloader.py
    ├── test_scene_detector.py
    └── test_extract_api.py
```

---

## API Endpoints

### `POST /api/extract`

YouTube URL을 받아 프레임 추출 작업을 생성.

**Request:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "max_frames": 20,
  "scene_threshold": 30.0
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "created_at": "2026-02-28T12:00:00Z"
}
```

### `GET /api/jobs/{job_id}`

작업 상태 및 결과 조회.

**Response (completed):**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "video_info": {
    "title": "BLACKPINK - How You Like That",
    "duration": 210,
    "channel": "BLACKPINK"
  },
  "frames": [
    {
      "index": 0,
      "timestamp": 12.5,
      "url": "https://storage.googleapis.com/...",
      "scene_score": 0.85
    }
  ],
  "total_frames": 15,
  "completed_at": "2026-02-28T12:01:30Z"
}
```

**Response (processing):**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "progress": "downloading"
}
```

### `GET /health`

헬스체크.

---

## Implementation Phases

### Phase 1: Core Frame Extraction (Local)

로컬에서 동작하는 프레임 추출 파이프라인 구현.

- [ ] 프로젝트 초기화 (requirements.txt, Dockerfile, config)
- [ ] `downloader.py` — yt-dlp로 영상 다운로드
  - URL 유효성 검증
  - 영상 메타데이터 추출 (제목, 길이, 채널명)
  - 최적 화질 다운로드 (1080p 우선, fallback 720p)
  - 임시 디렉토리에 저장
- [ ] `scene_detector.py` — PySceneDetect로 장면 전환 감지
  - ContentDetector 사용 (threshold 조정 가능)
  - 장면 목록 반환 (시작/끝 타임스탬프, confidence score)
- [ ] `frame_extractor.py` — 감지된 장면에서 대표 프레임 추출
  - 각 장면의 중간 시점 프레임 추출
  - max_frames 제한 시 scene_score 상위 N개 선택
  - PNG 포맷으로 저장

### Phase 2: API Server

FastAPI 서버 구현.

- [ ] Pydantic 모델 정의 (request/response schemas)
- [ ] `POST /extract` 엔드포인트 (동기 처리 버전)
- [ ] `GET /jobs/{job_id}` 엔드포인트
- [ ] `GET /health` 엔드포인트
- [ ] 에러 핸들링 (잘못된 URL, 다운로드 실패, 지원하지 않는 영상)
- [ ] 로컬 테스트

### Phase 3: GCP Integration

GCS 업로드 및 Cloud Run 배포.

- [ ] `storage.py` — GCS 업로드 및 Signed URL 생성
  - 버킷: `mv-escape-frames`
  - 경로: `{job_id}/scene_{index}.png`
  - manifest.json 생성
  - Signed URL 유효기간: 1시간
- [ ] Dockerfile 작성 (python:3.11-slim + ffmpeg)
- [ ] Cloud Run 배포 (asia-northeast3)
- [ ] IAM 설정 (Cloud Run → GCS 쓰기 권한)

### Phase 4: Async Processing (Optional)

트래픽 증가 시 비동기 처리 전환.

- [ ] `task_queue.py` — Cloud Tasks 연동
- [ ] Worker 서비스 분리
- [ ] 작업 상태 추적 (GCS manifest 기반)
- [ ] 재시도 로직 (Cloud Tasks 자동 재시도)

---

## Configuration

```env
# .env.example
GCP_PROJECT_ID=mv-escape
GCS_BUCKET_NAME=mv-escape-frames
GCP_REGION=asia-northeast3
CLOUD_TASKS_QUEUE=frame-extraction

# Frame extraction
MAX_FRAMES=20
SCENE_THRESHOLD=30.0
VIDEO_MAX_DURATION=600    # 10분 초과 영상 거부
DOWNLOAD_FORMAT=bestvideo[ext=mp4][height<=1080]

# API
API_HOST=0.0.0.0
API_PORT=8080
```

---

## Key Dependencies

```
fastapi==0.115.*
uvicorn==0.34.*
yt-dlp==2025.*
opencv-python-headless==4.*
scenedetect==0.6.*
google-cloud-storage==2.*
google-cloud-tasks==2.*
pydantic==2.*
python-dotenv==1.*
```

---

## Constraints & Considerations

| Item | Detail |
|------|--------|
| 영상 길이 제한 | 최대 10분 (MV 대상이므로 충분) |
| 동시 처리 | Cloud Run 인스턴스당 1개 영상 (CPU/메모리 집약) |
| 파일 정리 | 처리 완료 후 임시 비디오 파일 즉시 삭제 |
| GCS 정리 | 7일 후 자동 삭제 (lifecycle policy) |
| Cloud Run 스펙 | Worker: 4GB RAM, 2 vCPU, timeout 900s |
| 비용 | 건당 약 $0.01-0.02 (다운로드 + 처리 + 저장) |
| YouTube ToS | yt-dlp 사용은 개인/연구 목적. 상용화 시 YouTube Data API v3 고려 |

---

## Testing Strategy

- **Unit Tests**: downloader, scene_detector, frame_extractor 각 모듈 독립 테스트
- **Integration Test**: 짧은 테스트 영상(Creative Commons)으로 전체 파이프라인 테스트
- **API Test**: FastAPI TestClient로 엔드포인트 테스트
- **Load Test**: 동시 요청 처리 확인 (Phase 4 이후)
