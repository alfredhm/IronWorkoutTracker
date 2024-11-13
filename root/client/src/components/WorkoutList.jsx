import { Box, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure, Text, Button } from '@chakra-ui/react'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom';
import muscleIcons from '../resources/muscleIcons'
import getFocusCount from '../resources/getFocusCount'
import convertToMonthDay from '../resources/convertToMonthDay'
import EditWorkoutModal from './modal-body/EditWorkoutModal'

const WorkoutList = ({ setTabIndex, setStartedWorkout }) => {
    const [workouts, setWorkouts] = useState([])
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [newWorkoutId, setNewWorkoutId] = useState(null)
    const [error, setError] = useState("")
    const [refresh, setRefresh] = useState(0)
    const [loading, setLoading] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const editWorkoutModalRef = useRef()

    // Grabs the user's id
    const auth = useAuthUser()
    const uid = auth()?.uid;
    const navigate = useNavigate();

    // Fetches all the workoutsessions for the user
    const refreshWorkouts = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`http://localhost:5000/api/workouts/user/${uid}`);
            setWorkouts(response.data);
        } catch (err) {
            setWorkouts([])
            setError(err.message);
        }  finally {
            setLoading(false);
        }
    };

    // Adds a new workout session to the database
    const handleAddWorkout = async () => {
        try {
            setLoading(true)
            const res = await axios.post(`http://localhost:5000/api/workouts`, {
                userId: uid,
                name: "Unnamed Workout",
            })
            setNewWorkoutId(res.data._id)
            await refreshWorkouts()
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
        if (editWorkoutModalRef.current) {
            await editWorkoutModalRef.current.submitForm();
        }
        await refreshWorkouts()
        onClose()
        setSelectedWorkout(null)
    }

    useEffect(() => {
        // If no uid, user is not logged in and sent to login page
        if (!uid) {
            navigate('/login')
            return
        }
        refreshWorkouts()
    }, [uid, navigate]);


    // If a new workout was added, open the modal
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


    return (
        <>
            <Flex w="100%" justifyContent='flex-end' pb={4}>
                <Button p={0} width="30px" height="40px" bg="gray.800" onClick={handleAddWorkout}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'}></Image>
                </Button>
            </Flex>
            <Flex flexDir="column" gap="10px">
                {loading ? (
                    <Flex justifyContent="center" alignItems="center">
                        <Spinner size="xl" color="white" />
                    </Flex>
                ) : (
                    workouts.slice().reverse().map(workout => (
                        <Box 
                            onClick={() => handleWorkoutClick(workout)} 
                            bg="gray.800" 
                            width="100%" 
                            minH="75px" 
                            borderRadius="12px" 
                            p={3} 
                            justify="space-between" 
                            key={workout._id} 
                            _hover={{ cursor: "pointer", bg: "gray.600" }}
                        >
                            <Flex width="100%" gap="20px">
                                <Flex width="100%" gap="20px" alignItems="center" justify="space-between">
                                    <>
                                        <Flex gap="30px">
                                            <Flex pl={2} justify="center" flexDir="column" color="white" minW="40px">
                                                <Box minW="50px">{workout.name}</Box>
                                                {window.screen.width > 800 ? (
                                                    workout.notes ? (
                                                        <Box opacity="45%" fontSize="small">{workout.notes.length > 50 ? workout.notes.slice(0, 50) + '...': workout.notes}</Box>
                                                    ) : (
                                                        <Box opacity="0%" fontSize="small">{"_"}</Box>
                                                    )
                                                ) : (
                                                    <Box opacity="45%" fontSize="small">{convertToMonthDay(workout.createdAt)}</Box>
                                                )}
                                            </Flex>
                                        </Flex>
                                        <Flex alignItems="flex-end">
                                            {workout.focusGroup.slice(0, getFocusCount(workout)).map(muscle => (
                                                <Box key={muscle}>
                                                    <Image maxHeight={{ base: "35px", md: "50px" }} src={muscleIcons[muscle]} />
                                                </Box>
                                            ))}
                                        </Flex>
                                    </>
                                </Flex>
                            </Flex>
                            {selectedWorkout && selectedWorkout._id === workout._id && (
                                <Modal isOpen={isOpen} onClose={handleSaveAndClose}>
                                    <ModalOverlay />
                                    <ModalContent mx="auto" my="auto"  aria-hidden="false" bgColor="gray.700" borderRadius="10px">
                                        <ModalCloseButton color="white" />
                                        <ModalBody>
                                            <EditWorkoutModal 
                                                ref={editWorkoutModalRef}
                                                setTabIndex={setTabIndex} 
                                                setStartedWorkout={setStartedWorkout} 
                                                closeWorkoutList={handleSaveAndClose} 
                                                selectedWorkout={selectedWorkout} 
                                                refreshWorkouts={refreshWorkouts}
                                            />
                                        </ModalBody>
                                    </ModalContent>
                                </Modal>
                            )}
                        </Box>
                    ))
                )}
            </Flex>
        </>
    )
}

export default WorkoutList;
