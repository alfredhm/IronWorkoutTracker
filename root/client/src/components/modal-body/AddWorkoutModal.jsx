import React, { useEffect, useState } from 'react'
import {
    Box, VStack, Text, Center, FormControl, Input, Textarea,
    Button,
} from '@chakra-ui/react';
import { useFormik } from "formik"
import { useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import FocusSelect from '../FocusSelect';
import muscleGroups from '../../resources/muscle-groups';
import * as Yup from 'yup'
import AddExercise from '../AddExercise';

const AddWorkoutModal = ({ handleClose }) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([])

    const auth = useAuthUser()
    const uid = auth()?.uid;
    const navigate = useNavigate();

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

    const onSubmit = async (values) => {
        setError('')
        setLoading(true) 

        values.userId = uid;

        if (!values.name) {
            values.name = "Unnamed Workout";
        }
        
        try {
            let workoutValues = { ...values }
            delete workoutValues.durationSec
            await axios.post(
                "http://localhost:5000/api/workouts",
                workoutValues
            )
            setLoading(false)
            handleClose()
            formik.resetForm()
        } catch (err) {
            setError(err.message)
            setLoading(false);
        }
    }

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

    useEffect(() => {
        if (!uid) {
            navigate('/login');
            return;
        }

        const getPresets = async () => {
            try {
                const presetRes = await axios.get(`http://localhost:5000/api/exercises`);
                const presetExercises = presetRes.data.filter(exercise => exercise.isPreset);

                return presetExercises;
            } catch (err) {
                setError(err.message);
                return [];
            }
        };

        const getUserExercises = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/exercises/user/${uid}`);
                const userExercises = response.data.filter(exercise => exercise.isTemplate);

                return userExercises;
            } catch (err) {
                setError(err.message);
                return [];
            }
        };

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

        loadExercises();
    }, [uid, navigate]);

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" gap="10px" width="100%" onSubmit={formik.handleSubmit}>
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
                        <AddExercise setExercises={setExercises} session={false} />
                        <FocusSelect formik={formik} />
                        <Button
                            type="submit"
                            isLoading={loading}
                            bgColor="gray.600"
                            color="white"
                            my={2}
                            py={5}
                            px={8}
                        >
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
}

export default AddWorkoutModal;
