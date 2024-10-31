import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import ExerciseCategories from './ExerciseCategories'

const AddExercise = ({ session, workoutID, onSecondChildClose }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    // When ExerciseCategories is closed, the function for the parent of this component (One of the modals) is activated, causing a refresh
    const handleClose = () => {
        onSecondChildClose()
        onClose()
    }

    return (
        <Flex justify="center" alignItems="center">
            <Button bgColor="gray.600" color="gray.100" onClick={onOpen}>Add Exercise</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent color="white" border="1px solid white" bgColor="gray.700" borderRadius="10px">
                    <ModalHeader>Select Exercise</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ExerciseCategories onChildClose={handleClose} session={session} workoutID={workoutID} />
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default AddExercise