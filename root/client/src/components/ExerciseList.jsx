import { HamburgerIcon } from "@chakra-ui/icons";
import { Flex, List, ListItem, Text,  } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Set from "./Set";

const ExerciseList = ({ workoutID, session }) => {
  const apiParam = session ? "workoutsessions" : "workouts";
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState('')

  useEffect(() => {
    // Function to get all the exercise objects from the workouts exercise array of exerciseIDs
    const getExercises = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/${apiParam}/${workoutID}`);
        const currExerciseIDs = response.data.exercises;
        let currExercises = [];
        for (let i = 0; i < currExerciseIDs.length; i++) {
          const res = await axios.get(`http://localhost:5000/api/exercises/${currExerciseIDs[i]}`);
          currExercises.push(res.data);
        }
        setExercises(currExercises);
      } catch (err) {
        setError(err.message);
      }
    };
    getExercises();
  }, [apiParam, workoutID]);

  return (
    <>
        <Flex flexDir="column" w="100%" gap={4} pt={2}>
            {exercises.map((exercise) => (
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

                    {exercise.sets.length === 0 ? (
                        <Set />
                    ) : (
                        <>
                        {exercise.sets.map((set) => (
                            <List key={set._id}>
                            <ListItem></ListItem>
                            </List>
                        ))}
                        </>
                    )}
                    </Flex>
                </Flex>
            </Flex>
            ))}
        </Flex>
    </>
  );
};

export default ExerciseList;
