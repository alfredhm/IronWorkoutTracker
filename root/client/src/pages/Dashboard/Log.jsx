import { Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import WorkoutSessionList from '../../components/WorkoutSessionList'

const Log = ({ parentRefresh, startedWorkout, setStartedWorkout }) => {
  return (
    <>
        <Flex flexDir='column' width="100%" height="inherit">
          <Heading color="white">Log</Heading>
            <WorkoutSessionList parentRefresh={parentRefresh} startedWorkout={startedWorkout} setStartedWorkout={setStartedWorkout}/>
        </Flex>
    </>
  )
}

export default Log