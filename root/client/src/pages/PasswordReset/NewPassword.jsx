import React from 'react'
import { Button, Center, FormControl, FormLabel, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { useFormik } from "formik"
import NavBar from "../../components/NavBar"
import { useParams } from 'react-router-dom'

const NewPassword = () => {
    const [error, setError] = useState("")
    const [reset, setReset] = useState(false)
    const { id, token } = useParams()

    const onSubmit = async (values) => {
        setError("")

        try {
            await axios.post(
                `http://localhost:5000/api/users/reset-password/${id}/${token}`,
                values
            ) 
            setReset(true)

        } catch (err) {
            setError(err.response.data.message)

            if (err && err instanceof AxiosError) {
                console.log("Error: ", err.message)
            }
            else if (err && err instanceof Error) {
                console.log("Error: ", err.message)
            }
        }
    }

    const formik = useFormik({
        initialValues: {
            password: "",
            password_2: "",
        },
        onSubmit: onSubmit
    })

    return (
        <Box h="95em" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" w="350px" py={8} px={8} m={4} borderRadius="10px" display="flex"flexDirection="column" gap={8}>
                    <Heading>Password Reset</Heading>
                        <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                            <FormControl isRequired>
                                <FormLabel>New Password</FormLabel>
                                <Input 
                                    name="password"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    clearonescape="true"
                                    bgColor="gray.600" 
                                    type="password" 
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Confirm Password</FormLabel>
                                <Input 
                                    name="password_2"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    clearonescape="true"
                                    bgColor="gray.600" 
                                    type="password" 
                                />
                            </FormControl>
                            {
                                reset ? (
                                    <>
                                        <Box disabled bgColor="gray.600" color="white" mt={6} py={3} px={8} borderRadius="12px">
                                            ✓
                                        </Box>   
                                        <Box>   
                                            <Text>Password has been reset. <Link href="/login" color="blue.400">Login</Link></Text> 
                                        </Box>  
                                    </>

                                ) : (
                                    <Button type="submit" bgColor="gray.600" color="white" mt={6} py={5} px={8} isLoading={formik.isSubmitting}>
                                        Change Password
                                    </Button>
                                )
                            }
                            <Box>
                                <Text textAlign="center" color="red.300">{error}</Text>
                            </Box>
                        </VStack>
                </Center>
            </Center>
        </Box>
    )
}
export default NewPassword