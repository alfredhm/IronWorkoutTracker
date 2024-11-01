import React, { forwardRef, useEffect, useState } from 'react'
import {
    Box, VStack, Text, Center, 
    FormControl, Input, Textarea, 
    Button, Heading,
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
        exercises: Yup.array().of(Yup.string()),
        notes: Yup.string()
          .max(50, 'Notes cannot exceed 50 characters.')
          .optional(),
    });

    // Submit function for formik
    const onSubmit = async (values) => {
        setError('');
        setLoading(true);

        // If the values are unchanged, close form with no submission
        if (JSON.stringify(values) === JSON.stringify(initialValues)) {
            handleClose()
            setLoading(false)
            return
        }

        values.userId = uid;

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
    }, [uid, navigate, formik.values.name]);

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">{formik.values.name}</Heading>
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <FormControl>
                            <FocusSelect formik={formik} focusValues={formik.values.focusGroup} />
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
                                aria-hidden="false"
                            />
                        </FormControl>
                        <FormControl>
                            <Textarea
                                placeholder='Notes...'
                                name="notes"
                                value={formik.values.notes}
                                onChange={formik.handleChange}
                                bgColor="gray.600"
                                maxHeight="120px"
                                paddingLeft="10px"
                            />
                        </FormControl>
                        <ExerciseList ref={ref} session={false} workoutID={data._id} refresh={refresh} />
                        <AddExercise onSecondChildClose={handleSecondChildClose} setExercises={setExercises} session={false} workoutID={data._id}/>
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
