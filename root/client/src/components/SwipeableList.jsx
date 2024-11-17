import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  IconButton,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const SwipeableList = ({ items, onDelete }) => {
  const [activeItem, setActiveItem] = useState(null); // Tracks active item for delete extension
  const [startX, setStartX] = useState(null); // Swipe start position
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal controls
  const [deleteItem, setDeleteItem] = useState(null); // Tracks the item to delete

  const listRef = useRef(null);

  const SWIPE_THRESHOLD = 100; // Swipe distance threshold for triggering delete

  // Handle swipe start
  const handleSwipeStart = (e, id) => {
    setStartX(e.touches[0].clientX);
    setActiveItem(null); // Reset active item on new swipe
  };

  // Handle swipe end
  const handleSwipeEnd = (e, id) => {
    const endX = e.changedTouches[0].clientX;
    const swipeDistance = startX - endX;

    // If swipe distance exceeds threshold, show delete extension
    if (swipeDistance > SWIPE_THRESHOLD) {
      setActiveItem(id); // Activate delete button
    } else {
      setActiveItem(null); // Reset if swipe distance is too small
    }
    setStartX(null); // Reset start position
  };

  // Confirm delete
  const confirmDelete = () => {
    onDelete(deleteItem);
    onClose();
    setActiveItem(null);
    setDeleteItem(null);
  };

  // Close swipe or reset state when clicking outside
  const handleClickOutside = (e) => {
    if (listRef.current && !listRef.current.contains(e.target)) {
      setActiveItem(null);
    }
  };

  // Attach and detach event listeners for clicking outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box w="100%">
      {/* List */}
      <VStack spacing={4} align="stretch" ref={listRef} w="100%">
        {items.map((item) => (
          <Box
            key={item._id}
            bg="gray.100"
            position="relative"
            rounded="md"
            overflow="hidden"
            boxShadow="md"
            w="100%"
            display="flex"
            alignItems="center"
          >
            {/* Item Content */}
            <Box
              bg="white"
              px={4}
              py={2}
              position="relative"
              zIndex={1}
              w="100%"
              transform={activeItem === item._id ? "translateX(-80px)" : "translateX(0)"}
              transition="transform 0.3s"
              onTouchStart={(e) => handleSwipeStart(e, item._id)}
              onTouchEnd={(e) => handleSwipeEnd(e, item._id)}
            >
              <Text>{item.text}</Text>
            </Box>

            {/* Delete Extension with Trash Icon */}
            <Box
              bg="red.500"
              color="white"
              position="absolute"
              top={0}
              bottom={0}
              right={0}
              width="80px"
              display={activeItem === item._id ? "flex" : "none"}
              alignItems="center"
              justifyContent="center"
              zIndex={0}
              onClick={() => {
                setDeleteItem(item._id);
                onOpen();
              }}
            >
              <IconButton
                aria-label="Delete"
                icon={<DeleteIcon />}
                colorScheme="whiteAlpha"
                size="lg"
              />
            </Box>
          </Box>
        ))}
      </VStack>

      {/* Confirmation Modal */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg="white"
            p={6}
            rounded="md"
            shadow="lg"
            textAlign="center"
            maxW="sm"
            mx="auto"
          >
            <Text mb={4}>Are you sure you want to delete this item?</Text>
            <HStack justifyContent="center">
              <IconButton
                aria-label="Confirm Delete"
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={confirmDelete}
                size="lg"
              />
              <Button onClick={onClose}>Cancel</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SwipeableList;

