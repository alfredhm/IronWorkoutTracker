import { useEffect, useRef } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  Grid,
  Heading,
  IconButton,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import FocusSelect from "../FocusSelect";
import AddExercise from "../AddExercise";
import ExerciseList from "../ExerciseList";

const WorkoutEditorForm = ({
  error,
  exerciseListRef,
  exerciseRefs,
  exercises,
  formik,
  isLoading,
  onDeleteWorkout,
  onStartWorkout,
  onSubmit,
  editModalRefresh,
  refreshModal,
  selectedWorkout,
  setDeletedWorkoutId,
  setExercises,
  workoutId,
}) => {
  const textareaRef = useRef();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formik.values.notes]);

  return (
    <Box width="100%" display="flex" flexDirection="column">
      <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">
        {formik.values.name}
      </Heading>
      <Center>
        <Center
          width="100%"
          color="white"
          mt={5}
          display="flex"
          flexDirection="column"
        >
          <VStack as="form" width="100%" onSubmit={onSubmit}>
            <FocusSelect
              focusValues={formik.values.focusGroup}
              formik={formik}
            />
            <FormControl p={1} pl={2} pt={2} bg="gray.600" borderRadius="10px">
              <Input
                placeholder="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                clearonescape="true"
                bgColor="gray.600"
                height="35px"
                type="name"
                autoComplete="false"
                paddingLeft="10px"
                border={0}
                borderBottom="1px solid gray"
                borderRadius={0}
                _focus={{ boxShadow: "none" }}
                disabled={selectedWorkout.isTemplate}
              />
              <Textarea
                placeholder="Notes..."
                name="notes"
                rows={1}
                maxHeight="150px"
                value={formik.values.notes}
                ref={textareaRef}
                onChange={formik.handleChange}
                bgColor="gray.600"
                paddingLeft="10px"
                mt={1}
                border={0}
                borderRadius={0}
                _focus={{ boxShadow: "none" }}
                disabled={selectedWorkout.isTemplate}
              />
            </FormControl>
            <ExerciseList
              session={false}
              workoutID={workoutId}
              editModalRefresh={editModalRefresh}
              exerciseRefs={exerciseRefs}
              ref={exerciseListRef}
              exercises={exercises}
              setExercises={setExercises}
            />
            <Flex w="100%" direction="column" gap={2}>
              <Grid
                w="100%"
                templateColumns="minmax(0, 1fr) 44px minmax(0, 1fr)"
                gap={3}
                alignItems="center"
              >
                <AddExercise
                  buttonWidth="100%"
                  refreshModal={refreshModal}
                  exercises={exercises}
                  setExercises={setExercises}
                  session={false}
                  workoutID={workoutId}
                />
                <IconButton
                  type="button"
                  aria-label="Delete workout"
                  icon={<DeleteIcon />}
                  variant="ghost"
                  color="gray.400"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeletedWorkoutId(selectedWorkout._id);
                    onDeleteWorkout();
                  }}
                />
                <Button
                  type="button"
                  w="100%"
                  whiteSpace="nowrap"
                  onClick={onStartWorkout}
                >
                  Start Workout
                </Button>
              </Grid>
              <Button
                type="submit"
                w="100%"
                colorScheme="blue"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Save
              </Button>
            </Flex>
            <Box>
              <Text textAlign="center" color="red.300">
                {error}
              </Text>
            </Box>
          </VStack>
        </Center>
      </Center>
    </Box>
  );
};

export default WorkoutEditorForm;
