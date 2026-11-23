import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";

const DeleteWorkoutDialog = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent mx="auto" my="auto" bgColor="gray.700">
      <ModalBody>
        <Flex flexDir="column" gap={3} p={4}>
          <Flex fontSize="lg" fontWeight="600" color="white">
            Are you sure you want to delete this workout?
          </Flex>
          <Flex justify="space-between">
            <Button colorScheme="red" onClick={onConfirm}>
              Delete
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </Flex>
        </Flex>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default DeleteWorkoutDialog;
