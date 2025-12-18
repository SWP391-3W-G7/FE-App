/**
 * React Query hook for My Claims
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getMyClaims } from '@/services/claimRequests';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho My Claims
 */
export const myClaimsQueryKey = ['myClaims'] as const;

/**
 * Hook để fetch danh sách claims của current user
 * Sử dụng React Query để tự động caching, refetching, loading/error states
 */
export function useMyClaims() {
    return useQuery({
        queryKey: myClaimsQueryKey,
        queryFn: getMyClaims,
    });
}
