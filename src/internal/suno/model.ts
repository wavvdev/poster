export interface SunoTrack {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model_name: string;
  status: "streaming" | "complete" | "queued" | "error";
  gpt_description_prompt: string;
  prompt: string;
  type: string;
  tags: string;
}

export type SunoResponse = SunoTrack[];
