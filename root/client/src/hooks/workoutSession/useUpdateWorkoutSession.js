import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../resources/axiosInstance';
import daysOfWeek from '../../resources/daysOfWeek';

const useUpdateWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workoutSessionId, updates }) => {
            // Make API call to update the workout session
            const response = await axiosInstance.put(`/workoutsessions/${workoutSessionId}`, updates);
            return response.data;
        },
        onMutate: async ({ workoutSessionId, updates }) => {
            // Cancel any ongoing queries to avoid overwriting optimistic updates
            await queryClient.cancelQueries(['workoutSessions']);

            // Snapshot the previous data for rollback in case of error
            const previousWorkoutSessions = queryClient.getQueryData(['workoutSessions']);

            // Optimistically update the cache
            queryClient.setQueryData(['workoutSessions'], (workoutSessions) => {
                if (!workoutSessions) return;

                return {
                    ...workoutSessions,
                    pages: workoutSessions.pages.map((page) =>
                        page.map((session) =>
                            session._id === workoutSessionId
                                ? {
                                      ...session,
                                      ...updates,
                                      // Format date if it was updated
                                      ...(updates.date && {
                                          date: formatDate(updates.date),
                                      }),
                                  }
                                : session
                        )
                    ),
                };
            });

            // Return a rollback context
            return { previousWorkoutSessions };
        },
        onError: (error, { workoutSessionId, updates }, context) => {
            console.error('Error updating workout session:', error);

            // Rollback to previous data in case of error
            if (context?.previousWorkoutSessions) {
                queryClient.setQueryData(['workoutSessions'], context.previousWorkoutSessions);
            }
        },
        onSettled: () => {
            // Optionally refetch the workout sessions to ensure consistency
            queryClient.invalidateQueries(['workoutSessions'], { refetchType: 'none' });
        },
    });
};

// Helper function to format the date
const formatDate = (date) => {
    const formattedDate = new Date(date);
    return {
        day: daysOfWeek[formattedDate.getDay()],
        month: formattedDate.getMonth() + 1,
        date: formattedDate.getDate(),
        year: formattedDate.getFullYear(),
    };
};

export default useUpdateWorkoutSession;
