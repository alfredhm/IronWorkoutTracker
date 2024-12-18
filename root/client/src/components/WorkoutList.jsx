import { Box, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure, Text, Button, Heading } from '@chakra-ui/react'
import axios from 'axios'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import muscleIcons from '../resources/muscleIcons'
import getFocusCount from '../resources/getFocusCount'
import convertToMonthDay from '../resources/convertToMonthDay'
import EditWorkoutModal from './modal-body/EditWorkoutModal'
import ErrorModal from './ErrorModal';

const WorkoutList = ({ setTabIndex, setStartedWorkout }) => {
    const [workouts, setWorkouts] = useState([])
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [newWorkoutId, setNewWorkoutId] = useState(null)
    const [deletedWorkoutId, setDeletedWorkoutId] = useState(null);
    const [error, setError] = useState("")
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullStart, setPullStart] = useState(null);
    const [pullDownDistance, setPullDownDistance] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const editWorkoutModalRef = useRef()
    const scrollContainerRef = useRef();
    const refreshThreshold = 100;
    const minSpinnerDisplayTime = 500;
    const navigate = useNavigate();

    const location = useLocation()
    const userState = location.state
    const uid = userState.uid

    // Fetches all the workouts for the user
    const refreshWorkouts = async () => {
        setIsRefreshing(true)
        const startTime = Date.now();
        try {
            const userWorkouts = await axios.get(`http://localhost:5000/api/workouts/user/${uid}`);
            setWorkouts(userWorkouts.data)
            
        } catch (err) {
            setError('Failed to refresh workouts');
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = minSpinnerDisplayTime - elapsedTime;

            // Ensure the spinner stays visible for the minimum display time
            setTimeout(() => {
                setIsRefreshing(false);
            }, Math.max(remainingTime, 0));
        }
    };

    const handleTouchStart = useCallback((event) => {
        if (scrollContainerRef.current.scrollTop === 0) {
            setPullStart(event.touches[0].clientY);
        }
    }, []);

    const handleTouchMove = useCallback((event) => {
        if (pullStart !== null) {
            const currentY = event.touches[0].clientY;
            const pullDistance = currentY - pullStart;
            if (pullDistance > 0) {
                setPullDownDistance(pullDistance);
            }
        }
    }, [pullStart]);

    const handleTouchEnd = useCallback(() => {
        if (pullDownDistance > refreshThreshold) {
            refreshWorkouts();
        }
        setPullDownDistance(0);
        setPullStart(null);
    }, [pullDownDistance]);

    // Adds a new workout session to the database
    const handleAddWorkout = async () => {
        try {
            const res = await axios.post(`http://localhost:5000/api/workouts`, {
                userId: uid,
                name: "Unnamed Workout",
            })
            await refreshWorkouts()
            setNewWorkoutId(res.data._id)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDeleteWorkout = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/workouts/${deletedWorkoutId}`)
            await refreshWorkouts()
            onDeleteClose();
        } catch (err) {
            setError(err.message)
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
        onClose()
        setSelectedWorkout(null)
        await refreshWorkouts()
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
            {error && <ErrorModal isOpen={error.length > 0} onClose={() => setError('')} errorMessage={error} />}
            {pullDownDistance > 0 && (
                <Flex
                    top={`-${refreshThreshold}px`}
                    w="100%"
                    justifyContent="center"
                    alignItems="center"
                    height="70px"
                    transition="transform 0.2s"
                    transform={`translateY(${Math.min(pullDownDistance, refreshThreshold)}px)`}
                    position="relative"
                >
                    {isRefreshing || pullDownDistance >= refreshThreshold ? (
                        <Spinner size="lg" color="gray.400" />
                    ) : (
                        <Box color="gray.500" fontSize="sm">Pull to refresh</Box>
                    )}
                </Flex>
            )}
            <Heading color="white">Workouts</Heading>
            <Flex w="100%" justifyContent='flex-end' pb={4}>
                <Button p={0} width="30px" height="40px" bg="gray.800" onClick={handleAddWorkout}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'}></Image>
                </Button>
            </Flex>
            <Flex 
                flexDir="column"
                gap="10px"
                overflowY="auto"
                maxH='calc(100vh - 190px)'
                width="100%"
                ref={scrollContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {workouts.slice().reverse().map((workout) => (
                        <Box 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleWorkoutClick(workout);
                            }} 
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
                                                    <Image maxHeight={{ base: "40px", sm: "40px", md: "50px" }} src={muscleIcons[muscle]} />
                                                </Box>
                                            ))}
                                        </Flex>
                                </Flex>
                            </Flex>
                            {selectedWorkout && selectedWorkout._id === workout._id && (
                                <Modal isOpen={isOpen} onClose={handleSaveAndClose}>
                                    <ModalOverlay />
                                    <ModalContent mx="auto" my="auto"  aria-hidden="false" bgColor="gray.700">
                                        <ModalCloseButton color="white" />
                                        <ModalBody>
                                            <EditWorkoutModal 
                                                ref={editWorkoutModalRef}
                                                setTabIndex={setTabIndex} 
                                                setStartedWorkout={setStartedWorkout} 
                                                closeWorkoutList={handleSaveAndClose} 
                                                selectedWorkout={selectedWorkout} 
                                                refreshWorkouts={refreshWorkouts}
                                                handleDeleteWorkout={onDeleteOpen}
                                                setDeletedWorkoutId={setDeletedWorkoutId}
                                            />
                                        </ModalBody>
                                    </ModalContent>
                                </Modal>
                            )}
                            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                                <ModalOverlay />
                                <ModalContent mx="auto" my="auto" bgColor="gray.700">
                                    <ModalBody>
                                        <Flex flexDir="column" gap={4} p={4}>
                                            <Box fontSize="lg" fontWeight="600" color="white">Are you sure you want to delete this workout?</Box>
                                            <Flex justify="space-between">
                                                <Button colorScheme="red" onClick={() => handleDeleteWorkout()}>Delete</Button>
                                                <Button onClick={onDeleteClose}>Cancel</Button>
                                            </Flex>
                                        </Flex>
                                    </ModalBody>
                                </ModalContent>
                            </Modal>
                        </Box>
                    )
                )}
            </Flex>
        </>
    )
}

export default WorkoutList;
