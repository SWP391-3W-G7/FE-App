import { getFoundItemById } from '@/services/foundItems';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook để lấy chi tiết một Found Item theo ID
 */
export function useFoundItemDetail(id: number) {
    return useQuery({
        queryKey: ['foundItem', id],
        queryFn: () => getFoundItemById(id),
        enabled: !!id && id > 0,
    });
}
