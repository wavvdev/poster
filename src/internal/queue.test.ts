import { describe, it, expect } from "vitest";
import { Queue } from "./queue";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Queue", () => {
  it("limits concurrency", async () => {
    const q = new Queue(2);
    let running = 0;
    let maxRunning = 0;

    const task = async (ms: number) => {
      running++;
      if (running > maxRunning) maxRunning = running;
      await sleep(ms);
      running--;
    };

    await Promise.all([
      q.enqueue(() => task(50)),
      q.enqueue(() => task(50)),
      q.enqueue(() => task(50)),
      q.enqueue(() => task(50)),
      q.enqueue(() => task(50)),
    ]);

    expect(maxRunning).toBe(2);
  });

  it("returns the function result", async () => {
    const q = new Queue(1);
    const result = await q.enqueue(async () => 42);
    expect(result).toBe(42);
  });

  it("propagates errors", async () => {
    const q = new Queue(1);
    await expect(
      q.enqueue(async () => { throw new Error("boom"); })
    ).rejects.toThrow("boom");
  });

  it("continues processing after error", async () => {
    const q = new Queue(1);
    await q.enqueue(async () => { throw new Error("fail"); }).catch(() => {});
    const result = await q.enqueue(async () => "ok");
    expect(result).toBe("ok");
  });

  it("runs up to concurrency limit in parallel", async () => {
    const q = new Queue(3);
    const order: number[] = [];

    await Promise.all([
      q.enqueue(async () => { await sleep(30); order.push(1); }),
      q.enqueue(async () => { await sleep(10); order.push(2); }),
      q.enqueue(async () => { await sleep(20); order.push(3); }),
    ]);

    // all 3 start immediately, finish in order of their sleep duration
    expect(order).toEqual([2, 3, 1]);
  });
});
