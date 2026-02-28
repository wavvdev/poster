import { IWorker } from "./worker";

export class EspionageWorker extends IWorker {
  name = "espionage";
  trackCount = 2;
  crossfadeSec = 3;
  makeInstrumental = true;

  musicPrompt =
    "Dark cinematic espionage score at 70 BPM, " +
    "evolving granular drone pads with shortwave static and buried morse bleeps, " +
    "sparse muffled kicks and metallic rim shots in cavernous space, " +
    "haunting dissonant cello with heavy reverb, cold-war analog sweeps and filtered risers, " +
    "ticking clock tension, deep brass stabs punctuating silence, " +
    "noir jazz undertones, wide spatial depth, dark atmospheric mastering";

  imagePrompt =
    "dark noir cityscape at night, silhouette of spy in trench coat under streetlight, foggy alley, cinematic espionage thriller aesthetic";

  async upload(filePath: string): Promise<void> {
    this.log.info("uploading", { filePath });
    // TODO: youtube upload with channel credentials
  }
}
