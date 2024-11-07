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
    const editSessionModalRef = useRef()

     // This function will be used to handle modal close, and will invoke the child function first
    const handleModalClose = async () => {
        try {
            console.log("handleModalClose called in parent"); // Log for confirmation
            if (editSessionModalRef.current) {
                console.log("Calling child handleClose"); // Log for confirmation
                await editSessionModalRef.current.handleClose();
            }
            onClose(); // Close modal afterward
            setModalClosed((prev) => prev + 1)
        } catch (err) {
            console.error("Error during modal close:", err);
        }
    };

    return (
        <Box>
            <Flex width="100%" justify="flex-end" py={4}>
                <Button p={0} width="30px" height="40px" bg="gray.800" onClick={onOpen}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'}></Image>
                </Button>
                <Modal isOpen={isOpen} onClose={handleModalClose}>
                    <ModalOverlay />
                    <ModalContent mx={2} bgColor="gray.700" borderRadius="10px">
                        <ModalCloseButton color="white" />
                        <ModalBody>
                            <AddSessionModal ref={editSessionModalRef} handleClose={handleModalClose}/>
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="center" alignItems="center">
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
            <WorkoutSessionList ref={editSessionModalRef} refresh={modalClosed} handleClose={handleModalClose}/>
        </Box>
    )
}

export default AddWorkoutSession