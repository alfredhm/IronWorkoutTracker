import { Box, Button, Flex, Input, List, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useDisclosure } from "@chakra-ui/react";
import Set from "./Set";
import { ChevronRightIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import axios from "axios";

const ExerciseTemplate = forwardRef(({ exercise, exercises, onDeleteExercise, last, setRefresh }, ref) => {
    const [error, setError] = useState('');
    const [sets, setSets] = useState([]);
    const [notes, setNotes] = useState('');

    const { isOpen, onOpen, onClose } = useDisclosure();

    // Function to delete the entire exercise
    const deleteExercise = async () => {
        try {
            // Notify parent to remove exercise from frontend state immediately
            await onDeleteExercise(exercise._id);
        } catch (err) {
            setError(err.message);
        }
        console.log(exercises)
    };

    const handleClose = async () => {
        const input = { ...exercise };
        delete input._id;
        delete input.__v;
    
        await axios.put(`http://localhost:5000/api/exercises/${exercise._id}`, {
            ...input,
            category: input.category,
            numOfSets: sets,
            notes: notes
        });
    
        setRefresh((prev) => prev + 1); // Trigger refresh in parent
        onClose();
    };
    
    const handleEditExerciseTemplate = () => {
        console.log('edit exercise template');
        onOpen()
    }

    useEffect(() => {
        setSets(exercise.numOfSets);
        setNotes(exercise.notes);
    }, [exercise._id]);

    useImperativeHandle(ref, () => ({
        handleClose
    }));

    return (
        <Flex key={exercise._id} w="100%"  bg="gray.600">
            <Flex w="100%">
                <Flex px={4} flexDir="column" w="100%">
                    <Flex
                        py={2}
                        w="100%"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottom={last ? "none" : "1px solid"}
                        borderColor="rgba(256, 256, 256, 0.3)"
                    >
                        <Flex flexDirection='column'>
                            <Text fontSize="small" fontWeight="650">
                                {exercise.name}
                            </Text>
                            <Text>
                                {sets} sets
                            </Text>
                        </Flex>
                        <Box 
                            onClick={handleEditExerciseTemplate}
                            _hover={{ 
                                cursor: 'pointer', 
                                color: 'blue.200'
                            }}
                        >
                            <ChevronRightIcon boxSize={6}/>
                        </Box>
                    </Flex>
                    <Modal isOpen={isOpen} onClose={handleClose}>
                        <ModalOverlay />
                        <ModalContent mx="auto" my="auto"color="white" bgColor="gray.700" borderRadius="10px">
                            <ModalHeader>{exercise.name}</ModalHeader>
                            <ModalCloseButton color="white" />
                            <ModalBody>
                                <Flex 
                                    py={1} px={4} w="100%" 
                                    justifyContent="space-between" 
                                    alignItems="center"
                                    bgColor="gray.600" borderRadius="10px"
                                >
                                    <Text>Sets</Text>
                                    <Flex w="100%">
                                        <Input 
                                            p={0}
                                            w="100%"
                                            textAlign="right"
                                            border="none"
                                            type="number" value={sets} 
                                            onChange={(e) => setSets(e.target.value)} 
                                            _focus={{ boxShadow: 'none' }}
                                        />
                                    </Flex>
                                </Flex>
                                <Flex flexDir="column">
                                    <Text fontSize="small" color="gray.400">{exercise.name}</Text>
                                    <Textarea 
                                        px={3} placeholder={exercise.notes ? "" : "Add Note"} 
                                        border="none" bg="gray.600" 
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        _focus={{ boxShadow: 'none' }}
                                    />
                                </Flex>
                            </ModalBody>
                            <ModalFooter>
                                <Flex w="100%" bgColor="gray.600" flexDir="column" borderRadius="10px" >
                                    {/*
                                        TODO: ADD REPLACE EXERCISE FUNCTIONALITY
                                        <Box 
                                            borderTopRadius="10px"
                                            borderBottom="1px solid gray" 
                                            px={4} py={2} 
                                            _hover={{ cursor: 'pointer', color: 'blue.200', bgColor: 'gray.500' }}
                                            onClick={() => alert('Action performed!')}
                                        >
                                            Replace
                                        </Box>
                                    */}
                                    <Flex w="100%">
                                        <Box 
                                            borderRadius="10px"
                                            color="red.400" 
                                            px={4} py={2} w="100%" 
                                            _hover={{ cursor: 'pointer', color: 'blue.200', bgColor: 'gray.500' }}
                                            onClick={deleteExercise}
                                        >
                                            Delete
                                        </Box>
                                    </Flex>
                                </Flex>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Flex>
            </Flex>
        </Flex>
    );
});

export default ExerciseTemplate;
