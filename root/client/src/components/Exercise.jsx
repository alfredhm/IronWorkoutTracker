import { Flex, List, ListItem, Text } from "@chakra-ui/react"
import Set from "./Set"
import { HamburgerIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"

const Exercise = ({ exercise }) => {

    const [sets, setSets] = useState(exercise.sets)
    console.log(exercise.sets)

    const handleAddSet = () => {
        setSets(...sets, {})
    }

    useEffect(() => {

    }, [sets])

    return (
        <Flex key={exercise._id} w="100%" border="1px solid white" borderRadius={7} bg="gray.600">
            <Flex w="100%">
                <Flex px={4} flexDir="column" w="100%">
                    <Flex
                        py={2}
                        w="100%"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottom="1px solid"
                        borderColor="rgba(256, 256, 256, 0.3)"
                    >
                        <Text fontSize="small" fontWeight="650">
                        {exercise.name}
                        </Text>
                        <HamburgerIcon />
                    </Flex>              
                    {/* Maps out the sets of each exercise, only leaving a blank one if there are none */}
                    {exercise.sets.length === 0 ? (
                        <Set index={1} />
                            ) : (
                        <>
                        {exercise.sets.map((set, index) => (
                            <List key={set._id}>
                                <ListItem>
                                    <Set exercise={exercise} index={index}/>
                                </ListItem>
                            </List>
                        ))}
                        </>
                    )}
                    <Flex>
                        <Flex py={2} borderBottom="1px solid" borderColor="rgba(256, 256, 256, 0.3)">
                        <Text 
                            color='blue.300' 
                            fontSize="small" 
                            fontWeight="600"
                            _hover={{
                            cursor: 'pointer',
                            color: 'blue.100'
                            }}
                            onClick={handleAddSet}
                            >
                            Add Set
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default Exercise