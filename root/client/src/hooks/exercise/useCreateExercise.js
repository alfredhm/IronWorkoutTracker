import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../resources/axiosInstance';

const useCreateExercise = (workoutId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (newExercise) => {
            const response = await axiosInstance.post(`/exercises`, newExercise);
            return response.data;
        },
        {
            onSuccess: (newExercise) => {
                queryClient.setQueryData(['exercises', workoutId], (oldExercises) => {
                    if (!oldExercises) return [newExercise];
                    return [...oldExercises, newExercise];
                });
            },
            onError: (error) => {
                console.error('Error creating exercise:', error);
            },
        }
    );
};

export default useCreateExercise;
