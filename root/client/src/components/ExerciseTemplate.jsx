import { Box, Flex, Input, 
    Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter, ModalHeader,
    ModalOverlay, Text, Textarea, useDisclosure 
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorModal from "./ErrorModal";

const ExerciseTemplate = ({ exercise, onDeleteExercise, last, onExerciseUpdate, editModalRefresh }) => {
    const [error, setError] = useState('');
    const [setCount, setSetCount] = useState(exercise.numOfSets || 0); // Initialize from exercise.numOfSets
    const [notes, setNotes] = useState(exercise.notes || ''); // Initialize notes
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Open modal and ensure data is loaded
    const handleOpen = () => {
        onOpen();
    };

    // Save updates and close the modal
    const handleClose = async () => {
        try {
            // Update the exercise with new set count and notes
            const updatedExercise = { ...exercise, numOfSets: setCount, notes };
            delete updatedExercise._id;
            delete updatedExercise.__v;
            await axios.put(`http://localhost:5000/api/exercises/${exercise._id}`, updatedExercise);

            onExerciseUpdate(updatedExercise);
            if (typeof editModalRefresh === "function") {
                editModalRefresh();
            }
            onClose();
        } catch (err) {
            setError("Could not save updates.");
            console.error(err);
        }
    };

    // Handle change in set count
    const handleSetCountChange = (e) => {
        const newCount = parseInt(e.target.value, 10) || 0; // Convert to integer, default to 0
        setSetCount(newCount); // Update the displayed count
        onExerciseUpdate({ ...exercise, numOfSets: newCount }); // Update the exercise in the parent
    };

    return (
        <>
            {error && 
                <ErrorModal isOpen={error.length > 0} onClose={() => setError("")} errorMessage={error} />
            }
            <Flex key={exercise._id} w="100%" bg="gray.600">
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
                            <Flex flexDirection="column">
                                <Text fontSize="small" fontWeight="650">
                                    {exercise.name}
                                </Text>
                                <Text>
                                    {setCount} sets
                                </Text>
                            </Flex>
                            <Box 
                                onClick={handleOpen}
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
                            <ModalContent mx="auto" my="auto" color="white" bgColor="gray.700" borderRadius="10px">
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
                                                required
                                                type="number"
                                                value={setCount} // Display the current count
                                                onChange={handleSetCountChange} 
                                                _focus={{ boxShadow: 'none' }}
                                            />
                                        </Flex>
                                    </Flex>
                                    <Flex flexDir="column" mt={4}>
                                        <Text fontSize="small" color="gray.400">Notes</Text>
                                        <Textarea 
                                            px={3} placeholder="Add Note" 
                                            border="none" bg="gray.600" 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            _focus={{ boxShadow: 'none' }}
                                        />
                                    </Flex>
                                </ModalBody>
                                <ModalFooter>
                                    <Flex w="100%" bgColor="gray.600" flexDir="column" borderRadius="10px">
                                        <Flex w="100%">
                                            <Box 
                                                borderRadius="10px"
                                                color="red.400" 
                                                px={4} py={2} w="100%" 
                                                _hover={{ cursor: 'pointer', color: 'blue.200', bgColor: 'gray.500' }}
                                                onClick={() => onDeleteExercise(exercise._id)}
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
        </>
    );
};

export default ExerciseTemplate;
