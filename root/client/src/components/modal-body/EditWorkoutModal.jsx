import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
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

const EditWorkoutModal = forwardRef(({ handleClose, data }, ref) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);
    const [refresh, setRefresh] = useState(0)

    const textareaRef = useRef(null);
    const exerciseListRef = useRef(null);

    // Grabs the id of the current user
    const auth = useAuthUser();
    const uid = auth()?.uid;
    const navigate = useNavigate();

    // Initial values used for formik and checking if anything has been edited
    const initialValues = {
        name: data.name || "",
        focusGroup: data.focusGroup || [],
        notes: data.notes || "",
        exercises: data.exercises || [],
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

        // If the values are unchanged, close form with no submission
        if (JSON.stringify(values) === JSON.stringify(initialValues)) {
            setLoading(false)
            return
        }

        values.userId = uid;
        values.exercises = values.exercises.map(exercise => exercise._id);

        try {
            // Update workout
            let workoutValues = { ...values }
            delete workoutValues.durationSec
            await axios.put(
                `http://localhost:5000/api/workouts/${data._id}`,
                workoutValues
            )
            setLoading(false);
            handleClose();
            formik.resetForm();
        } catch (err) {
            setError(err.message);
            setLoading(false);
            console.log("Error: ", err);
        }
    }

    // Formik creation
    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validationSchema: WorkoutSchema
    });

    /* 
        Function that responds to the closing of its child component, 
        the exercise list, creating a refresh of this page and its exercises
    */
    const handleSecondChildClose = () => {
        setRefresh(prev => prev + 1)
    }

    // Adjust height based on content
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to auto to get scrollHeight
            textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight
        }
    };

    const handleStartWorkout = async () => {
        console.log("Start workout");
        console.log(data)
        console.log(formik.values)

        try {
            // Ensure validation completes before submitting
            await formik.validateForm();

            
            const res = await axios.post(`http://localhost:5000/api/workoutsessions`, {
                workoutTemplate: data._id,
                name: data.name, 
                focusGroup: data.focusGroup,
                notes: data.notes,
                userId: uid,
                exercises: formik.values.exercises.map(exercise => exercise._id),
            })

            for (let i = 0; i < formik.values.exercises.length; i++) {
                for (let j = 0; j < formik.values.exercises[i].numOfSets; j++) {
                    await axios.post(`http://localhost:5000/api/sets`, {
                        exerciseId: formik.values.exercises[i]._id,
                        sessionId: res.data._id,
                        weight: 0,
                        reps: 0,
                        notes: "",
                        bodyWeight: false,
                        restTimeSec: 0,
                        ghost: false
                    })
                    console.log("Exercise: ", formik.values.exercises[i].name, "Set: ", j);
                }
            }
            console.log(formik.values.exercises)

            handleClose()

            // Redirect to workout session
        } catch (err) {
            setError(err.message);
            console.log(err)
        }

    }

    // Expose handleClose function to be accessed via the ref
    useImperativeHandle(ref, () => ({
        async handleClose() {
          console.log("handleClose in EditWorkoutModal called");
      
          // Ensure Exercise component handleClose is called first
          try {
            if (exerciseListRef.current) {
              await exerciseListRef.current.handleClose();
            }
          } catch (error) {
            console.error("Error in Exercise component handleClose:", error);
          } 
      
          // Ensure validation completes before submitting
          try {
            console.log("Validating form...");
            const res = await formik.validateForm();
            console.log(formik.values, res)
            console.log("Validation complete, submitting form.");
            const res1 = formik.handleSubmit();
            console.log(formik.values, res1)
          } catch (validationError) {
            console.error("Validation failed:", validationError);
          }
        },
    }), [formik]);

    useEffect(() => {
        // If there is no uid, the user is not logged in and is redirected to the login page
        if (!uid) {
            navigate('/login');
            return;
        }

        // Async function that fetches the preset exercises 
        const getPresets = async () => {
            try {
                // Filters all the preset exercises
                const presetRes = await axios.get(`http://localhost:5000/api/exercises`);
                const presetExercises = presetRes.data.filter(exercise => exercise.isPreset);

                return presetExercises;
            } catch (err) {
                setError(err.message);
                return [];
            }
        };

        // Async function that fetches the user's saved exercises
        const getUserExercises = async () => {
            try {
                // Filters all the user's exercises for the ones saved as a template
                const response = await axios.get(`http://localhost:5000/api/exercises/user/${uid}`);
                const userExercises = response.data.filter(exercise => exercise.isTemplate);

                return userExercises;
            } catch (err) {
                setError(err.message);
                return [];
            }
        };

        // Async function that calls both above functions to get all the exercises
        const loadExercises = async () => {
            setLoading(true);
            try {
                const [presetExercises, userExercises] = await Promise.all([getPresets(), getUserExercises()]);
                const combinedExercises = [...presetExercises, ...userExercises];
                setExercises(combinedExercises);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Reload exercises
        loadExercises();
        adjustHeight();
    }, [uid, navigate, formik.values]);

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">{formik.values.name}</Heading>
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <FormControl>
                            <FocusSelect focusValues={formik.values.focusGroup} formik={formik} />
                        </FormControl>
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
                                _focus={{
                                    outline: 'none',
                                    border: 'none'
                                }}
                            />
                           <FormControl>
                                <Textarea
                                    placeholder='Notes...'
                                    name="notes"
                                    rows={1}
                                    maxHeight="150px"
                                    value={formik.values.notes}
                                    ref={textareaRef}
                                    onChange={(e) => {
                                        formik.handleChange(e); // Update Formik value
                                        adjustHeight(); // Adjust textarea height
                                    }}
                                    bgColor="gray.600"
                                    paddingLeft="10px"
                                    mt={1}
                                    border={0}
                                    borderRadius={0}
                                />
                            </FormControl>
                        </FormControl>
                        <ExerciseList ref={exerciseListRef} session={false} workoutID={data._id} refresh={refresh} />
                        <Flex w="100%" justify='space-between'>
                            <AddExercise onSecondChildClose={handleSecondChildClose} setExercises={setExercises} session={false} workoutID={data._id}/>
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
