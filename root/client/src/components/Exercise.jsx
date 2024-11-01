import { Flex, List, ListItem, Text } from "@chakra-ui/react"
import Set from "./Set"
import { HamburgerIcon } from "@chakra-ui/icons"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import axios from "axios"

const Exercise = forwardRef(({ exercise, handleModalClose }, ref) => {
    const [error, setError] = useState('')
    const [sets, setSets] = useState([])

    const handleAddSet = async () => {
        try {
            const newSet = {
                exerciseId: exercise._id,
                weight: undefined,
                reps: undefined, 
                notes: undefined
            }
            const res = await axios.post(`http://localhost:5000/api/sets`, newSet)
            setSets((prevSets) => [...prevSets, { ...newSet, _id: res.data._id }]);
        } catch (err) {
            setError(err.message)
        }

    }   

    // Handle set changes
    const handleUpdateSet = (setId, updatedData) => {
        setSets((prevSets) =>
            prevSets.map((set) =>
                set._id === setId ? { ...set, ...updatedData } : set
            )
        );
    };

    const postSetsToDatabase = async () => {
        try {
            await Promise.all(
                sets.map(async (set) => {
                    if (!set._id) {
                        const response = await axios.post(`http://localhost:5000/api/sets`, {
                            exerciseId: set.exerciseId,
                            weight: set.weight,
                            reps: set.reps,
                            notes: set.notes,
                        });
                        set._id = response.data._id;
                    } else {
                        await axios.put(`http://localhost:5000/api/sets/${set._id}`, {
                            exerciseId: set.exerciseId,
                            weight: set.weight,
                            reps: set.reps,
                            notes: set.notes,
                        });
                    }
                })
            );
            console.log('All sets have been posted successfully.');
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle modal close event
    const handleClose = async () => {
        await postSetsToDatabase(); // Post sets to the database
    };

    // Async function for loading sets used in effect hook
    const loadSets = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/sets/exercise/${exercise._id}`)
            if (response.data.length > 0) {
                    setSets(
                        response.data.map((set) => ({
                            ...set,
                            exerciseId: set.exerciseId,
                            weight: set.weight !== undefined ? set.weight : undefined,
                            reps: set.reps !== undefined ? set.reps : undefined,
                            notes: set.notes !== undefined ? set.notes : undefined,
                    }))
                );
            }
        } catch(err) {
            setError(err.message)
        }
      } 

    // Use useImperativeHandle to expose handleClose to parent components
    useImperativeHandle(ref, () => ({
        handleClose,
        loadSets
    }));

    useEffect(() => { 
      loadSets()
    }, [exercise._id])
    
    return (
        <Flex key={exercise._id} w="100%" border="1px solid white" borderRadius={7} bg="gray.600">
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
                                    onChange={handleUpdateSet}
                                />
                            </ListItem>
                        ))}
                    </List>            
                    <Flex>
                        <Flex py={2} borderBottom="1px solid" borderColor="rgba(256, 256, 256, 0.3)">
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
    )
})

export default Exercise