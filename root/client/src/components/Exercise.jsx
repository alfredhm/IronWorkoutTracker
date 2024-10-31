import { Flex, List, ListItem, Text } from "@chakra-ui/react"
import Set from "./Set"
import { HamburgerIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"
import axios from "axios"

const Exercise = ({ exercise }) => {
    const [error, setError] = useState('')
    const [sets, setSets] = useState([{
        exerciseId: exercise._id
    }])

    const handleAddSet = () => {
        const newSet = {
            exerciseId: exercise._id
        }
        setSets([...sets, newSet])
    }

    useEffect(() => {
      const loadSets = async () => {
        try {
            console.log("x")
            const response = await axios.get(`http://localhost:5000/api/sets/exercise/${exercise._id}`)
            if (response.data.length > 0) {
                setSets(response.data)
            }
            
        } catch(err) {
            setError(err.message)
        }
      }  
      loadSets()
    })
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
                    <List>
                        {sets.map((set, index) => (
                            <ListItem key={set._id || `set-${index}`}>
                                <Set exercise={exercise} index={index + 1}/>
                            </ListItem>
                        ))}
                    </List>            
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