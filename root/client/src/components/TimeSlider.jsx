import React, { useState } from 'react';
import { ChakraProvider, extendTheme, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box, Text, VStack, Tooltip, SliderMark } from '@chakra-ui/react';

// Extend the Chakra UI theme to use the dark mode
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

const TimeSlider = ({ onTimeChange }) => {
  // State for the total time in 5-minute intervals
  const [intervals, setIntervals] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate total seconds (each interval represents 5 minutes)
  const totalSeconds = intervals * 300;

  // Format the total seconds into "1h 25m" format
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    // Build the formatted string
    const hoursPart = hrs > 0 ? `${hrs}h ` : '';
    const minutesPart = mins > 0 ? `${mins}m` : '';
    
    return `${hoursPart}${minutesPart}`.trim();
  };

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }

  return (
    <ChakraProvider theme={theme}>
      <Box p={6} minW="300px" maxW="500px" mx="auto" textAlign="center" bg="gray.700" borderRadius="md" boxShadow="md">
          <Text mb={4} fontSize="md" fontWeight="bold" color="white">
            Workout Duration
          </Text>
        <VStack align="stretch">
          <Box>
            <Slider
              aria-label="time-slider"
              defaultValue={0}
              min={0}
              max={48} // Maximum 36 intervals (3 hours)
              step={1} // Each step is a 5-minute interval
              value={intervals}
              onChange={(value) => {
                setIntervals(value)
                const calculatedTime = value * 300
                onTimeChange(calculatedTime)
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <SliderMark value={12} {...labelStyles}>
                1h
              </SliderMark>
              <SliderMark value={24} {...labelStyles}>
                2h
              </SliderMark>
              <SliderMark value={36} {...labelStyles}>
                3h
              </SliderMark>
              <SliderTrack bg="gray.600">
                <SliderFilledTrack bg="blue.300" />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg="gray.400"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={formatTime(totalSeconds)}
              >
                <SliderThumb boxSize={6} />
              </Tooltip>
            </Slider>
          </Box>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default TimeSlider;