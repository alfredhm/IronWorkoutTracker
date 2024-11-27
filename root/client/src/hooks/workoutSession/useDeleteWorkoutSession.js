import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import axiosInstance from '../../resources/axiosInstance'

const useDeleteWorkoutSession = () => {
    const queryClient = useQueryClient()
    const addWorkoutSession = useMutation({
        mutationFn: async (workoutSessionId) => {
            const response = await axiosInstance.delete(`/workoutsessions/${workoutSessionId}`)
            return response.data
        },
        onMutate: (workoutSessionId) => {
            // Cancel any outgoing queries for workout sessions
            queryClient.cancelQueries(['workoutSessions'])

            // Snapshot the previous value
            const previousWorkoutSessions = queryClient.getQueryData(['workoutSessions'])

            // Optimistically update the cache
            queryClient.setQueryData(['workoutSessions'], workoutSessions => {
                if (!workoutSessions) return []
                return {
                    ...workoutSessions,
                    pages: workoutSessions.pages.map(page => 
                        page.filter(session => session._id !== workoutSessionId)
                    )
                }
            })

            // Return the snapshot for potential rollback
            return { previousWorkoutSessions };
        },
        onSuccess: (_, workoutSessionId) => {
            console.log(`Successfully deleted workout session with ID: ${workoutSessionId}`);
        },
        onError: (error, workoutSessionId, context) => {
            console.error('Failed to delete workout session', error);
            // Rollback to the previous state if the mutation fails
            if (context?.previousWorkoutSessions) {
                queryClient.setQueryData(['workoutSessions'], context.previousWorkoutSessions);
            }
        },
    })

    return addWorkoutSession
}

export default useDeleteWorkoutSession