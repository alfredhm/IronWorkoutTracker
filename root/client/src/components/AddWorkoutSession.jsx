import React, { useRef, useState } from 'react'
import {
    Box,
    Button,
    useDisclosure,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalFooter,
    ModalBody,
    Modal,
    Flex,
    Image
  } from '@chakra-ui/react';
import WorkoutSessionList from './WorkoutSessionList';
import AddSessionModal from './modal-body/AddSessionModal';

const AddWorkoutSession = () => {
    const [modalClosed, setModalClosed] = useState(0)

    const { isOpen, onOpen, onClose } = useDisclosure() 
    const exerciseRef = useRef()

    // This function will be used to handle modal close, and will invoke the child function first
    const handleModalClose = async () => {
        // If the child has a handleClose function, call it first
        if (exerciseRef.current) {
            await exerciseRef.current.handleClose();
        }
        // Then, close the modal
        onClose();
        setModalClosed((prev) => prev + 1)
    };

    // Function called when the modal opens
    const handleModalOpen = () => {
        if (exerciseRef.current) {
            exerciseRef.current.loadSets();
        }
        onOpen();
    };

    return (
        <Box>
            <Flex width="100%" justify="flex-end" py={4}>
                <Button p={0} width="30px" height="40px" bg="gray.800" onClick={handleModalOpen}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'}></Image>
                </Button>
                <Modal isOpen={isOpen} onClose={handleModalClose}>
                    <ModalOverlay />
                    <ModalContent border="1px solid white" bgColor="gray.700" borderRadius="10px">
                        <ModalCloseButton color="white" />
                        <ModalBody>
                            <AddSessionModal ref={exerciseRef} handleClose={handleModalClose}/>
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="center" alignItems="center">
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
            <WorkoutSessionList ref={exerciseRef} refresh={modalClosed} handleClose={handleModalClose}/>
        </Box>
    )
}

export default AddWorkoutSession