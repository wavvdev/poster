import path from "path";
import { mkdirSync, readdirSync, unlinkSync } from "fs";
import winston from "winston";
import logger from "../logger/logger";
import { generateMusic, crossfadeMixAndSave, downloadTrack } from "../replicate/music";
import { generateAndSave as generateAndSaveImage } from "../replicate/images";
import { createVideo } from "../video/video";
import { Queue } from "../queue";

const OUTPUT_DIR = path.resolve(process.cwd(), "output");

export abstract class IWorker {
  abstract name: string;
  abstract musicPrompt: string;
  abstract imagePrompt: string;
  abstract trackCount: number;
  abstract musicDuration: number;
  abstract crossfadeSec: number;

  protected get log(): winston.Logger {
    return logger.child({ worker: this.name });
  }

  async run(queue: Queue): Promise<string> {
    this.log.info("starting pipeline");
    const ts = Date.now();
    const dir = path.join(OUTPUT_DIR, this.name);
    mkdirSync(dir, { recursive: true });

    // 1. generate tracks with different seeds (queued)
    this.log.info("generating tracks", { count: this.trackCount });
    const trackUrls = await Promise.all(
      Array.from({ length: this.trackCount }, (_, i) => {
        const seed = Math.floor(Math.random() * 2147483647);
        this.log.info(`queuing track ${i + 1}/${this.trackCount}`, { seed });
        return queue.enqueue(() =>
          generateMusic(this.musicPrompt, {
            duration: this.musicDuration,
            seed,
          })
        );
      })
    );
    this.log.info("all tracks generated", { count: trackUrls.length });

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
