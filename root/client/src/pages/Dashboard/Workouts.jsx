import React from 'react'
import { Flex, Heading } from '@chakra-ui/react'
import AddWorkout from '../../components/AddWorkout'

const Workouts = ({ setTabIndex, setStartedWorkout }) => {
    return (
        <>
            <Flex flexDir='column' width="100%" height="inherit">
              <Heading color="white">Workouts</Heading>
                <AddWorkout setTabIndex={setTabIndex} setStartedWorkout={setStartedWorkout}/>
            </Flex>
        </>
      )
}

export default Workouts