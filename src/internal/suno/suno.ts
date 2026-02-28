import axios from "axios";
import logger from "../logger/logger";
import { SunoTrack } from "./model";

const SUNO_BASE = "http://localhost:3000";

export interface GenerateParams {
  prompt: string;
  make_instrumental?: boolean;
  wait_audio?: boolean;
  model?: string;
}

export async function generate(params: GenerateParams): Promise<SunoTrack[]> {
  logger.info("suno: generating", { prompt: params.prompt.slice(0, 80) });

  const res = await axios.post<SunoTrack[]>(`${SUNO_BASE}/api/generate`, {
    prompt: params.prompt,
    make_instrumental: params.make_instrumental ?? false,
    wait_audio: params.wait_audio ?? true,
    model: params.model ?? "chirp-crow",
  });

  logger.info("suno: generated", { count: res.data.length });
  return res.data;
}
