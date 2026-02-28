import logger from "./internal/logger/logger";
import { LiquidDnBWorker } from "./internal/worker/liquid-dnb";

const workers = [new LiquidDnBWorker()];

const main = async () => {
  logger.info("starting all workers", { count: workers.length });

  const results = await Promise.allSettled(workers.map((w) => w.run()));

  for (const [i, result] of results.entries()) {
    if (result.status === "fulfilled") {
      logger.info(`[${workers[i].name}] completed`, { output: result.value });
    } else {
      logger.error(`[${workers[i].name}] failed`, {
        error: result.reason?.message,
      });
    }
  }

  logger.info("all workers finished");
};

main();
