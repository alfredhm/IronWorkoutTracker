import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
    Box, VStack, Text, Center, FormControl, Input, Textarea,
    Button, FormLabel, Switch,
    Heading,
} from '@chakra-ui/react';
import { useFormik } from "formik"
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom';
import TimeSlider from '../TimeSlider'
import axios from 'axios'
import muscleGroups from '../../resources/muscle-groups';
import * as Yup from 'yup'
import FocusSelect from '../FocusSelect';
import AddExercise from '../AddExercise';
import ExerciseList from '../ExerciseList';

const EditSessionModal = forwardRef(({ handleClose, data }, ref) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);
    const [isOn, setIsOn] = useState(false);
    const [refresh, setRefresh] = useState(0)

    const exerciseListRef = useRef(null);

    // Grabs the id of the current user
    const auth = useAuthUser();
    const uid = auth()?.uid; 
    const navigate = useNavigate(); 

    // Initial values used for formik and checking if anything has been edited
    const initialValues = {
        userId: uid || "",
        name: data.name || "",
        focusGroup: data.focusGroup || [],
        notes: data.notes || "",
        durationSec: data.durationSec || 0,
        exercises: data.exercises || [],
        isTemplate: data.isTemplate || isOn
    }

    // Schema for a workout session for front-end validation
    const WorkoutSessionSchema = Yup.object().shape({
        name: Yup.string()
          .max(50, 'Name cannot exceed 50 characters.')
          .optional(),
        focusGroup: Yup.array()
          .of(Yup.string().oneOf(muscleGroups, 'Invalid muscle group'))
          .optional(),
        workoutTemplate: Yup.string(),
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
        durationSec: Yup.number()
          .integer('Duration must be an integer.')
          .optional(),
        notes: Yup.string()
          .max(50, 'Notes cannot exceed 50 characters.')
          .optional(),
    });

    // Submit function for formik
    const onSubmit = async (values) => {
        console.log("Submitting values:", values)
        setError('')
        setLoading(true)

        // If the values are unchanged, close form with no submission
        if (JSON.stringify(values) === JSON.stringify(initialValues)) {
            console.log('x')
            setLoading(false)
            return
        }

        values.userId = uid;
        values.exercises = values.exercises.map(exercise => exercise._id);

        try {
            // If user edits session to be saved as a template, save as workout
            if (values.isTemplate) {
                let workoutValues = { ...values }
                delete workoutValues.durationSec
                await axios.post(
                    `http://localhost:5000/api/workouts`,
                    workoutValues
                )
            }

            let sessionValues = { ...values }
            delete sessionValues.isTemplate

            // Update session
            await axios.put(
                `http://localhost:5000/api/workoutsessions/${data._id}`,
                sessionValues
            )
            setLoading(false)
            handleClose()
            formik.resetForm()

        } catch (err) {
            setError(err.message)
            setLoading(false);
            console.log("Error: ", err)
        }
    }

    // Formik creation
    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validationSchema: WorkoutSessionSchema
       
    })

    /* 
        Function that responds to the closing of its child component, 
        the exercise list, creating a refresh of this page and its exercises
    */
    const handleSecondChildClose = () => {
        setRefresh(prev => prev + 1)
    }

    // When the time changes, update the duration (input is a slider)
    const handleChildTimeChange = (data) => {
        formik.setFieldValue('durationSec', data);
    };

    // Expose handleClose function to be accessed via the ref
    useImperativeHandle(ref, () => ({
        async handleClose() {
          console.log("handleClose in EditSessionModal called");
      
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
    }, [uid, navigate, formik.values]);
    

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">{formik.values.name}</Heading>
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <FormControl>
                            <FocusSelect focusValues={formik.values.focusGroup} formik={formik} />
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
                            />
                        </FormControl>
                        <FormControl>
                            <Textarea
                                placeholder='Notes...'
                                name="notes"
                                rows={1}
                                minHeight="40px"
                                maxHeight="150px"
                                value={formik.values.notes}
                                onChange={formik.handleChange}
                                bgColor="gray.600"
                                paddingLeft="10px"
                            />
                        </FormControl>
                        <TimeSlider initial={typeof formik.values.durationSec === "number" ? formik.values.durationSec : 0} onTimeChange={handleChildTimeChange} />
                        <ExerciseList ref={exerciseListRef} session={true} workoutID={data._id} refresh={refresh}  />
                        <AddExercise onSecondChildClose={handleSecondChildClose} session={true} workoutID={data._id} />
                        {!data.isTemplate && (
                            <FormControl pt={0} display="flex" justifyContent="center">
                                <FormLabel htmlFor="switch" mb="0" color="white">
                                    Save as a Routine
                                </FormLabel>
                                <Switch
                                    id="switch"
                                    size="lg"
                                    colorScheme="gray"
                                    isChecked={isOn}
                                    onChange={(e) => {
                                        setIsOn(e.target.checked);
                                        formik.setFieldValue('isTemplate', e.target.checked);
                                    }}
                                />
                            </FormControl>
                        )}
                        <Box>
                            <Text textAlign="center" color="red.300">{error}</Text>
                        </Box>
                        <Button type='submit'>Done</Button>
                    </VStack>
                </Center>
            </Center>
        </Box>
    )
})

export default EditSessionModal;
