/**
 * React Query hook for My Found Items
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getMyFoundItems } from '@/services/foundItems';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho My Found Items
 */
export const myFoundItemsQueryKey = ['myFoundItems'] as const;

/**
 * Hook để fetch danh sách Found Items của current user
 * Sử dụng React Query để tự động caching, refetching, loading/error states
 */
export function useMyFoundItems() {
    return useQuery({
        queryKey: myFoundItemsQueryKey,
        queryFn: getMyFoundItems,
    });
}
