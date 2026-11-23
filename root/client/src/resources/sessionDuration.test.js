import getElapsedDurationSec from "./sessionDuration";

describe("getElapsedDurationSec", () => {
  test("measures from the active session start instead of an older workout date", () => {
    const activeSessionOpenedAt = new Date("2026-11-15T21:06:00").getTime();
    const workoutEndedAt = new Date("2026-11-15T21:07:00").getTime();

    expect(getElapsedDurationSec(activeSessionOpenedAt, workoutEndedAt)).toBe(
      60,
    );
  });

  test("keeps a just-ended workout distinguishable from an in-progress one", () => {
    expect(getElapsedDurationSec(1000, 1000)).toBe(1);
  });

  test("returns zero for invalid or reversed timestamps", () => {
    expect(getElapsedDurationSec(Number.NaN, 2000)).toBe(0);
    expect(getElapsedDurationSec(2000, 1000)).toBe(0);
  });
});
