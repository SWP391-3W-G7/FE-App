/**
 * React Query hook for My Lost Items
 */

import { getMyLostItems } from '@/services/lostItems';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho My Lost Items
 */
export const myLostItemsQueryKey = ['myLostItems'] as const;

/**
 * Hook để fetch danh sách Lost Items của current user
 */
export function useMyLostItems() {
    return useQuery({
        queryKey: myLostItemsQueryKey,
        queryFn: getMyLostItems,
    });
}
