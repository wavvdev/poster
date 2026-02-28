import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`missing env var: ${key}`);
  return val;
}

function optional(key: string): string | undefined {
  return process.env[key];
}

export const config = {
  replicate: {
    apiToken: required("REPLICATE_API_TOKEN"),
  },
youtube: {
    clientId: optional("YOUTUBE_CLIENT_ID"),
    clientSecret: optional("YOUTUBE_CLIENT_SECRET"),
    liquidDnbRefreshToken: optional("YOUTUBE_LIQUID_DNB_REFRESH_TOKEN"),
    espionageRefreshToken: optional("YOUTUBE_ESPIONAGE_REFRESH_TOKEN"),
    apiKey: optional("YOUTUBE_API_KEY"),
  },
} as const;
