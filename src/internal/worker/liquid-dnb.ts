import { IWorker } from "./worker";

export class LiquidDnBWorker extends IWorker {
  name = "liquid-dnb";
  trackCount = 5;
  crossfadeSec = 4;
  makeInstrumental = true;

  musicPrompt =
    "Liquid drum & bass / jungle fusion at 172 BPM, " +
    "Extended DJ-friendly intro with filtered minor-key arp, ping-pong delay widening gradually; " +
    "jungle break creeps in with chopped Amen edits and tight ghosted snares, " +
    "First drop brings deep rolling sub and smooth Reese layer, Juno-style pads gluing the mids, " +
    "Second pass adds brighter top-end percussion and subtle vocal chops for lift, " +
    "then strips back to pads and arp for an atmospheric outro, " +
    "jungle, warm, deep, breaks, drum and bass, slow, bassline, smooth, breakbeat";

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
