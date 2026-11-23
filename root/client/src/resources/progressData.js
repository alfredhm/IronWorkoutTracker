// Pure workout analytics used by the Progress page and its tests.
export const numberValue = (value) => {
  const number = Number(value);
  // Treat missing or malformed numeric values as zero so one bad record cannot poison a total.
  return Number.isFinite(number) ? number : 0;
};

export const calculateBMI = (weightPounds, heightInches) => {
  const weight = numberValue(weightPounds);
  const height = numberValue(heightInches);
  // The factor converts BMI's metric formula to pounds and inches.
  return weight > 0 && height > 0 ? (weight / height ** 2) * 703 : null;
};

export const getExerciseCategories = (exercise, templateCategoriesByName) => {
  if (Array.isArray(exercise.category) && exercise.category.length > 0) {
    return exercise.category;
  }
  // Session copies may omit categories; match their source template by normalized name.
  const exerciseName = exercise.name?.trim().toLowerCase();
  return exerciseName ? templateCategoriesByName.get(exerciseName) || [] : [];
};

// Sum the completed-set data already normalized by progressApi.
export const summarizeSessions = (sessions) =>
  sessions.reduce(
    (totals, session) => {
      totals.sets += session.sets.length;
      totals.reps += session.sets.reduce(
        (total, set) => total + numberValue(set.reps),
        0,
      );
      totals.volume += session.sets.reduce(
        (total, set) =>
          total + numberValue(set.weight) * numberValue(set.reps),
        0,
      );
      totals.durationSec += numberValue(session.durationSec);
      return totals;
    },
    { sets: 0, reps: 0, volume: 0, durationSec: 0 },
  );

export const getMuscleGroupSetCounts = (sessions) => {
  const totals = sessions.reduce((groups, session) => {
    (session.exercises || []).forEach((exercise) => {
      const categories =
        Array.isArray(exercise.category) && exercise.category.length > 0
          ? [...new Set(exercise.category)]
          : ["Uncategorized"];
      const completedSets = (exercise.sets || []).filter(
        (set) => numberValue(set.reps) > 0,
      );
      // Compound movements count once toward every target muscle, not by lifted weight.
      categories.forEach((category) => {
        groups[category] = (groups[category] || 0) + completedSets.length;
      });
    });
    return groups;
  }, {});

  return Object.entries(totals).sort((first, second) => second[1] - first[1]);
};

export const getBestLifts = (sessions) => {
  const liftMap = new Map();
  sessions.forEach((session) => {
    (session.exercises || []).forEach((exercise) => {
      const exerciseName = exercise.name?.trim();
      if (!exerciseName) return;
      const weightedSets = (exercise.sets || []).filter(
        (set) => numberValue(set.weight) > 0,
      );
      if (weightedSets.length === 0) return;

      // Rank by the heaviest working set; use reps to break equal-weight ties.
      const bestSet = weightedSets.reduce((best, set) =>
        numberValue(set.weight) > numberValue(best.weight) ||
        (numberValue(set.weight) === numberValue(best.weight) &&
          numberValue(set.reps) > numberValue(best.reps))
          ? set
          : best,
      );
      const key = exerciseName.toLowerCase();
      if (!liftMap.has(key)) {
        liftMap.set(key, {
          name: exerciseName,
          bestWeight: 0,
          bestReps: 0,
          points: [],
        });
      }
      const lift = liftMap.get(key);
      const sessionWeight = Math.max(
        ...weightedSets.map((set) => numberValue(set.weight)),
      );
      const date = new Date(session.date);
      // Keep one trend point per workout, with enough detail for its chart tooltip.
      lift.points.push({
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        date,
        workoutName: session.name,
        value: sessionWeight,
        showPoint: true,
      });
      if (
        numberValue(bestSet.weight) > lift.bestWeight ||
        (numberValue(bestSet.weight) === lift.bestWeight &&
          numberValue(bestSet.reps) > lift.bestReps)
      ) {
        lift.bestWeight = numberValue(bestSet.weight);
        lift.bestReps = numberValue(bestSet.reps);
      }
    });
  });

  return [...liftMap.values()]
    .map((lift) => ({
      ...lift,
      points: lift.points.sort((first, second) => first.date - second.date),
    }))
    .sort((first, second) => second.bestWeight - first.bestWeight);
};

const getWeekStart = (date) => {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
};

export const getSessionsForPeriod = (sessions, period, today = new Date()) => {
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  if (period === "week") {
    startDate.setDate(startDate.getDate() - startDate.getDay());
  } else if (period === "month") {
    startDate.setDate(1);
  } else {
    startDate.setMonth(0, 1);
  }

  // Use local calendar boundaries so "this week/month/year" matches the user's dates.
  return sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
};

export const getWeeklyProgress = (
  sessions,
  weeks,
  metric,
  today = new Date(),
) => {
  // The selected range is exactly the visible calendar-week buckets, including this week.
  const currentWeek = getWeekStart(today);
  const firstWeek = new Date(currentWeek);
  firstWeek.setDate(firstWeek.getDate() - (weeks - 1) * 7);
  const currentSessions = sessions.filter(
    (session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= firstWeek && sessionDate <= today;
    },
  );
  // Aggregate each session into its local week; retain workout details for hover text.
  const pointsByWeek = new Map();

  currentSessions.forEach((session) => {
    const weekStart = getWeekStart(new Date(session.date));
    const key = weekStart.toISOString();
    if (!pointsByWeek.has(key)) {
      pointsByWeek.set(key, {
        volume: 0,
        weight: 0,
        reps: 0,
        sets: 0,
        minutes: 0,
        workouts: [],
      });
    }
    const point = pointsByWeek.get(key);
    point.workouts.push({ name: session.name, date: session.date });
    point.volume += session.sets.reduce(
      (total, set) =>
        total + numberValue(set.weight) * numberValue(set.reps),
      0,
    );
    point.weight = Math.max(
      point.weight,
      ...session.sets.map((set) => numberValue(set.weight)),
      0,
    );
    point.reps += session.sets.reduce(
      (total, set) => total + numberValue(set.reps),
      0,
    );
    point.sets += session.sets.length;
    point.minutes += numberValue(session.durationSec) / 60;
  });

  const chartPoints = [];
  for (let weekOffset = weeks - 1; weekOffset >= 0; weekOffset -= 1) {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() - weekOffset * 7);
    const week = pointsByWeek.get(date.toISOString());
    chartPoints.push({
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      date,
      value: week ? week[metric] : 0,
      workouts: week ? week.workouts : [],
      showPoint: Boolean(week?.workouts.length),
    });
  }

  return { currentSessions, chartPoints };
};
