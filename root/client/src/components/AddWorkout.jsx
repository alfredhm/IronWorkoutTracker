import React from 'react'
import { Button, Center, FormControl, FormLabel, Input, VStack, Box, Text, Menu, MenuButton, MenuList, MenuItem, Tag, TagLabel, TagCloseButton, Textarea, Switch } from "@chakra-ui/react"
import { useState } from "react"
import { useFormik } from "formik"
import { useAuthUser} from 'react-auth-kit'
import { ChevronDownIcon } from '@chakra-ui/icons';
import TimeSlider from '../components/TimeSlider'
import muscleGroups from '../resources/muscle-groups'
import axios from 'axios'

const AddWorkout = () => {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedGroups, setSelectedGroups] = useState([])
    const [isOn, setIsOn] = useState(false);
    
    const auth = useAuthUser()
    const email = auth().email
    const uid = auth().uid

    const onSubmit = async (values) => {
        setError('')
        setLoading(true)

        values.userId = uid

        console.log("Values: ", values)

        if (!values.name) {
            setError("Workout Name is Required")
            setLoading(false)
        }
        if (!values.focusGroup) {
            setError("At Least 1 Focus Group is Required")
            setLoading(false)
        }
        if (!values.durationSec) {
            setError("Workout Duration is Required!")
            setLoading(false)
        }
        console.log(values.duration)

        try {
            const response = await axios.post(
                "http://localhost:5000/api/workouts",
                values
            )
            console.log(response)

            setLoading(false)

        } catch (err) {
            setError(err.message)
            console.log("Error: ", err)
        }
    }

    const formik = useFormik({
        initialValues: {
            name:"",
            focusGroup: [],
            notes: "",
            durationSec:"",
            exercises: [],
            isTemplate: isOn
        },
        onSubmit: onSubmit
    })

    // Handle adding items to the selectedGroups array
    const handleAddGroup = (newGroup) => {
        if (newGroup && !selectedGroups.includes(newGroup)) {
            const updatedGroups = [...selectedGroups, newGroup]
            setSelectedGroups(updatedGroups);
            formik.setFieldValue('focusGroup', updatedGroups); // Update Formik state
        }
    };

    // Handle removing items from the selectedGroups array
    const handleRemoveGroup = (groupToRemove) => {
        const updatedGroups = selectedGroups.filter((group) => group !== groupToRemove);
        setSelectedGroups(updatedGroups);
        formik.setFieldValue('focusGroup', updatedGroups); // Update Formik state
    };

    const handleChildTimeChange = (data) => {
        console.log('Duration received from TimeSlider:', data);
        formik.setFieldValue('durationSec', data);
      };

    return (
        <Box h="95em"display="flex" flexDirection="column">
            <Center>
                <Center bgColor="gray.700" color="white" py={8} px={8} m={4} borderRadius="10px" display="flex" flexDirection="column" gap={4}>
                        <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                            <FormControl py={4}>
                                <FormLabel>Name</FormLabel>
                                <Input 
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    clearonescape="true"
                                    bgColor="gray.600" 
                                    height="35px"
                                    type="name" 
                                    required
                                    autoComplete='false'
                                />
                            </FormControl>
                            <FormControl py={4}>
                                <FormLabel>Add a Focus Group</FormLabel>
                                <Box display="flex"justifyContent="center">
                                    <Menu>
                                        <MenuButton bg="gray.600" color="gray.200" as={Button} rightIcon={<ChevronDownIcon />}>
                                            Choose a Focus Group
                                        </MenuButton>
                                        <MenuList bg="teal.100" color="black">
                                            {muscleGroups
                                                .filter((group) => !selectedGroups.includes(group))
                                                .map((group) => (
                                                <MenuItem 
                                                    key={group} 
                                                    onClick={() => handleAddGroup(group)}
                                                    _hover={{ bg: 'teal.200' }}
                                                >
                                                    {group}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu>
            
                                </Box>
                            </FormControl>
                            <Box width="320px" textAlign="center">
                                {selectedGroups.length > 0 ? (
                                selectedGroups.map((group) => (
                                    <Tag
                                    key={group}
                                    size="lg"
                                    bg="gray.500"
                                    color="gray.100"
                                    borderRadius="full"
                                    m={1}
                                    >
                                    <TagLabel>{group}</TagLabel>
                                    <TagCloseButton onClick={() => handleRemoveGroup(group)} />
                                    </Tag>
                                ))
                                ) : (
                                    <Box flex textAlign="center">
                                        <Text fontSize="small">No Focus Groups Selected</Text>
                                    </Box>
                                )}
                            </Box>
                            <TimeSlider onTimeChange={handleChildTimeChange}/>
                            <FormControl py={4}>
                                <Textarea 
                                    placeholder='Notes...'
                                    name="notes"
                                    value={formik.values.notes}
                                    onChange={formik.handleChange}
                                    bgColor="gray.600"   
                                    fontSize="small" 
                                    maxHeight="150px"
                                />
                            </FormControl>
                            <FormControl display="flex" justifyContent="center">
                                <FormLabel htmlFor="switch" mb="0" color="white">
                                    Save Workout
                                </FormLabel>
                                <Switch
                                    id="switch"
                                    size="lg"
                                    colorScheme="teal"
                                    isChecked={isOn}
                                    onChange={(e) => {
                                        setIsOn(e.target.checked)
                                        formik.setFieldValue('isTemplate', e.target.checked)
                                    }}
                                />
                            </FormControl>                            
                            <Button type="submit" bgColor="gray.600" color="white" my={2} py={5} px={8} isLoading={formik.isSubmitting}>
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

export default AddWorkout