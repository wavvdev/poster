import ffmpeg from "fluent-ffmpeg";
import logger from "../logger/logger";

export function createVideo(
  imagePath: string,
  audioPath: string,
  outputPath: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    logger.info("creating video", { imagePath, audioPath, outputPath });

    ffmpeg()
      .input(imagePath)
      .inputOptions("-loop", "1")
      .input(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-tune stillimage",
        "-c:a aac",
        "-b:a 192k",
        "-pix_fmt yuv420p",
        "-shortest",
      ])
      .on("end", () => {
        logger.info("video created", { outputPath });
        resolve(outputPath);
      })
      .on("error", (err) => {
        logger.error("video creation failed", { error: err.message });
        reject(err);
      })
      .save(outputPath);
  });
}
