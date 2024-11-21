import { Button, Center, Heading, Input, VStack, Box, Text, Link } from "@chakra-ui/react";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import axiosInstance from "../resources/axiosInstance";

const Register = () => {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Validation Schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(3, "Name must be at least 3 characters")
            .max(30, "Name must be 30 characters or less")
            .required("Name is required"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(10, "Password must be at least 10 characters")
            .required("Password is required"),
        password_2: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Must Confirm Password"),
    });

    const onSubmit = async (values) => {
        setError(""); // Clear error state

        const postValues = {
            name: values.name,
            email: values.email,
            password: values.password,
        };

        try {
            // Sends registration post to back end
            const response = await axiosInstance.post("/users", postValues, {
                withCredentials: true, // Ensures cookies are sent with the request
            });

            // Navigate to the dashboard after successful registration
            const { uid, name, email } = response.data;
            navigate("/dashboard", { state: { uid, name, email } });

        } catch (err) {
            console.log(err)
            if (err.response) {
                setError(err.response.data);
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    const formik = useFormik({
        initialValues: { name: "", email: "", password: "", password_2: "" },
        validationSchema, // Attach validation schema
        onSubmit,
    });

    return (
        <Box w="100vw" minH="100vh" bgColor="gray.800" display="flex" flexDirection="column">
            <NavBar />
            <Center>
                <Center bgColor="gray.700" color="white" w="350px" py={8} px={8} m={4} borderRadius="10px" display="flex" flexDirection="column" gap={4}>
                    <Heading>Create Account</Heading>
                    <VStack as="form" width="100%" onSubmit={formik.handleSubmit}>
                        <Box w="100%">
                            <Input
                                border={0}
                                borderBottom="1px solid"
                                borderRadius={0}
                                borderColor={formik.touched.name && formik.errors.name ? "red.400" : "white"}
                                placeholder="Name"
                                pl={2}
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                type="text"
                                _focus={{
                                    outline: "none",
                                    borderColor: "gray.500",
                                }}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <Text fontSize="sm" color="red.400">{formik.errors.name}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Input
                                border={0}
                                borderBottom="1px solid"
                                borderRadius={0}
                                borderColor={formik.touched.email && formik.errors.email ? "red.400" : "white"}
                                placeholder="Email"
                                pl={2}
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                type="email"
                                _focus={{
                                    outline: "none",
                                    borderColor: "gray.500",
                                }}
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
                                placeholder="Password"
                                pl={2}
                                name="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                type="password"
                                _focus={{
                                    outline: "none",
                                    borderColor: "gray.500",
                                }}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <Text fontSize="sm" color="red.400">{formik.errors.password}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Input
                                border={0}
                                borderBottom="1px solid"
                                borderRadius={0}
                                borderColor={formik.touched.password_2 && formik.errors.password_2 ? "red.400" : "white"}
                                placeholder="Confirm Password"
                                pl={2}
                                name="password_2"
                                value={formik.values.password_2}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                type="password"
                                _focus={{
                                    outline: "none",
                                    borderColor: "gray.500",
                                }}
                            />
                            {formik.touched.password_2 && formik.errors.password_2 && (
                                <Text fontSize="sm" color="red.400">{formik.errors.password_2}</Text>
                            )}
                        </Box>
                        <Button type="submit" bgColor="gray.600" color="white" my={2} py={5} px={8} isLoading={formik.isSubmitting}>
                            Register
                        </Button>
                        <Box>
                            <Text textAlign="center" color="red.400">{error}</Text>
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
