import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditSessionModal from "./modal-body/EditSessionModal";
import daysOfWeek from "../resources/daysOfWeek";
import getTimeOfDay from "../resources/getTimeOfDay";
import getElapsedDurationSec from "../resources/sessionDuration";
import ErrorModal from "./ErrorModal";
import WorkoutSessionCard from "./WorkoutSessionCard";
import DeleteWorkoutDialog from "./DeleteWorkoutDialog";
axios.defaults.withCredentials = true;

const WorkoutSessionList = ({
  dashboardRefresh,
  startedWorkout,
  setStartedWorkout,
}) => {
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
  const editSessionModalRef = useRef();
  const activeWorkoutTimerRef = useRef(null);
  const scrollContainerRef = useRef();
  const refreshThreshold = 100;
  const minSpinnerDisplayTime = 500;
  const navigate = useNavigate();

  const location = useLocation();
  const userState = location.state;
  const uid = userState.uid;

  const refreshWorkoutSessions = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      const response = await axios.get(
        `http://localhost:5000/api/workoutsessions/user/${uid}`,
      );
      const updatedData = response.data.map((item) => {
        const date = new Date(item.date);
        return {
          ...item,
          date: {
            day: daysOfWeek[date.getDay()],
            month: date.getMonth() + 1,
            date: date.getDate(),
            year: date.getFullYear(),
          },
        };
      });
      setWorkouts(updatedData);
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
  }, [uid]);

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
      refreshWorkoutSessions();
    }
    setPullDownDistance(0);
    setPullStart(null);
  }, [pullDownDistance, refreshWorkoutSessions]);

  const startWorkoutTimer = useCallback((workoutId) => {
    const previousTimer = activeWorkoutTimerRef.current;
    activeWorkoutTimerRef.current = {
      workoutId,
      startedAt: Date.now(),
      accumulatedSec:
        previousTimer?.workoutId === workoutId
          ? previousTimer.accumulatedSec
          : 0,
    };
  }, []);

  const pauseWorkoutTimer = useCallback((workoutId) => {
    const timer = activeWorkoutTimerRef.current;
    if (timer?.workoutId !== workoutId || timer.startedAt === null) return;

    timer.accumulatedSec += getElapsedDurationSec(timer.startedAt);
    timer.startedAt = null;
  }, []);

  const handleAddSession = async () => {
    const currentDate = new Date();
    const currTimeOfDay = getTimeOfDay(currentDate);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/workoutsessions`,
        {
          userId: uid,
          name: `${currTimeOfDay} Workout`,
          durationSec: 0,
        },
      );
      await refreshWorkoutSessions();
      setNewWorkoutId(res.data._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/workoutsessions/${deletedWorkoutId}`,
      );
      await refreshWorkoutSessions();
      onDeleteClose();
      onClose();
      setSelectedWorkout(null);
      if (activeWorkoutTimerRef.current?.workoutId === deletedWorkoutId) {
        activeWorkoutTimerRef.current = null;
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndSession = async (workoutId) => {
    const activeTimer = activeWorkoutTimerRef.current;
    const secondsElapsed =
      activeTimer?.workoutId === workoutId
        ? activeTimer.accumulatedSec +
          (activeTimer.startedAt === null
            ? 0
            : getElapsedDurationSec(activeTimer.startedAt))
        : getElapsedDurationSec(Date.now());
    try {
      await axios.put(
        `http://localhost:5000/api/workoutsessions/${workoutId}`,
        {
          userId: uid,
          durationSec: secondsElapsed,
        },
      );
      activeWorkoutTimerRef.current = null;
      await refreshWorkoutSessions();
      return secondsElapsed;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWorkoutClick = (workout) => {
    startWorkoutTimer(workout._id);
    setSelectedWorkout(workout);
    onOpen();
  };

  const handleSaveAndClose = async () => {
    if (editSessionModalRef.current) {
      await editSessionModalRef.current.submitForm();
    }
    if (selectedWorkout) pauseWorkoutTimer(selectedWorkout._id);
    setSelectedWorkout(null);
    onClose();
    await refreshWorkoutSessions();
  };

  useEffect(() => {
    if (!uid) {
      navigate("/login");
      return;
    }
    refreshWorkoutSessions();
  }, [uid, navigate, dashboardRefresh, refreshWorkoutSessions]);

  useEffect(() => {
    if (newWorkoutId && workouts.length > 0) {
      const newWorkout = workouts.find(
        (workout) => workout._id === newWorkoutId,
      );
      if (newWorkout) {
        startWorkoutTimer(newWorkout._id);
        setSelectedWorkout(newWorkout);
        onOpen();
        setNewWorkoutId(null);
      }
    }
  }, [newWorkoutId, workouts, onOpen, setNewWorkoutId, startWorkoutTimer]);

  useEffect(() => {
    if (startedWorkout) {
      const workoutToSelect = workouts.find(
        (workout) => workout._id === startedWorkout._id,
      );
      if (workoutToSelect) {
        startWorkoutTimer(workoutToSelect._id);
        setSelectedWorkout(workoutToSelect);
        onOpen();
        setStartedWorkout(null);
      }
    }
  }, [startedWorkout, workouts, onOpen, setStartedWorkout, startWorkoutTimer]);

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
      <Flex w="100%" justifyContent="flex-end" pb={4}>
        <Button
          bg="blue.400"
          p={0}
          width="100%"
          height="40px"
          onClick={handleAddSession}
        >
          <Image
            maxHeight="13px"
            src={process.env.PUBLIC_URL + "/assets/plus.png"}
          />
        </Button>
      </Flex>
      <Flex
        flexDir="column"
        gap="10px"
        overflowY="auto"
        maxH="calc(100vh - 150px)"
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {workouts.length === 0 ? (
          <Box color="white" textAlign="center" fontSize="lg" fontWeight="600">
            No better time to start than now!
          </Box>
        ) : (
          workouts
            .slice()
            .reverse()
            .map((workout) => (
              <Box key={workout._id}>
                <WorkoutSessionCard
                  workout={workout}
                  onOpen={handleWorkoutClick}
                  onDelete={(workoutId) => {
                    setDeletedWorkoutId(workoutId);
                    onDeleteOpen();
                  }}
                />
              </Box>
            ))
        )}
      </Flex>
      {selectedWorkout && (
        <Modal isOpen={isOpen} onClose={handleSaveAndClose}>
          <ModalOverlay />
          <ModalContent
            mx="auto"
            my="auto"
            aria-hidden="false"
            bgColor="gray.700"
          >
            <ModalBody>
              <EditSessionModal
                ref={editSessionModalRef}
                closeSessionList={handleSaveAndClose}
                selectedWorkout={selectedWorkout}
                handleDeleteSession={onDeleteOpen}
                setDeletedWorkoutId={setDeletedWorkoutId}
                handleEndSession={handleEndSession}
                noRefreshClose={onClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <DeleteWorkoutDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteSession}
      />
    </>
  );
};

export default WorkoutSessionList;
