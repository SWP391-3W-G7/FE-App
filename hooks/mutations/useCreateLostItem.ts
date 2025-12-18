/**
 * React Query mutation hook for creating Lost Items
 */

import { createLostItem, CreateLostItemPayload } from '@/services/lostItems';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lostItemsQueryKey } from '../queries/useLostItems';

/**
 * Hook để tạo Lost Item mới
 * Sử dụng React Query để handle loading, error states và invalidate cache
 */
export function useCreateLostItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateLostItemPayload) => createLostItem(payload),
        onSuccess: () => {
            // Invalidate lost items cache để refresh danh sách
            queryClient.invalidateQueries({ queryKey: lostItemsQueryKey });
        },
    });
}
