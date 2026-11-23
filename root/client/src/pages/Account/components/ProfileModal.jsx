import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

const ProfileModal = ({
  formik,
  isOpen,
  onClose,
  onLogout,
  onDelete,
  isSaving,
  profileLoadError,
  profileSubmitError,
  profileUpdateSuccess,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent mx="auto" my="auto" bg="gray.700" color="white">
      <ModalHeader>Profile</ModalHeader>
      <ModalCloseButton />
      <Box as="form" onSubmit={formik.handleSubmit}>
        <ModalBody minH="500px">
          <Flex
            minH="500px"
            flexDir="column"
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Box
                borderBottom={
                  formik.touched.name && !!formik.errors.name
                    ? "1px solid red"
                    : "1px solid white"
                }
              >
                <Input
                  placeholder="Name"
                  name="name"
                  focusBorderColor="transparent"
                  border={0}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Box>
              {formik.touched.name && formik.errors.name && (
                <Text fontSize="sm" color="red.500">
                  {formik.errors.name}
                </Text>
              )}
              <Box
                mb={5}
                borderBottom={
                  formik.touched.email && !!formik.errors.email
                    ? "1px solid red"
                    : "1px solid white"
                }
              >
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
              <Box
                mb={2}
                borderBottom={
                  formik.touched.heightInches && !!formik.errors.heightInches
                    ? "1px solid red"
                    : "1px solid white"
                }
              >
                <Input
                  type="number"
                  min="24"
                  max="96"
                  step="0.1"
                  placeholder="Height (inches)"
                  aria-label="Height in inches"
                  name="heightInches"
                  focusBorderColor="transparent"
                  border={0}
                  value={formik.values.heightInches}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Box>
              {formik.touched.heightInches && formik.errors.heightInches && (
                <Text fontSize="sm" color="red.500">
                  {formik.errors.heightInches}
                </Text>
              )}
              {profileLoadError && (
                <Text fontSize="sm" color="red.300">
                  {profileLoadError}
                </Text>
              )}
              <Button
                w="100%"
                mb={2}
                bg="blue.300"
                color="white"
                isDisabled={isSaving || !formik.isValid || formik.isSubmitting}
                type="submit"
              >
                Save
              </Button>
              {profileUpdateSuccess && (
                <Text color="green.300" fontSize="sm">
                  Profile updated successfully!
                </Text>
              )}
              {profileSubmitError && (
                <Text color="red.300" fontSize="sm">
                  Failed to update profile.
                </Text>
              )}
            </Box>
            <Flex flexDir="column" gap={3} pb={4}>
              <Button
                type="button"
                w="100%"
                bg="gray.500"
                color="white"
                onClick={onLogout}
                size="md"
              >
                Logout
              </Button>
              <Button
                type="button"
                w="100%"
                colorScheme="red"
                onClick={onDelete}
                size="md"
              >
                Delete Account
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </Box>
    </ModalContent>
  </Modal>
);

export default ProfileModal;
