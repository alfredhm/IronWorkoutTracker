import { Flex, List, ListItem, Text } from "@chakra-ui/react";
import Set from "./Set";
import { HamburgerIcon } from "@chakra-ui/icons";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import axios from "axios";

const Exercise = forwardRef(({ exercise, onDeleteExercise, session, workoutID }, ref) => {
    const [error, setError] = useState('');
    const [sets, setSets] = useState([]);
    const [deletedSets, setDeletedSets] = useState([]); // Track sets to delete from backend

    // Function to delete the entire exercise
    const deleteExercise = async () => {
        try {
            // Notify parent to remove exercise from frontend state immediately
            onDeleteExercise(exercise._id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSet = (index) => {
        setSets((prevSets) => {
            const updatedSets = [...prevSets];
            const [removedSet] = updatedSets.splice(index, 1);

            // Track deleted sets for backend deletion
            if (removedSet && removedSet._id) {
                setDeletedSets((prevDeleted) => [...prevDeleted, removedSet._id]);
            }

            // If no sets remain, delete the exercise itself
            if (updatedSets.length === 0) {
                deleteExercise();
            }

            return updatedSets;
        });
    };

    const handleAddSet = () => {
        const newSet = {
            exerciseId: exercise._id,
            sessionId: workoutID,
            weight: undefined,
            reps: undefined,
            notes: undefined,
        };

        setSets((prevSets) => {
            const updatedSets = prevSets.map((set) =>
                // if there is a ghost set, replace it with the new set
                set.ghost ? { ...set, ghost: false } : set
            );
            return [...updatedSets, newSet];
        });
    };

    
    const handleUpdateSet = (index, updatedData) => {
        setSets((prevSets) =>
            prevSets.map((set, i) =>
                i === index ? { ...set, ...updatedData, ghost: false } : set // Remove `ghost` flag on update
            )
        );
    };

    const postSetsToDatabase = async () => {
        try {
            // Filters sets to only include those with weight, reps, notes, or ghost set to false
            const filteredSets = sets.filter(
                (set) => set.weight || set.reps || set.notes || set.ghost === false
            );

            await Promise.all(
                filteredSets.map(async (set) => {
                    // Skip ghost sets
                    if (set.ghost) return;

                    const processedSet = {
                        exerciseId: set.exerciseId,
                        sessionId: workoutID,
                        weight: set.weight || undefined,
                        reps: set.reps || undefined,
                        notes: set.notes || undefined,
                    };

                    // If set has no ID, it is a new set
                    if (!set._id) {
                        const response = await axios.post(`http://localhost:5000/api/sets`, processedSet);
                        set._id = response.data._id;
                    // Otherwise, update the existing set
                    } else {
                        await axios.put(`http://localhost:5000/api/sets/${set._id}`, processedSet);
                    }
                })
            );

            // Delete sets that were removed from the frontend
            await Promise.all(
                deletedSets.map(async (setId) => {
                    await axios.delete(`http://localhost:5000/api/sets/${setId}`);
                })
            );

            setDeletedSets([]);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleClose = async () => {
        await postSetsToDatabase();
    };

    useEffect(() => {
        const loadSetsAndAddGhost = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/sets/exercise/${exercise._id}`);
                
                // Filter sets to include only those that match the provided workoutID
                let loadedSets = response.data.filter(
                    (set) => set.sessionId === workoutID && (set.weight || set.reps || set.notes || set.ghost === false)
                );
    
                // Check if a ghost set is present; if not and no sets exist, add a ghost set
                const hasGhostSet = loadedSets.some((set) => set.ghost);
                if (!hasGhostSet && loadedSets.length === 0) {
                    loadedSets.push({
                        exerciseId: exercise._id,
                        sessionId: workoutID,
                        weight: '',
                        reps: '',
                        notes: '',
                        ghost: true,
                    });
                }
    
                setSets(loadedSets);
            } catch (err) {
                setError(err.message);
            }
        };
    
        loadSetsAndAddGhost();
    }, [exercise._id, workoutID]);

    useImperativeHandle(ref, () => ({
        handleClose
    }));

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
                        <Text fontSize="small" fontWeight="650">
                            {exercise.name}
                        </Text>
                        <HamburgerIcon />
                    </Flex>
                    <List>
                        {sets.map((set, index) => (
                            <ListItem key={set._id || `set-${index}`}>
                                <Set
                                    set={set}
                                    index={index}
                                    onChange={(updatedData) => handleUpdateSet(index, updatedData)}
                                    onDelete={() => handleDeleteSet(index)}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Flex>
                        <Flex py={2}>
                            <Text
                                color='blue.300'
                                fontSize="small"
                                fontWeight="600"
                                _hover={{
                                    cursor: 'pointer',
                                    color: 'blue.100'
                                }}
                                onClick={handleAddSet}
                            >
                                Add Set
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
});

export default Exercise;
