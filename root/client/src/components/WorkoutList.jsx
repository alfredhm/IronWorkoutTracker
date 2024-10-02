import { Box, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, useDisclosure, Text } from '@chakra-ui/react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom';
import muscleIcons from '../resources/muscleIcons'
import EditWorkoutModal from './modal-body/EditWorkoutModal'

const WorkoutList = ({ refresh, handleClose }) => {
    const [workouts, setWorkouts] = useState([])
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const auth = useAuthUser()
    const uid = auth()?.uid;
    const navigate = useNavigate();

    const getFocusCount = (workout) => {
        if (workout.focusGroup.length > 5) {
            return 4
        } else {
            return workout.focusGroup.length
        }
    }

    const convertToMonthDay = (isoString) => {
        const date = new Date(isoString);
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate(); 
    
        return `${month}/${day}`;
    }

    const handleWorkoutClick = (workout) => {
        setSelectedWorkout(workout);
        onOpen();
    };

    const handleEditClose = () => {
        handleClose();
        onClose();
    }

    useEffect(() => {
        if (!uid) {
            navigate('/login');
            return;
        }

        const getWorkouts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/workouts/user/${uid}`);
                const updatedData = response.data;
                setWorkouts(updatedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getWorkouts();
    }, [refresh, uid, navigate]);

    return (
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
                                                <Box opacity="45%" fontSize="small">{workout.notes}</Box>
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
                            <Modal isOpen={isOpen} onClose={handleEditClose}>
                                <ModalOverlay />
                                <ModalContent aria-hidden="false" border="1px solid white" bgColor="gray.700" borderRadius="10px">
                                    <ModalCloseButton color="white" />
                                    <ModalBody>
                                        <EditWorkoutModal handleClose={handleEditClose} data={selectedWorkout} />
                                    </ModalBody>
                                </ModalContent>
                            </Modal>
                        )}
                    </Box>
                ))
            )}
            {error && (
                <Text color="red.300" textAlign="center">
                    {error}
                </Text>
            )}
        </Flex>
    )
}

export default WorkoutList;
