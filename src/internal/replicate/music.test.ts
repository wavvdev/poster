import { describe, it, expect } from "vitest";
import { buildCrossfadeFilters } from "./music";

describe("buildCrossfadeFilters", () => {
  it("builds correct filter for 2 tracks", () => {
    const filters = buildCrossfadeFilters(2, 3, "tri");
    expect(filters).toEqual([
      "[0:a][1:a]acrossfade=d=3:c1=tri:c2=tri[out]",
    ]);
  });

  it("builds correct chain for 3 tracks", () => {
    const filters = buildCrossfadeFilters(3, 2, "exp");
    expect(filters).toEqual([
      "[0:a][1:a]acrossfade=d=2:c1=exp:c2=exp[a00]",
      "[a00][2:a]acrossfade=d=2:c1=exp:c2=exp[out]",
    ]);
  });

  it("builds correct chain for 5 tracks", () => {
    const filters = buildCrossfadeFilters(5, 3, "tri");
    expect(filters).toHaveLength(4);
    expect(filters[0]).toBe("[0:a][1:a]acrossfade=d=3:c1=tri:c2=tri[a00]");
    expect(filters[1]).toBe("[a00][2:a]acrossfade=d=3:c1=tri:c2=tri[a01]");
    expect(filters[2]).toBe("[a01][3:a]acrossfade=d=3:c1=tri:c2=tri[a02]");
    expect(filters[3]).toBe("[a02][4:a]acrossfade=d=3:c1=tri:c2=tri[out]");
  });

  it("builds correct chain for 10 tracks", () => {
    const filters = buildCrossfadeFilters(10, 3, "tri");
    expect(filters).toHaveLength(9);
    // first always starts with [0:a][1:a]
    expect(filters[0]).toMatch(/^\[0:a\]\[1:a\]/);
    // last always ends with [out]
    expect(filters[8]).toMatch(/\[out\]$/);
    // middle ones chain correctly
    expect(filters[4]).toBe("[a03][5:a]acrossfade=d=3:c1=tri:c2=tri[a04]");
  });
});
