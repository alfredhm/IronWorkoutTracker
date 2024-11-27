import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../resources/axiosInstance';

const useUpdateExercise = (workoutId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async ({ exerciseId, updates }) => {
            const response = await axiosInstance.put(`/exercises/${exerciseId}`, updates);
            return response.data;
        },
        {
            onMutate: async ({ exerciseId, updates }) => {
                await queryClient.cancelQueries(['exercises', workoutId]);

                const previousExercises = queryClient.getQueryData(['exercises', workoutId]);

                queryClient.setQueryData(['exercises', workoutId], (oldExercises) =>
                    oldExercises.map((exercise) =>
                        exercise._id === exerciseId ? { ...exercise, ...updates } : exercise
                    )
                );

                return { previousExercises };
            },
            onError: (error, { exerciseId, updates }, context) => {
                queryClient.setQueryData(['exercises', workoutId], context.previousExercises);
            },
            onSettled: () => {
                queryClient.invalidateQueries(['exercises', workoutId], { refetchType: 'none' });
            },
        }
    );
};

export default useUpdateExercise;
