import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import axiosInstance from '../../resources/axiosInstance'
import daysOfWeek from '../../resources/daysOfWeek'

const useCreateWorkoutSession = () => {
    const queryClient = useQueryClient()
    const addWorkoutSession = useMutation({
        mutationFn: async (workoutSession) => {
            const response = await axiosInstance.post('/workoutsessions', workoutSession)
            return response.data
        },
        onSuccess: (newWorkoutSession) => {
            // Format the date
            const formattedDate = new Date(newWorkoutSession.date);
            const updatedWorkoutSession = {
                ...newWorkoutSession,
                date: {
                    day: daysOfWeek[formattedDate.getDay()],
                    month: formattedDate.getMonth() + 1,
                    date: formattedDate.getDate(),
                    year: formattedDate.getFullYear(),
                },
            };

            // Update the cache
            queryClient.setQueryData(['workoutSessions'], (workoutSessions) => {
                if (!workoutSessions) return;
                return {
                    ...workoutSessions,
                    pages: [
                        [updatedWorkoutSession, ...workoutSessions.pages[0]], // Add new session to the first page
                        ...workoutSessions.pages.slice(1),
                    ],
                };
            });
        },
        onError: (error) => {
            console.error('Failed to create workout session', error)
        }
    })

    return addWorkoutSession
}

export default useCreateWorkoutSession