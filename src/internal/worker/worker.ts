import path from "path";
import { mkdirSync, readdirSync, unlinkSync } from "fs";
import winston from "winston";
import logger from "../logger/logger";
import { crossfadeMixAndSave, downloadTrack } from "../replicate/music";
import { generate as generateSuno } from "../suno/suno";
import { generateAndSave as generateAndSaveImage } from "../replicate/images";
import { createVideo } from "../video/video";
import { Queue } from "../queue";

const OUTPUT_DIR = path.resolve(process.cwd(), "output");

export abstract class IWorker {
  abstract name: string;
  abstract musicPrompt: string;
  abstract imagePrompt: string;
  abstract trackCount: number;
  abstract crossfadeSec: number;
  abstract makeInstrumental: boolean;

  protected get log(): winston.Logger {
    return logger.child({ worker: this.name });
  }

  async run(queue: Queue): Promise<string> {
    this.log.info("starting pipeline");
    const ts = Date.now();
    const dir = path.join(OUTPUT_DIR, this.name);
    mkdirSync(dir, { recursive: true });

    // 1. generate tracks via Suno (each call returns 2 tracks)
    const callCount = Math.ceil(this.trackCount / 2);
    this.log.info("generating tracks via suno", { trackCount: this.trackCount, calls: callCount });

    const allTracks = (
      await Promise.all(
        Array.from({ length: callCount }, (_, i) => {
          this.log.info(`queuing suno call ${i + 1}/${callCount}`);
          return queue.enqueue(() =>
            generateSuno({
              prompt: this.musicPrompt,
              make_instrumental: this.makeInstrumental,
              wait_audio: true,
            })
          );
        })
      )
    ).flat();

    this.log.info("waiting 45s for audio to finalize");
    await new Promise((r) => setTimeout(r, 45_000));

    const trackUrls = allTracks.slice(0, this.trackCount).map((t) => t.audio_url);
    this.log.info("all tracks ready", { count: trackUrls.length });

    // 2. download tracks to disk
    this.log.info("downloading tracks");
    const trackFiles = await Promise.all(
      trackUrls.map((url, i) =>
        downloadTrack(url, path.join(dir, `track-${ts}-${i}.wav`))
      )
    );
    this.log.info("all tracks downloaded", { count: trackFiles.length });

    // 3. crossfade mix into single audio
    const audioPath = path.join(dir, `mix-${ts}.mp3`);
    this.log.info("crossfade mixing", { crossfadeSec: this.crossfadeSec });
    await crossfadeMixAndSave(trackFiles, audioPath, this.crossfadeSec);
    this.log.info("mix complete", { audioPath });

    // 4. generate and save image (queued)
    const imagePath = path.join(dir, `cover-${ts}.png`);
    this.log.info("generating image");
    await queue.enqueue(() =>
      generateAndSaveImage(this.imagePrompt, imagePath, {
        aspectRatio: "16:9",
        outputFormat: "png",
      })
    );
    this.log.info("image saved", { imagePath });

    // 5. combine image + audio -> video
    const videoPath = path.join(dir, `video-${ts}.mp4`);
    this.log.info("creating video");
    await createVideo(imagePath, audioPath, videoPath);
    this.log.info("video created", { videoPath });

    // 6. upload
    this.log.info("uploading");
    await this.upload(videoPath);
    this.log.info("upload complete");

    // 7. cleanup intermediate files
    this.log.info("cleaning up");
    for (const file of readdirSync(dir)) {
      if (path.extname(file).toLowerCase() !== ".mp4") {
        unlinkSync(path.join(dir, file));
      }
    }

    this.log.info("pipeline complete");
    return videoPath;
  }

  abstract upload(filePath: string): Promise<void>;
}
