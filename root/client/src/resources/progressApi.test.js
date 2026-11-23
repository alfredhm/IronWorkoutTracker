import axios from "axios";
import {
  createMeasurement,
  deleteMeasurement,
  fetchProgressData,
} from "./progressApi";

jest.mock("axios", () => ({
  delete: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
}));

describe("progress API resource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("combines sessions, template categories, sets, and measurements", async () => {
    const workoutSession = {
      _id: "session-1",
      workoutTemplate: "workout-1",
      date: "2026-11-15T12:00:00.000Z",
      durationSec: 60,
      exercises: [
        { _id: "exercise-1", name: "Bench Press", category: [] },
      ],
    };
    const measurements = [{ _id: "measurement-1", value: 150 }];
    const responses = {
      "/api/workoutsessions/user/user-1": [workoutSession],
      "/api/users/me/measurements": measurements,
      "/api/workouts/user/user-1": [
        {
          _id: "workout-1",
          exercises: [{ name: "Bench Press", category: ["Chest"] }],
        },
      ],
      "/api/users/me": { heightInches: 70 },
      "/api/sets/exercise/exercise-1": [
        { sessionId: "session-1", reps: 0, weight: 100 },
        { sessionId: "session-1", reps: 8, weight: 100 },
        { sessionId: "another-session", reps: 8, weight: 100 },
      ],
    };
    axios.get.mockImplementation((url) =>
      Promise.resolve({ data: responses[url.replace("http://localhost:5000", "")] }),
    );

    await expect(fetchProgressData("user-1")).resolves.toEqual({
      measurements,
      heightInches: 70,
      sessions: [
        {
          id: "session-1",
          name: "Workout",
          date: new Date("2026-11-15T12:00:00.000Z"),
          durationSec: 60,
          exercises: [
            {
              _id: "exercise-1",
              name: "Bench Press",
              category: ["Chest"],
              sets: [{ sessionId: "session-1", reps: 8, weight: 100 }],
            },
          ],
          sets: [
            {
              sessionId: "session-1",
              reps: 8,
              weight: 100,
              exerciseName: "Bench Press",
              categories: ["Chest"],
            },
          ],
        },
      ],
    });
  });

  test("uses the measurement endpoints for create and delete operations", async () => {
    const measurement = { kind: "bodyWeight", value: 150 };
    await createMeasurement(measurement);
    await deleteMeasurement("measurement-1");

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5000/api/users/me/measurements",
      measurement,
      { withCredentials: true },
    );
    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:5000/api/users/me/measurements/measurement-1",
      { withCredentials: true },
    );
  });
});
