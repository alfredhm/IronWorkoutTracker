import { Button, Center, FormControl, FormLabel, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { useFormik } from "formik"
import { useSignIn } from "react-auth-kit"
import { useNavigate } from "react-router-dom"
import NavBar from "../components/NavBar"

const Register = () => {
    const [error, setError] = useState("")
    
    const signIn = useSignIn()
    const navigate = useNavigate()

    // Formik onsubmit function
    const onSubmit = async (values) => {

        // If passwords do not match, display error
        if (values.password !== values.password_2) {
            setError("Passwords Do Not Match")
        }

        let postValues = {
            name: values.name,
            email: values.email,
            password: values.password
        }

        // Saves new account in back end and then initializes the signIn function to create a token for the user
        try {
            const response = await axios.post(
                "http://localhost:5000/api/users",
                postValues
            )

            signIn({
                token: response.data.token,
                expiresIn: 3600,
                tokenType: "Bearer",
                authState: { email: values.email },
            })

            // After login, send user to dashboard
            navigate("/dashboard")

        } catch (err) {
            setError(err.response.data)
            if (err && err instanceof AxiosError) {
            }
            else if (err && err instanceof Error) {
            }
        }
    }

    // Formik creation
    const formik = useFormik({
        initialValues: {
            name:"",
            email: "",
            password: "",
            password_2:""
        },
        onSubmit: onSubmit
    })

    return (
        <Box w="100vw" minH="100vh" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" w="350px" py={8} px={8} m={4} borderRadius="10px" display="flex"flexDirection="column" gap={4}>
                    <Heading>Create Account</Heading>
                        <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                            <FormControl isRequired>
                                <FormLabel>Name</FormLabel>
                                <Input 
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    clearonescape="true"
                                    bgColor="gray.600" 
                                    type="name" 
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Email Address</FormLabel>
                                <Input 
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    clearonescape="true"
                                    bgColor="gray.600" 
                                    type="email" 
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input 
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    bgColor="gray.600" 
                                    type="password" 
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Re-Enter Password</FormLabel>
                                <Input 
                                    name="password_2"
                                    value={formik.values.password_2}
                                    onChange={formik.handleChange}
                                    bgColor="gray.600" 
                                    type="password" 
                                />
                            </FormControl>
                            <Button type="submit" bgColor="gray.600" color="white" my={2} py={5} px={8} isLoading={formik.isSubmitting}>
                                Register
                            </Button>
                            <Box>
                                <Text textAlign="center" color="red.300">{error}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs"><Link href="/login">Already have an account?</Link></Text>
                            </Box>
                        </VStack>
                </Center>
            </Center>
        </Box>
    )
}

export default Register