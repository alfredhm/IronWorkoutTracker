import { Box, Flex } from "@chakra-ui/react";
import axios from "axios";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Exercise from "./Exercise";
import ExerciseTemplate from "./ExerciseTemplate";

const ExerciseList = forwardRef(({ workoutID, session, refresh }, ref) => {
  const apiParam = session ? "workoutsessions" : "workouts";
  const [exercises, setExercises] = useState([]);
  const [deletedExercise, setDeletedExercise] = useState(null); // Track deleted exercise
  const [error, setError] = useState('');

  const exerciseRefs = useRef([]);

  const onDeleteExercise = async (exerciseID) => {
    try {
        console.log('deleting exercise');
        console.log(exerciseID);

        // Correctly send exerciseID in the data property for axios.delete
        await axios.delete(`http://localhost:5000/api/${apiParam}/${workoutID}/exercises`, {
            data: { exerciseID }
        });

        // Log the updated workout after deletion
        console.log(await axios.get(`http://localhost:5000/api/${apiParam}/${workoutID}`));

        // Update the state to reflect the deletion
        setDeletedExercise(exerciseID);
        setExercises((prevExercises) => prevExercises.filter((exercise) => exercise._id !== exerciseID));
    } catch (err) {
        console.log(err);
        setError(err.message);
    }
};

  const handleClose = async () => {
    await Promise.all(exerciseRefs.current.map(exerciseRef => exerciseRef?.handleClose()));
    setExercises(exercises)
  }
  
  // Forward `handleClose` to allow `EditSessionModal` to trigger it
  useImperativeHandle(ref, () => ({
    handleClose
  }));

  // Handle the deletion of exercises from state
  useEffect(() => {
    if (deletedExercise) {
      setExercises((prevExercises) => prevExercises.filter((exercise) => exercise._id !== deletedExercise));
      setDeletedExercise(null); // Reset deletedExercise after updating state
    }
  }, [deletedExercise]);

  // Fetch exercises when component mounts or refresh changes
  useEffect(() => {
    const getExercises = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/${apiParam}/${workoutID}`);
        const currExerciseIDs = response.data.exercises;
        let currExercises = [];

        for (let i = 0; i < currExerciseIDs.length; i++) {
          try {
            const res = await axios.get(`http://localhost:5000/api/exercises/${currExerciseIDs[i]}`);
            currExercises.push(res.data);
          } catch {
            continue;
          }
        }

        setExercises(currExercises);
        console.log(exercises)
      } catch (err) {
        setError(err.message);
      }
    };

    if (workoutID) {
      getExercises();
    }
  }, [refresh, apiParam, workoutID ]);
  

  return (
    session ? (
        <Box display={exercises.length === 0 ? "none" : "block"} bg='gray.700' w='100%' borderRadius={'10px'}>
          <Flex flexDir="column" gap={session ? "10px" : 0} w="100%" py={0}>
            {exercises.map((exercise, index) => 
                <Exercise
                  key={exercise._id}
                  last={index === exercises.length - 1}
                  workoutID={workoutID}
                  session={session}
                  ref={el => (exerciseRefs.current[index] = el)}
                  exercise={exercise}
                  onDeleteExercise={onDeleteExercise}
                />
            )}
          </Flex>
        </Box>
      ) : (
        <Box display={exercises.length === 0 ? "none" : "block"} py={2} bg='gray.600' w='100%' borderRadius={'10px'}>
          <Flex flexDir="column" gap={session ? "10px" : 0} w="100%" py={0}>
            {exercises.map((exercise, index) => 
                <ExerciseTemplate
                  key={exercise._id}
                  last={index === exercises.length - 1}
                  workoutID={workoutID}
                  session={session}
                  ref={el => (exerciseRefs.current[index] = el)}
                  exercise={exercise}
                  exercises={exercises}
                  onDeleteExercise={onDeleteExercise}
                />
            )}
          </Flex>
        </Box>
      )
  );
});

export default ExerciseList;
