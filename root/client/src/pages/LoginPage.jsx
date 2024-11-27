import { Button, Center, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import axiosInstance from "../resources/axiosInstance";

const LoginPage = () => {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Validation Schema
    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email address") // Valid email address
            .required("Email is required"), // Required field
        password: Yup.string()
            .min(10, "Password must be at least 10 characters") // At least 10 characters
            .required("Password is required"), // Required field
    });

    const onSubmit = async (values) => {
        setError("");

        try {
            // Sends authentication post to back end
            const response = await axiosInstance.post("/auth", values, {
                withCredentials: true, // Ensures cookies are sent with the request
            });

            // Optionally store user data in state or context
            const { uid, name, email } = response.data;
            // Navigate to the dashboard after login
            navigate("/dashboard", { state: { uid, name, email } });
            console.log(response);

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
        validationSchema, // Attach validation schema here
        onSubmit: onSubmit,
    });

    return (
        <Box w="100vw" minH="100vh" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" h="400px" w="350px" py={4} px={8} m={4} borderRadius="10px" display="flex" flexDirection="column" gap={4}>
                    <Heading>Welcome</Heading>
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <Box w="100%">
                            <Input
                                border={0}
                                borderBottom="1px solid"
                                borderColor={formik.touched.email && formik.errors.email ? "red.400" : "white"}
                                borderRadius={0}
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                type="email"
                                placeholder="Email"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <Text fontSize="sm" color="red.400">{formik.errors.email}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Input
                                border={0}
                                borderBottom="1px solid"
                                borderRadius={0}
                                borderColor={formik.touched.password && formik.errors.password ? "red.400" : "white"}
                                name="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                type="password"
                                placeholder="Password"
                            />
                            {formik.touched.password && formik.errors.password && (
                                <Text fontSize="sm" color="red.400">{formik.errors.password}</Text>
                            )}
                        </Box>
                        <Button
                            type="submit"
                            bgColor="gray.600"
                            color="white"
                            my={2}
                            py={5}
                            px={8}
                            isLoading={formik.isSubmitting}
                        >
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
