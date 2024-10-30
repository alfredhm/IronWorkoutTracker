import { Flex  } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Exercise from "./Exercise";

const ExerciseList = ({ workoutID, session, refresh }) => {
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
  }, [refresh, apiParam, workoutID]);

  return (
    <>
        <Flex flexDir="column" w="100%" gap={4} pt={2}>
            {exercises.map((exercise) => (
              <Exercise key={exercise._id} exercise={exercise} />
            ))}
        </Flex>
    </>
  );
};

export default ExerciseList;
