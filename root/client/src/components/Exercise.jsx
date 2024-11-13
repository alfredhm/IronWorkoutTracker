import { Box, Flex, List, ListItem, Text } from "@chakra-ui/react";
import Set from "./Set";
import { DeleteIcon } from "@chakra-ui/icons";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import axios from "axios";

const Exercise = forwardRef(({ exercise, onDeleteExercise, workoutID }, ref) => {
    const [error, setError] = useState('');
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletedSets, setDeletedSets] = useState([]); // Track sets to delete from backend
    const [modified, setModified] = useState(false);

    // Add a new empty set to the list
    const handleAddSet = () => {
        setModified(true);
        const newSet = { exerciseId: exercise._id, sessionId: workoutID, ghost: true };
        setSets(prevSets => [...prevSets, newSet]);
    };

    // Update set values in real-time
    const handleUpdateSet = (index, updatedData) => {
        setModified(true);
        setSets(prevSets =>
            prevSets.map((set, i) => i === index ? { ...set, ...updatedData, ghost: false } : set)
        );
    };

    // Handle set deletion
    const handleDeleteSet = (index) => {
        setSets(prevSets => {
            const updatedSets = [...prevSets];
            const [removedSet] = updatedSets.splice(index, 1);

            if (removedSet?._id) {
                setDeletedSets(prev => [...prev, removedSet._id]);
            }

            // If no sets remain, add a ghost set
            if (updatedSets.length === 0) {
                onDeleteExercise(exercise._id);
            }

            return updatedSets;
        });
    };

    // Save all sets to the database
    const saveSetsToDatabase = async () => {
        try {
            await Promise.all(
                sets.map(async (set) => {

                // If the exercise was modified, convert ghost sets to non-ghost and save them
                if (modified || !set.ghost) {
                    const setData = {
                        exerciseId: set.exerciseId,
                        sessionId: workoutID,
                        weight: set.weight ?? 0,
                        reps: set.reps ?? 0,
                        notes: set.notes ?? "",
                    };
                
                    if (!set._id) {
                        const response = await axios.post(`http://localhost:5000/api/sets`, setData);
                        set._id = response.data._id;
                    } else {
                        await axios.put(`http://localhost:5000/api/sets/${set._id}`, setData);
                    }
                
                    // After saving, convert it to a non-ghost set
                    set.ghost = false;
                }
                })
            );

            // Delete removed sets
            await Promise.all(deletedSets.map(async setId => {
                await axios.delete(`http://localhost:5000/api/sets/${setId}`);
            }));

            setDeletedSets([]); // Clear deleted sets after successful save
            setModified(false); // Reset modified state
        } catch (err) {
            setError(err.message);
        }
    };

    useImperativeHandle(ref, () => ({
        saveSetsToDatabase,
    }));

    // Fetch existing sets on mount
    useEffect(() => {
        const fetchSets = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/sets/exercise/${exercise._id}`);
                const loadedSets = response.data.filter(set => set.sessionId === workoutID);    
                if (loadedSets.length === 0) {
                    // Add an initial ghost set if no sets exist
                    loadedSets.push({ exerciseId: exercise._id, sessionId: workoutID, ghost: true });
                }    
                setSets(loadedSets);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSets();
    }, [exercise._id, workoutID]);

    return (
        <Flex key={exercise._id} w="100%" borderRadius={7} bg="gray.600">
            <Flex w="100%">
                <Flex px={4} flexDir="column" w="100%">
                    <Flex
                        py={2}
                        w="100%"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottom="1px solid"
                        borderColor="rgba(256, 256, 256, 0.3)"
                    >
                        <Text fontSize="small" fontWeight="650">{exercise.name}</Text>
                        <Box onClick={() => onDeleteExercise(exercise._id)} _hover={{ cursor: 'pointer', color: 'red.300' }}>
                            <DeleteIcon boxSize={4} />
                        </Box>
                    </Flex>
                    <List>
                        {sets.map((set, index) => (
                            <ListItem key={set._id || `set-${index}`}>
                                <Set
                                    index={index}
                                    set={set}
                                    onChange={(updatedData) => handleUpdateSet(index, updatedData)}
                                    onDelete={() => handleDeleteSet(index)}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Flex py={2}>
                        <Text
                            color="blue.300"
                            fontSize="small"
                            fontWeight="600"
                            _hover={{ cursor: 'pointer', color: 'blue.100' }}
                            onClick={handleAddSet}
                        >
                            Add Set
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
});

export default Exercise;
