/**
 * React Query hook for Campuses
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getCampuses } from '@/services/campuses';
import { Campus } from '@/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho Campuses
 */
export const campusesQueryKey = ['campuses'] as const;

/**
 * Hook để fetch danh sách Campus
 * Sử dụng React Query để tự động caching, refetching, loading/error states
 * staleTime set cao vì danh sách campus ít thay đổi
 */
export function useCampuses() {
    return useQuery<Campus[]>({
        queryKey: campusesQueryKey,
        queryFn: getCampuses,
        staleTime: 1000 * 60 * 60, // 1 hour - campus list rarely changes
    });
}
