import logger from "./logger/logger";

export class Queue {
  private running = 0;
  private pending: (() => void)[] = [];

  constructor(private readonly concurrency: number) {}

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      await new Promise<void>((resolve) => this.pending.push(resolve));
    }

    this.running++;
    logger.info("queue: task started", {
      running: this.running,
      pending: this.pending.length,
    });

    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.pending.shift();
      if (next) next();
      logger.info("queue: task done", {
        running: this.running,
        pending: this.pending.length,
      });
    }
  }
}
