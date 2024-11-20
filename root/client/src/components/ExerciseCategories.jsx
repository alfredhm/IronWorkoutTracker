import { Box, Flex, Heading, Image, Modal, ModalBody, ModalContent, ModalFooter,ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import muscleCategories from '../resources/exercise-categories'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthUser } from 'react-auth-kit'
import ErrorModal from './ErrorModal'
import AddExerciseModal from './AddExerciseModal'

const ExerciseCategories = ({ session, workoutID, closeAndRefresh, exercises, setExercises }) => {
    const [category, setCategory] = useState('')
    const [categoryExercises, setCategoryExercises] = useState([])
    const [updated, setUpdated] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(true)

    const auth = useAuthUser()
    const uid = auth()?.uid;

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()

    // Opens modal and sets the category to the selected category
    const handleOpen = (newCategory) => {
        setCategory(newCategory)
        onOpen()
    }

    const handleAddExercise = async (exercise) => {
        try {
            // If adding exercise to a workout sessions (through session prop variable), use the workout session API
            if (session) {

                // Create new exercise in database
                const newExercise = {
                    ...exercise, 
                    isPreset: false,
                    userId: uid,
                    category: exercise.category,
                }
                delete newExercise._id
                delete newExercise.__v
                delete newExercise.isTemplate

                // If there is a workoutID, the exercise is being added to a precreated workout session, if not, the session is currently being created
                if (workoutID) {
                    const response = await axios.post(`http://localhost:5000/api/exercises`, newExercise)
                    await axios.put(`http://localhost:5000/api/workoutsessions/${workoutID}/exercises`, {
                        exerciseId: response.data._id
                    })
                    setExercises([...exercises, response.data])
                } else {
                    setExercises([...exercises, newExercise])
                }
            
            // Otherwise, use the workout API to add
            } else {

                // Create new exerciseTemplate in database
                const newExerciseTemplate = {
                    ...exercise, 
                    userId: uid,
                    category: exercise.category,
                }
                delete newExerciseTemplate._id
                delete newExerciseTemplate.__v
                delete newExerciseTemplate.isSingle
                delete newExerciseTemplate.isPreset
                delete newExerciseTemplate.sets
                delete newExerciseTemplate.isTemplate


                // If there is a workoutID, the exercise is being added to a precreated workout, if not, the workout is currently being created
                if (workoutID) {
                    const response = await axios.post(`http://localhost:5000/api/exercises`, newExerciseTemplate)
                    await axios.put(`http://localhost:5000/api/workouts/${workoutID}/exercises`, {
                        exerciseId: response.data._id
                    })
                    setExercises([...exercises, response.data])
                } else {
                    setExercises([...exercises, newExerciseTemplate])
                }
            }

            // Close everything out
            closeAndRefresh()
            setLoading(false)
        } catch (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        // Async function that grabs the exercises for each category
        const getCategoryExercises = async () => {
            try {
                // If there is no category, do nothing
                if (!category) return

                // Fetch exercises from category and set category exercises to the exercises fetched
                const userResponse = await axios.get(`http://localhost:5000/api/exercises/category/${category.toLowerCase()}/${uid}`)
                const presetResponse = await axios.get(`http://localhost:5000/api/exercises/preset/category/${category.toLowerCase()}`)
                const userExercises = userResponse.data
                const presetExercises = presetResponse.data

                // Filter out duplicate exercises
                const exercises = ([...userExercises, ...presetExercises]).filter((exercise, index, self) =>
                    index === self.findIndex((t) => (
                        t.name === exercise.name
                    ))
                )

                setCategoryExercises(exercises)
                setLoading(false)

            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }
        getCategoryExercises()
        setUpdated(false)
    },[category, updated, exercises, uid])

    return (
        <>
            {error && 
                <ErrorModal isOpen={error.length > 0} onClose={() => setError("")} errorMessage={error} />
            }
            <Box>
                {muscleCategories.map((category) => (
                    <Box key={category} >
                        <Box onClick={() => handleOpen(category)} px={2} py={1.5} borderBottom="1px solid gray" _hover={{ bg: "gray.800", cursor: "pointer" }}>
                            <Box>
                                {category}
                            </Box>
                        </Box>
                        <Modal isOpen={isOpen} onClose={onClose}>
                            <ModalOverlay />
                            <ModalContent color="white" bgColor="gray.700" borderRadius="10px">
                                <Flex p={4} w="100%" alignItems="center" justify="space-between">
                                    <Text onClick={onClose} color="blue.300">Cancel</Text>
                                    <Heading fontSize="xl">Select Exercise</Heading>
                                    <Flex justify="flex-end" w="47px">
                                        <Image onClick={onAddOpen} maxHeight="20px" src={process.env.PUBLIC_URL + '/assets/blueplus.png'} />
                                    </Flex>
                                </Flex> 
                                <ModalBody _loading={isLoading}>
                                    {categoryExercises.map((exercise) => (
                                        <Box key={exercise.name} onClick={() => handleAddExercise(exercise)}>
                                            <Box px={2} py={1.5}borderBottom="1px solid gray" _hover={{ bg: "gray.800", cursor: "pointer" }}>
                                                {exercise.name}
                                            </Box>
                                        </Box>
                                    ))}
                                    {error && (
                                        <Text color="red.300" textAlign="center">
                                            {error}
                                        </Text>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </Box>
                ))}
            </Box>
            <AddExerciseModal isOpen={isAddOpen} onClose={onAddClose} />
        </>
    )
}


export default ExerciseCategories