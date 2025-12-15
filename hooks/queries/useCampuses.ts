/**
 * React Query hook for Campuses
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getCampusEnumValues } from '@/services/campuses';
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
    return useQuery({
        queryKey: campusesQueryKey,
        queryFn: getCampusEnumValues,
        staleTime: 1000 * 60 * 60, // 1 hour - campus list rarely changes
    });
}
