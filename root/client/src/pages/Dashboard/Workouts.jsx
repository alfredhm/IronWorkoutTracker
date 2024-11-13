import React from 'react'
import { Flex, Heading } from '@chakra-ui/react'
import WorkoutList from '../../components/WorkoutList'

const Workouts = ({ setTabIndex, setStartedWorkout }) => {
    return (
        <>
            <Flex flexDir='column' width="100%" height="inherit">
              <Heading color="white">Workouts</Heading>
                <WorkoutList setStartedWorkout={setStartedWorkout} setTabIndex={setTabIndex} />
            </Flex>
        </>
      )
}

export default Workouts