import { Box, Flex, Spinner } from "@chakra-ui/react";
import axios from "axios";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Exercise from "./Exercise";
import ExerciseTemplate from "./ExerciseTemplate";
import ErrorModal from "./ErrorModal";

const ExerciseList = forwardRef(({ workoutID, session, editModalRefresh, exerciseRefs, exercises, setExercises }, ref) => {
  const apiParam = session ? "workoutsessions" : "workouts";
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletedExerciseIds, setDeletedExerciseIds] = useState([]); // Track exercises to delete from backend

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/${apiParam}/${workoutID}`);
      const exerciseIDs  = response.data.exercises;

      // Fetch each exercise’s details by ID
      const fetchedExercises = await Promise.all(
        exerciseIDs.map(async (exerciseID) => {
            try {
                const exerciseResponse = await axios.get(`http://localhost:5000/api/exercises/${exerciseID._id}`);
                return exerciseResponse.data;
            } catch {
                return null;
            }
        })
      );
      setTimeout(() => {}, 5000);
      setExercises(fetchedExercises.filter((exercise) => exercise !== null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Add or update exercises in the list
  const updateExerciseList = (updatedExercise) => {
    setExercises((prevExercises) =>
        prevExercises.map((ex) => (ex._id === updatedExercise._id ? updatedExercise : ex))
    );
  };

  // Handle exercise deletion
  const handleDeleteExercise = (exerciseID) => {
    setExercises((prevExercises) => prevExercises.filter((ex) => ex._id !== exerciseID));
    setDeletedExerciseIds((prev) => [...prev, exerciseID]);
  };

  const persistDeletedExercises = async () => {
    try {
        await Promise.all(
            deletedExerciseIds.map(async (exerciseID) => {
                await axios.delete(`http://localhost:5000/api/exercises/${exerciseID}`);
            })
        );
        console.log('Deleted exercises persisted successfully');
    } catch (error) {
        console.error('Error persisting deleted exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [workoutID]);

  // Assign refs after exercises are rendered
  useEffect(() => {
    exercises.forEach((exercise, index) => {
      if (!exerciseRefs.current[index]) {
        exerciseRefs.current[index] = null;
      }
    });
  }, [exercises, exerciseRefs]);

  useImperativeHandle(ref, () => ({
    persistDeletedExercises,
  }));

  return error ? 
      <ErrorModal isOpen={error.length > 0} onClose={() => setError("")} errorMessage={error} /> : 
    loading ? (
      <Flex justifyContent="center" alignItems="center">
        <Spinner size="xl" color="white" />
      </Flex>
    ) : session ? (
        <Box display={exercises.length === 0 ? "none" : "block"} bg='gray.700' w='100%' borderRadius={'10px'}>
          <Flex flexDir="column" gap={session ? "10px" : 0} w="100%" py={0}>
            {exercises.map((exercise, index) => 
                <Exercise
                  key={exercise._id}
                  workoutID={workoutID}
                  exercise={exercise}
                  onDeleteExercise={handleDeleteExercise}
                  ref={(el) => (exerciseRefs.current[index] = el || exerciseRefs.current[index])}
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
                  exercise={exercise}
                  onDeleteExercise={handleDeleteExercise}
                  onExerciseUpdate={updateExerciseList}
                  editModalRefresh={editModalRefresh}
                />
            )}
          </Flex>
        </Box>
      );
});

export default ExerciseList;
