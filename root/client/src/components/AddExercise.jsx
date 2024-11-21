import React from "react";
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Heading,
  Text,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import ExerciseCategories from "./ExerciseCategories";
import AddExerciseModal from "./AddExerciseModal";

const AddExercise = ({ session, workoutID, refreshModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

  return (
    <Flex justify="center" alignItems="center">
      <Button bgColor="gray.600" color="gray.100" onClick={onOpen}>
        Add Exercise
      </Button>

      {/* ExerciseCategories Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent color="white" bgColor="gray.700" borderRadius="10px">
          <Flex p={4} justify="space-between" alignItems="center">
            <Text color="blue.300" onClick={onClose}>
              Cancel
            </Text>
            <Heading fontSize="xl">Select Exercise</Heading>
            <Text color="blue.300" onClick={onAddOpen}>
              <Image h="20px" w="20px" src={process.env.PUBLIC_URL + '/assets/blueplus.png'}/>
            </Text>
          </Flex>
          <ModalBody>
            <ExerciseCategories
              closeAndRefresh={() => {
                refreshModal();
                onClose();
              }}
              session={session}
              workoutID={workoutID}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* AddExerciseModal */}
      <AddExerciseModal isOpen={isAddOpen} onClose={onAddClose} />
    </Flex>
  );
};

export default React.memo(AddExercise);
