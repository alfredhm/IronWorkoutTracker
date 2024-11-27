import React from 'react'
import axiosInstance from '../../resources/axiosInstance';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import daysOfWeek from '../../resources/daysOfWeek';

const useWorkoutSessions = (uid, { pageSize }) => {
    const fetchWorkoutSessions = async (uid, { pageParam }) => {
        try {
            const response = await axiosInstance.get(`/workoutsessions/user/${uid}`, {
                params: {
                    _start: (pageParam - 1) * pageSize,
                    _limit: pageSize,
                }
            });
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

            return updatedData;
        } catch (error) {
            throw new Error('Failed to fetch workout sessions', error.message)
        }
        
    };
    
    return useInfiniteQuery({
        queryKey: ['workoutSessions'],
        queryFn: ({ pageParam = 1 }) => fetchWorkoutSessions(uid, { pageParam }),
        staleTime: 1000 * 60 * 2,
        enabled: !!uid,
        refetchInterval: 1000 * 60 * 2,
        keepPreviousData: true,
        placeholderData: { pages: [], pageParams: [] },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 0 ? null : allPages.length + 1;
        }
    })
}

export default useWorkoutSessions