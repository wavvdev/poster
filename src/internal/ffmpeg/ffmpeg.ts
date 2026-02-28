import ffmpeg from "fluent-ffmpeg";
import { writeFile } from "fs/promises";
import axios from "axios";
import logger from "../logger/logger";

export async function downloadTrack(url: string, dest: string): Promise<string> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await writeFile(dest, Buffer.from(res.data));
  logger.info("track downloaded", { dest });
  return dest;
}

export function buildCrossfadeFilters(
  trackCount: number,
  crossfadeSec: number,
  curve: string,
): string[] {
  const filters: string[] = [];
  const last = trackCount - 1;
  for (let i = 0; i < last; i++) {
    const inLeft = i === 0 ? "[0:a]" : `[a${String(i - 1).padStart(2, "0")}]`;
    const inRight = `[${i + 1}:a]`;
    const out = i === last - 1 ? "[out]" : `[a${String(i).padStart(2, "0")}]`;
    filters.push(
      `${inLeft}${inRight}acrossfade=d=${crossfadeSec}:c1=${curve}:c2=${curve}${out}`,
    );
  }
  return filters;
}

export async function crossfadeMixAndSave(
  files: string[],
  outputPath: string,
  crossfadeSec = 3,
  curve: string = "tri",
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (files.length < 2) {
      reject(new Error("need at least 2 tracks"));
      return;
    }

    logger.info("crossfade mix starting", {
      tracks: files.length,
      crossfadeSec,
    });

    const cmd = ffmpeg();
    for (const file of files) cmd.input(file);

    const filters = buildCrossfadeFilters(files.length, crossfadeSec, curve);

    cmd
      .complexFilter(filters)
      .outputOptions("-map", "[out]")
      .on("end", () => {
        logger.info("crossfade mix done", { outputPath });
        resolve(outputPath);
      })
      .on("error", (err) => {
        logger.error("crossfade mix failed", { error: err.message });
        reject(err);
      })
      .save(outputPath);
  });
}

export function createVideo(
  imagePath: string,
  audioPath: string,
  outputPath: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    logger.info("creating video", { imagePath, audioPath, outputPath });

    ffmpeg()
      .input(imagePath)
      .inputOptions("-loop", "1")
      .input(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-tune stillimage",
        "-c:a aac",
        "-b:a 192k",
        "-pix_fmt yuv420p",
        "-shortest",
      ])
      .on("end", () => {
        logger.info("video created", { outputPath });
        resolve(outputPath);
      })
      .on("error", (err) => {
        logger.error("video creation failed", { error: err.message });
        reject(err);
      })
      .save(outputPath);
  });
}
