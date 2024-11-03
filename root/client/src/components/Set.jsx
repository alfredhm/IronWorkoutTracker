import { Input, Textarea, Text, Flex, Box, Image } from "@chakra-ui/react";
import {  useRef, useState } from "react";

const Set = ({ index, set, onChange, onDelete }) => {
    const [height, setHeight] = useState("auto");
    const minHeight = "18px";
    const textareaRef = useRef(null);
    
    // Adjust the height to fit content when focused
    const handleFocus = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            setHeight(`${textarea.scrollHeight}px`);  // Grow to fit content
        }
    };

    // Reset height to minimum if input is empty on blur
    const handleBlur = (e) => {
        if (e.target.value === "") {
            setHeight(minHeight);  // Reset to minimum height
        }
    };

    // Adjust the height dynamically as the user types
    const handleInput = (e) => {
        const textarea = e.target;
        setHeight("auto");  // Temporarily reset to auto
        setHeight(`${textarea.scrollHeight}px`);  // Set height to match content
    };

     // Handle changes to inputs and call onChange with updated values
    const handleUpdateInputChange = (e, field) => {
        const updatedValue = e.target.value
        const updatedSet = { ...set, [field]: updatedValue }
        onChange(set._id || `set-${index}`, updatedSet)
    }

    // Handle changes to inputs and call onChange with updated values
    const handleDeleteInputChange = (e) => {
        const setId = set._id
        onDelete(set._id)
    }


    return (
        <Flex gap={3} py={2} position="relative" borderBottom="1px solid" borderColor="rgba(256, 256, 256, 0.3)">
            <Flex alignItems="center" justifyContent="center">
                <Box
                    h={7}
                    w={7}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor="rgba(256, 256, 256, 0.3)"
                    borderRadius="25px"
                    position="relative"
                    _hover={{
                        backgroundColor: 'red.300',
                        cursor: 'pointer'
                    }}
                    role="group" // Enables grouping for hover effect
                    onClick={(e) => handleDeleteInputChange(e)}
                >
                    <Text
                        color="rgba(256, 256, 256, 0.3)"
                        fontSize="x-small"
                        p={2}
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        opacity={1}
                        _groupHover={{ opacity: 0 }}
                    >
                        {index + 1}
                    </Text>
                    <Image
                        h={3}
                        src={process.env.PUBLIC_URL + '/assets/close.png'}
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                    />
                </Box>
            </Flex>
            <Flex position="relative" w="100%">
                <Box position="absolute" top={0} left={0}>
                    <Flex flexDir="column" alignItems="center" justifyContent="center">
                        <Text color="rgba(256, 256, 256, 0.6)" fontSize="x-small">
                            +Lb
                        </Text>
                        <Input
                            type="number"
                            p={0}
                            textAlign="center"
                            h="auto"
                            maxW={7}
                            placeholder="0"
                            fontSize={12}
                            color="rgba(256, 256, 256, 0.85)"
                            border={0}
                            _focus={{
                                outline: "none",
                                boxShadow: "none",
                                borderColor: "transparent"
                            }}
                            max={2000}
                            value={set.weight || ''}
                            onChange={(e) => handleUpdateInputChange(e, 'weight')}
                        />
                    </Flex>
                </Box>
                <Box position="absolute" top={0} left={50}>
                    <Flex flexDir="column" alignItems="center" justifyContent="center">
                        <Text color="rgba(256, 256, 256, 0.6)" fontSize="x-small">
                            Reps
                        </Text>
                        <Input
                            type="number"
                            p={0}
                            textAlign="center"
                            h="auto"
                            maxW={7}
                            placeholder="0"
                            fontSize={12}
                            color="rgba(256, 256, 256, 0.85)"
                            border={0}
                            _focus={{
                                outline: "none",
                                boxShadow: "none",
                                borderColor: "transparent"
                            }}
                            max={100}
                            value={set.reps || ''}
                            onChange={(e) => handleUpdateInputChange(e, 'reps')}
                        />
                    </Flex>
                </Box>
                <Flex flexDir="column" w="100%" ml="120px">
                    <Text color="rgba(256, 256, 256, 0.6)" fontSize="x-small" mb={1}>
                        Notes
                    </Text>
                    <Textarea
                        ref={textareaRef}
                        minW="150px"
                        maxW="150px"
                        maxH="100px"
                        minH={minHeight}
                        rows={1}
                        resize="none"  // Prevent manual resizing
                        height={height}
                        maxLength={164}
                        overflow="hidden"
                        p={0}
                        border={0}
                        fontSize={12}
                        color="rgba(256, 256, 256, 0.85)"
                        sx={{
                            transition: 'height 0.2s ease-in-out',  // Smooth height transition
                        }}
                        _focus={{
                            outline: "none",
                            boxShadow: "none",
                            borderColor: "transparent"
                        }}
                        onFocus={handleFocus}
                        onInput={handleInput}
                        onBlur={handleBlur}
                        value={set.notes || ''}
                        onChange={(e) => handleUpdateInputChange(e, 'notes')}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
}

export default Set;
