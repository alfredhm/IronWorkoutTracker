import {
  calculateBMI,
  getExerciseCategories,
  getBestLifts,
  getMuscleGroupSetCounts,
  getSessionsForPeriod,
  getWeeklyProgress,
  numberValue,
  summarizeSessions,
} from "./progressData";

const sessions = [
  {
    name: "Push Day",
    date: new Date("2026-11-01T12:00:00"),
    durationSec: 1800,
    sets: [
      { weight: 100, reps: 5 },
      { weight: 110, reps: 3 },
    ],
    exercises: [
      {
        name: "Bench Press",
        category: ["Chest", "Triceps"],
        sets: [
          { weight: 100, reps: 5 },
          { weight: 110, reps: 3 },
        ],
      },
    ],
  },
  {
    name: "Upper Body",
    date: new Date("2026-11-08T12:00:00"),
    durationSec: 2400,
    sets: [
      { weight: 110, reps: 5 },
      { weight: 0, reps: 12 },
    ],
    exercises: [
      {
        name: "bench press",
        category: ["Chest", "Triceps"],
        sets: [
          { weight: 110, reps: 5 },
          { weight: 0, reps: 12 },
        ],
      },
      {
        name: "Bodyweight Squat",
        category: ["Quadriceps"],
        sets: [{ weight: 0, reps: 12 }],
      },
    ],
  },
  {
    date: new Date("2026-10-01T12:00:00"),
    durationSec: 1200,
    sets: [{ weight: 200, reps: 1 }],
    exercises: [],
  },
];

describe("progress data calculations", () => {
  test("calculates BMI from pounds and inches when both values are present", () => {
    expect(calculateBMI(150, 70)).toBeCloseTo(21.52, 2);
    expect(calculateBMI(150, null)).toBeNull();
  });

  test("uses workout-template categories when a session copy lacks them", () => {
    const categories = new Map([["pull-up", ["Back", "Biceps"]]]);
    expect(
      getExerciseCategories({ name: "Pull-Up", category: [] }, categories),
    ).toEqual(["Back", "Biceps"]);
    expect(
      getExerciseCategories(
        { name: "Pull-Up", category: ["Back"] },
        categories,
      ),
    ).toEqual(["Back"]);
  });

  test("summarizes loaded volume, completed sets, reps, and workout time", () => {
    expect(summarizeSessions(sessions.slice(0, 2))).toEqual({
      sets: 4,
      reps: 25,
      volume: 1380,
      durationSec: 4200,
    });
    expect(numberValue("not a number")).toBe(0);
  });

  test("tracks the best set and weight trend by exercise name", () => {
    const [benchPress] = getBestLifts(sessions.slice(0, 2));
    expect(benchPress.name).toBe("Bench Press");
    expect(benchPress.bestWeight).toBe(110);
    expect(benchPress.bestReps).toBe(5);
    expect(benchPress.points.map((point) => point.value)).toEqual([110, 110]);
    expect(benchPress.points[0].workoutName).toBe("Push Day");
  });

  test("counts completed sets for each target muscle, independent of weight", () => {
    expect(getMuscleGroupSetCounts(sessions.slice(0, 2))).toEqual([
      ["Chest", 4],
      ["Triceps", 4],
      ["Quadriceps", 1],
    ]);
  });

  test("builds weekly metric points and excludes sessions outside the range", () => {
    const today = new Date("2026-11-15T12:00:00");
    const volume = getWeeklyProgress(sessions, 4, "volume", today);
    expect(volume.currentSessions).toHaveLength(2);
    expect(volume.chartPoints.map((point) => point.value)).toEqual([
      0, 830, 550, 0,
    ]);

    const weight = getWeeklyProgress(sessions, 4, "weight", today);
    expect(weight.chartPoints.map((point) => point.value)).toEqual([
      0, 110, 110, 0,
    ]);
    const reps = getWeeklyProgress(sessions, 4, "reps", today);
    expect(reps.chartPoints.map((point) => point.value)).toEqual([
      0, 8, 17, 0,
    ]);
    const sets = getWeeklyProgress(sessions, 4, "sets", today);
    expect(sets.chartPoints.map((point) => point.value)).toEqual([
      0, 2, 2, 0,
    ]);
    const minutes = getWeeklyProgress(sessions, 4, "minutes", today);
    expect(minutes.chartPoints.map((point) => point.value)).toEqual([
      0, 30, 40, 0,
    ]);
    expect(volume.chartPoints[1].workouts).toEqual([
      { name: "Push Day", date: sessions[0].date },
    ]);
    expect(volume.chartPoints.map((point) => point.showPoint)).toEqual([
      false,
      true,
      true,
      false,
    ]);
  });

  test("includes only sessions in the visible calendar weeks and through today", () => {
    const datedSessions = [
      { date: new Date("2026-10-24T12:00:00"), sets: [], durationSec: 60 },
      { date: new Date("2026-10-25T12:00:00"), sets: [], durationSec: 60 },
      { date: new Date("2026-11-16T12:00:00"), sets: [], durationSec: 60 },
    ];
    const result = getWeeklyProgress(
      datedSessions,
      4,
      "minutes",
      new Date("2026-11-15T12:00:00"),
    );

    expect(result.currentSessions).toEqual([datedSessions[1]]);
  });

  test("filters muscle-period sessions to the current week, month, or year", () => {
    const datedSessions = [
      { date: new Date(2026, 10, 15, 10) },
      { date: new Date(2026, 10, 8, 10) },
      { date: new Date(2026, 9, 31, 10) },
      { date: new Date(2025, 11, 31, 10) },
    ];
    const today = new Date(2026, 10, 15, 12);

    expect(getSessionsForPeriod(datedSessions, "week", today)).toHaveLength(1);
    expect(getSessionsForPeriod(datedSessions, "month", today)).toHaveLength(2);
    expect(getSessionsForPeriod(datedSessions, "year", today)).toHaveLength(3);
  });
});
