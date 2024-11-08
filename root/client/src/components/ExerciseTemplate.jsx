import { Box, Flex, List, ListItem, Text } from "@chakra-ui/react";
import Set from "./Set";
import { ChevronRightIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import axios from "axios";

const ExerciseTemplate = forwardRef(({ exercise, exercises, onDeleteExercise, last }, ref) => {
    const [error, setError] = useState('');
    const [sets, setSets] = useState([]);

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

    useEffect(() => {
        setSets(exercise.numOfSets);
    }, [exercise._id]);

    useImperativeHandle(ref, () => ({
        async handleClose() {
            console.log(ref.current)
        }
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
                            onClick={() => deleteExercise(exercise._id)}
                            _hover={{ 
                                cursor: 'pointer', 
                                color: 'red.300'
                            }}
                        >
                            <DeleteIcon boxSize={4}/>
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
});

export default ExerciseTemplate;
