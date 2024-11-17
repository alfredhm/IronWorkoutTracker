import { Box, Button, Flex, Image, List, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthUser } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import EditSessionModal from './modal-body/EditSessionModal';
import formatTime from '../resources/formatTime';
import daysOfWeek from '../resources/daysOfWeek';
import getTimeOfDay from '../resources/getTimeOfDay';
import ErrorModal from './ErrorModal';

const WorkoutSessionList = ({ dashboardRefresh, startedWorkout, setStartedWorkout }) => {
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [newWorkoutId, setNewWorkoutId] = useState(null);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullStart, setPullStart] = useState(null);
    const [pullDownDistance, setPullDownDistance] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const editSessionModalRef = useRef();
    const scrollContainerRef = useRef();
    const refreshThreshold = 100;
    const minSpinnerDisplayTime = 500;
    const auth = useAuthUser();
    const uid = auth()?.uid;
    const navigate = useNavigate();

    const refreshWorkoutSessions = useCallback(async () => {
        setIsRefreshing(true);
        const startTime = Date.now();

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
            setError('Failed to refresh workouts');
            console.log(err)
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = minSpinnerDisplayTime - elapsedTime;

            // Ensure the spinner stays visible for the minimum display time
            setTimeout(() => {
                setIsRefreshing(false);
            }, Math.max(remainingTime, 0));
        }
    }, [uid]);

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
            refreshWorkoutSessions();
        }
        setPullDownDistance(0);
        setPullStart(null);
    }, [pullDownDistance, refreshWorkoutSessions]);

    const handleAddSession = async () => {
        const currentDate = new Date();
        const currTimeOfDay = getTimeOfDay(currentDate);
        try {
            const res = await axios.post(`http://localhost:5000/api/workoutsessions`, {
                userId: uid,
                name: `${currTimeOfDay} Workout`,
                durationSec: 0,
            });
            await refreshWorkoutSessions();
            setNewWorkoutId(res.data._id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleWorkoutClick = (workout) => {
        setSelectedWorkout(workout);
        onOpen();
    };

    const handleSaveAndClose = async () => {
        if (editSessionModalRef.current) {
            await editSessionModalRef.current.submitForm();
        }
        await refreshWorkoutSessions();
        setSelectedWorkout(null);
        onClose();
    };

    useEffect(() => {
        if (!uid) {
            navigate('/login');
            return;
        }
        refreshWorkoutSessions();
        console.log(workouts)
    }, [uid, navigate, dashboardRefresh, refreshWorkoutSessions]);

    useEffect(() => {
        if (newWorkoutId && workouts.length > 0) {
            const newWorkout = workouts.find((workout) => workout._id === newWorkoutId);
            if (newWorkout) {
                setSelectedWorkout(newWorkout);
                onOpen();
                setNewWorkoutId(null);
            }
        }
    }, [newWorkoutId, workouts, onOpen, setNewWorkoutId]);

    useEffect(() => {
        if (startedWorkout) {
            const workoutToSelect = workouts.find((workout) => workout._id === startedWorkout._id);
            if (workoutToSelect) {
                setSelectedWorkout(workoutToSelect);
                onOpen();
                setStartedWorkout(null);
            }
        }
    }, [startedWorkout, workouts, onOpen, setStartedWorkout]);

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
            <Flex w="100%" justifyContent="flex-end" pb={4}>
                <Button bg="blue.400" p={0} width="100%" height="40px" onClick={handleAddSession}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'} />
                </Button>
            </Flex>
            <Flex
                flexDir="column"
                gap="10px"
                overflowY="auto"
                maxH='calc(100vh - 150px)'
                ref={scrollContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {workouts.length === 0 ? (
                    <Box color="white" textAlign="center" fontSize="lg" fontWeight="600">
                        No better time to start than now!
                    </Box>
                ) : (
                    workouts.slice().reverse().map((workout) => (
                        <Box key={workout._id}>
                            <Flex 
                                onClick={() => handleWorkoutClick(workout)} 
                                flexDir="column" 
                                bg="gray.800" 
                                width="100%" 
                                minH="60px"
                                borderRadius="12px"
                                p={3} pt={2} 
                                justify="space-between" 
                                _hover={{ cursor: 'pointer', bg: 'gray.600' }}
                            >
                                <Flex w="100%" justify="space-between" gap="15px">
                                    <Flex w='70%' gap="10px">
                                        <Flex mt={1} width="50px" height="50px" flexDir="column">
                                            <Box pb={1} bg="gray.600" height="45%" borderBottom="1px solid gray" borderRadius="12px 12px 0px 0px" color="white" textAlign="center" fontSize="xs" fontWeight="500">
                                                {workout.date.day}
                                            </Box>
                                            <Box bg="blue.400" height="55%" textAlign="center" borderRadius="0px 0px 12px 12px" color="gray.100" fontSize="lg" fontWeight="600">
                                                {workout.date.date}
                                            </Box>
                                        </Flex>
                                        <Flex justify="center" flexDir="column" color="white" w="65%">
                                            <Box>{workout.name}</Box>
                                            <List minH="30px">
                                                {workout.exercises ? workout.exercises.map((exercise) => (
                                                    <ListItem color="gray.300" fontSize="xs" key={exercise._id}>
                                                        {exercise.sets.length}x {exercise.name}
                                                    </ListItem>
                                                ))
                                                :
                                                <ListItem h="50px" color="gray.300" fontSize="xs">
                                                </ListItem>
                                                }
                                            </List>
                                        </Flex>
                                    </Flex>
                                    <Flex textAlign="right" flexDir="column" w='50px' color="white">
                                        <Box fontSize="xs">{formatTime(workout.durationSec)}</Box>
                                    </Flex>
                                </Flex>

                            </Flex>
                            {selectedWorkout && selectedWorkout._id === workout._id && (
                                <Modal isOpen={isOpen} onClose={handleSaveAndClose}>
                                    <ModalOverlay />
                                    <ModalContent mx="auto" my="auto" aria-hidden="false" bgColor="gray.700">
                                        <ModalCloseButton color="white" />
                                        <ModalBody>
                                            <EditSessionModal ref={editSessionModalRef} closeSessionList={handleSaveAndClose} selectedWorkout={selectedWorkout} />
                                        </ModalBody>
                                    </ModalContent>
                                </Modal>
                            )}
                        </Box>
                    ))
                )}
            </Flex>
        </>
    );
};

export default WorkoutSessionList;
