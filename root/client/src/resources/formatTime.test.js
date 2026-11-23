import formatTime from "./formatTime";

describe("formatTime", () => {
  test("formats long durations as hours instead of thousands of minutes", () => {
    expect(formatTime(1467 * 60)).toBe("24h 27m");
  });

  test("does not display positive sub-minute durations as zero", () => {
    expect(formatTime(30)).toBe("<1m");
  });

  test("formats zero and invalid durations safely", () => {
    expect(formatTime(0)).toBe("0m");
    expect(formatTime(Number.NaN)).toBe("0m");
  });
});
