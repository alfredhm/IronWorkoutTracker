import { Heading, Box, Image } from "@chakra-ui/react";

const MainHeader = () => {
  return (
    <Box w="100%" py={5}>
      <Image 
        src={process.env.PUBLIC_URL + '/assets/weights.jpg'} 
        w="100%"
        zIndex={1}
      />
      <Box
        zIndex={10}
        position="absolute"
        textAlign="center"
        bottom={{base: '80%', md: '78%', lg: '67%', xl: '65%', '2xl': '60%'}}
        w="100%"
      >
        <Heading 
          fontSize={{ sm: 'xl', md: '2xl', lg: '4xl', xl: '4xl', '2xl': '5xl'}}
          color="white"
        >
          Remove the Mental Weight off of Fitness and Get To It.
        </Heading>
      </Box>
    </Box>

  );
};

export default MainHeader;
