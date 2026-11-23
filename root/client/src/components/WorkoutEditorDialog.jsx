import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import EditWorkoutModal from "./modal-body/EditWorkoutModal";

const WorkoutEditorDialog = ({
  editorRef,
  isOpen,
  onClose,
  onSaved,
  onDelete,
  selectedWorkout,
  setDeletedWorkoutId,
  setStartedWorkout,
  setTabIndex,
  refreshWorkouts,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent
      mx="auto"
      my="auto"
      aria-hidden="false"
      bgColor="gray.700"
    >
      <ModalCloseButton color="white" />
      <ModalBody>
        <EditWorkoutModal
          ref={editorRef}
          setTabIndex={setTabIndex}
          setStartedWorkout={setStartedWorkout}
          closeWorkoutList={onSaved}
          selectedWorkout={selectedWorkout}
          refreshWorkouts={refreshWorkouts}
          handleDeleteWorkout={onDelete}
          setDeletedWorkoutId={setDeletedWorkoutId}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default WorkoutEditorDialog;
