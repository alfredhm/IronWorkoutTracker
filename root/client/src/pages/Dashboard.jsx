import { Center, Heading, Box } from "@chakra-ui/react"
import NavBar from "../components/NavBar"
import Calendar from "../components/Calendar"
import AddWorkout from "../components/AddWorkout"

const Dashboard = () => {
    return (
        <Box bgColor="gray.700">
            <NavBar />
            <Center display="flex" flexDir="column">
                <Heading color="white">Let's Get To It!</Heading>
                <Box>
                    <AddWorkout />
                </Box>
                <Box height="510px">

                </Box>
                <Box>
                    <Calendar />
                </Box>
            </Center>
        </Box>
    )
}

export default Dashboard