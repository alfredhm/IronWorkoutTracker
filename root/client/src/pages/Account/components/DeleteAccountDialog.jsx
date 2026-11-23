import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from "@chakra-ui/react";

const DeleteAccountDialog = ({
  cancelRef,
  error,
  isDeleting,
  isOpen,
  onClose,
  onDelete,
}) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
    closeOnOverlayClick={!isDeleting}
    closeOnEsc={!isDeleting}
  >
    <AlertDialogOverlay>
      <AlertDialogContent bg="gray.700" color="white">
        <AlertDialogHeader>Delete your account?</AlertDialogHeader>
        <AlertDialogBody>
          This permanently deletes your account, workouts, workout history, and
          body-weight entries. This action cannot be undone.
          {error && (
            <Text color="red.300" mt={3}>
              {error}
            </Text>
          )}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            type="button"
            ref={cancelRef}
            onClick={onClose}
            isDisabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            colorScheme="red"
            onClick={onDelete}
            isLoading={isDeleting}
            ml={3}
          >
            Delete account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default DeleteAccountDialog;
