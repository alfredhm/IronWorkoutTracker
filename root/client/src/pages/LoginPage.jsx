import { Button, Center, FormControl, FormLabel, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { useFormik } from "formik"
import { useSignIn } from "react-auth-kit"
import { useNavigate } from "react-router-dom"
import NavBar from "../components/NavBar"

const LoginPage = () => {
    const [error, setError] = useState("")
    const signIn = useSignIn()
    const navigate = useNavigate()

    const onSubmit = async (values) => {
        console.log("Values: ", values)
        setError("")
        
        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth",
                values
            )

            signIn({
                token: response.data.token,
                expiresIn: 3600,
                tokenType: "Bearer",
                authState: { email: values.email },
            })
            navigate("/dashboard")

        } catch (err) {
            if (err && err instanceof AxiosError) {
                setError("Username and Password Do Not Match")
                console.log("Error: ", err.message)
            }
            else if (err && err instanceof Error) {
                setError("Username and Password Do Not Match")
                console.log("Error: ", err.message)
            }
        }
    }

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        onSubmit: onSubmit
    })

    return (
       <>
            <Box h="95em" bgColor="gray.800" display="flex"flexDirection="column">
                <NavBar />
                <Center>
                    <Center bgColor="gray.700" color="white" h="400px" w="350px" py={4} px={8} m={4} borderRadius="10px" display="flex"flexDirection="column" gap={4}>
                        <Heading>Welcome</Heading>
                            <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
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
                                <Button type="submit" bgColor="gray.600" color="white" my={2} py={5} px={8} isLoading={formik.isSubmitting}>
                                    Login
                                </Button>
                                <Box>
                                    <Text textAlign="center" color="red.300">{error}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs">Don't have an account? <Link href="/register" color="blue.400">Sign Up</Link></Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs"><Link href="/reset-password">Forgot your password?</Link></Text>
                                </Box>
                            </VStack>
                    </Center>
                </Center>
            </Box>
       </>
    )
}

export default LoginPage