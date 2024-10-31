import React, { useState } from 'react'
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

const AddWorkout = () => {
    const [modalClosed, setModalClosed] = useState(0)
    const { isOpen, onOpen, onClose } = useDisclosure() 

    // Closes the modal as well as alters the modalClsoed variable which causes a refresh in the workout list
    const handleClose = () => {
        onClose()
        setModalClosed((prev) => prev + 1)
    }

    return (
        <Box>
            <Flex width="100%" justify="flex-end" py={4}>
                <Button p={0} width="30px" height="40px" bg="gray.800" onClick={onOpen}>
                    <Image maxHeight="13px" src={process.env.PUBLIC_URL + '/assets/plus.png'}></Image>
                </Button>
                <Modal isOpen={isOpen} onClose={handleClose}>
                    <ModalOverlay />
                    <ModalContent border="1px solid white" bgColor="gray.700" borderRadius="10px">
                        <ModalCloseButton color="white" />
                        <ModalBody>
                            <AddWorkoutModal handleClose={handleClose} />
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="center" alignItems="center">
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
            <WorkoutList refresh={modalClosed} handleClose={handleClose}/>
        </Box>
    )
}

export default AddWorkout