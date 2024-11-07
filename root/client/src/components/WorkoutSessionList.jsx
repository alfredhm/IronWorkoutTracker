import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import axios from 'axios'
import React, { forwardRef, useEffect, useState } from 'react'
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'
import EditSessionModal from './modal-body/EditSessionModal'
import formatTime from '../resources/formatTime'
import daysOfWeek from '../resources/daysOfWeek'


const WorkoutSessionList = forwardRef(({ refresh, handleClose }, ref) => {
    const [workouts, setWorkouts] = useState([])
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { isOpen, onOpen, onClose } = useDisclosure()

    // Grabs the user's id
    const auth = useAuthUser()
    const uid = auth()?.uid
    const navigate = useNavigate()

    // Sets selected workout to the workout clicked and opens the modal
    const handleWorkoutClick = (workout) => {
        setSelectedWorkout(workout);
        onOpen();
    };

    // When the edit modal is closed, its parent component (AddWorkoutSession.jsx) is refreshed
    const handleEditClose = async () => {
        handleClose()
        onClose()
    }

    useEffect(() => {
        // If no uid, user is not logged in and sent to login page
        if (!uid) {
            navigate('/login')
            return
        }

        // Fetches all the workoutsessions for the user
        const getWorkoutSessions = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`http://localhost:5000/api/workoutsessions/user/${uid}`);
                const updatedData = response.data.map((item) => {
                    const date = new Date(item.date);
                    return {
                        ...item,
                        date: {
                            day: daysOfWeek[date.getDay()],
                            month: date.getMonth() + 1,
                            date: date.getDate(),
                            year: date.getFullYear(),
                        },
                    };
                });
                setWorkouts(updatedData);
                setLoading(false)
            } catch (err) {
                setWorkouts([])
                setError(err.message);
                setLoading(false)
            }
        };

        getWorkoutSessions();
    }, [refresh, uid, navigate]);

    return (
        <Flex flexDir="column" gap="10px" overflowY="auto" maxH="65vh">
            {loading ? (
                <Flex justifyContent="center" alignItems="center" minH="100px">
                    <Spinner size="xl" color="white" />
                </Flex>
            ) : (
                workouts.slice().reverse().map(workout => (
                    <Box key={workout._id}>
                        <Flex onClick={() => handleWorkoutClick(workout)} bg="gray.800" width="100%" minH="60px" borderRadius="12px" p={3} justify="space-between" _hover={{ cursor: "pointer", bg: "gray.600" }}>
                            <Flex gap="20px">
                                <Flex width="45px" height="45px" flexDir="column">
                                    <Box pb={1} bg="gray.700" height="45%" borderBottom="1px solid black" borderRadius="12px 12px 0px 0px" color="gray.400" textAlign="center" fontSize="xs" fontWeight="500">
                                        {workout.date.day} 
                                    </Box>
                                    <Box bg="gray.400" height="55%" textAlign="center" borderRadius="0px 0px 12px 12px" color="gray.100" fontSize="lg" fontWeight="600">
                                        {workout.date.date}
                                    </Box>
                                </Flex>
                                <Flex justify="center" flexDir="column" color="white" minW="40px">
                                    <Box>{workout.name}</Box>
                                    <Box>
                                        {window.screen.width > 800 ? (
                                            <Flex flexDir="column" opacity="45%" color="white">
                                                <Box fontSize="small">{workout.notes}</Box>
                                                <Box></Box>
                                            </Flex>
                                        ) : (<></>)}
                                    </Box>
                                </Flex>
                            </Flex>
                            <Flex flexDir="column" alignItems="flex-end" color="white">
                                <Box fontSize="xs">{formatTime(workout.durationSec)}</Box>
                                <Box></Box>
                            </Flex>
                        </Flex>
                        {selectedWorkout && selectedWorkout._id === workout._id && (
                            <Modal isOpen={isOpen} onClose={handleEditClose}>
                                <ModalOverlay />
                                <ModalContent aria-hidden="false" bgColor="gray.700" borderRadius="10px">
                                    <ModalCloseButton color="white" />
                                    <ModalBody>
                                        <EditSessionModal ref={ref} handleClose={handleEditClose} data={selectedWorkout} />
                                    </ModalBody>
                                </ModalContent>
                            </Modal>
                        )}
                    </Box>
                ))
            )}
        </Flex>
    )
})

export default WorkoutSessionList