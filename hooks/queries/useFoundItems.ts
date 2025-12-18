/**
 * React Query hook for Found Items
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getFoundItems } from '@/services/foundItems';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho Found Items
 */
export const foundItemsQueryKey = ['foundItems'] as const;

/**
 * Hook để fetch danh sách Found Items
 * Sử dụng React Query để tự động caching, refetching, loading/error states
 */
export function useFoundItems() {
    return useQuery({
        queryKey: foundItemsQueryKey,
        queryFn: getFoundItems,
    });
}
