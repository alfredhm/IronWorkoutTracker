import React, { forwardRef, useEffect, useState } from 'react'
import {
    Box, VStack, Text, Center, FormControl, Input, Textarea,
    Button, FormLabel, Switch,
} from '@chakra-ui/react';
import { useFormik } from "formik"
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom';
import TimeSlider from '../TimeSlider'
import axios from 'axios'
import FocusSelect from '../FocusSelect';
import muscleGroups from '../../resources/muscle-groups';
import * as Yup from 'yup'
import AddExercise from '../AddExercise';
import ExerciseList from '../ExerciseList';

const AddSessionModal = forwardRef(({ handleClose }, ref) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);
    const [workoutID, setWorkoutID] = useState("")
    const [isOn, setIsOn] = useState(false);
    const [refresh, setRefresh] = useState(0)

    // Grabs the id of the current user
    const auth = useAuthUser();
    const uid = auth()?.uid; 
    const navigate = useNavigate();

    // Schema for a workout session for front-end validation
    const WorkoutSessionSchema = Yup.object().shape({
        name: Yup.string()
          .max(50, 'Name cannot exceed 50 characters.')
          .default('Unnamed Session')
          .notRequired(),
        focusGroup: Yup.array()
          .of(Yup.string().oneOf(muscleGroups, 'Invalid muscle group'))
          .notRequired(),
        workoutTemplate: Yup.string(),
        exercises: Yup.array().of(Yup.string()),
        durationSec: Yup.number()
          .optional()
          .default(0)
          .integer('Duration must be an integer.'),
        notes: Yup.string()
          .max(50, 'Notes cannot exceed 50 characters.')
          .notRequired(),
    });

    
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

            
    // Modify createNewWorkout to accept parameters
    const createNewWorkout = (extraValues) => {
        const values = { ...formik.values, ...extraValues };
        onSubmit(values, true); // true indicates it was triggered from the child component
        setRefresh((prev) => prev + 1)
    };

    const handleSetWorkoutID = (workoutID) => {
        setWorkoutID(workoutID)
        setRefresh((prev) => prev + 1)
    }

    // Formik Submit function
    const onSubmit = async (values, fromExercise = false) => {
        setError('');
        setLoading(true);
        console.log(values)
        values.userId = uid;

        // If the name is blank, set it to "Unnamed Workout"
        if (!values.name) {
            values.name = "Unnamed Workout";
        }

        try {
            // If user wants to save the session as a template, it is saved as a workout
            if (values.isTemplate) {
                let workoutValues = { ...values };
                delete workoutValues.durationSec;
                await axios.post(
                    "http://localhost:5000/api/workouts",
                    workoutValues
                );
            }

            // Workout Session is saved and form is closed and reset
            let sessionValues = { ...values };
            delete sessionValues.isTemplate;
            await axios.post(
                "http://localhost:5000/api/workoutsessions",
                sessionValues
            );
            setLoading(false);
            if (!fromExercise) {
                handleClose();
            } else {
                setRefresh((prev) => prev + 1)
            }
            formik.resetForm();
        
        // Error handling
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    // Formik creation
    const formik = useFormik({
        initialValues: {
            name: "",
            focusGroup: [],
            notes: "",
            durationSec: 0,
            exercises: [],
            isTemplate: isOn,
        },
        onSubmit: onSubmit,
        validationSchema: WorkoutSessionSchema,
    });

    useEffect(() => {
        // If there is no uid, the user is not logged in and is redirected to the login page
        if (!uid) {
            navigate('/login');
            return;
        }
    }, [uid, navigate, refresh]);

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" width="100%" onSubmit={(e) => formik.handleSubmit}>
                        <FormControl pt={4}>
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
                                value={formik.values.notes}
                                onChange={formik.handleChange}
                                bgColor="gray.600" 
                                maxHeight="120px"
                                paddingLeft="10px"
                            />
                        </FormControl>
                        <TimeSlider onTimeChange={handleChildTimeChange} />
                        <ExerciseList ref={ref} handleModalClose={handleClose} session={true} refresh={refresh}/>
                        <AddExercise workoutID={workoutID} setWorkoutID={handleSetWorkoutID} createNewWorkout={createNewWorkout} onSecondChildClose={handleSecondChildClose} session={true} />
                        <FocusSelect formik={formik} />
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
                        <Button type="submit" isLoading={loading} bgColor="gray.600" color="white" my={2} py={5} px={8}>
                            Submit
                        </Button>
                        <Box>
                            <Text textAlign="center" color="red.300">{error}</Text>
                        </Box>
                    </VStack>
                </Center>
            </Center>
        </Box>
    )
})

export default AddSessionModal;
