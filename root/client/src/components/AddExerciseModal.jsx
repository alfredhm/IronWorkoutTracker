import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, FormControl, Input, Flex, Heading, Text, Switch, Button, Box, Select } from '@chakra-ui/react';
import axios from 'axios';
import * as Yup from 'yup';
import muscleGroups from '../resources/muscle-groups';
import { useFormik } from 'formik';
import { useAuthUser } from 'react-auth-kit';

const AddExerciseModal = ({ isOpen, onClose }) => {
    const auth = useAuthUser()
    const uid = auth()?.uid;

    const formik = useFormik({
        initialValues: {
            name: '',
            muscleCategory: '',
            isSingle: false,
        },
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .required('Name is required')
                .max(65, 'Name must be less than 65 characters'),
            muscleCategory: Yup.string().required('Muscle Category is required'),
            isSingle: Yup.boolean(),
        }),
        onSubmit: async (values) => {
            try {
                const exerciseToPost = { 
                    name: values.name,
                    isSingle: values.isSingle,
                    category: [values.muscleCategory], 
                    userId: uid, 
                    isUserPreset: true 
                };
                await axios.post('http://localhost:5000/api/exercises', exerciseToPost);
                onClose();
            } catch (error) {
                console.error('There was an error creating the exercise!', error);
            }
        },
    });

    const firstErrorKey = Object.keys(formik.errors).find(key => formik.touched[key] && formik.errors[key]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg="gray.700" color="white" pb="30px">
                <Flex p={4} w="100%" alignItems="center" justify="space-between">
                    <Text onClick={onClose} color="blue.300">Cancel</Text>
                    <Heading fontSize="xl">Add Exercise</Heading>
                    <Flex justify="flex-end" w="47px">
                        <Text onClick={formik.handleSubmit} cursor="pointer" color="blue.300">Done</Text>
                    </Flex>
                </Flex>
                <ModalBody display="flex" flexDir="column" gap="20px">
                    <FormControl p={1} bg="gray.600" borderRadius="10px">
                        <Input
                            placeholder='Name'
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            bgColor="gray.600"
                            height="35px"
                            paddingLeft="16px"
                            border={0}
                            borderBottom={'1px solid gray'}
                            borderRadius={0}
                            _focus={{ boxShadow: 'none' }}
                        />
                        <Select
                            placeholder="Target"
                            name="muscleCategory"
                            value={formik.values.muscleCategory}
                            onChange={formik.handleChange}
                            bg="gray.600"
                            color="white"
                            border="none"
                            _focus={{ boxShadow: 'none' }}
                            sx={{
                                option: {
                                    bg: "gray.600", // Dropdown options background color
                                },
                            }}
                        >
                            {muscleGroups.map((category, index) => (
                                <option disabled={index === -1 ? true : false} key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </Select>
                        {firstErrorKey && (
                            <Text w="100%" textAlign="center" pl="10px" color="red.300" fontSize="sm">
                                {formik.errors[firstErrorKey]}
                            </Text>
                        )}
                    </FormControl>
                    <FormControl p={3} bg="gray.600" borderRadius="10px">
                        <Flex w="100%" justify="space-between" align="center">
                            <Text mr={2}>Single Leg / Single Arm</Text>
                            <Switch
                                isChecked={formik.values.isSingle}
                                onChange={(e) => {
                                    formik.setFieldValue('isSingle', e.target.checked);
                                }}
                            />
                        </Flex>
                    </FormControl>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AddExerciseModal;