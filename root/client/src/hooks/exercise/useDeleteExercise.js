import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../resources/axiosInstance';

const useDeleteExercise = (workoutId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (exerciseId) => {
            await axiosInstance.delete(`/exercises/${exerciseId}`);
            return exerciseId;
        },
        {
            onMutate: async (exerciseId) => {
                await queryClient.cancelQueries(['exercises', workoutId]);

                const previousExercises = queryClient.getQueryData(['exercises', workoutId]);

                queryClient.setQueryData(['exercises', workoutId], (oldExercises) =>
                    oldExercises.filter((exercise) => exercise._id !== exerciseId)
                );

                return { previousExercises };
            },
            onError: (error, exerciseId, context) => {
                queryClient.setQueryData(['exercises', workoutId], context.previousExercises);
            },
            onSettled: () => {
                queryClient.invalidateQueries(['exercises', workoutId], { refetchType: 'none' });
            },
        }
    );
};

export default useDeleteExercise;
