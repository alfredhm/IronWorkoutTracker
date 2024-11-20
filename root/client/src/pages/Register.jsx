import { Button, Center, FormControl, FormLabel, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const Register = () => {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onSubmit = async (values) => {
        if (values.password !== values.password_2) {
            setError("Passwords Do Not Match");
            return;
        }

        const postValues = {
            name: values.name,
            email: values.email,
            password: values.password,
        };

        try {
            // Sends registration post to back end
            const response = await axios.post("http://localhost:5000/api/users", postValues, {
                withCredentials: true, // Ensures cookies are sent with the request
            });

            // Optionally store user data in state or context
            const { uid, name, email } = response.data;

            // Navigate to the dashboard after successful registration
            navigate("/dashboard", { state: { uid, name, email } });

        } catch (err) {
            if (err.response) {
                setError(err.response.data);
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    const formik = useFormik({
        initialValues: { name: "", email: "", password: "", password_2: "" },
        onSubmit: onSubmit,
    });

    return (
        <Box w="100vw" minH="100vh" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" w="350px" py={8} px={8} m={4} borderRadius="10px" display="flex" flexDirection="column" gap={4}>
                    <Heading>Create Account</Heading>
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                bgColor="gray.600"
                                type="text"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Email Address</FormLabel>
                            <Input
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
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
    );
};

export default Register;
