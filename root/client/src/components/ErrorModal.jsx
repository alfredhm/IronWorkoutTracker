import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
} from '@chakra-ui/react';

const ErrorModal = ({ isOpen, onClose, errorMessage }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent mx="auto" my="auto" bg="gray.700" color="white">
                <ModalHeader borderBottom="1px solid gray">Error</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {errorMessage}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="red" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ErrorModal;