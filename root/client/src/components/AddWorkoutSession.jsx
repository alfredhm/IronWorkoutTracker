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
import WorkoutSessionList from './WorkoutSessionList';
import AddSessionModal from './modal-body/AddSessionModal';

const AddWorkoutSession = () => {
    const [modalClosed, setModalClosed] = useState(0)

    const { isOpen, onOpen, onClose } = useDisclosure() 

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
                            <AddSessionModal handleClose={handleClose}/>
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="center" alignItems="center">
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
            <WorkoutSessionList refresh={modalClosed} handleClose={handleClose}/>
        </Box>
    )
}

export default AddWorkoutSession