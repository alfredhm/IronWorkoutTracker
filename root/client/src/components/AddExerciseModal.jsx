import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  FormControl,
  Input,
  Flex,
  Heading,
  Text,
  Switch,
  Button,
  Box,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import * as Yup from "yup";
import muscleGroups from "../resources/muscle-groups";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";

const AddExerciseModal = ({ isOpen, onClose, onExerciseAdded }) => {
  const location = useLocation();
  const userState = location.state;
  const uid = userState.uid;
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      muscleCategory: "",
      isSingle: false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required")
        .max(30, "Name must be 30 characters or fewer"),
      muscleCategory: Yup.string().required("Muscle Category is required"),
      isSingle: Yup.boolean(),
    }),
    onSubmit: async (values) => {
      setSubmitError("");
      try {
        const exerciseToPost = {
          name: values.name,
          isSingle: values.isSingle,
          category: [values.muscleCategory],
          userId: uid,
          isUserPreset: true,
        };
        const response = await axios.post(
          "http://localhost:5000/api/exercises",
          exerciseToPost,
        );
        onExerciseAdded?.(response.data);
        formik.resetForm();
        onClose();
      } catch (error) {
        const responseMessage = error.response?.data;
        setSubmitError(
          typeof responseMessage === "string" &&
            !responseMessage.trim().startsWith("<")
            ? responseMessage
            : "Unable to save the exercise. Please try again.",
        );
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSubmitError("");
    onClose();
  };

  const firstErrorKey = Object.keys(formik.errors).find(
    (key) => formik.touched[key] && formik.errors[key],
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg="gray.700" color="white" pb="30px">
        <Box as="form" onSubmit={formik.handleSubmit}>
          <Flex p={4} w="100%" alignItems="center" justify="space-between">
            <Button
              type="button"
              variant="link"
              color="blue.300"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Heading fontSize="xl">Add Exercise</Heading>
            <Button
              type="submit"
              variant="link"
              color="blue.300"
              isLoading={formik.isSubmitting}
              isDisabled={formik.isSubmitting}
            >
              Done
            </Button>
          </Flex>
          <ModalBody display="flex" flexDir="column" gap="20px">
            <FormControl p={1} bg="gray.600" borderRadius="10px">
              <Input
                placeholder="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                bgColor="gray.600"
                height="35px"
                paddingLeft="16px"
                border={0}
                borderBottom={"1px solid gray"}
                borderRadius={0}
                _focus={{ boxShadow: "none" }}
              />
              <Select
                placeholder="Target"
                name="muscleCategory"
                value={formik.values.muscleCategory}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                bg="gray.600"
                color="white"
                border="none"
                _focus={{ boxShadow: "none" }}
                sx={{
                  option: { color: "white", bg: "gray.600" },
                }}
              >
                {muscleGroups.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              {firstErrorKey && (
                <Text
                  w="100%"
                  textAlign="center"
                  pl="10px"
                  color="red.300"
                  fontSize="sm"
                >
                  {formik.errors[firstErrorKey]}
                </Text>
              )}
              {submitError && (
                <Text
                  w="100%"
                  textAlign="center"
                  px={2}
                  color="red.300"
                  fontSize="sm"
                  role="alert"
                >
                  {submitError}
                </Text>
              )}
            </FormControl>
            <FormControl p={3} bg="gray.600" borderRadius="10px">
              <Flex w="100%" justify="space-between" align="center">
                <Text mr={2}>Single Leg / Single Arm</Text>
                <Switch
                  isChecked={formik.values.isSingle}
                  onChange={(e) => {
                    formik.setFieldValue("isSingle", e.target.checked);
                  }}
                />
              </Flex>
            </FormControl>
          </ModalBody>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default AddExerciseModal;
