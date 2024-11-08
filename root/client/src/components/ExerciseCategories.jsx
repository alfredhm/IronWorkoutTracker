import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import muscleCategories from '../resources/exercise-categories'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthUser } from 'react-auth-kit'

const ExerciseCategories = ({ session, workoutID, onChildClose, exercises, setExercises }) => {
    const [category, setCategory] = useState('')
    const [categoryExercises, setCategoryExercises] = useState([])
    const [updated, setUpdated] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(true)

    const auth = useAuthUser()
    const uid = auth()?.uid;

    const { isOpen, onOpen, onClose } = useDisclosure()

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
                    userId: uid
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
                } else {
                    console.log(exercises, newExercise)
                    setExercises([...exercises, newExercise])
                }
            
            // Otherwise, use the workout API to add
            } else {

                // Create new exerciseTemplate in database
                const newExerciseTemplate = {
                    ...exercise, 
                    userId: uid
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
                } else {
                    setExercises([...exercises, newExerciseTemplate])
                }
            }

            // Close everything out
            onChildClose()
            setLoading(false)
        } catch (error) {
            console.log(error)
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
                const response = await axios.get(`http://localhost:5000/api/exercises/category/${category.toLowerCase()}`)
                const exercises = response.data
                setCategoryExercises(exercises)
                setLoading(false)

            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }
        getCategoryExercises()
        setUpdated(false)
        console.log(exercises)
    },[category, updated, exercises])

    return (
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
                        <ModalContent color="white" border="1px solid white" bgColor="gray.700" borderRadius="10px">
                            <ModalHeader>Select Exercise</ModalHeader>
                            <ModalCloseButton />
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
    )
}


export default ExerciseCategories