import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import muscleCategories from '../resources/exercise-categories'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const ExerciseCategories = () => {
    const [category, setCategory] = useState('')
    const [categoryExercises, setCategoryExercises] = useState([])
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(true)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleOpen = (newCategory) => {
        setCategory(newCategory)
        onOpen()
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
    },[category])

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
                                    <Box key={exercise.name}>
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