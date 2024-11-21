import { Input, Textarea, Text, Flex, Box, Image } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

const Set = ({ index, set, onChange, onDelete }) => {
    const [height, setHeight] = useState("auto");
    const [completed, setCompleted] = useState(false);
    const minHeight = "18px";
    const textareaRef = useRef(null);
    const lbsRef = useRef(null);

    const handleFocus = () => {
        if (textareaRef.current) setHeight(`${textareaRef.current.scrollHeight}px`);
    };

    const handleBlur = (e) => {
        if (e.target.value === "") setHeight(minHeight);
    };

    const handleInput = (e) => {
        setHeight("auto");
        setHeight(`${e.target.scrollHeight}px`);
    };

    const handleUpdateInputChange = (e, field) => {
        onChange({ [field]: e.target.value });
    };

    useEffect(() => {
        if (set.reps) {
            if (!set.weight) {
                set.weight = 0;
                lbsRef.current.value = 0;
            }
            setCompleted(true);
        } else {
            setCompleted(false);
        }
    })

    return (
        <Flex gap={3} py={2} position="relative" borderBottom="1px solid" borderColor="rgba(256, 256, 256, 0.3)">
            <Flex alignItems="center" justifyContent="center">
                <Box
                    h={7}
                    w={7}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="2px solid"
                    borderColor={completed ? "white" : "rgba(256, 256, 256, 0.3)"}
                    borderRadius="25px"
                    position="relative"
                    _hover={{
                        backgroundColor: 'red.300',
                        cursor: 'pointer'
                    }}
                    onClick={onDelete}
                    role="group" 
                >
                    <Text
                        color={completed ? "white" : "rgba(256, 256, 256, 0.3)"}
                        fontSize="12px"
                        fontWeight="700"
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
                        <Text color="rgba(256, 256, 256, 0.6)" fontSize="10px">
                            Lb(s)
                        </Text>
                        <Input
                            type="number"
                            onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                            p={0}
                            textAlign="center"
                            h="auto"
                            maxW={7}
                            placeholder="0"
                            fontSize="16px"
                            color="rgba(256, 256, 256, 0.85)"
                            border={0}
                            _focus={{
                                outline: "none",
                                boxShadow: "none",
                                borderColor: "transparent"
                            }}
                            max={2000}
                            ref={lbsRef}
                            value={set.weight || ''}
                            onChange={(e) => handleUpdateInputChange(e, 'weight')}
                        />
                    </Flex>
                </Box>
                <Box position="absolute" top={0} left={50}>
                    <Flex flexDir="column" alignItems="center" justifyContent="center">
                        <Text color="rgba(256, 256, 256, 0.6)" fontSize="10px">
                            Reps
                        </Text>
                        <Input
                            type="number"
                            p={0}
                            textAlign="center"
                            h="auto"
                            maxW={7}
                            placeholder="0"
                            fontSize="16px"
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
                    <Text color="rgba(256, 256, 256, 0.6)" fontSize="10px" mb={1}>
                        Notes
                    </Text>
                    <Textarea
                        ref={textareaRef}
                        minW="150px"
                        maxW="150px"
                        maxH="100px"
                        minH={minHeight}
                        rows={1}
                        resize="none"
                        height={height}
                        maxLength={164}
                        overflow="hidden"
                        p={0}
                        border={0}
                        fontSize="16px"
                        color="rgba(256, 256, 256, 0.85)"
                        sx={{
                            transition: 'height 0.2s ease-in-out',
                        }}
                        _focus={{
                            outline: "none",
                            boxShadow: "none",
                            borderColor: "transparent"
                        }}
                        onFocus={handleFocus}
                        onInput={handleInput}
                        onBlur={handleBlur}
                        value={set.notes}
                        onChange={(e) => handleUpdateInputChange(e, 'notes')}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Set;


