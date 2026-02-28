import { IWorker } from "./worker";

export class EspionageWorker extends IWorker {
  name = "espionage";
  trackCount = 2;
  musicDuration = 5;
  crossfadeSec = 3;

  musicPrompt =
    "dark cinematic espionage thriller film score, deep ominous low-frequency drone pads that slowly evolve and shift with granular synthesis textures, tense suspenseful atmosphere with distant shortwave radio static and morse code bleeps buried in the mix, sparse minimal percussion with muffled kicks and metallic rim shots echoing in a large empty space, haunting solo cello playing dissonant minor intervals with heavy reverb, cold war era analog synthesizer sweeps and filtered noise risers, subtle ticking clock sample building tension, occasional deep brass stabs punctuating silence, undercover CIA surveillance mood with noir jazz undertones, slow tempo around 70 bpm, professional cinematic mixing with wide spatial depth and dark atmospheric mastering";

  imagePrompt =
    "dark noir cityscape at night, silhouette of spy in trench coat under streetlight, foggy alley, cinematic espionage thriller aesthetic";

  async upload(filePath: string): Promise<void> {
    this.log.info("uploading", { filePath });
    // TODO: youtube upload with channel credentials
  }
}
