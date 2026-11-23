import {
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

const AccountOverview = ({
  bodyStats,
  email,
  profileLoadError,
  onEditProfile,
  onSendFeedback,
}) => (
  <>
    <Heading color="white" fontSize={32}>
      Profile
    </Heading>
    <List
      display="flex"
      flexDir="column"
      pt={4}
      justifyContent="space-between"
      h="calc(100% - 107px)"
    >
      <Flex flexDir="column">
        <Heading mb={4} fontSize="x-large" fontWeight="600" color="white">
          Account
        </Heading>
        <Button
          bg="gray.600"
          p={2}
          w="100%"
          onClick={onEditProfile}
          aria-label="Edit account profile"
        >
          <Flex w="100%" align="center">
            <Text fontSize="md" color="white">
              {email}
            </Text>
            <ChevronRightIcon ml="auto" color="white" boxSize={6} />
          </Flex>
        </Button>
        <Box
          bg="gray.800"
          color="white"
          border="1px solid"
          borderColor="gray.600"
          borderRadius="xl"
          p={4}
          mt={3}
        >
          <Heading color="white" fontSize="md" fontWeight="semibold" mb={3}>
            Body stats
          </Heading>
          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            }}
            gap={3}
          >
            {bodyStats.map((stat) => (
              <Box key={stat.label} bg="gray.700" borderRadius="lg" p={3}>
                <Text color="gray.300" fontSize="xs">
                  {stat.label}
                </Text>
                <Text color="white" fontWeight="semibold" fontSize="sm">
                  {stat.value}
                </Text>
              </Box>
            ))}
          </Box>
          <Text color="gray.400" fontSize="xs" mt={3}>
            BMI uses your saved height and latest body-weight entry.
          </Text>
          {profileLoadError && (
            <Text color="red.300" fontSize="xs" mt={2}>
              {profileLoadError}
            </Text>
          )}
        </Box>
      </Flex>
      <ListItem>
        <Button
          w="100%"
          color="white"
          bg="blue.400"
          onClick={onSendFeedback}
          size="md"
        >
          Send Feedback
        </Button>
      </ListItem>
    </List>
  </>
);

export default AccountOverview;
