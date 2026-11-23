import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { AiOutlineCheck } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";

const FeedbackModal = ({
  feedbackError,
  formik,
  handleClose,
  isOpen,
  isSending,
  sent,
}) => (
  <Modal isOpen={isOpen} onClose={handleClose}>
    <ModalOverlay />
    <ModalContent mx="auto" my="auto" bg="gray.700" color="white">
      <ModalHeader>Send Feedback</ModalHeader>
      <ModalCloseButton />
      <Box as="form" onSubmit={formik.handleSubmit}>
        <ModalBody>
          <Flex flexDir="column" gap={2}>
            <Text color="gray.400" fontSize="xs">
              Sent to ironworkouttracker@gmail.com with your email for replies.
            </Text>
            {["email", "subject"].map((field) => (
              <Box
                key={field}
                borderBottom={
                  formik.touched[field] && !!formik.errors[field]
                    ? "1px solid red"
                    : "1px solid white"
                }
              >
                <Input
                  placeholder={field === "email" ? "Email" : "Subject"}
                  name={field}
                  focusBorderColor="transparent"
                  border={0}
                  value={formik.values[field]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Box>
            ))}
            {["email", "subject"].map(
              (field) =>
                formik.touched[field] &&
                formik.errors[field] && (
                  <Text key={field} fontSize="sm" color="red.500">
                    {formik.errors[field]}
                  </Text>
                ),
            )}
            <Box
              borderBottom={
                formik.touched.body && !!formik.errors.body
                  ? "1px solid red"
                  : "1px solid white"
              }
            >
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
            {feedbackError && (
              <Text color="red.300" fontSize="sm" role="alert">
                {feedbackError}
              </Text>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            bg="blue.400"
            color="white"
            isDisabled={isSending || !formik.isValid || formik.isSubmitting}
            mr={3}
          >
            Send
          </Button>
          <Button
            bg="none"
            color="blue.300"
            onClick={handleClose}
            isDisabled={isSending}
          >
            Cancel
          </Button>
          <Flex alignItems="center" ml={4}>
            {isSending && <Spinner />}
            {sent && <AiOutlineCheck size={24} style={{ color: "#38A169" }} />}
            {feedbackError && (
              <RxCross1 size={24} style={{ color: "#E53E3E" }} />
            )}
          </Flex>
        </ModalFooter>
      </Box>
    </ModalContent>
  </Modal>
);

export default FeedbackModal;
