import React, { useEffect, useRef, useState } from 'react'
import {
    Box, VStack, Text, Center, FormControl, Input, Textarea,
    Button,
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
import ExerciseTemplate from '../ExerciseTemplate';

const AddWorkoutModal = ({ handleClose }) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [updated, setUpdated] = useState(false)
    const [exercises, setExercises] = useState([])
    const [refresh, setRefresh] = useState(0)

    const textareaRef = useRef(null);
    const exerciseListRef = useRef(null);

    // Grabs the id of the current user
    const auth = useAuthUser()
    const uid = auth()?.uid;
    const navigate = useNavigate();

    // Schema for a workout for front-end validation
    const WorkoutSchema = Yup.object().shape({
        name: Yup.string()
          .max(50, 'Name cannot exceed 50 characters.')
          .default('Unnamed Workout')
          .notRequired(),
        focusGroup: Yup.array()
          .of(Yup.string().oneOf(muscleGroups, 'Invalid muscle group'))
          .notRequired(),
        exercises: Yup.array().of(Yup.string()),
        notes: Yup.string()
          .max(50, 'Notes cannot exceed 50 characters.')
          .notRequired(),
    });
    
    // Formik Submit function
    const onSubmit = async (values) => {
        setError('')
        setLoading(true) 
        values.userId = uid;
        console.log(values)

        // If the name is blank, set it to "Unnamed Workout"
        if (!values.name) {
            values.name = "Unnamed Workout";
        }
        
        try {
            // Saves workout and closes and resets form
            let workoutValues = { ...values }
            delete workoutValues.durationSec
            const res = await axios.post(
                "http://localhost:5000/api/workouts",
                workoutValues
            )
            handleSubmitExercises(res.data._id)
            setLoading(false)
            handleClose()
            formik.resetForm()
        } catch (err) {
            // Error handling
            console.log(err)
            setError(err.message)
            setLoading(false);
        }
    }

    // Formik creation
    const formik = useFormik({
        initialValues: {
            name: "",
            focusGroup: [],
            notes: "",
            exercises: [],
        },
        onSubmit: onSubmit,
        validationSchema: WorkoutSchema,
    });


    const handleSubmitExercises = async (workoutID) => {
        try {
            // Save the exercises
            await Promise.all(
                exercises.map(async (exercise) => {
                    console.log(exercise)
                    const response = await axios.post(`http://localhost:5000/api/exercises`, exercise)
                    await axios.put(`http://localhost:5000/api/workouts/${workoutID}/exercises`, {
                        exerciseId: response.data._id
                    })
                })
            )
            setExercises([])
            setUpdated(true)
            setRefresh(prev => prev + 1)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }


    // Function to delete an exercise from the list
    const handleDeleteExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index))
    }

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

    // If there is no uid, the user is not logged in and is redirected to the login page
    useEffect(() => {
        if (!uid) {
            navigate('/login');
            return;
        }
        adjustHeight();
        console.log(exercises)
    }, [uid, navigate, updated, exercises]);

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" gap="10px" width="100%" onSubmit={formik.handleSubmit}>
                        <FormControl>
                            <FocusSelect focusValues={formik.values.focusGroup} formik={formik} />
                        </FormControl>
                        <FormControl p={1} pl={2} pt={2} bg="gray.600" borderRadius="10px">
                            <FormControl>
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
                                        border: 'none',
                                    }}
                                />
                            </FormControl>
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
                        <Box display={exercises.length === 0 ? "none" : "block"} py={2} bg='gray.600' w='100%' borderRadius={'10px'}>
                            <Flex flexDir="column"  w="100%">
                              {exercises.map((exercise, index) => 
                                  <ExerciseTemplate
                                    key={index}
                                    last={index === exercises.length - 1}
                                    exercise={exercise}
                                    onDeleteExercise={() => handleDeleteExercise(index)}
                                  />
                              )}
                            </Flex>
                        </Box>
                        <Flex w="100%" justifyContent="space-between">
                            <AddExercise 
                                exercises={exercises} 
                                setExercises={setExercises} 
                                onSecondChildClose={handleSecondChildClose} 
                                session={false} 
                            />
                            <Button
                                type="submit"
                                isLoading={loading}
                                my={2}
                                py={5}
                                px={8}
                            >
                                Submit
                            </Button>
                        </Flex>
                        <Box>
                            <Text textAlign="center" color="red.300">{error}</Text>
                        </Box>
                    </VStack>
                </Center>
            </Center>
        </Box>
    )
}

export default AddWorkoutModal;
