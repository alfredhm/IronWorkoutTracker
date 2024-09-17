import { Box } from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import MainHeader from "../components/MainHeader";
import MainDescription from "../components/MainDescription";

const HomePage = () => {
    return (
      <>
        <Box h="200%" bgColor="gray.700" >
          <Box zIndex={2} display="flex" flexDirection='column' justifyContent="center" alignItems="center" h="100%">
            <NavBar />
            <MainHeader />
          </Box>
          <Box display="flex" flexDirection='column' justifyContent="center" alignItems="center" px={6}>
            <MainDescription />
          </Box>
          <Box h="1500px"></Box>
        </Box>
      </>

    )
}

export default HomePage