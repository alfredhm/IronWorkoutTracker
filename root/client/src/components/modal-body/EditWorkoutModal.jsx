import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useFormik } from "formik";
import axios from "axios";
import muscleGroups from "../../resources/muscle-groups";
import * as Yup from "yup";
import ErrorModal from "../ErrorModal";
import { useLocation } from "react-router-dom";
import WorkoutEditorForm from "./WorkoutEditorForm";

const EditWorkoutModal = forwardRef(
  (
    {
      closeWorkoutList,
      selectedWorkout,
      setTabIndex,
      setStartedWorkout,
      refreshWorkouts,
      handleDeleteWorkout,
      setDeletedWorkoutId,
    },
    ref,
  ) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const exerciseListRef = useRef();
    const exerciseRefs = useRef([]);

    const location = useLocation();
    const userState = location.state;
    const uid = userState.uid;

    // Initial values for other fields, stored in state
    const [workoutFields, setWorkoutFields] = useState({
      name: selectedWorkout.name || "",
      focusGroup: selectedWorkout.focusGroup || [],
      notes: selectedWorkout.notes || "",
    });

    // Initial values used for formik and checking if anything has been edited
    const initialValues = {
      name: workoutFields.name || "",
      focusGroup: workoutFields.focusGroup || [],
      notes: workoutFields.notes || "",
      exercises: exercises || [],
    };

    // Schema for a workout for front-end validation
    const WorkoutSchema = Yup.object().shape({
      name: Yup.string()
        .max(50, "Name cannot exceed 50 characters.")
        .optional(),
      focusGroup: Yup.array()
        .of(Yup.string().oneOf(muscleGroups, "Invalid muscle group"))
        .optional(),

      exercises: Yup.array().of(
        Yup.object({
          name: Yup.string(),
          _id: Yup.string().required("Exercise ID is required."),
          __v: Yup.number().required("Version number is required."),
          userId: Yup.string().required("User ID is required."),
          sets: Yup.array().of(
            Yup.object({
              weight: Yup.number(),
              reps: Yup.number(),
              notes: Yup.string().optional(),
            }),
          ),
        }),
      ),
      notes: Yup.string()
        .max(500, "Notes cannot exceed 240 characters.")
        .optional(),
    });

    // Submit function for formik
    const onSubmit = async (values) => {
      setError("");
      setLoading(true);
      try {
        // Construct payload without modifying exercises unless specified
        const updatedValues = {
          userId: uid,
          name: values.name,
          focusGroup: values.focusGroup,
          notes: values.notes,
          exercises: exercises.map((exercise) => exercise._id),
        };

        // Update workout
        await axios.put(
          `http://localhost:5000/api/workouts/${selectedWorkout._id}`,
          updatedValues,
        );

        // Call saveSetsToDatabase on each Exercise component using refs
        await Promise.all(
          exerciseRefs.current.map((ref) => ref?.saveSetsToDatabase?.()),
        );

        // Persist deleted exercises
        await exerciseListRef.current?.persistDeletedExercises?.();

        formik.resetForm();
        await closeWorkoutList();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Formik creation
    const formik = useFormik({
      initialValues: initialValues,
      onSubmit: onSubmit,
      validationSchema: WorkoutSchema,
      enableReinitialize: true,
    });

    // Function to fetch latest workout data and update state
    const loadWorkoutData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/workouts/${selectedWorkout._id}`,
        );
        const {
          name,
          focusGroup,
          notes,
          exercises: fetchedExercises,
        } = response.data;
        setWorkoutFields({ name, focusGroup, notes });
        setExercises(fetchedExercises); // Sync exercises with latest data
      } catch (err) {
        console.error("Error loading workout data:", err);
      }
    };

    const handleStartWorkout = async () => {
      try {
        await loadWorkoutData();

        // Ensure validation completes before submitting
        await formik.validateForm();

        // Step 1: Duplicate each exercise to create independent entries for this session
        const duplicatedExerciseIds = [];
        for (let exercise of exercises) {
          const duplicatedExercise = await axios.post(
            `http://localhost:5000/api/exercises`,
            {
              userId: uid,
              name: exercise.name,
              category: exercise.category || [],
              description: exercise.description,
              focusGroup: exercise.focusGroup,
              numOfSets: exercise.numOfSets,
            },
          );
          duplicatedExerciseIds.push(duplicatedExercise.data._id);
        }

        // Step 2: Create the workout session with duplicated exercise IDs
        const res = await axios.post(
          `http://localhost:5000/api/workoutsessions`,
          {
            workoutTemplate: selectedWorkout._id,
            name: formik.values.name?.trim() || selectedWorkout.name,
            focusGroup: formik.values.focusGroup,
            notes: formik.values.notes,
            userId: uid,
            exercises: duplicatedExerciseIds, // Use duplicated exercises here
          },
        );

        // Step 3: Create sets for each duplicated exercise in the workout session
        for (let i = 0; i < duplicatedExerciseIds.length; i++) {
          let setIds = [];
          for (let j = 0; j < formik.values.exercises[i].numOfSets; j++) {
            const response = await axios.post(
              `http://localhost:5000/api/sets`,
              {
                exerciseId: duplicatedExerciseIds[i],
                userId: uid,
                sessionId: res.data._id,
                weight: 0,
                reps: 0,
                notes: "",
                bodyWeight: false,
                restTimeSec: 0,
                ghost: false,
              },
            );
            setIds.push(response.data._id);
          }
          await axios.put(
            `http://localhost:5000/api/exercises/${duplicatedExerciseIds[i]}`,
            {
              userId: uid,
              name: formik.values.exercises[i].name,
              description: formik.values.exercises[i].description,
              focusGroup: formik.values.exercises[i].focusGroup,
              numOfSets: formik.values.exercises[i].numOfSets,
              sets: setIds,
            },
          );
        }

        await closeWorkoutList();
        setTabIndex(0);
        setStartedWorkout(res.data);
        refreshWorkouts();
      } catch (err) {
        setError(err.message);
      }
    };

    const memoizedEditModalRefresh = useCallback(
      () => setRefresh((prev) => prev + 1),
      [],
    );

    useEffect(() => {
      const fetchExercises = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/api/workouts/${selectedWorkout._id}`,
          );
          const exerciseIDs = response.data.exercises;

          // Fetch each exercise’s details by ID
          const fetchedExercises = await Promise.all(
            exerciseIDs.map(async (exerciseID) => {
              try {
                const exerciseResponse = await axios.get(
                  `http://localhost:5000/api/exercises/${exerciseID}`,
                );
                return exerciseResponse.data;
              } catch {
                return null;
              }
            }),
          );
          setExercises(
            fetchedExercises.filter((exercise) => exercise !== null),
          );
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchExercises();
    }, [selectedWorkout]);

    useImperativeHandle(ref, () => ({
      submitForm: formik.submitForm,
    }));

    return (
      <>
        {error && (
          <ErrorModal
            isOpen={error.length > 0}
            onClose={() => setError("")}
            errorMessage={error}
          />
        )}
        <WorkoutEditorForm
          error={error}
          exerciseListRef={exerciseListRef}
          exerciseRefs={exerciseRefs}
          exercises={exercises}
          formik={formik}
          isLoading={loading}
          onDeleteWorkout={handleDeleteWorkout}
          onStartWorkout={handleStartWorkout}
          onSubmit={formik.handleSubmit}
          editModalRefresh={refresh}
          refreshModal={memoizedEditModalRefresh}
          selectedWorkout={selectedWorkout}
          setDeletedWorkoutId={setDeletedWorkoutId}
          setExercises={setExercises}
          workoutId={selectedWorkout._id}
        />
      </>
    );
  },
);

export default EditWorkoutModal;
