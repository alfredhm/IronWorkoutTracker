import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../resources/axiosInstance';

const useExercises = (workoutId) => {
    return useQuery(['exercises', workoutId], async () => {
        const sessionResponse = await axiosInstance.get(`/workoutsessions/${workoutId}`);
        const exerciseIDs = sessionResponse.data.exercises;

        // Fetch details for each exercise
        const exercises = await Promise.all(
            exerciseIDs.map(async (exerciseID) => {
                const exerciseResponse = await axiosInstance.get(`/exercises/${exerciseID}`);
                return exerciseResponse.data;
            })
        );

        return exercises;
    });
};

export default useExercises;
