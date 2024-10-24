import { HamburgerIcon } from "@chakra-ui/icons"
import { Box, Flex, List, ListItem, Text } from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"

const ExerciseList = ({ workoutID, session }) => {
    const apiParam = session ? 'workoutsessions' : 'workouts'

    const [exercises, setExercises] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        const getExercises = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/${apiParam}/${workoutID}`)
                const currExerciseIDs = response.data.exercises
                let currExercises = []
                for (let i = 0; i < currExerciseIDs.length; i++) {
                    const res = await axios.get(`http://localhost:5000/api/exercises/${currExerciseIDs[i]}`)
                    currExercises.push(res.data)
                }
                setExercises(currExercises)
                console.log(exercises)

            } catch (err) {
                setError(err.message)
            }
        }
        getExercises()
    }, [])

    return (
        <>
            {exercises.map((exercise) => (
                <List w="100%" border="1px solid white" borderRadius={3} bg="gray.600">
                    <ListItem key={exercise._id}>
                        <Flex flexDir="column">
                            <Flex p={2} w="100%" alignItems="center" justifyContent="space-between" borderBottom="1px solid white">
                                <Text fontSize='small' fontWeight="650">{exercise.name}</Text>
                                <HamburgerIcon />
                            </Flex>
                            {exercise.sets.length === 0 ? (
                                <Flex>
                                    
                                </Flex>

                            ) : (
                                <>
                                    {exercise.sets.map((set) => (
                                        <List>
                                            <ListItem key={set._id}></ListItem>
                                        </List>
                                    ))}
                                </>
                            )} 

                        </Flex>
                    </ListItem>
                </List>
            ))}
        </>
    )
}

export default ExerciseList