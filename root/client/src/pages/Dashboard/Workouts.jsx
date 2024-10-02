import React from 'react'
import { Flex, Heading } from '@chakra-ui/react'
import AddWorkout from '../../components/AddWorkout'

const Workouts = () => {
    return (
        <>
            <Flex flexDir='column' width="100%" height="inherit">
              <Heading color="white">Workouts</Heading>
                <AddWorkout />
            </Flex>
        </>
      )
}

export default Workouts