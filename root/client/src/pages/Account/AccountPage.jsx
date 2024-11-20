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
  import { useEffect, useState } from "react";
  import { useFormik } from "formik";
  import * as Yup from "yup";
  import { useAuthUser, useIsAuthenticated, useSignOut } from "react-auth-kit";
  import { Link, useNavigate } from "react-router-dom";
  import { AiOutlineCheck } from "react-icons/ai";
  import { RxCross1 } from "react-icons/rx";
  import emailjs from "@emailjs/browser";
  
  const AccountPage = () => {
    const isAuthenticated = useIsAuthenticated();
    const signOut = useSignOut();
    const navigate = useNavigate();
    const auth = useAuthUser();
    const userEmail = auth()?.email;
  
    const [authState, setAuthState] = useState(isAuthenticated);
    const [sent, setSent] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(false);
  
    const { isOpen, onOpen, onClose } = useDisclosure();
  
    const handleClose = () => {
      formik.resetForm();
      setSent(false);
      setError(false);
      setLoading(false);
      onClose();
    };
  
    const formik = useFormik({
      initialValues: {
        subject: "Iron feedback(v1.0.0)",
        email: `${userEmail}`,
        body: "",
      },
      validationSchema: Yup.object({
        subject: Yup.string().required("Subject is required"),
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
          fromName: userEmail,
          subject: values.subject,
          body: values.body,
          recipient_email: userEmail, // Set to the user's email
        };
  
        emailjs
          .send(serviceId, templateId, emailData, publicKey)
          .then(() => {
            setLoading(false);
            setSent(true);
            formik.resetForm();
            setTimeout(() => {
              handleClose();
            }, 2000); // Close the modal after 2 seconds
          })
          .catch((error) => {
            setLoading(false);
            setError(true);
            console.error("Email failed to send:", error);
          });
      },
    });
  
    const logOut = () => {
      navigate("/login");
      signOut();
      setAuthState(false);
    };
  
    useEffect(() => {
      setAuthState(isAuthenticated);
    }, [isAuthenticated, authState]);
  
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
              {auth().name}
            </Text>
          </Flex>
          <ListItem>
            <Link>
              <Button w="100%" colorScheme="red" onClick={logOut} size="md">
                Logout
              </Button>
            </Link>
            <Button mt={4} w="100%" color="white" bg="blue.400" onClick={onOpen} size="md">
              Send Feedback
            </Button>
          </ListItem>
        </List>
  
        {/* Email Modal */}
        <Modal isOpen={isOpen} onClose={handleClose}>
          <ModalOverlay />
          <ModalContent mx="auto" my="auto" bg="gray.600" color="white">
            <ModalHeader>Send Feedback</ModalHeader>
            <ModalCloseButton />
            <Box as="form" onSubmit={formik.handleSubmit}>
              <ModalBody>
                <Flex flexDir="column" gap={2}>
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
                  colorScheme="blue"
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
  