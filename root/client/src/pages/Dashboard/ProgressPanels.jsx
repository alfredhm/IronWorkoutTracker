import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import ProgressChart from "./ProgressChart";
import BodyWeightDatePicker from "./BodyWeightDatePicker";

const RANK_COLORS = ["yellow.400", "gray.300", "orange.500"];

const formatValue = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

// Parent owns lift selection; this panel only renders the selector, trend, and ranking.
export const PersonalRecords = ({
  bestLifts,
  selectedLift,
  onSelectLift,
}) => (
  <Box bg="gray.800" borderRadius="xl" p={4}>
    <Text fontWeight="semibold">Personal records</Text>
    <Text color="gray.400" fontSize="xs" mt={1}>
      Your best recorded working set for each weighted exercise. Top five are
      ranked by weight.
    </Text>
    {bestLifts.length > 0 ? (
      <>
        <Select
          mt={3}
          value={selectedLift?.name || ""}
          onChange={(event) => onSelectLift(event.target.value)}
          bg="gray.700"
          borderColor="gray.600"
          sx={{ option: { color: "white", bg: "gray.700" } }}
          aria-label="Select an exercise to view its record trend"
        >
          {bestLifts.map((lift) => (
            <option key={lift.name} value={lift.name}>
              {lift.name}
            </option>
          ))}
        </Select>
        {selectedLift && (
          <>
            <Flex
              justify="space-between"
              align="center"
              bg="gray.700"
              borderRadius="lg"
              p={3}
              mt={3}
            >
              <Text fontSize="sm">{selectedLift.name} best set</Text>
              <Text fontWeight="bold">
                {formatValue(selectedLift.bestWeight)} lb ×{" "}
                {formatValue(selectedLift.bestReps)} reps
              </Text>
            </Flex>
            <Text color="gray.400" fontSize="xs" mt={4} mb={1}>
              Heaviest set logged in each workout
            </Text>
            <ProgressChart
              points={selectedLift.points}
              metric={{
                label: "Heaviest set",
                unit: "lb",
                color: "#9F7AEA",
              }}
            />
          </>
        )}
        <Flex direction="column" gap={2} mt={3}>
          {bestLifts.slice(0, 5).map((lift, index) => (
            <Button
              key={lift.name}
              variant="ghost"
              justifyContent="flex-start"
              whiteSpace="normal"
              h="auto"
              py={2}
              px={2}
              w="100%"
              color={lift.name === selectedLift?.name ? "blue.200" : "white"}
              onClick={() => onSelectLift(lift.name)}
            >
              <Flex w="100%" align="center" gap={3}>
                <Flex
                  flexShrink={0}
                  w={7}
                  h={7}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg={RANK_COLORS[index] || "gray.600"}
                  color={index < RANK_COLORS.length ? "gray.900" : "white"}
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {index + 1}
                </Flex>
                <Text flex="1" textAlign="left">
                  {lift.name}
                </Text>
                <Text flexShrink={0}>
                  {formatValue(lift.bestWeight)} lb × {formatValue(lift.bestReps)}
                </Text>
              </Flex>
            </Button>
          ))}
        </Flex>
      </>
    ) : (
      <Text color="gray.400" fontSize="sm" mt={3}>
        Record weighted sets to see your exercise-by-exercise bests and trends.
      </Text>
    )}
  </Box>
);

// Period selection is controlled by Progress so the headline and breakdown stay in sync.
export const MuscleGroupBreakdown = ({
  musclePeriod,
  periods,
  periodNames,
  sets,
  maxSets,
  onPeriodChange,
}) => (
  <Box bg="gray.800" borderRadius="xl" p={4}>
    <Text fontWeight="semibold">Muscle-group breakdown</Text>
    <Text color="gray.400" fontSize="xs" mt={1}>
      Completed sets by target muscle for the {periodNames[musclePeriod]}.
      Compound sets count for each listed muscle.
    </Text>
    <Flex gap={2} mt={3} role="group" aria-label="Muscle breakdown period">
      {periods.map((period) => (
        <Button
          key={period.key}
          size="sm"
          flex="1"
          aria-pressed={musclePeriod === period.key}
          color={musclePeriod === period.key ? "white" : "gray.400"}
          bg={musclePeriod === period.key ? "blue.500" : "gray.700"}
          _hover={{
            bg: musclePeriod === period.key ? "blue.400" : "gray.600",
          }}
          onClick={() => onPeriodChange(period.key)}
        >
          {period.label}
        </Button>
      ))}
    </Flex>
    {sets.length > 0 ? (
      <Flex direction="column" gap={3} mt={4}>
        {sets.map(([muscle, count]) => (
          <Box key={muscle}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm">{muscle}</Text>
              <Text color="gray.400" fontSize="xs">
                {formatValue(count)} {count === 1 ? "set" : "sets"}
              </Text>
            </Flex>
            <Box h="6px" borderRadius="full" bg="gray.700">
              <Box
                h="100%"
                borderRadius="full"
                bg="blue.300"
                width={`${Math.max(2, (count / maxSets) * 100)}%`}
              />
            </Box>
          </Box>
        ))}
      </Flex>
    ) : (
      <Text color="gray.400" fontSize="sm" mt={3}>
        Add categorized exercises with completed sets to see your volume
        distribution.
      </Text>
    )}
  </Box>
);

// Form values and API actions stay in Progress; this component renders the weight UI.
export const BodyWeightSection = ({
  measurements,
  bodyWeightPoints,
  measurementValue,
  measurementDate,
  measurementError,
  measurementSaving,
  deletingMeasurementId,
  maxDate,
  onAdd,
  onValueChange,
  onDateChange,
  onDelete,
}) => (
  <Box bg="gray.800" borderRadius="xl" p={4}>
    <Text fontWeight="semibold">Body weight</Text>
    <Text color="gray.400" fontSize="xs" mt={1}>
      Log weight in pounds. BMI uses your latest entry and height from Account.
    </Text>
    <Box as="form" onSubmit={onAdd} mt={3}>
      <Flex align="center" gap={2}>
        <Input
          type="number"
          min="0.1"
          max="1000"
          step="0.1"
          required
          value={measurementValue}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Weight"
          aria-label="Body weight in pounds"
        />
        <Text color="gray.400">lb</Text>
      </Flex>
      <Flex direction={{ base: "column", sm: "row" }} gap={2} mt={2}>
        <BodyWeightDatePicker
          value={measurementDate}
          maxDate={maxDate}
          onChange={onDateChange}
        />
        <Button type="submit" colorScheme="blue" isLoading={measurementSaving}>
          Save
        </Button>
      </Flex>
    </Box>
    {measurementError && (
      <Text color="red.300" fontSize="sm" mt={2}>
        {measurementError}
      </Text>
    )}
    {bodyWeightPoints.length > 0 && (
      <Box mt={4}>
        <Text color="gray.300" fontSize="sm" mb={1}>
          Body-weight trend
        </Text>
        <ProgressChart
          points={bodyWeightPoints}
          metric={{
            label: "Body weight",
            unit: "lb",
            color: "#F687B3",
          }}
        />
      </Box>
    )}
    <Text color="gray.300" fontSize="sm" mt={4} mb={2}>
      Recent entries
    </Text>
    {measurements.length > 0 ? (
      <Flex direction="column" gap={2}>
        {measurements.slice(0, 5).map((measurement) => (
          <Flex
            key={measurement._id}
            align="center"
            justify="space-between"
            bg="gray.700"
            borderRadius="lg"
            px={3}
            py={2}
          >
            <Box>
              <Text fontSize="sm">Body weight: {measurement.value} lb</Text>
              <Text color="gray.400" fontSize="xs">
                {new Date(measurement.date).toLocaleDateString()}
              </Text>
            </Box>
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              color="gray.400"
              aria-label="Delete body weight entry"
              isLoading={deletingMeasurementId === measurement._id}
              onClick={() => onDelete(measurement._id)}
            />
          </Flex>
        ))}
      </Flex>
    ) : (
      <Text color="gray.500" fontSize="sm">
        Your saved measurements will appear here.
      </Text>
    )}
  </Box>
);
