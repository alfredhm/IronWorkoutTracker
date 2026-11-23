import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  calculateBMI,
  getBestLifts,
  getMuscleGroupSetCounts,
  getSessionsForPeriod,
  numberValue,
  summarizeSessions,
} from "../../resources/progressData";
import {
  fetchProgressData,
  getProgressErrorMessage,
} from "../../resources/progressApi";
import useBodyWeightMeasurements from "./hooks/useBodyWeightMeasurements";
import {
  BodyWeightSection,
  MuscleGroupBreakdown,
  PersonalRecords,
} from "./ProgressPanels";

// Dashboard view for workout summaries, personal records, muscle volume, and measurements.
const RANGE_OPTIONS = [
  { label: "4 weeks", weeks: 4 },
  { label: "12 weeks", weeks: 12 },
  { label: "1 year", weeks: 52 },
];

const MUSCLE_PERIODS = [
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
  { key: "year", label: "Yearly" },
];

const MUSCLE_PERIOD_NAMES = {
  week: "current week",
  month: "current month",
  year: "current year",
};

const formatValue = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const Progress = ({ dashboardRefresh }) => {
  const { state } = useLocation();
  const uid = state?.uid;
  const bodyWeight = useBodyWeightMeasurements();

  // Keep selection, API data, and body-weight form state local to this tab.
  const [range, setRange] = useState(12);
  const [sessions, setSessions] = useState([]);
  const [heightInches, setHeightInches] = useState(null);
  const [musclePeriod, setMusclePeriod] = useState("week");
  const [selectedLiftName, setSelectedLiftName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    deletingMeasurementId,
    handleAddMeasurement,
    handleDeleteMeasurement,
    loadMeasurements,
    maxDate,
    measurementDate,
    measurementError,
    measurementSaving,
    measurementValue,
    measurements,
    setMeasurementDate,
    setMeasurementValue,
  } = bodyWeight;

  // Load the data sources together so the dashboard is either current or shows an error.
  const loadProgress = useCallback(async () => {
    if (!uid) {
      setSessions([]);
      setError("User details are missing. Please sign in again to view progress.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const progressData = await fetchProgressData(uid);
      setSessions(progressData.sessions);
      loadMeasurements(progressData.measurements);
      setHeightInches(progressData.heightInches ?? null);
    } catch (requestError) {
      setError(
        getProgressErrorMessage(
          requestError,
          "Unable to load workout progress.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [loadMeasurements, uid]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress, dashboardRefresh]);

  // Ignore empty session records when calculating progress and personal records.
  const completedSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.sets.length > 0 || session.durationSec > 0,
      ),
    [sessions],
  );
  const bestLifts = useMemo(
    () => getBestLifts(completedSessions),
    [completedSessions],
  );
  const selectedLift =
    bestLifts.find((lift) => lift.name === selectedLiftName) || bestLifts[0];
  const currentSessions = getSessionsForPeriod(completedSessions, range);
  const musclePeriodSessions = getSessionsForPeriod(
    completedSessions,
    musclePeriod,
  );
  const muscleGroupSets = getMuscleGroupSetCounts(musclePeriodSessions);
  // The headline uses an all-time count; the breakdown below follows its period selector.
  const allTimeMuscleGroupSets = getMuscleGroupSetCounts(completedSessions);
  const mostTrainedMuscle = allTimeMuscleGroupSets.find(
    ([muscle]) => muscle !== "Uncategorized",
  );
  const maxMuscleSets = Math.max(
    1,
    ...muscleGroupSets.map(([, sets]) => sets),
  );
  // Measurements are stored newest-first when loaded and remain sorted after additions.
  const latestBodyWeight = measurements[0];
  const bmi = calculateBMI(latestBodyWeight?.value, heightInches);
  const bodyWeightPoints = measurements
    .slice()
    .reverse()
    .slice(-12)
    .map((measurement) => ({
      label: new Date(measurement.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      date: measurement.date,
      value: numberValue(measurement.value),
      showPoint: true,
    }));

  const summary = summarizeSessions(currentSessions);

  const hasNoWorkoutData =
    !loading && !error && completedSessions.length === 0;

  // These values share the selected workout range, except BMI and the all-time muscle card.
  const metricCards = [
    {
      label: "Volume lifted",
      value: formatValue(summary.volume),
      unit: "lb",
      key: "volume",
    },
    {
      label: "Sets completed",
      value: formatValue(summary.sets),
      unit: "sets",
      key: "sets",
    },
    {
      label: "Reps completed",
      value: formatValue(summary.reps),
      unit: "reps",
      key: "reps",
    },
    {
      label: "BMI",
      value: bmi === null ? "—" : bmi.toFixed(1),
      unit: "",
      key: "bmi",
      hint:
        bmi === null
          ? "Add height and weight to calculate"
          : "Based on latest weight",
    },
    {
      label: "Most-trained muscle",
      value: mostTrainedMuscle?.[0] || "—",
      unit: mostTrainedMuscle
        ? `${formatValue(mostTrainedMuscle[1])} sets · all-time`
        : "",
      key: "muscle",
    },
  ];

  return (
    <Flex
      direction="column"
      gap={4}
      color="white"
      w="100%"
      h="calc(100dvh - 88px)"
      overflowY="auto"
      pb={6}
      sx={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* Keep the current-data/sample status visible without conflating the two. */}
      <Flex justify="space-between" align="center" gap={3}>
        <Box>
          <Heading size="lg">Progress</Heading>
          <Text color="gray.400" fontSize="sm" mt={1}>
            Your training summary and measurements.
          </Text>
        </Box>
        <Box
          px={2}
          py={1}
          borderRadius="full"
          bg={hasNoWorkoutData ? "purple.900" : "green.900"}
          color={hasNoWorkoutData ? "purple.200" : "green.200"}
          fontSize="xs"
          fontWeight="bold"
          whiteSpace="nowrap"
        >
          {loading ? "LOADING" : hasNoWorkoutData ? "NO WORKOUTS" : "YOUR DATA"}
        </Box>
      </Flex>

      {error && (
        <Alert status="error" borderRadius="lg" bg="red.900" color="white">
          <AlertIcon />
          <Box flex="1">{error}</Box>
          <Button size="sm" ml={2} onClick={loadProgress}>
            Retry
          </Button>
        </Alert>
      )}

      {/* The selected range drives the workout summary. */}
      <Flex gap={2} flexWrap="wrap" pb={1} role="group" aria-label="Progress date range">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.weeks}
            size="sm"
            flexShrink={0}
            minH="40px"
            aria-pressed={range === option.weeks}
            color={range === option.weeks ? "white" : "gray.400"}
            bg={range === option.weeks ? "blue.500" : "gray.800"}
            _hover={{ bg: range === option.weeks ? "blue.400" : "gray.700" }}
            onClick={() => setRange(option.weeks)}
          >
            {option.label}
          </Button>
        ))}
      </Flex>

      {/* BMI and most-trained muscle are independent of the selected date range. */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        gap={3}
      >
        {metricCards.map((card) => (
          <Box key={card.key} bg="gray.800" borderRadius="xl" p={4}>
            <Text fontSize="xs" color="gray.400">
              {card.label}
            </Text>
            <Flex align="baseline" gap={1} mt={2}>
              <Text fontSize="2xl" fontWeight="bold">
                {loading ? "—" : card.value}
              </Text>
              {card.unit && (
                <Text color="gray.400" fontSize="xs">
                  {card.unit}
                </Text>
              )}
            </Flex>
            {card.hint && (
              <Text color="gray.500" fontSize="xs" mt={1}>
                {card.hint}
              </Text>
            )}
          </Box>
        ))}
      </Box>

      {/* Record ranking is based on raw best-set weight; this is not cross-exercise normalization. */}
      <PersonalRecords
        bestLifts={bestLifts}
        selectedLift={selectedLift}
        onSelectLift={setSelectedLiftName}
      />

      {/* Set counts are recalculated for the selected calendar period. */}
      <MuscleGroupBreakdown
        musclePeriod={musclePeriod}
        periods={MUSCLE_PERIODS}
        periodNames={MUSCLE_PERIOD_NAMES}
        sets={muscleGroupSets}
        maxSets={maxMuscleSets}
        onPeriodChange={setMusclePeriod}
      />

      {/* Measurement form state stays here while the panel handles its presentation. */}
      <BodyWeightSection
        measurements={measurements}
        bodyWeightPoints={bodyWeightPoints}
        measurementValue={measurementValue}
        measurementDate={measurementDate}
        measurementError={measurementError}
        measurementSaving={measurementSaving}
        deletingMeasurementId={deletingMeasurementId}
        maxDate={maxDate}
        onAdd={handleAddMeasurement}
        onValueChange={setMeasurementValue}
        onDateChange={setMeasurementDate}
        onDelete={handleDeleteMeasurement}
      />

    </Flex>
  );
};

export default Progress;
