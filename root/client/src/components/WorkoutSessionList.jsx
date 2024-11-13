import { Box, Button, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'
import EditSessionModal from './modal-body/EditSessionModal'
import formatTime from '../resources/formatTime'
import daysOfWeek from '../resources/daysOfWeek'
import getTimeOfDay from '../resources/getTimeOfDay'


const WorkoutSessionList = ({ dashboardRefresh, startedWorkout, setStartedWorkout}) => {
    const [workouts, setWorkouts] = useState([])
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [newWorkoutId, setNewWorkoutId] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const editSessionModalRef = useRef()

    // Grabs the user's id
    const auth = useAuthUser()
    const uid = auth()?.uid
    const navigate = useNavigate()

    // Fetches all the workoutsessions for the user
    const refreshWorkoutSessions = async () => {
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
        } catch (err) {
            setWorkouts([])
            setError(err.message);
        }  finally {
            setLoading(false);
        }

    };

    // Adds a new workout session to the database
    const handleAddSession = async () => {
        setLoading(true)
        const currentDate = new Date()
        const currTimeOfDay = getTimeOfDay(currentDate)
        try {
            const res = await axios.post(`http://localhost:5000/api/workoutsessions`, {
                userId: uid,
                name: `${currTimeOfDay} Workout`,
                durationSec: 0,
            })
            await refreshWorkoutSessions()
            setNewWorkoutId(res.data._id)
        } catch (err) {
            console.error("Error during modal close:", err);
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Sets selected workout to the workout clicked and opens the modal
    const handleWorkoutClick = (workout) => {
        setSelectedWorkout(workout);
        onOpen();
    };

    // Save and close the modal
    const handleSaveAndClose = async () => {
        if (editSessionModalRef.current) {
            await editSessionModalRef.current.submitForm();
        }
        await refreshWorkoutSessions()
        onClose()
        setSelectedWorkout(null)
    }

    useEffect(() => {
        // If no uid, user is not logged in and sent to login page
        if (!uid) {
            navigate('/login')
            return
        }
        refreshWorkoutSessions()
    }, [uid, navigate, dashboardRefresh]);

    useEffect(() => {
        if (newWorkoutId && workouts.length > 0) {
            const newWorkout = workouts.find((workout) => workout._id === newWorkoutId);
            if (newWorkout) {
                setSelectedWorkout(newWorkout);
                onOpen();
                setNewWorkoutId(null);
            }
        }
    }, [newWorkoutId, workouts]);

    // Open the modal automatically for the started workout
    useEffect(() => {
        if (startedWorkout) {
            const workoutToSelect = workouts.find(workout => workout._id === startedWorkout._id);
            if (workoutToSelect) {
                setSelectedWorkout(workoutToSelect);
                onOpen();
                setStartedWorkout(null); // Reset startedWorkout after opening the modal
            }
        }
    }, [startedWorkout, workouts]);

    return (
        <>
            <Flex w="100%" justifyContent='flex-end' pb={4}>
                <Button p={0} width="30px" height="40px" bg="gray.800" onClick={handleAddSession}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'}></Image>
                </Button>
            </Flex>
            <Flex flexDir="column" gap="10px" overflowY="auto" maxH="65vh">
                {loading ? (
                    <Flex justifyContent="center" alignItems="center" minH="100px">
                        <Spinner size="xl" color="white" />
                    </Flex>
                ) : (
                    workouts.length === 0 ? (
                        <>
                            <Box color="white" textAlign="center" fontSize="lg" fontWeight="600">No better time to start than now!</Box>
                        </>
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
                                            {window.screen.width > 800 && (
                                                <Flex flexDir="column" opacity="45%" color="white">
                                                    <Box fontSize="small">{workout.notes.length > 50 ? workout.notes.slice(0, 50) + '...' : workout.notes}</Box>
                                                    <Box></Box>
                                                </Flex>
                                            )}
                                        </Box>
                                    </Flex>
                                </Flex>
                                <Flex flexDir="column" alignItems="flex-end" color="white">
                                    <Box fontSize="xs">{formatTime(workout.durationSec)}</Box>
                                    <Box></Box>
                                </Flex>
                            </Flex>
                            {selectedWorkout && selectedWorkout._id === workout._id && (
                                <Modal isOpen={isOpen} onClose={handleSaveAndClose}>
                                    <ModalOverlay />
                                    <ModalContent mx="auto" my="auto" aria-hidden="false" bgColor="gray.700" borderRadius="10px">
                                        <ModalCloseButton color="white" />
                                        <ModalBody>
                                            <EditSessionModal 
                                                ref={editSessionModalRef}
                                                closeSessionList={handleSaveAndClose} 
                                                selectedWorkout={selectedWorkout} 
                                            />
                                        </ModalBody>
                                    </ModalContent>
                                </Modal>
                            )}
                        </Box>
                    )))
                )}
            </Flex>
        </>
    )
}

export default WorkoutSessionList