import { Box, Button, Flex, Image, List, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditSessionModal from './modal-body/EditSessionModal';
import formatTime from '../resources/formatTime';
import daysOfWeek from '../resources/daysOfWeek';
import getTimeOfDay from '../resources/getTimeOfDay';
import ErrorModal from './ErrorModal';
import { DeleteIcon } from '@chakra-ui/icons';
import axiosInstance from '../resources/axiosInstance';
import useWorkoutSessions from '../hooks/workoutSession/useWorkoutSessions';
import useCreateWorkoutSession from '../hooks/workoutSession/useCreateWorkoutSession';
import useDeleteWorkoutSession from '../hooks/workoutSession/useDeleteWorkoutSession';
import { date } from 'yup';
import useUpdateWorkoutSession from '../hooks/workoutSession/useUpdateWorkoutSession';

const WorkoutSessionList = ({ dashboardRefresh, startedWorkout, setStartedWorkout }) => {
    // Get the user ID from the location state
    const location = useLocation()
    const userState = location.state
    const uid = userState.uid
    
    // Custom hook to fetch workout sessions
    const pageSize = 9;
    const { data, error, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useWorkoutSessions(uid, { pageSize });
    const allWorkoutSessions = data?.pages?.flat() || []

    // State variables
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [newWorkoutId, setNewWorkoutId] = useState(null);
    const [deletedWorkoutId, setDeletedWorkoutId] = useState(null);

    // Custom hooks for modals
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isErrorOpen, onClose: onErrorClose } = useDisclosure();
    
    const editSessionModalRef = useRef();
    const navigate = useNavigate();

    const workoutSessionCreator = useCreateWorkoutSession()
    const workoutSessionDeleter = useDeleteWorkoutSession()
    const workoutSessionUpdater = useUpdateWorkoutSession()

    const handleAddSession = async () => {
        workoutSessionCreator.mutate({
            userId: uid,
            name: `${getTimeOfDay(Date.now())} Workout`,
            durationSec: 0,
        })
    };

    const handleDeleteSession = async () => {
        try {
            workoutSessionDeleter.mutate(deletedWorkoutId, {
                onSuccess: () => {
                    setDeletedWorkoutId(null);
                    onDeleteClose();
                },
                onError: (error) => {
                    console.error('Failed to delete workout session:', error);
                },
            });
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const handleEndSession = async (workoutId) => {
        try {
            // Fetch the session to calculate the elapsed time
            const session = await axiosInstance.get(`/workoutsessions/${workoutId}`);
            const sessionStartTime = new Date(session.data.date);
            const currentTime = new Date();
            const secondsElapsed = Math.floor((currentTime - sessionStartTime) / 1000);    
            // Use the mutation to update the duration
            workoutSessionUpdater.mutate({
                workoutSessionId: workoutId,
                updates: {
                    userId: uid,
                    durationSec: secondsElapsed,
                },
            });    
            return secondsElapsed;
        } catch (error) {
            console.error('Error ending session:', error);
            throw error; // Re-throw if needed
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
        setSelectedWorkout(null);
        onClose();
    };

    const scrollContainerRef = useRef();
    const handleScroll = () => {
        if (
            scrollContainerRef.current &&
            scrollContainerRef.current.scrollHeight - scrollContainerRef.current.scrollTop <= scrollContainerRef.current.clientHeight + 100
        ) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    };

    useEffect(() => {
        if (!uid) {
            navigate('/login');
            return;
        }
    }, [uid, navigate, dashboardRefresh]);

    useEffect(() => {
        if (newWorkoutId && allWorkoutSessions.length > 0) {
            const newWorkout = allWorkoutSessions.find((workout) => workout._id === newWorkoutId);
            if (newWorkout) {
                setSelectedWorkout(newWorkout);
                onOpen();
                setNewWorkoutId(null);
            }
        }
    }, [newWorkoutId, allWorkoutSessions, onOpen, setNewWorkoutId]);

    useEffect(() => {
        if (startedWorkout) {
            const workoutToSelect = allWorkoutSessions.find((workout) => workout._id === startedWorkout._id);
            if (workoutToSelect) {
                setSelectedWorkout(workoutToSelect);
                onOpen();
                setStartedWorkout(null);
            }
        }
    }, [startedWorkout, allWorkoutSessions, onOpen, setStartedWorkout]);

    return (
        <>
            {isLoading && ( 
                <Flex justify="center" align="center" h="100vh">
                    <Spinner size="xl" color="blue.400" />
                </Flex>
            )}

            {error && <ErrorModal isOpen={isErrorOpen} onClose={onErrorClose} errorMessage={error} />}

            <Flex w="100%" justifyContent="flex-end" pb={4}>
                <Button bg="blue.400" p={0} width="100%" height="40px" onClick={handleAddSession}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'} />
                </Button>
            </Flex>
            <Flex
                onScroll={handleScroll}
                ref={scrollContainerRef}
                flexDir="column"
                gap="10px"
                overflowY="auto"
                maxH='calc(100vh - 150px)'
            >
                {allWorkoutSessions.length === 0 ? (
                    <Box color="white" textAlign="center" fontSize="lg" fontWeight="600">
                        No better time to start than now!
                    </Box>
                ) : (
                allWorkoutSessions.map((workout) => (
                    <Box key={workout._id}>
                        <Flex 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleWorkoutClick(workout);
                            }} 
                            flexDir="column" 
                            bg="gray.800" 
                            width="100%" 
                            minH="60px"
                            borderRadius="12px"
                            p={3} pt={2} pr={2} pb={2} 
                            justify="space-between" 
                            _hover={{ cursor: 'pointer', bg: 'gray.600' }}
                        >
                            <Flex w="100%" justify="space-between" gap="15px">
                                <Flex justify="space-between" w="100%">
                                    <Flex w='70%' gap="10px">
                                        <Flex mt={1} width="50px" height="50px" flexDir="column">
                                            <Box 
                                                pb={1} bg="gray.600" height="45%" 
                                                borderBottom="1px solid gray" borderRadius="12px 12px 0px 0px" 
                                                color="white" textAlign="center" fontSize="xs" fontWeight="500"
                                            >
                                                {workout.date.day}
                                            </Box>
                                            <Box 
                                                bg="blue.400" height="55%" 
                                                textAlign="center" borderRadius="0px 0px 12px 12px" 
                                                color="gray.100" fontSize="lg" fontWeight="600"
                                            >
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
                                                <ListItem h="50px" color="gray.300" fontSize="xs"></ListItem>
                                                }
                                            </List>
                                        </Flex>
                                    </Flex>                                
                                    <Flex minH="60px" justify="space-between" textAlign="right" flexDir="column" color="white" align="flex-end">
                                        <DeleteIcon 
                                            boxSize={5} 
                                            color="gray.400" 
                                            _active={{ color: "red.300" }} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletedWorkoutId(workout._id);
                                                onDeleteOpen();
                                            }}
                                        />
                                        <Box fontSize="xs">
                                            {
                                                formatTime(workout.durationSec) && formatTime(workout.durationSec) !== 0 ? 
                                                    formatTime(workout.durationSec) 
                                                : "In Progress"
                                            }
                                        </Box>
                                    </Flex>
                                </Flex>
                            </Flex> 
                            {isFetchingNextPage && (
                                <Flex justify="center" align="center" py={4}>
                                    <Spinner size="lg" />
                                </Flex>
                            )}                                                   
                        </Flex>

                        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                            <ModalOverlay />
                            <ModalContent mx="auto" my="auto" bgColor="gray.700">
                                <ModalBody>
                                    <Flex flexDir="column" gap={3} p={4}>
                                        <Box fontSize="lg" fontWeight="600" color="white">Are you sure you want to delete this workout?</Box>
                                        <Flex justify="space-between">
                                            <Button colorScheme="red" onClick={() => handleDeleteSession()}>Delete</Button>
                                            <Button onClick={onDeleteClose}>Cancel</Button>
                                        </Flex>
                                    </Flex>
                                </ModalBody>
                            </ModalContent>
                        </Modal>

                        {selectedWorkout && selectedWorkout._id === workout._id && (
                            <Modal isOpen={isOpen} onClose={handleSaveAndClose}>
                                <ModalOverlay />
                                <ModalContent mx="auto" my="auto" aria-hidden="false" bgColor="gray.700">
                                    <ModalBody>
                                        <EditSessionModal 
                                            ref={editSessionModalRef} 
                                            closeSessionList={handleSaveAndClose} 
                                            selectedWorkout={selectedWorkout} 
                                            handleDeleteSession={onDeleteOpen}
                                            setDeletedWorkoutId={setDeletedWorkoutId} 
                                            handleEndSession={handleEndSession} 
                                            noRefreshClose={onClose} 
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
    );
};

export default WorkoutSessionList;
