/**
 * React Query hook for Claim Detail
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getClaimById } from '@/services/claimRequests';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook để lấy chi tiết một Claim Request theo ID
 */
export function useClaimDetail(id: number) {
    return useQuery({
        queryKey: ['claim', id],
        queryFn: () => getClaimById(id),
        enabled: !!id && id > 0,
    });
}
