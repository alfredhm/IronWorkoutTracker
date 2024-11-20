import {
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { AiOutlineCheck } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";

axios.defaults.withCredentials = true;

const AccountPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [sent, setSent] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const location = useLocation()
  const userState = location.state
  const uid = userState.uid
  const name = userState.name
  const email = userState.email

  // Logout Functionality
  const logOut = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", { withCredentials: true });
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  // Formik Configuration for Sending Feedback
  const formik = useFormik({
    initialValues: {
      subject: "Iron feedback(v1.0.0)",
      email: email, // Pre-fill the user's email
      body: "",
    },
    validationSchema: Yup.object({
      subject: Yup.string().required("Subject is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      body: Yup.string().required("Body is required"),
    }),
    onSubmit: (values) => {
      const serviceId = "service_6uofvsc";
      const templateId = "template_f5dw9oc";
      const publicKey = "Yh8oP2xNiYM_hgugM";

      setLoading(true);
      setSent(false);
      setError(false);

      const emailData = {
        fromName: email,
        subject: values.subject,
        body: values.body,
      };

      emailjs
        .send(serviceId, templateId, emailData, publicKey)
        .then(() => {
          setLoading(false);
          setSent(true);
          formik.resetForm();
          setTimeout(() => {
            handleClose();
          }, 1000); // Close modal after 2 seconds
        })
        .catch((error) => {
          setLoading(false);
          setError(true);
          console.error("Email failed to send:", error);
        });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSent(false);
    setError(false);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Heading color="white" fontSize={32}>
        Profile
      </Heading>
      <List
        display="flex"
        flexDir="column"
        pt={4}
        justifyContent="space-between"
        h="calc(100% - 107px)"
      >
        <Flex flexDir="column">
          <Heading mb={4} fontSize="x-large" fontWeight="600" color="white">
            Account
          </Heading>
          <Text fontSize="md" color="white">
            {name}
          </Text>
        </Flex>
        <ListItem>
          <Button w="100%" color="white" bg="blue.400" onClick={onOpen} size="md">
            Send Feedback
          </Button>
          <Button mt={3} w="100%" colorScheme="red" onClick={logOut} size="md">
            Logout
          </Button>
        </ListItem>
      </List>

      {/* Feedback Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent mx="auto" my="auto" bg="gray.700" color="white">
          <ModalHeader>Send Feedback</ModalHeader>
          <ModalCloseButton />
          <Box as="form" onSubmit={formik.handleSubmit}>
            <ModalBody>
              <Flex flexDir="column" gap={2}>
                <Box borderBottom={formik.touched.email && !!formik.errors.email ? "1px solid red" : "1px solid white"}>
                  <Input
                    placeholder="Email"
                    name="email"
                    focusBorderColor="transparent"
                    border={0}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Box>
                {formik.touched.email && formik.errors.email && (
                  <Text fontSize="sm" color="red.500">
                    {formik.errors.email}
                  </Text>
                )}
                <Box borderBottom={formik.touched.subject && !!formik.errors.subject ? "1px solid red" : "1px solid white"}>
                  <Input
                    placeholder="Subject"
                    name="subject"
                    focusBorderColor="transparent"
                    border={0}
                    value={formik.values.subject}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Box>
                {formik.touched.subject && formik.errors.subject && (
                  <Text fontSize="sm" color="red.500">
                    {formik.errors.subject}
                  </Text>
                )}
                <Box borderBottom={formik.touched.body && !!formik.errors.body ? "1px solid red" : "1px solid white"}>
                  <Textarea
                    placeholder="Body"
                    name="body"
                    focusBorderColor="transparent"
                    border={0}
                    value={formik.values.body}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Box>
                {formik.touched.body && formik.errors.body && (
                  <Text fontSize="sm" color="red.500">
                    {formik.errors.body}
                  </Text>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                bg="blue.400"
                color="white"
                isDisabled={isLoading || !formik.isValid || formik.isSubmitting}
                mr={3}
              >
                Send
              </Button>
              <Button bg="none" color="blue.300" onClick={handleClose} isDisabled={isLoading}>
                Cancel
              </Button>
              <Flex alignItems="center" ml={4}>
                {isLoading && <Spinner />}
                {sent && <AiOutlineCheck size={24} style={{ color: "#38A169" }} />}
                {error && <RxCross1 size={24} style={{ color: "#E53E3E" }} />}
              </Flex>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountPage;
