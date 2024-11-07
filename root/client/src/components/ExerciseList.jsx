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
    console.log('Delete')
    try {
      // Call the backend to remove the exercise from the workout and delete the exercise
      const res = await axios.delete(`http://localhost:5000/api/${apiParam}/${workoutID}/exercises`, {
        exerciseID
      });
      console.log(res)
      
      // Update the state to reflect the deletion
      setDeletedExercise(exerciseID); // Set deleted exercise ID for useEffect to handle
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Forward `handleClose` to allow `EditSessionModal` to trigger it
  useImperativeHandle(ref, () => ({
    async handleClose() {
      // Call handleClose on each Exercise component
      await Promise.all(exerciseRefs.current.map(exerciseRef => exerciseRef?.handleClose()));
    }
  }));

  // Handle the deletion of exercises from state
  useEffect(() => {
    if (deletedExercise) {
      setExercises((prevExercises) => prevExercises.filter((exercise) => exercise._id !== deletedExercise));
      setDeletedExercise(null); // Reset deletedExercise after updating state
    }
    console.log(exercises)
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
      } catch (err) {
        setError(err.message);
      }
    };

    if (workoutID) {
      getExercises();
    }
  }, [refresh, apiParam, workoutID]);

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
                  onDeleteExercise={onDeleteExercise}
                />
            )}
          </Flex>
        </Box>
      )
  );
});

export default ExerciseList;
