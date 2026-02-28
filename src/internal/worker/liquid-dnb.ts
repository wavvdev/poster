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
    "fragmented silhouette dissolving into tangled telephone wires against a bleeding sunset, " +
    "mixed media collage of torn manga pages and circuit diagrams layered over 16mm film stills, " +
    "VHS tracking corruption eating the edges, hand-painted ink wash textures, " +
    "no face visible, muted rust and deep teal, Kon Satoshi meets Shinichi Sakamoto, " +
    "uncomfortable negative space, grain-heavy, lo-fi decay";

  async upload(filePath: string): Promise<void> {
    this.log.info("uploading", { filePath });
    // TODO: youtube upload with channel credentials
  }
}
