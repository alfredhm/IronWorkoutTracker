import React, { useEffect, useState } from 'react'
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

const EditSessionModal = ({ handleClose, data }) => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [exercises, setExercises] = useState([]);
    const [isOn, setIsOn] = useState(false);
    const [refresh, setRefresh] = useState(0)

    const auth = useAuthUser();
    const uid = auth()?.uid; 
    const navigate = useNavigate(); 

    const initialValues = {
        userId: uid || "",
        name: data.name || "",
        focusGroup: data.focusGroup || [],
        notes: data.notes || "",
        durationSec: data.durationSec || 0,
        exercises: data.exercises || [],
        isTemplate: data.isTemplate || isOn
    }

    const WorkoutSessionSchema = Yup.object().shape({
        name: Yup.string()
          .max(50, 'Name cannot exceed 50 characters.')
          .optional(),
        focusGroup: Yup.array()
          .of(Yup.string().oneOf(muscleGroups, 'Invalid muscle group'))
          .optional(),
        workoutTemplate: Yup.string(),
        exercises: Yup.array().of(Yup.string()),
        durationSec: Yup.number()
          .positive('Duration must be a positive number.')
          .integer('Duration must be an integer.')
          .optional(),
        notes: Yup.string()
          .max(50, 'Notes cannot exceed 50 characters.')
          .optional(),
    });

    const onSubmit = async (values) => {
        console.log("a")
        setError('')
        setLoading(true)

        if (JSON.stringify(values) === JSON.stringify(initialValues)) {
            handleClose()
            setLoading(false)
            return
        }

        values.userId = uid;

        try {
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

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validationSchema: WorkoutSessionSchema
    })

    const handleSecondChildClose = () => {
        setRefresh(prev => prev + 1)
    }

    const handleChildTimeChange = (data) => {
        formik.setFieldValue('durationSec', data);
    };

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

    }, [uid, navigate, formik.values.handleChildTimeChange]);

    return (
        <Box width="100%" display="flex" flexDirection="column">
            <Heading fontSize={{ base: "x-large", md: "xx-large" }} color="white">{formik.values.name}</Heading>
            <Center>
                <Center width="100%" color="white" mt={5} borderRadius="10px" display="flex" flexDirection="column">
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <FormControl>
                            <FocusSelect formik={formik} />
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
                        <TimeSlider onTimeChange={handleChildTimeChange} />
                        <ExerciseList session={true} workoutID={data._id} refresh={refresh}  />
                        <AddExercise onSecondChildClose={handleSecondChildClose} session={true} workoutID={data._id} />
                        <FormControl>
                        </FormControl>
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

export default EditSessionModal;
