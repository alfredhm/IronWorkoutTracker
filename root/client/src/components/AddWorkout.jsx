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
import AddWorkoutModal from './modal-body/AddWorkoutModal'
import WorkoutList from './WorkoutList';

const AddWorkout = ({ setTabIndex, setStartedWorkout }) => {
    const [modalClosed, setModalClosed] = useState(0)

    const { isOpen, onOpen, onClose } = useDisclosure() 
    const editWorkoutModalRef = useRef()

     // This function will be used to handle modal close, and will invoke the child function first
     const handleModalClose = async () => {
        try {
            if (editWorkoutModalRef.current) {
                await editWorkoutModalRef.current.handleClose();
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
                    <ModalContent bgColor="gray.700" borderRadius="10px">
                        <ModalCloseButton color="white" />
                        <ModalBody>
                            <AddWorkoutModal handleClose={handleModalClose} />
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="center" alignItems="center">
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
            <WorkoutList setTabIndex={setTabIndex} setStartedWorkout={setStartedWorkout} ref={editWorkoutModalRef} refresh={modalClosed} handleClose={handleModalClose}/>
        </Box>
    )
}

export default AddWorkout