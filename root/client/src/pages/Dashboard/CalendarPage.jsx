import { Box, Flex } from '@chakra-ui/react'
import React from 'react'
import Calendar from '../../components/Calendar'

const CalendarPage = () => {
  return (
    <>
        <Box width="100%">
            <Flex justify="center" p={4}>
                <Calendar />
            </Flex>
        </Box>
    </>
  )
}

export default CalendarPage