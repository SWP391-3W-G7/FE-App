/**
 * React Query mutation hook for creating Found Items
 */

import { createFoundItem, CreateFoundItemPayload } from '@/services/foundItems';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foundItemsQueryKey } from '../queries/useFoundItems';

/**
 * Hook để tạo Found Item mới
 * Sử dụng React Query để handle loading, error states và invalidate cache
 */
export function useCreateFoundItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateFoundItemPayload) => createFoundItem(payload),
        onSuccess: () => {
            // Invalidate found items cache để refresh danh sách
            queryClient.invalidateQueries({ queryKey: foundItemsQueryKey });
        },
    });
}
