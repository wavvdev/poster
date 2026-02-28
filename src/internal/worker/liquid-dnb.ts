import { IWorker } from "./worker";

export class LiquidDnBWorker extends IWorker {
  name = "liquid-dnb";
  trackCount = 5;
  crossfadeSec = 4;
  makeInstrumental = true;

  musicPrompt =
    "Liquid DnB jungle fusion 172 BPM, filtered arp intro, chopped Amen breaks, " +
    "deep rolling sub with Reese layer, Juno pads, vocal chops, atmospheric outro, " +
    "warm, deep, smooth, breakbeat";

  imagePrompt =
    "a melancholic anime girl with long black hair resting her chin on her hands, " +
    "staring through a CRT monitor in a dark room, blue monochrome lighting, " +
    "hand-drawn cel animation style from the late 1990s, thin ink linework, " +
    "faded japanese text and kanji overlaid like a corrupted VHS tape, " +
    "heavy film grain and analog noise, washed out contrast like a scan from an old artbook, " +
    "inspired by Yoshitoshi ABe illustration work, muted tones, no bright colors, " +
    "composition like a still frame from a 1998 anime OVA captured on a worn VHS tape";

  async upload(filePath: string): Promise<void> {
    this.log.info("uploading", { filePath });
    // TODO: youtube upload with channel credentials
  }
}
