import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import axios from "axios";
import { FiMove } from "react-icons/fi";
import Exercise from "./Exercise";
import ExerciseTemplate from "./ExerciseTemplate";
import ErrorModal from "./ErrorModal";
import reorderExercises from "../resources/reorderExercises";

const ExerciseList = forwardRef(
  (
    {
      workoutID,
      session,
      editModalRefresh,
      exerciseRefs,
      exercises,
      setExercises,
    },
    ref,
  ) => {
    const [error, setError] = React.useState("");
    const [deletedExerciseIds, setDeletedExerciseIds] = React.useState([]);
    const [draggedExerciseId, setDraggedExerciseId] = React.useState(null);
    const [dropTargetId, setDropTargetId] = React.useState(null);

    const handleUpdateExercise = (updatedExercise) => {
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise._id === updatedExercise._id
            ? { ...exercise, ...updatedExercise }
            : exercise,
        ),
      );
    };

    const moveExercise = (sourceIndex, destinationIndex) => {
      setExercises((current) =>
        reorderExercises(current, sourceIndex, destinationIndex),
      );
    };

    const handleDrop = (event, targetExerciseId) => {
      event.preventDefault();
      const sourceExerciseId =
        event.dataTransfer.getData("text/plain") || draggedExerciseId;
      if (!sourceExerciseId) return;

      setExercises((current) =>
        reorderExercises(
          current,
          current.findIndex((exercise) => exercise._id === sourceExerciseId),
          current.findIndex((exercise) => exercise._id === targetExerciseId),
        ),
      );
      setDraggedExerciseId(null);
      setDropTargetId(null);
    };

    // Persist deleted exercises
    const persistDeletedExercises = useCallback(async () => {
      try {
        await Promise.all(
          deletedExerciseIds.map((exerciseID) =>
            axios.delete(`http://localhost:5000/api/exercises/${exerciseID}`),
          ),
        );
        setDeletedExerciseIds([]);
      } catch (error) {
        console.error("Error persisting deleted exercises:", error);
      }
    }, [deletedExerciseIds]);

    useImperativeHandle(ref, () => ({
      persistDeletedExercises,
    }));

    return error ? (
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError("")}
        errorMessage={error}
      />
    ) : (
      <Box
        display={exercises.length === 0 ? "none" : "block"}
        p={session ? 0 : 1}
        bg={session ? "none" : "gray.600"}
        w="100%"
        borderRadius="10px"
      >
        <Flex
          borderRadius="15px"
          flexDir="column"
          w="100%"
          py={1}
          role="list"
          aria-label="Workout exercises"
        >
          {exercises.map((exercise, index) => {
            const reorderControls = (
              <Flex
                align="center"
                gap={0}
                flexShrink={0}
                onClick={(event) => event.stopPropagation()}
              >
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  minW={8}
                  h={8}
                  color="white"
                  bg="whiteAlpha.100"
                  aria-label={`Move ${exercise.name} up`}
                  isDisabled={index === 0}
                  icon={<ChevronUpIcon boxSize={5} />}
                  _hover={{ bg: "whiteAlpha.300" }}
                  _active={{ bg: "whiteAlpha.400" }}
                  _disabled={{
                    opacity: 0.65,
                    color: "white",
                    cursor: "not-allowed",
                  }}
                  onClick={() => moveExercise(index, index - 1)}
                />
                <Box
                  draggable
                  aria-hidden="true"
                  title="Drag to reorder"
                  cursor="grab"
                  w={8}
                  h={8}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  borderRadius="md"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", exercise._id);
                    event.dataTransfer.effectAllowed = "move";
                    setDraggedExerciseId(exercise._id);
                  }}
                  onDragEnd={() => {
                    setDraggedExerciseId(null);
                    setDropTargetId(null);
                  }}
                >
                  <FiMove size={18} />
                </Box>
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  minW={8}
                  h={8}
                  color="white"
                  bg="whiteAlpha.100"
                  aria-label={`Move ${exercise.name} down`}
                  isDisabled={index === exercises.length - 1}
                  icon={<ChevronDownIcon boxSize={5} />}
                  _hover={{ bg: "whiteAlpha.300" }}
                  _active={{ bg: "whiteAlpha.400" }}
                  _disabled={{
                    opacity: 0.65,
                    color: "white",
                    cursor: "not-allowed",
                  }}
                  onClick={() => moveExercise(index, index + 1)}
                />
              </Flex>
            );

            return (
              <Box
                key={exercise._id}
                w="100%"
                role="listitem"
                data-exercise-id={exercise._id}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTargetId(exercise._id);
                }}
                onDrop={(event) => handleDrop(event, exercise._id)}
                opacity={draggedExerciseId === exercise._id ? 0.55 : 1}
                boxShadow={
                  dropTargetId === exercise._id
                    ? "0 0 0 2px var(--chakra-colors-blue-300)"
                    : "none"
                }
                borderRadius="10px"
                transition="opacity 120ms ease, box-shadow 120ms ease"
              >
                {session ? (
                  <Exercise
                    ref={(el) => (exerciseRefs.current[index] = el)}
                    workoutID={workoutID}
                    exercise={exercise}
                    reorderControls={reorderControls}
                    onDeleteExercise={(exerciseID) => {
                      setExercises((prev) =>
                        prev.filter((ex) => ex._id !== exerciseID),
                      );
                      setDeletedExerciseIds((prev) => [...prev, exerciseID]);
                    }}
                  />
                ) : (
                  <ExerciseTemplate
                    last={index === exercises.length - 1}
                    exercise={exercise}
                    reorderControls={reorderControls}
                    onDeleteExercise={(exerciseID) => {
                      setExercises((prev) =>
                        prev.filter((ex) => ex._id !== exerciseID),
                      );
                      setDeletedExerciseIds((prev) => [...prev, exerciseID]);
                    }}
                    onExerciseUpdate={handleUpdateExercise}
                    editModalRefresh={editModalRefresh}
                  />
                )}
              </Box>
            );
          })}
        </Flex>
      </Box>
    );
  },
);

export default React.memo(ExerciseList);
