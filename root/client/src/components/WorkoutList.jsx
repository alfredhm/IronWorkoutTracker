import {
  Box,
  Flex,
  Image,
  Spinner,
  useDisclosure,
  Button,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorModal from "./ErrorModal";
import WorkoutCard from "./WorkoutCard";
import WorkoutEditorDialog from "./WorkoutEditorDialog";
import DeleteWorkoutDialog from "./DeleteWorkoutDialog";

const WorkoutList = ({ setTabIndex, setStartedWorkout }) => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [newWorkoutId, setNewWorkoutId] = useState(null);
  const [deletedWorkoutId, setDeletedWorkoutId] = useState(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState(null);
  const [pullDownDistance, setPullDownDistance] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const editWorkoutModalRef = useRef();
  const scrollContainerRef = useRef();
  const refreshThreshold = 100;
  const minSpinnerDisplayTime = 500;
  const navigate = useNavigate();

  const location = useLocation();
  const userState = location.state;
  const uid = userState.uid;

  // Fetches all the workouts for the user
  const refreshWorkouts = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    try {
      const userWorkouts = await axios.get(
        `http://localhost:5000/api/workouts/user/${uid}`,
      );
      setWorkouts(userWorkouts.data);
    } catch (err) {
      setError("Failed to refresh workouts");
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minSpinnerDisplayTime - elapsedTime;

      // Ensure the spinner stays visible for the minimum display time
      setTimeout(
        () => {
          setIsRefreshing(false);
        },
        Math.max(remainingTime, 0),
      );
    }
  };

  const handleTouchStart = useCallback((event) => {
    if (scrollContainerRef.current.scrollTop === 0) {
      setPullStart(event.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback(
    (event) => {
      if (pullStart !== null) {
        const currentY = event.touches[0].clientY;
        const pullDistance = currentY - pullStart;
        if (pullDistance > 0) {
          setPullDownDistance(pullDistance);
        }
      }
    },
    [pullStart],
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDownDistance > refreshThreshold) {
      refreshWorkouts();
    }
    setPullDownDistance(0);
    setPullStart(null);
  }, [pullDownDistance]);

  // Adds a new workout session to the database
  const handleAddWorkout = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/workouts`, {
        userId: uid,
        name: "Unnamed Workout",
      });
      await refreshWorkouts();
      setNewWorkoutId(res.data._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteWorkout = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/workouts/${deletedWorkoutId}`,
      );
      await refreshWorkouts();
      onDeleteClose();
    } catch (err) {
      setError(err.message);
    }
  };

  // Sets selected workout to the workout clicked and opens the modal
  const handleWorkoutClick = (workout) => {
    setSelectedWorkout(workout);
    onOpen();
  };

  // Close only after the editor has successfully saved or a workout has started.
  const handleCloseWorkout = async () => {
    onClose();
    setSelectedWorkout(null);
    await refreshWorkouts();
  };

  // The editor's successful submit closes the modal through handleCloseWorkout.
  const handleSaveAndClose = async () => {
    if (editWorkoutModalRef.current) {
      await editWorkoutModalRef.current.submitForm();
    }
  };

  useEffect(() => {
    // If no uid, user is not logged in and sent to login page
    if (!uid) {
      navigate("/login");
      return;
    }
    refreshWorkouts();
  }, [uid, navigate]);

  // If a new workout was added, open the modal
  useEffect(() => {
    if (newWorkoutId && workouts.length > 0) {
      const newWorkout = workouts.find(
        (workout) => workout._id === newWorkoutId,
      );
      if (newWorkout) {
        setSelectedWorkout(newWorkout);
        onOpen();
        setNewWorkoutId(null);
      }
    }
  }, [newWorkoutId, workouts]);

  return (
    <>
      {error && (
        <ErrorModal
          isOpen={error.length > 0}
          onClose={() => setError("")}
          errorMessage={error}
        />
      )}
      {pullDownDistance > 0 && (
        <Flex
          top={`-${refreshThreshold}px`}
          w="100%"
          justifyContent="center"
          alignItems="center"
          height="70px"
          transition="transform 0.2s"
          transform={`translateY(${Math.min(pullDownDistance, refreshThreshold)}px)`}
          position="relative"
        >
          {isRefreshing || pullDownDistance >= refreshThreshold ? (
            <Spinner size="lg" color="gray.400" />
          ) : (
            <Box color="gray.500" fontSize="sm">
              Pull to refresh
            </Box>
          )}
        </Flex>
      )}
      <Heading color="white">Workouts</Heading>
      <Flex w="100%" justifyContent="flex-end" pb={4}>
        <Button
          p={0}
          width="30px"
          height="40px"
          bg="gray.800"
          onClick={handleAddWorkout}
        >
          <Image
            maxHeight="13px"
            src={process.env.PUBLIC_URL + "/assets/plus.png"}
          ></Image>
        </Button>
      </Flex>
      <Flex
        flexDir="column"
        gap="10px"
        overflowY="auto"
        maxH="calc(100vh - 190px)"
        width="100%"
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {workouts
          .slice()
          .reverse()
          .map((workout) => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              onClick={() => handleWorkoutClick(workout)}
            />
          ))}
      </Flex>
      {selectedWorkout && (
        <WorkoutEditorDialog
          editorRef={editWorkoutModalRef}
          isOpen={isOpen}
          onClose={handleSaveAndClose}
          onSaved={handleCloseWorkout}
          onDelete={onDeleteOpen}
          selectedWorkout={selectedWorkout}
          setDeletedWorkoutId={setDeletedWorkoutId}
          setStartedWorkout={setStartedWorkout}
          setTabIndex={setTabIndex}
          refreshWorkouts={refreshWorkouts}
        />
      )}
      <DeleteWorkoutDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteWorkout}
      />
    </>
  );
};

export default WorkoutList;
