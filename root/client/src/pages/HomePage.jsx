import { Box } from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import MainHeader from "../components/MainHeader";
import MainDescription from "../components/MainDescription";

const HomePage = () => {
    return (
      <>
        <Box w="100vw" height="100vh" bgColor="gray.700" >
          <Box zIndex={2} display="flex" flexDirection='column' justifyContent="center" alignItems="center">
            <NavBar />
            <MainHeader />
          </Box>
          <Box display="flex" flexDirection='column' justifyContent="center" alignItems="center" px={6}>
            <MainDescription />
          </Box>
        </Box>
      </>
 
    )
}

export default HomePage