import { Box, Flex, Image } from "@chakra-ui/react";
import muscleIcons from "../resources/muscleIcons";
import getFocusCount from "../resources/getFocusCount";
import convertToMonthDay from "../resources/convertToMonthDay";

const WorkoutCard = ({ workout, onClick }) => (
  <Box
    onClick={onClick}
    bg="gray.800"
    width="100%"
    minH="75px"
    borderRadius="12px"
    p={3}
    justify="space-between"
    _hover={{ cursor: "pointer", bg: "gray.600" }}
  >
    <Flex width="100%" gap="20px">
      <Flex
        width="100%"
        gap="20px"
        alignItems="center"
        justify="space-between"
      >
        <Flex gap="30px">
          <Flex
            pl={2}
            justify="center"
            flexDir="column"
            color="white"
            minW="40px"
          >
            <Box minW="50px">{workout.name}</Box>
            {window.screen.width > 800 ? (
              workout.notes ? (
                <Box opacity="45%" fontSize="small">
                  {workout.notes.length > 50
                    ? `${workout.notes.slice(0, 50)}...`
                    : workout.notes}
                </Box>
              ) : (
                <Box opacity="0%" fontSize="small">
                  _
                </Box>
              )
            ) : (
              <Box opacity="45%" fontSize="small">
                {convertToMonthDay(workout.createdAt)}
              </Box>
            )}
          </Flex>
        </Flex>
        <Flex alignItems="flex-end">
          {workout.focusGroup
            .slice(0, getFocusCount(workout))
            .map((muscle) => (
              <Box key={muscle}>
                <Image
                  maxHeight={{ base: "40px", sm: "40px", md: "50px" }}
                  src={muscleIcons[muscle]}
                />
              </Box>
            ))}
        </Flex>
      </Flex>
    </Flex>
  </Box>
);

export default WorkoutCard;
