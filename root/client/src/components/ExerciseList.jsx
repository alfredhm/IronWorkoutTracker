import React, { forwardRef, useEffect, useImperativeHandle, useCallback } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import axios from "axios";
import Exercise from "./Exercise";
import ExerciseTemplate from "./ExerciseTemplate";
import ErrorModal from "./ErrorModal";
import axiosInstance from "../resources/axiosInstance";

const ExerciseList = forwardRef(
  ({ workoutID, session, editModalRefresh, exerciseRefs }, ref) => {
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [exercises, setExercises] = React.useState([]);
    const [deletedExerciseIds, setDeletedExerciseIds] = React.useState([]);

    // Fetch exercises only when `workoutID` changes
    const fetchExercises = useCallback(async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/${session ? "workoutsessions" : "workouts"}/${workoutID}`
        );
        const exerciseIDs = response.data.exercises;

        const fetchedExercises = await Promise.all(
          exerciseIDs.map(async (exerciseID) => {
            try {
              const exerciseResponse = await axiosInstance.get(
                `/exercises/${exerciseID}`
              );
              return exerciseResponse.data;
            } catch {
              return null;
            }
          })
        );
        setExercises(fetchedExercises.filter(Boolean));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, [workoutID, session]);

    const handleUpdateExercise = (updatedExercise) => {
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise._id === updatedExercise._id ? { ...exercise, ...updatedExercise } : exercise
        )
      );
    }


    // Persist deleted exercises
    const persistDeletedExercises = useCallback(async () => {
      try {
        await Promise.all(
          deletedExerciseIds.map((exerciseID) =>
            axiosInstance.delete(`/exercises/${exerciseID}`)
          )
        );
        setDeletedExerciseIds([]);
      } catch (error) {
        console.error("Error persisting deleted exercises:", error);
      }
    }, [deletedExerciseIds]);

    useImperativeHandle(ref, () => ({
      persistDeletedExercises,
    }));

    useEffect(() => {
      fetchExercises();
    }, [fetchExercises]);

    return error ? (
      <ErrorModal isOpen={!!error} onClose={() => setError("")} errorMessage={error} />
    ) : loading ? (
      <Flex justifyContent="center" alignItems="center">
        <Spinner size="xl" color="white" />
      </Flex>
    ) : (
      <Box display={exercises.length === 0 ? "none" : "block"} p={ session ? 0 : 1 } bg={ session ? "none" : "gray.600" } w="100%" borderRadius="10px">
        <Flex borderRadius="15px" flexDir="column" w="100%" py={1}>
          {exercises.map((exercise, index) =>
            session ? (
              <Exercise
                key={exercise._id}
                ref={(el) => (exerciseRefs.current[index] = el)}
                workoutID={workoutID}
                exercise={exercise}
                onDeleteExercise={(exerciseID) => {
                  setExercises((prev) => prev.filter((ex) => ex._id !== exerciseID));
                  setDeletedExerciseIds((prev) => [...prev, exerciseID]);
                }}
              />
            ) : (
              <ExerciseTemplate
                key={exercise._id}
                last={index === exercises.length - 1}
                exercise={exercise}
                onDeleteExercise={(exerciseID) => {
                  setExercises((prev) => prev.filter((ex) => ex._id !== exerciseID));
                  setDeletedExerciseIds((prev) => [...prev, exerciseID]);
                }}
                onExerciseUpdate={handleUpdateExercise}
                editModalRefresh={editModalRefresh}
              />
            )
          )}
        </Flex>
      </Box>
    );
  }
);

export default React.memo(ExerciseList);

