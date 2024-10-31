import React, { useState } from 'react';
import { Box, SimpleGrid, Text, Button, Grid, Image } from '@chakra-ui/react';
import dayjs from 'dayjs';
import generateCalendarDays from '../resources/generateCalendarDays';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(null);
    
    const calendarDays = generateCalendarDays(currentDate);

    // Handler for selecting a date
    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    // Handlers for navigating months
    const handlePreviousMonth = () => {
        setCurrentDate(currentDate.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setCurrentDate(currentDate.add(1, 'month'));
    };

    return (
        <Box p={5} maxWidth="400px" mx="auto" bgColor="gray.600" borderRadius="15px">
            <Box display="flex" justifyContent="space-between" mb={4}>
                <Button bgColor="gray.700" onClick={handlePreviousMonth}>
                    <Image maxHeight="20px" src={process.env.PUBLIC_URL + '/assets/leftArrow.png'}></Image>
                </Button>
                <Text color="white" fontSize="xl" fontWeight="bold">
                    {currentDate.format('MMMM YYYY')}
                </Text>
                <Button bgColor="gray.700" onClick={handleNextMonth}>
                    <Image maxHeight="20px" src={process.env.PUBLIC_URL + '/assets/rightArrow.png'}></Image>
                </Button>
            </Box>
            <SimpleGrid columns={7} spacing={1} textAlign="center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} fontWeight="bold" color="white" marginBottom="5px">
                        {day}
                    </Text>
                ))}
            </SimpleGrid>
            <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                {calendarDays.map((day) => {
                    const isCurrentMonth = day.month() === currentDate.month();
                    const isSelected = selectedDate && day.isSame(selectedDate, 'day');

                    return (
                        <Box
                            key={day.toString()}
                            minWidth="40px"
                            minHeight="40px"
                            paddingLeft="3px"
                            paddingTop="3px"
                            bg={isSelected ? 'gray.800' : 'gray.100'}
                            color={isCurrentMonth ? 'gray.300' : 'gray.700'}
                            borderRadius="md"
                            cursor="pointer"
                            fontSize="x-small"
                            fontWeight="bolder"
                            bgColor="gray.500"
                            onClick={() => handleDateClick(day)}
                            _hover={{ bg: 'gray.700' }}
                        >
                            {day.date()}
                            <Box height="80%"></Box>
                        </Box>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default Calendar;