import Replicate from "replicate";
import { writeFile } from "fs/promises";
import axios from "axios";
import logger from "../logger/logger";
import { config } from "../config/config";

const replicate = new Replicate({ auth: config.replicate.apiToken });

const VARIATION_TAGS = [
  "close-up portrait shot",
  "wide angle composition",
  "looking away from camera",
  "side profile view",
  "low angle perspective",
  "high contrast lighting",
  "soft diffused lighting",
  "silhouette framing",
  "overhead birds eye view",
  "extreme close-up on eyes",
  "back turned to viewer",
  "reflected in a mirror",
  "partially obscured by shadow",
  "viewed through glass",
  "surrounded by static",
];

export async function generateImage(
  prompt: string,
  opts?: {
    seed?: number;
    aspectRatio?: "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21";
    outputFormat?: "webp" | "jpg" | "png";
    numInferenceSteps?: number;
    guidanceScale?: number;
  },
): Promise<string> {
  const seed = opts?.seed ?? Math.floor(Math.random() * 2147483647);
  const variation = VARIATION_TAGS[Math.floor(Math.random() * VARIATION_TAGS.length)];
  const variedPrompt = `${prompt}, ${variation}`;
  logger.info("generating image", { seed, variation });

  const output = (await replicate.run("black-forest-labs/flux-dev", {
    input: {
      prompt: variedPrompt,
      seed,
      aspect_ratio: opts?.aspectRatio ?? "1:1",
      output_format: opts?.outputFormat ?? "png",
      num_inference_steps: opts?.numInferenceSteps ?? 25,
      guidance: opts?.guidanceScale ?? 3,
      go_fast: false,
    },
  })) as any[];

  const url = output[0].url() as string;
  logger.info("image generated", { url });
  return url;
}

export async function generateAndSave(
  prompt: string,
  path: string,
  opts?: Parameters<typeof generateImage>[1],
): Promise<string> {
  const url = await generateImage(prompt, opts);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await writeFile(path, Buffer.from(res.data));
  logger.info("image saved", { path });
  return path;
}
