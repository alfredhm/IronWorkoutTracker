import { Box } from "@chakra-ui/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const formatValue = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const formatDate = (date) => new Date(date).toLocaleDateString();

const getPointDetails = (point) => {
  const workouts = point.workouts?.map(
    (workout) =>
      `${formatDate(workout.date)}${workout.name ? ` - ${workout.name}` : ""}`,
  );
  return (
    workouts?.join("\n") ||
    (point.workoutName
      ? `${formatDate(point.date)} - ${point.workoutName}`
      : point.date
        ? formatDate(point.date)
        : `Week of ${point.label}`)
  );
};

const ProgressChart = ({ points, metric }) => {
  if (points.length === 0) return null;
  const visibleLabelIndexes = new Set([
    0,
    Math.floor((points.length - 1) / 2),
    points.length - 1,
  ]);

  return (
    <Box
      w="100%"
      h="172px"
      role="img"
      aria-label={`${metric.label} progression chart`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 12, right: 14, left: 14 }}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="label"
            interval={0}
            tickFormatter={(label, index) =>
              visibleLabelIndexes.has(index) ? label : ""
            }
            tick={{ fill: "#A0AEC0", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            height={26}
          />
          <YAxis hide domain={[0, (maxValue) => Math.max(maxValue, 1)]} />
          <Area
            type="linear"
            dataKey="value"
            stroke={metric.color}
            strokeWidth={3}
            fill={`${metric.color}22`}
            isAnimationActive={false}
            activeDot={false}
            dot={(dotProps) => {
              const point = points[dotProps.index];
              if (!point?.showPoint) return null;

              const description = `${metric.label}: ${formatValue(point.value)} ${metric.unit}\n${getPointDetails(point)}`;
              return (
                <g
                  tabIndex={0}
                  role="group"
                  aria-label={description}
                  key={`${point.label}-${dotProps.index}`}
                >
                  <title>{description}</title>
                  <circle
                    cx={dotProps.cx}
                    cy={dotProps.cy}
                    r="9"
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <circle
                    cx={dotProps.cx}
                    cy={dotProps.cy}
                    r="3.5"
                    fill={metric.color}
                    stroke="#1A202C"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ProgressChart;
