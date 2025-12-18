import { getLostItemById } from '@/services/lostItems';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook để lấy chi tiết một Lost Item theo ID
 */
export function useLostItemDetail(id: number) {
    return useQuery({
        queryKey: ['lostItem', id],
        queryFn: () => getLostItemById(id),
        enabled: !!id && id > 0,
    });
}
