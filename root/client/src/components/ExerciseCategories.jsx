import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import muscleCategories from '../resources/exercise-categories'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthUser } from 'react-auth-kit'

const ExerciseCategories = ({ session, workoutID, onChildClose }) => {
    const [category, setCategory] = useState('')
    const [categoryExercises, setCategoryExercises] = useState([])
    const [updated, setUpdated] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(true)

    const auth = useAuthUser()
    const uid = auth()?.uid;

    const { isOpen, onOpen } = useDisclosure()

    const handleOpen = (newCategory) => {
        setCategory(newCategory)
        onOpen()
    }

    const handleAddExercise = async (exercise) => {
        try {
            // Create new exercise in database
            const newExercise = {
                ...exercise, 
                userId: uid
            }
            delete newExercise._id
            delete newExercise.__v
            const response = await axios.post(`http://localhost:5000/api/exercises`, newExercise)

            // If adding exercise to a workout sessions (through session prop variable), use the workout session API
            if (session) {
                console.log(session)

                // If there is a workoutID, the exercise is being added to a precreated workout session, if not, the session is currently being created
                if (workoutID) {
                    console.log(workoutID)
                    console.log('Edit')
                    await axios.put(`http://localhost:5000/api/workoutsessions/${workoutID}/exercises`, {
                        exerciseId: response.data._id
                    })
                } else {
                    console.log('Add')
                }
            
            // Otherwise, use the workout API to add
            } else {
                // If there is a workoutID, the exercise is being added to a precreated workout session, if not, the session is currently being created
                if (workoutID) {
                    console.log(workoutID)
                    console.log('Edit')
                    await axios.put(`http://localhost:5000/api/workoutsessions/${workoutID}/exercises`, {
                        exerciseId: response.data._id
                    })
                } else {
                    console.log('Add')
                }
            }
            setUpdated(true)
            setLoading(false)
        } catch (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        const getCategoryExercises = async () => {
            try {
                if (!category) return
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
    },[category, updated])

    return (
        <Box>
            {muscleCategories.map((category) => (
                <Box key={category} >
                    <Box onClick={() => handleOpen(category)} px={2} py={1.5} borderBottom="1px solid gray" _hover={{ bg: "gray.800", cursor: "pointer" }}>
                        <Box>
                            {category}
                        </Box>
                    </Box>
                    <Modal isOpen={isOpen} onClose={onChildClose}>
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