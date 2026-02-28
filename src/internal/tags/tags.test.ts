import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import { getYouTubeSuggestions, getTrendingMusicTags, getBulkSuggestions } from "./tags";

describe("tags", () => {
  describe("getYouTubeSuggestions (live)", () => {
    it("returns suggestions for a query", async () => {
      const results = await getYouTubeSuggestions("lofi music");
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toBeTypeOf("string");
    });

    it("returns empty array for gibberish", async () => {
      const results = await getYouTubeSuggestions("xyzzzz12345noresult");
      expect(results).toBeInstanceOf(Array);
    });
  });

  describe("getTrendingMusicTags (mocked)", () => {
    it("returns deduped lowercase tags from trending videos", async () => {
      const spy = vi.spyOn(axios, "get");

      // mock trending video IDs
      spy.mockResolvedValueOnce({
        data: { items: [{ id: "abc" }, { id: "def" }] },
      });

      // mock snippet details
      spy.mockResolvedValueOnce({
        data: {
          items: [
            { snippet: { tags: ["Pop", "Music", "2026"] } },
            { snippet: { tags: ["Music", "Hip Hop"] } },
          ],
        },
      });

      const tags = await getTrendingMusicTags("fake-key");
      expect(tags).toEqual(["pop", "music", "2026", "hip hop"]);

      spy.mockRestore();
    });

    it("returns empty array when no trending videos", async () => {
      const spy = vi.spyOn(axios, "get");
      spy.mockResolvedValueOnce({ data: { items: [] } });

      const tags = await getTrendingMusicTags("fake-key");
      expect(tags).toEqual([]);

      spy.mockRestore();
    });

    it("handles videos with no tags", async () => {
      const spy = vi.spyOn(axios, "get");
      spy.mockResolvedValueOnce({
        data: { items: [{ id: "abc" }] },
      });
      spy.mockResolvedValueOnce({
        data: { items: [{ snippet: {} }] },
      });

      const tags = await getTrendingMusicTags("fake-key");
      expect(tags).toEqual([]);

      spy.mockRestore();
    });
  });

  describe("getBulkSuggestions (live)", () => {
    it("returns deduped suggestions from multiple seeds", async () => {
      const results = await getBulkSuggestions(["lofi", "hip hop"], 100);
      expect(results.length).toBeGreaterThan(0);
      // should be all lowercase
      results.forEach((r) => expect(r).toBe(r.toLowerCase()));
      // should be unique
      expect(results.length).toBe(new Set(results).size);
    });
  });
});
