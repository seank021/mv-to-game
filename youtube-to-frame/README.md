# YouTube to Frame Extractor

YouTube MV에서 주요 장면 프레임을 자동 추출하는 API 서버.

Scene detection으로 장면 전환을 감지하고, 각 장면의 중간 지점에서 프레임을 추출합니다.

## Quick Start

```bash
# 1. Setup
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure
cp .env.example .env

# 3. Run
uvicorn main:app --reload --port 8080
```

ffmpeg이 설치되어 있어야 합니다: `brew install ffmpeg`

## API

### POST `/api/extract` — 프레임 추출 시작

```bash
curl -X POST http://localhost:8080/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://youtu.be/2GJfWMYCWY0",
    "max_frames": 20,
    "scene_threshold": 30.0
  }'
```

**Parameters:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `youtube_url` | string | (required) | YouTube URL |
| `max_frames` | int | 20 | 최대 추출 프레임 수 (1-50) |
| `scene_threshold` | float | 30.0 | Scene detection 민감도 (5.0-90.0, 낮을수록 민감) |

**Response (202):**

```json
{
  "job_id": "e16aaa8e-04d1-417a-b4c8-c3b302500813",
  "status": "queued",
  "created_at": "2026-02-28T05:50:53.465018Z"
}
```

### GET `/api/jobs/{job_id}` — 작업 상태 조회

```bash
curl http://localhost:8080/api/jobs/{job_id}
```

**Status flow:** `queued` → `downloading` → `detecting_scenes` → `extracting_frames` → `uploading` → `completed`

**Response (completed):**

```json
{
  "job_id": "e16aaa8e-04d1-417a-b4c8-c3b302500813",
  "status": "completed",
  "video_info": {
    "title": "BLACKPINK - 'GO' M/V",
    "duration": 201,
    "channel": "BLACKPINK",
    "video_id": "2GJfWMYCWY0"
  },
  "frames": [
    {
      "index": 0,
      "timestamp": 3.545,
      "url": "/frames/{job_id}/scene_000.png",
      "width": 1920,
      "height": 1080
    }
  ],
  "total_frames": 20,
  "created_at": "2026-02-28T05:50:53Z",
  "completed_at": "2026-02-28T05:51:09Z",
  "error": null
}
```

각 프레임의 `timestamp`는 해당 장면의 정확한 시간(초)입니다.

## 프레임 타임스탬프 활용

추출된 각 프레임에는 정확한 `timestamp` (초 단위)가 포함됩니다. 이를 활용하는 방법:

### 특정 시간대의 프레임 가져오기

```bash
# 전체 추출 후 결과에서 원하는 timestamp의 프레임 선택
curl -s http://localhost:8080/api/jobs/{job_id} | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for f in data['frames']:
    mins = int(f['timestamp'] // 60)
    secs = f['timestamp'] % 60
    print(f\"scene_{f['index']:03d}.png  {mins}:{secs:05.2f}  {f['url']}\")
"
```

**출력 예시:**

```
scene_000.png  0:03.55  /frames/.../scene_000.png
scene_001.png  0:08.78  /frames/.../scene_001.png
scene_002.png  0:15.35  /frames/.../scene_002.png
scene_003.png  0:28.57  /frames/.../scene_003.png
...
scene_019.png  3:16.26  /frames/.../scene_019.png
```

### ffmpeg으로 특정 타임스탬프에서 직접 추출

API 없이 ffmpeg만으로 특정 시간의 프레임을 추출할 수도 있습니다:

```bash
# 단일 프레임 추출 (timestamp 초 단위)
ffmpeg -ss 3.545 -i video.mp4 -frames:v 1 -q:v 2 frame_at_3.5s.png

# 여러 타임스탬프에서 추출
for ts in 3.545 28.570 108.004 152.652; do
  ffmpeg -ss $ts -i video.mp4 -frames:v 1 -q:v 2 "frame_at_${ts}s.png"
done

# 매 N초마다 프레임 추출 (scene detection 없이)
ffmpeg -i video.mp4 -vf "fps=1/5" frame_%03d.png  # 5초마다
ffmpeg -i video.mp4 -vf "fps=1/10" frame_%03d.png  # 10초마다
```

### API 타임스탬프 → ffmpeg 연동

```bash
# 1. API로 scene detection 후 타임스탬프 추출
TIMESTAMPS=$(curl -s http://localhost:8080/api/jobs/{job_id} | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for f in data['frames']:
    print(f['timestamp'])
")

# 2. 원본 영상에서 해당 타임스탬프로 고화질 프레임 재추출
echo "$TIMESTAMPS" | while read ts; do
  ffmpeg -ss $ts -i original_video.mp4 -frames:v 1 -q:v 1 "hq_frame_${ts}s.png"
done
```

### Python에서 타임스탬프 활용

```python
import requests

# 작업 결과 가져오기
resp = requests.get("http://localhost:8080/api/jobs/{job_id}")
data = resp.json()

for frame in data["frames"]:
    print(f"Scene {frame['index']}: {frame['timestamp']:.2f}s -> {frame['url']}")

# 특정 시간 범위의 프레임만 필터링 (예: 1분~2분 구간)
chorus_frames = [
    f for f in data["frames"]
    if 60 <= f["timestamp"] <= 120
]
```

## Scene Detection 튜닝

`scene_threshold` 값으로 장면 감지 민감도를 조절합니다:

| Threshold | 감도 | 용도 |
|-----------|------|------|
| 15-20 | 높음 | 빠른 컷이 많은 MV, 미세한 장면 전환 감지 |
| 25-35 | 보통 | 일반적인 MV (기본값: 30.0) |
| 40-60 | 낮음 | 뚜렷한 장면 전환만 감지, 프레임 수 줄이기 |

```bash
# 민감하게 (더 많은 프레임)
curl -X POST http://localhost:8080/api/extract \
  -d '{"youtube_url": "...", "scene_threshold": 15.0, "max_frames": 40}'

# 주요 장면만 (적은 프레임)
curl -X POST http://localhost:8080/api/extract \
  -d '{"youtube_url": "...", "scene_threshold": 50.0, "max_frames": 10}'
```

## 환경 변수

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_GCS` | `false` | `true`면 GCS에 업로드, `false`면 로컬 저장 |
| `FRAMES_DIR` | `extracted_frames` | 로컬 프레임 저장 디렉토리 |
| `VIDEO_MAX_DURATION` | `600` | 최대 영상 길이 (초) |
| `MAX_FRAMES` | `20` | 기본 최대 프레임 수 |
| `SCENE_THRESHOLD` | `30.0` | 기본 scene detection 민감도 |
| `COOKIE_FILE` | (none) | yt-dlp 쿠키 파일 경로 (봇 감지 우회용) |
| `GCS_BUCKET_NAME` | `mv-escape-frames` | GCS 버킷 이름 (USE_GCS=true 시) |

## Architecture

```
POST /api/extract
  → validate URL
  → create job (in-memory store)
  → spawn thread:
      1. yt-dlp: download video → /tmp/mv-frame-xxx/video.mp4
      2. PySceneDetect: detect scene changes → list of (start, end) times
      3. OpenCV: extract frame at midpoint of each scene → PNG files
      4. Storage: copy to extracted_frames/{job_id}/ (local) or upload to GCS
      5. Write manifest.json
  → return job_id

GET /api/jobs/{job_id}
  → return current status + frames list with timestamps
```

## Docker

```bash
docker build -t mv-frame-api .
docker run -p 8080:8080 mv-frame-api
```
