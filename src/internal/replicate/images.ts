import Replicate from "replicate";
import { writeFile } from "fs/promises";
import axios from "axios";
import logger from "../logger/logger";
import { config } from "../config/config";

const replicate = new Replicate({ auth: config.replicate.apiToken });

export async function generateImage(
  prompt: string,
  opts?: {
    seed?: number;
    imageInput?: string[];
    aspectRatio?: "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21" | "match_input_image";
    outputFormat?: "webp" | "jpg" | "png";
  },
): Promise<string> {
  const seed = opts?.seed ?? Math.floor(Math.random() * 2147483647);
  logger.info("generating image", { seed });

  const output = (await replicate.run("google/nano-banana", {
    input: {
      prompt,
      seed,
      image_input: opts?.imageInput,
      aspect_ratio: opts?.aspectRatio ?? "1:1",
      output_format: opts?.outputFormat ?? "jpg",
    },
  })) as any;

  const url = output.url() as string;
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
