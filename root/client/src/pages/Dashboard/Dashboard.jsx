import { Box, Tabs, Text, TabList, Tab, TabPanels, TabPanel, Flex } from "@chakra-ui/react"
import NavBar from "../../components/NavBar"
import Log from "./Log"
import CalendarPage from "./CalendarPage"
import { GrNotes } from "react-icons/gr"
import { PiBarbellBold } from "react-icons/pi"
import { IoCalendarOutline } from "react-icons/io5"
import { RiAccountCircleLine } from "react-icons/ri"
import Workouts from "./Workouts"
import AccountPage from "../Account/AccountPage"

const Dashboard = () => {
    return (
        <Box display="flex" flexDir="column" alignItems="center" w="100vw" minH="100vh" bgColor="gray.700">
            <NavBar />
            <Box w={['100%', '100%', '700px']}>
                <Tabs variant="soft-rounded" width="100%" isFitted display="flex" flexDirection="column" justifyContent="space-between">
                    <TabPanels>
                        <TabPanel>
                            <Log />
                        </TabPanel>
                        <TabPanel>
                            <Workouts />
                        </TabPanel>
                        <TabPanel>
                            <CalendarPage />
                        </TabPanel>
                        <TabPanel>
                            <AccountPage />
                        </TabPanel>
                    </TabPanels>
                    <Box display="flex" justifyContent="center">
                        <TabList w={['100%', '100%', '700px']} position="fixed" bottom="0"  borderRadius="10px 10px 0px 0px" bg="gray.800" color="white" width="100%">
                            <Tab _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                <Flex flexDir="column" alignItems="center">
                                    <GrNotes size="25px"/>
                                    <Text pt={1} fontSize="small">Log</Text>
                                </Flex>
                            </Tab>
                            <Tab _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                <Flex flexDir="column" alignItems="center">
                                    <PiBarbellBold size="25px" />
                                    <Text pt={1} fontSize="small">Workouts</Text>
                                </Flex>
                            </Tab>
                            <Tab _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                <Flex flexDir="column" alignItems="center">
                                    <IoCalendarOutline size="25px" />
                                    <Text pt={1} fontSize="small">Calendar</Text>
                                </Flex>
                            </Tab>
                            <Tab _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                <Flex flexDir="column" alignItems="center">
                                    <RiAccountCircleLine size="25px" />
                                    <Text pt={1} fontSize="small">Account</Text>
                                </Flex>
                            </Tab>
                        </TabList>
                    </Box>
                </Tabs>
            </Box>
        </Box>
    )
}

export default Dashboard