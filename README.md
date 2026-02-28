# ytttt

Automated YouTube music video pipeline. Generates AI music tracks via Replicate (MusicGen), crossfade mixes them with FFmpeg, generates cover art via Google Nano Banana, composites into a video, and uploads to YouTube.

## Architecture

```
src/
  index.ts                         # entrypoint - runs worker pipeline(s)
  internal/
    config/config.ts               # env var loader (dotenv)
    logger/logger.ts               # winston logger w/ ANSI color output
    queue.ts                       # concurrency-limited async task queue
    replicate/
      music.ts                     # MusicGen: generate, download, crossfade mix
      images.ts                    # Nano Banana: generate and save cover art
    tags/tags.ts                   # YouTube trending tags + autocomplete suggest
    video/video.ts                 # FFmpeg: combine still image + audio -> mp4
    worker/
      worker.ts                    # abstract worker base class (pipeline orchestration)
      liquid-dnb.ts                # liquid drum & bass / jungle worker
      espionage.ts                 # dark cinematic espionage worker
```

## Pipeline

Each worker runs this pipeline:

1. **Generate music** - N tracks via MusicGen with different seeds (same prompt = cohesive sound)
2. **Download tracks** - pull WAV files from Replicate URLs
3. **Crossfade mix** - chain `acrossfade` FFmpeg filters into a single MP3
4. **Generate cover art** - Google Nano Banana with random seed per run
5. **Create video** - FFmpeg composites still image + audio into MP4 (h264/aac)
6. **Upload** - push to YouTube (TODO)
7. **Cleanup** - delete intermediate files, keep only the final MP4

All Replicate API calls go through a concurrency-limited queue (default: 25).

## Setup

### Local

```bash
yarn install
cp .env.example .env  # fill in your keys
```

### Remote server

```bash
ssh user@host 'bash -s' < setup.sh
```

Installs: build-essential, git, curl, python3, ffmpeg, Node.js (via nvm), Yarn, PM2.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `REPLICATE_API_TOKEN` | yes | Replicate API key |
| `YOUTUBE_API_KEY` | no | YouTube Data API v3 key (for trending tags) |
| `YOUTUBE_CLIENT_ID` | no | YouTube OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | no | YouTube OAuth client secret |
| `YOUTUBE_LIQUID_DNB_REFRESH_TOKEN` | no | OAuth refresh token for liquid-dnb channel |
| `YOUTUBE_ESPIONAGE_REFRESH_TOKEN` | no | OAuth refresh token for espionage channel |

## Usage

```bash
# development (watch mode)
yarn dev

# production
yarn start

# with PM2
pm2 start yarn --name "ytttt" -- start
```

## Tests

```bash
yarn test
```

Tests cover:
- Crossfade filter chain generation (2, 3, 5, 10 tracks)
- YouTube suggest API (live)
- YouTube trending tags (mocked)
- Concurrency queue (limits, error propagation, ordering)

## Adding a new worker

```ts
// src/internal/worker/my-genre.ts
import { IWorker } from "./worker";

export class MyGenreWorker extends IWorker {
  name = "my-genre";
  trackCount = 5;
  musicDuration = 90;
  crossfadeSec = 3;
  musicPrompt = "...";
  imagePrompt = "...";

  async upload(filePath: string): Promise<void> {
    // youtube upload logic
  }
}
```

Then add it to `src/index.ts`:

```ts
import { MyGenreWorker } from "./internal/worker/my-genre";
const workers = [new MyGenreWorker()];
```

## Key dependencies

- **replicate** - Replicate API client (MusicGen, Nano Banana)
- **fluent-ffmpeg** - FFmpeg wrapper (crossfade, video creation)
- **axios** - HTTP client (file downloads, YouTube APIs)
- **winston** - logging with ANSI colors and millisecond timestamps
- **dotenv** - env var loading
- **@axiomhq/js** - Axiom observability (planned)
