import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
    Box, VStack, Text, 
    Center, FormControl, 
    Input, Textarea, Heading,
    Button,
    Flex,
    Spinner,
    ModalCloseButton,
} from '@chakra-ui/react';
import { useFormik } from "formik"
import axios from 'axios'
import muscleGroups from '../../resources/muscle-groups';
import * as Yup from 'yup'
import FocusSelect from '../FocusSelect';
import AddExercise from '../AddExercise';
import ExerciseList from '../ExerciseList';
import ErrorModal from '../ErrorModal';
import SwipeableList from '../SwipeableList';
import { DeleteIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';

const EditSessionModal = forwardRef(({ closeSessionList, selectedWorkout, handleDeleteSession, handleEndSession, noRefreshClose, setDeletedWorkoutId }, ref) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);
    const [refresh, setRefresh] = useState(0)

    const exerciseListRef = useRef()
    const exerciseRefs = useRef([])

    const location = useLocation()
    const userState = location.state
    const uid = userState.uid
    
    // Initial values used for formik and checking if anything has been edited
    const initialValues = {
        userId: uid || "",
        name: selectedWorkout.name || "",
        focusGroup: selectedWorkout.focusGroup || [],
        notes: selectedWorkout.notes || "",
        durationSec: selectedWorkout.durationSec || 0,
    }

    // Schema for a workout session for front-end validation
    const WorkoutSessionSchema = Yup.object().shape({
        name: Yup.string()
          .max(50, 'Name cannot exceed 50 characters.'),
        focusGroup: Yup.array()
          .of(Yup.string().oneOf(muscleGroups, 'Invalid muscle group')),
        workoutTemplate: Yup.string(),
        durationSec: Yup.number()
          .integer('Duration must be an integer.')
          .optional(),
        notes: Yup.string()
          .max(450, 'Notes cannot exceed 450 characters.'),
    });

    // Submit function for formik
    const onSubmit = async (values) => {
        setError('')
        setLoading(true)    


        try {
            await axios.put(
                `http://localhost:5000/api/workoutsessions/${selectedWorkout._id}`,{
                ...values,
                userId: uid,
                exercises: exercises.map(exercise => exercise._id),
            
            })

            // Call saveSetsToDatabase on each Exercise component using refs
            await Promise.all(exerciseRefs.current.map(ref => ref?.saveSetsToDatabase?.()));

            // Persist deleted exercises
            await exerciseListRef.current?.persistDeletedExercises?.();

            formik.resetForm()
            closeSessionList()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)   
        }

    }

    // Formik creation
    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validationSchema: WorkoutSessionSchema,
        enableReinitialize: true,
        validateOnChange: true
       
    })

    const memoizedEditModalRefresh = useCallback(() => setRefresh((prev) => prev + 1), []);

    // Adjusts textarea height based on content
    const textareaRef = useRef();
    useEffect(() => {
        if (textareaRef.current) {
            // Temporarily store scrollHeight and apply the new height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [formik.values.notes]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/workoutsessions/${selectedWorkout._id}`);
                const exerciseIDs  = response.data.exercises;
        
                // Fetch each exercise’s details by ID
                const fetchedExercises = await Promise.all(
                    exerciseIDs.map(async (exerciseID) => {
                        try {
                            const exerciseResponse = await axios.get(`http://localhost:5000/api/exercises/${exerciseID}`);
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
        <>
            {error && 
                <ErrorModal isOpen={error.length > 0} onClose={() => setError("")} errorMessage={error} />
            }
            {loading && <Center w="100%" h="100%" position="absolute" zIndex="20"><Spinner size="xl" /></Center>}
            <Box width="100%" display="flex" flexDirection="column">
                <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">{formik.values.name}</Heading>
                <ModalCloseButton color="white" />
                <Center>
                    <Center width="100%" color="white" mt={5}  display="flex" flexDirection="column">
                        <VStack width="100%" onSubmit={formik.handleSubmit}>
                            <FormControl>
                                <FocusSelect formik={formik} />
                                {formik.touched.focusGroup && formik.errors.focusGroup && (
                                    <Text fontSize="sm" color="red.400">{formik.errors.focusGroup}</Text>
                                )}
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
                                    _focus={{ boxShadow: 'none' }}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <Text fontSize="sm" color="red.400">{formik.errors.name}</Text>
                                )}
                                <FormControl>
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
                                    {formik.touched.notes && formik.errors.notes && (
                                        <Text fontSize="sm" color="red.400">{formik.errors.notes}</Text>
                                    )}
                                </FormControl>
                            </FormControl>
                            <ExerciseList 
                                session={true} 
                                workoutID={selectedWorkout._id} 
                                editModalRefresh={refresh}  
                                exerciseRefs={exerciseRefs}
                                ref={exerciseListRef}
                                exercises={exercises}
                                setExercises={setExercises}
                            />
                            <Flex w="100%" justifyContent="space-between" align="center">
                                <AddExercise 
                                    refreshModal={memoizedEditModalRefresh} 
                                    exercises={exercises}
                                    setExercises={setExercises}
                                    session={true} 
                                    workoutID={selectedWorkout._id} 
                                />
                                <Box  
                                    p={3} bg="gray.400" 
                                    borderRadius="50%" 
                                    border="3px solid white"
                                    _active={{ bg: "red.500" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletedWorkoutId(selectedWorkout._id);
                                        handleDeleteSession();
                                    }}
                                >
                                    <DeleteIcon color="white" boxSize={6} />                                 
                                </Box>
                                <Button onClick={closeSessionList} w="124px">
                                    Save
                                </Button>
                            </Flex>
                            {!selectedWorkout.durationSec && 
                                <Button 
                                    w="100%" 
                                    mt={2} 
                                    color="white" 
                                    bg="red.400"
                                    onClick={() => {
                                        handleEndSession(selectedWorkout._id)
                                        noRefreshClose()
                                    }}
                                >
                                    End Workout
                                </Button>
                            }
                            <Box>
                                <Text textAlign="center" color="red.300">{error}</Text>
                            </Box>
                        </VStack>
                    </Center>
                </Center>
            </Box>
        </>
    )
})

export default EditSessionModal;
