import React, { useEffect, useState } from 'react';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box, Text, VStack, Tooltip, SliderMark } from '@chakra-ui/react';
import formatTime from '../resources/formatTime';

const TimeSlider = ({ initial, onTimeChange }) => {
  // State for the total time in 5-minute intervals
  const [intervals, setIntervals] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate total seconds (each interval represents 5 minutes)
  const totalSeconds = intervals * 300;

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }

  useEffect(() => {
    setIntervals(initial / 300);
  }, [initial]);

  return (
      <Box width="100%" mx="auto" textAlign="center">
        <VStack align="stretch" border="1px solid white" bg="gray.600" borderRadius="lg" boxShadow="xl" p={6}>
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
              <SliderTrack bg="gray.400">
                <SliderFilledTrack bg="blue.300" />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg="gray.500"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={formatTime(totalSeconds)}
              >
                <SliderThumb boxSize={4} />
              </Tooltip>
            </Slider>
          </Box>
        </VStack>
      </Box>
  );
};

export default TimeSlider;