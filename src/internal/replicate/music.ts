import Replicate from "replicate";
import ffmpeg from "fluent-ffmpeg";
import { writeFile } from "fs/promises";
import axios from "axios";
import logger from "../logger/logger";
import { config } from "../config/config";
const replicate = new Replicate({ auth: config.replicate.apiToken });

async function downloadTrack(url: string, dest: string): Promise<string> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await writeFile(dest, Buffer.from(res.data));
  logger.info("track downloaded", { dest });
  return dest;
}

export async function generateMusic(
  prompt: string,
  opts?: {
    duration?: number;
    seed?: number;
    temperature?: number;
    topK?: number;
    topP?: number;
    classifierFreeGuidance?: number;
    modelVersion?: "stereo-large" | "stereo-melody-large" | "melody-large" | "large";
    outputFormat?: "mp3" | "wav";
    normalizationStrategy?: "loudness" | "clip" | "peak" | "rms";
  },
): Promise<string> {
  logger.info("generating music", { seed: opts?.seed });

  const output = (await replicate.run(
    "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
    {
      input: {
        prompt,
        seed: opts?.seed ?? -1,
        temperature: opts?.temperature ?? 1,
        top_k: opts?.topK ?? 250,
        top_p: opts?.topP ?? 0,
        classifier_free_guidance: opts?.classifierFreeGuidance ?? 3,
        model_version: opts?.modelVersion ?? "stereo-large",
        output_format: opts?.outputFormat ?? "wav",
        duration: opts?.duration ?? 8,
        normalization_strategy: opts?.normalizationStrategy ?? "loudness",
      },
    },
  )) as any;

  logger.info("music generated", { url: output.url() });
  return output.url();
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

export { downloadTrack };
