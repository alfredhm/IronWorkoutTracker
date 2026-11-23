import { Box, Flex, IconButton, List, ListItem } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import formatTime from "../resources/formatTime";

const WorkoutSessionCard = ({ workout, onOpen, onDelete }) => (
  <Flex
    onClick={() => onOpen(workout)}
    flexDir="column"
    bg="gray.800"
    width="100%"
    minH="60px"
    borderRadius="12px"
    p={3}
    pt={2}
    pr={2}
    pb={2}
    justify="space-between"
    _hover={{ cursor: "pointer", bg: "gray.600" }}
  >
    <Flex w="100%" justify="space-between" gap="15px">
      <Flex justify="space-between" w="100%">
        <Flex w="70%" gap="10px">
          <Flex mt={1} width="50px" height="50px" flexDir="column">
            <Box
              pb={1}
              bg="gray.600"
              height="45%"
              borderBottom="1px solid gray"
              borderRadius="12px 12px 0px 0px"
              color="white"
              textAlign="center"
              fontSize="xs"
              fontWeight="500"
            >
              {workout.date.day}
            </Box>
            <Box
              bg="blue.400"
              height="55%"
              textAlign="center"
              borderRadius="0px 0px 12px 12px"
              color="gray.100"
              fontSize="lg"
              fontWeight="600"
            >
              {workout.date.date}
            </Box>
          </Flex>
          <Flex justify="center" flexDir="column" color="white" w="65%">
            <Box>{workout.name}</Box>
            <List minH="30px">
              {workout.exercises ? (
                workout.exercises.map((exercise) => (
                  <ListItem
                    color="gray.300"
                    fontSize="xs"
                    key={exercise._id}
                  >
                    {exercise.sets.length}x {exercise.name}
                  </ListItem>
                ))
              ) : (
                <ListItem h="50px" color="gray.300" fontSize="xs" />
              )}
            </List>
          </Flex>
        </Flex>
        <Flex
          minH="60px"
          justify="space-between"
          textAlign="right"
          flexDir="column"
          color="white"
          align="flex-end"
        >
          <IconButton
            icon={<DeleteIcon />}
            aria-label={`Delete ${workout.name}`}
            variant="ghost"
            color="gray.400"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(workout._id);
            }}
          />
          <Box fontSize="xs">
            {workout.durationSec > 0
              ? formatTime(workout.durationSec)
              : "In Progress"}
          </Box>
        </Flex>
      </Flex>
    </Flex>
  </Flex>
);

export default WorkoutSessionCard;
