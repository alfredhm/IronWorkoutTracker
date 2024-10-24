import { Input, Textarea, Text, Flex, Box } from "@chakra-ui/react"
import { useRef, useState } from "react";

const Set = () => {
    const [height, setHeight] = useState("auto")
    const [minHeight] = useState("18px")
    const textareaRef = useRef(null);
    
    // Expand the textarea to fit content when focused
    const handleFocus = () => {
        const textarea = textareaRef.current;
        setHeight(`${textarea.scrollHeight}px`);  // Grow to fit content
    };

    // Shrink the textarea to minimum height when losing focus
    const handleBlur = (e) => {
        if (e.target.value === ""){
            setHeight(minHeight);  // Reset to minimum height when clicking off
        }
    };

    // Adjust the height while typing
    const handleInput = (e) => {
        const textarea = e.target;
            setHeight("auto");  // Reset the height to auto to calculate new height
            setHeight(`${textarea.scrollHeight}px`);  // Adjust height to content
    };
    return (
        <Flex gap={3} py={2} position="relative" borderBottom="1px solid" borderColor="rgba(256, 256, 256, 0.3)">
        <Flex alignItems="center" justifyContent="center">
          <Flex h={7} w={7} alignItems="center" justifyContent="center" border="1px solid" borderColor="rgba(256, 256, 256, 0.3)" borderRadius="25px">
            <Text color="rgba(256, 256, 256, 0.3)" fontSize="x-small" p={2}>
              1
            </Text>
          </Flex>
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
              resize="vertical"
              height={height}
              overflow="hidden"
              p={0}
              border={0}
              fontSize={12}
              color="rgba(256, 256, 256, 0.85)" 
              css={{
                  '&::-webkit-resizer': {
                    display: 'none',
                  },
                }}
              _focus={{
                  outline: "none",
                  boxShadow: "none",
                  borderColor: "transparent"
                }}
              onFocus={handleFocus}
              onInput={handleInput}
              onBlur={(e) => handleBlur(e)}
            />
          </Flex>
        </Flex>
      </Flex>
    )
}

export default Set