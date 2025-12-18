/**
 * React Query hook for Lost Items
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getLostItems } from '@/services/lostItems';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho Lost Items
 */
export const lostItemsQueryKey = ['lostItems'] as const;

/**
 * Hook để fetch danh sách Lost Items
 * Sử dụng React Query để tự động caching, refetching, loading/error states
 */
export function useLostItems() {
    return useQuery({
        queryKey: lostItemsQueryKey,
        queryFn: getLostItems,
        // Handle both direct array responses and paginated object responses
        select: (data) => {
            if (Array.isArray(data)) {
                return data;
            }
            // Handle paginated response structures
            if (data && typeof data === 'object') {
                // Common paginated response property names
                return (data as any).data || (data as any).items || (data as any).content || [];
            }
            return [];
        },
    });
}
