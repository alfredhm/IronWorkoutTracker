import { Button, Center, FormControl, FormLabel, Heading, Input, VStack, Box, Text } from "@chakra-ui/react"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { useFormik } from "formik"
import NavBar from "../../components/NavBar"

const ForgotPassword = () => {
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)

    const onSubmit = async (values) => {
        setError("")
        try {
            await axios.post(
                "http://localhost:5000/api/users/reset-password",
                values
            )

            setSent(true)
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
            email: "",
        },
        onSubmit: onSubmit
    })

    return (
        <Box w="100vw" minH="100vh" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" w="350px" py={8} px={8} m={4} borderRadius="10px" display="flex"flexDirection="column" gap={8}>
                    <Heading>Forgot Password</Heading>
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
                            {
                                sent ? (
                                <>
                                    <Box disabled bgColor="gray.600" color="white" mt={6} py={3} px={8} borderRadius="12px">
                                        ✓
                                    </Box>
                                </>
                                ) : (
                                    <Button type="submit" bgColor="gray.600" color="white" mt={6} py={5} px={8} isLoading={formik.isSubmitting}>
                                        Send Reset Link
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

export default ForgotPassword