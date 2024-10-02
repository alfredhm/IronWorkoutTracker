import { Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import AddWorkoutSession from '../../components/AddWorkoutSession'

const Log = () => {
  return (
    <>
        <Flex flexDir='column' width="100%" height="inherit">
          <Heading color="white">Log</Heading>
            <AddWorkoutSession />
        </Flex>
    </>
  )
}

export default Log