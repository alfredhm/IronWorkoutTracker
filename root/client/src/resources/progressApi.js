// Isolate Progress page network requests and normalize API records for analytics.
import axios from "axios";
import { getExerciseCategories, numberValue } from "./progressData";

const API_URL = "http://localhost:5000/api";
const requestConfig = { withCredentials: true };

export const getProgressErrorMessage = (requestError, fallback) => {
  const responseMessage =
    requestError.response?.data?.message || requestError.response?.data;
  if (typeof responseMessage !== "string") {
    return requestError.message || fallback;
  }
  if (/<!doctype html|<html|Cannot (GET|POST|DELETE)/i.test(responseMessage)) {
    return requestError.response?.status === 404
      ? "The running API does not have this endpoint yet. Restart the backend and retry."
      : fallback;
  }
  return responseMessage;
};

// Fetch the small set of top-level resources concurrently; exercise sets are loaded below.
export const fetchProgressData = async (userId) => {
  const [
    sessionsResponse,
    measurementsResponse,
    workoutsResponse,
    userResponse,
  ] = await Promise.all([
    axios.get(`${API_URL}/workoutsessions/user/${userId}`, requestConfig),
    axios.get(`${API_URL}/users/me/measurements`, requestConfig),
    axios.get(`${API_URL}/workouts/user/${userId}`, requestConfig),
    axios.get(`${API_URL}/users/me`, requestConfig),
  ]);
  const workoutSessions = sessionsResponse.data;
  // Session copies can omit categories, so keep their source templates available by ID.
  const workoutsById = new Map(
    workoutsResponse.data.map((workout) => [String(workout._id), workout]),
  );
  const exercises = workoutSessions.flatMap((session) =>
    (session.exercises || []).map((exercise) => ({
      ...exercise,
      sessionId: String(session._id),
    })),
  );
  const uniqueExercises = [
    ...new Map(exercises.map((exercise) => [exercise._id, exercise])).values(),
  ];
  // The API is exercise-scoped; fetch each exercise once, then filter by session ID below.
  const setsByExercise = await Promise.all(
    uniqueExercises.map(async (exercise) => {
      const setsResponse = await axios.get(
        `${API_URL}/sets/exercise/${exercise._id}`,
        requestConfig,
      );
      return [exercise._id, setsResponse.data];
    }),
  );
  const setMap = new Map(setsByExercise);
  const sessions = workoutSessions.map((session) => {
    const template = workoutsById.get(String(session.workoutTemplate));
    // Templates provide categories for session copies that do not retain them.
    const templateCategoriesByName = new Map(
      (template?.exercises || []).map((exercise) => [
        exercise.name.trim().toLowerCase(),
        exercise.category || [],
      ]),
    );
    const exercisesForSession = (session.exercises || []).map((exercise) => ({
      ...exercise,
      category: getExerciseCategories(exercise, templateCategoriesByName),
      // Reusing an exercise across sessions must not mix their set records.
      sets: (setMap.get(exercise._id) || []).filter(
        (set) =>
          String(set.sessionId) === String(session._id) &&
          numberValue(set.reps) > 0,
      ),
    }));
    const completedSets = exercisesForSession.flatMap((exercise) =>
      exercise.sets.map((set) => ({
        ...set,
        exerciseName: exercise.name,
        categories: exercise.category || [],
      })),
    );

    return {
      id: session._id,
      name: session.name || "Workout",
      date: new Date(session.date),
      durationSec: numberValue(session.durationSec),
      exercises: exercisesForSession,
      sets: completedSets,
    };
  });

  return {
    sessions,
    measurements: measurementsResponse.data,
    heightInches: userResponse.data.heightInches,
  };
};

export const createMeasurement = (measurement) =>
  axios.post(`${API_URL}/users/me/measurements`, measurement, requestConfig);

export const deleteMeasurement = (measurementId) =>
  axios.delete(
    `${API_URL}/users/me/measurements/${measurementId}`,
    requestConfig,
  );
