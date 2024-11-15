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
import { useEffect, useState } from "react"

const Dashboard = () => {
    const [tabIndex, setTabIndex] = useState(0); // State to control selected tab
    const [dashboardRefresh, setDashboardRefresh] = useState(0); // State to refresh components when needed
    const [startedWorkout, setStartedWorkout] = useState("");

    const handleTabChange = (index) => {
        setTabIndex(index); // Update state when a tab is clicked
        if (index === 0) { // Only refresh when returning to "Log" tab for example
            setDashboardRefresh((prev) => prev + 1);
        } // Increment refresh state to refresh components
    };

    return (
        <Box display="flex" flexDir="column" alignItems="center" h="100vh" bgColor="gray.700">
            <Box w={['100%', '100%', '700px']}>
                <Tabs index={tabIndex} variant="soft-rounded" h="100%" width="100%" isFitted display="flex" flexDirection="column" justifyContent="space-between">
                    <TabPanels>
                        <TabPanel>
                            <Log startedWorkout={startedWorkout} setStartedWorkout={setStartedWorkout} dashboardRefresh={dashboardRefresh} />
                        </TabPanel>
                        <TabPanel>
                            <Workouts setStartedWorkout={setStartedWorkout} setTabIndex={handleTabChange}/>
                        </TabPanel>
                        {/*
                            <TabPanel>
                                <CalendarPage />
                            </TabPanel>
                        */}
                        <TabPanel h='100vh'>
                            <AccountPage />
                        </TabPanel>
                    </TabPanels>
                    <Box display="flex" justifyContent="center">
                        <TabList w={['100%', '100%', '700px']} position="fixed" bottom="0" borderRadius="5px 5px 0px 0px" bg="gray.800" color="white" width="100%">
                            <Tab onClick={() => handleTabChange(0)} _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                <Flex flexDir="column" alignItems="center">
                                    <GrNotes size="25px"/>
                                    <Text pt={1} fontSize="small">Log</Text>
                                </Flex>
                            </Tab>
                            <Tab onClick={() => handleTabChange(1)} _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                <Flex flexDir="column" alignItems="center">
                                    <PiBarbellBold size="25px" />
                                    <Text pt={1} fontSize="small">Workouts</Text>
                                </Flex>
                            </Tab>
                            {/*
                                <Tab onClick={() => handleTabChange(2)} _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
                                    <Flex flexDir="column" alignItems="center">
                                        <IoCalendarOutline size="25px" />
                                        <Text pt={1} fontSize="small">Calendar</Text>
                                    </Flex>
                                </Tab>
                            */}
                            <Tab onClick={() => handleTabChange(2)} _selected={{ color: 'blue.200', borderColor: 'blue.200'}}>
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