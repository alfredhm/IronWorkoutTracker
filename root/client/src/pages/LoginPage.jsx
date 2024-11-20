import { Button, Center, FormControl, FormLabel, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const LoginPage = () => {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onSubmit = async (values) => {
        setError("");

        try {
            // Sends authentication post to back end
            const response = await axios.post("http://localhost:5000/api/auth", values, {
                withCredentials: true, // Ensures cookies are sent with the request
            });
        
            // Optionally store user data in state or context
            const { uid, name, email } = response.data;
            // Navigate to the dashboard after login
            navigate("/dashboard", { state: { uid, name, email } });

        } catch (err) {
            console.log(err);
            if (err.response) {
                setError("Username and Password Do Not Match");
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        onSubmit: onSubmit,
    });

    return (
        <Box w="100vw" minH="100vh" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" h="400px" w="350px" py={4} px={8} m={4} borderRadius="10px" display="flex" flexDirection="column" gap={4}>
                    <Heading>Welcome</Heading>
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
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
    );
};

export default LoginPage;
