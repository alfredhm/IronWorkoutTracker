import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
    Box, VStack, Text, Center, 
    FormControl, Input, Textarea, 
    Button, Heading,
    Flex,
} from '@chakra-ui/react';
import { useFormik } from "formik"
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import FocusSelect from '../FocusSelect';
import muscleGroups from '../../resources/muscle-groups';
import * as Yup from 'yup'
import AddExercise from '../AddExercise';
import ExerciseList from '../ExerciseList';

const EditWorkoutModal = forwardRef(({ closeWorkoutList, selectedWorkout, setTabIndex, setStartedWorkout, refreshWorkouts }, ref) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);
    const [refresh, setRefresh] = useState(0)

    const exerciseListRef = useRef()
    const exerciseRefs = useRef([])

    // Grabs the id of the current user
    const auth = useAuthUser();
    const uid = auth()?.uid;

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
    }

    // Schema for a workout for front-end validation
    const WorkoutSchema = Yup.object().shape({
        name: Yup.string()
          .max(50, 'Name cannot exceed 50 characters.')
          .optional(),
        focusGroup: Yup.array()
          .of(Yup.string().oneOf(muscleGroups, 'Invalid muscle group'))
          .optional(),

        exercises: Yup.array().of(Yup.object({
            name: Yup.string(),
            _id: Yup.string().required('Exercise ID is required.'),
            __v: Yup.number().required('Version number is required.'),
            userId: Yup.string().required('User ID is required.'),
            sets: Yup.array().of(Yup.object({
                weight: Yup.number(),
                reps: Yup.number(),
                notes: Yup.string().optional(),
            })),
        })),
        notes: Yup.string()
          .max(500, 'Notes cannot exceed 240 characters.')
          .optional(),
    });

    // Submit function for formik
    const onSubmit = async (values) => {
        setError('');
        setLoading(true);

        try {
            // Construct payload without modifying exercises unless specified
            const updatedValues = {
                userId: uid,
                name: values.name,
                focusGroup: values.focusGroup,
                notes: values.notes,
            };

            // Update workout
            await axios.put(
                `http://localhost:5000/api/workouts/${selectedWorkout._id}`,
                updatedValues
            );

            // Call saveSetsToDatabase on each Exercise component using refs
            await Promise.all(exerciseRefs.current.map(ref => ref?.saveSetsToDatabase?.()));

            // Persist deleted exercises
            await exerciseListRef.current?.persistDeletedExercises?.();

            formik.resetForm();
            closeWorkoutList();
        } catch (err) {
            setError(err.message);
            console.log("Error: ", err);
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
            const response = await axios.get(`http://localhost:5000/api/workouts/${selectedWorkout._id}`);
            const { name, focusGroup, notes, exercises: fetchedExercises } = response.data;                
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
                const duplicatedExercise = await axios.post(`http://localhost:5000/api/exercises`, {
                    userId: uid,
                    name: exercise.name,
                    description: exercise.description,
                    focusGroup: exercise.focusGroup,
                    numOfSets: exercise.numOfSets,
                });
                duplicatedExerciseIds.push(duplicatedExercise.data._id);
            }
    
            // Step 2: Create the workout session with duplicated exercise IDs
            const res = await axios.post(`http://localhost:5000/api/workoutsessions`, {
                workoutTemplate: selectedWorkout._id,
                name: workoutFields.name,
                focusGroup: workoutFields.focusGroup,
                notes: workoutFields.notes,
                userId: uid,
                exercises: duplicatedExerciseIds, // Use duplicated exercises here
            });
    
            // Step 3: Create sets for each duplicated exercise in the workout session
            for (let i = 0; i < duplicatedExerciseIds.length; i++) {
                for (let j = 0; j < formik.values.exercises[i].numOfSets; j++) {
                    await axios.post(`http://localhost:5000/api/sets`, {
                        exerciseId: duplicatedExerciseIds[i],
                        sessionId: res.data._id,
                        weight: 0,
                        reps: 0,
                        notes: "",
                        bodyWeight: false,
                        restTimeSec: 0,
                        ghost: false
                    });
                }
            }
            
            closeWorkoutList();
            setTabIndex(0);
            setStartedWorkout(res.data);
            refreshWorkouts();
        } catch (err) {
            setError(err.message);
            console.log(err);
        }
    };

    const memoizedEditModalRefresh = useCallback(() => setRefresh((prev) => prev + 1), []);

    // Adjusts textarea height based on content
    const textareaRef = useRef();
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [formik.values.notes]);
    
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/workouts/${selectedWorkout._id}`);
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
                setExercises(fetchedExercises.filter((exercise) => exercise !== null));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchExercises();
    }, [selectedWorkout])

    useImperativeHandle(ref, () => ({
        submitForm: formik.submitForm,
    }));

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">{formik.values.name}</Heading>
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <FocusSelect focusValues={formik.values.focusGroup} formik={formik} />
                        <FormControl p={1} pl={2} pt={2} bg="gray.600" borderRadius="10px">
                            <Input
                                placeholder='Name'
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                clearonescape="true"
                                bgColor="gray.600"
                                height="35px"
                                type="name"
                                autoComplete='false'
                                paddingLeft="10px"
                                border={0}
                                borderBottom={'1px solid gray'}
                                borderRadius={0}
                                _focus={{ boxShadow: 'none' }}
                            />
                            <Textarea
                                placeholder='Notes...'
                                name="notes"
                                rows={1}
                                maxHeight="150px"
                                value={formik.values.notes}
                                ref={textareaRef}
                                onChange={(e) => formik.handleChange(e)}
                                bgColor="gray.600"
                                paddingLeft="10px"
                                mt={1}
                                border={0}
                                borderRadius={0}
                                _focus={{ boxShadow: 'none' }}
                                />
                        </FormControl>
                        <ExerciseList 
                            session={false} 
                            workoutID={selectedWorkout._id} 
                            editModalRefresh={refresh}
                            exerciseRefs={exerciseRefs}
                            ref={exerciseListRef}
                            exercises={exercises}
                            setExercises={setExercises}
                        />
                        <Flex w="100%" justify='space-between'>
                            <AddExercise 
                                refreshModal={memoizedEditModalRefresh} 
                                exercises={exercises}
                                setExercises={setExercises} 
                                session={false} 
                                workoutID={selectedWorkout._id}
                            />
                            <Button onClick={handleStartWorkout}>Start Workout</Button>
                        </Flex>
                        <Box>
                            <Text textAlign="center" color="red.300">{error}</Text>
                        </Box>
                    </VStack>
                </Center>
            </Center>
        </Box>
    )
})

export default EditWorkoutModal;
