import { Button, Flex, Heading, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import ExerciseCategories from './ExerciseCategories'
import AddExerciseModal from './AddExerciseModal'

const AddExercise = ({ session, workoutID, refreshModal, exercises, setExercises }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()

    // When ExerciseCategories is closed, the function for the parent of this component (One of the modals) is activated, causing a refresh
    const handleClose = () => {
        refreshModal()
        onClose()
    }

    return (
        <Flex justify="center" alignItems="center">
            <Button bgColor="gray.600" color="gray.100" onClick={onOpen}>Add Exercise</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent color="white" bgColor="gray.700" borderRadius="10px">
                    <Flex p={4} w="100%" alignItems="center" justify="space-between">
                        <Text onClick={handleClose} color="blue.300">Cancel</Text>
                        <Heading fontSize="xl">Select Exercise</Heading>
                        <Flex justify="flex-end" w="47px">
                            <Image onClick={onAddOpen} maxHeight="20px" src={process.env.PUBLIC_URL + '/assets/blueplus.png'} />
                        </Flex>
                    </Flex> 
                    <ModalBody>
                        <ExerciseCategories 
                            closeAndRefresh={handleClose} 
                            session={session} 
                            workoutID={workoutID} 
                            exercises={exercises}
                            setExercises={setExercises}
                        />
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AddExerciseModal isOpen={isAddOpen} onClose={onAddClose} />
        </Flex>
    ) 
}

export default AddExercise