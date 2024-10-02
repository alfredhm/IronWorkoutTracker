import React, { useEffect, useState } from 'react'
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

const EditWorkoutModal = ({ handleClose, data }) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);

    const auth = useAuthUser();
    const uid = auth()?.uid;
    const navigate = useNavigate();

    const initialValues = {
        name: data.name || "",
        focusGroup: data.focusGroup || [],
        notes: data.notes || "",
        exercises: data.exercises || [],
    }

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

    const onSubmit = async (values) => {
        setError('');
        setLoading(true);

        if (JSON.stringify(values) === JSON.stringify(initialValues)) {
            handleClose()
            setLoading(false)
            return
        }

        values.userId = uid;

        try {
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

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validationSchema: WorkoutSchema
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
                        <AddExercise exercises={exercises} />
                        <Button type="submit" isLoading={loading} bgColor="gray.600" color="white" my={2} py={5} px={8}>
                            Done
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

export default EditWorkoutModal;
