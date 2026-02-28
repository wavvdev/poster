import { IWorker } from "./worker";

export class LiquidDnBWorker extends IWorker {
  name = "liquid-dnb";
  trackCount = 5;
  musicDuration = 90;
  crossfadeSec = 4;

  musicPrompt =
    "liquid drum and bass jungle fusion track at 172 bpm with proper song structure, " +
    "intro builds with a filtered synth arpeggiator sequence in minor key running sixteenth notes with ping pong delay, " +
    "rolling jungle breakbeat drops in with chopped amen breaks and tight ghost note snare fills, shuffled hi-hats with offbeat open hat accents, " +
    "deep warm rolling sub bassline with smooth reese mid-bass layered on top modulating with slow LFO, " +
    "melodic grand piano playing jazzy minor seventh and ninth chord progressions with soft velocity dynamics, " +
    "bright pluck synth stabs hitting syncopated rhythms on the offbeats creating a bouncy groove, " +
    "lush detuned saw pad chords swelling in and out with long release tails and stereo chorus, " +
    "shimmering ambient arpeggiator running through a lush reverb creating a dreamy background texture, " +
    "soft pitched-down female vocal chops drenched in hall reverb floating over the mix, " +
    "orchestral string ensemble swells rising into halftime breakdowns, " +
    "subtle vinyl crackle and tape hiss adding warmth, rain and nature field recording textures in the background, " +
    "gentle wind chime and bell one-shots scattered throughout, " +
    "soothing groovy bouncy feel with deep low end presence and wide stereo imaging, " +
    "professional mixdown with sidechain compression on the pads ducking to the kick";

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
