/**
 * React Query mutation hook for creating Claim Request
 */

import { CreateClaimPayload, createClaimRequest } from '@/services/claimRequests';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook để tạo Claim Request mới
 */
export function useCreateClaim() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateClaimPayload) => createClaimRequest(payload),
        onSuccess: () => {
            // Invalidate my claims list để refresh data
            queryClient.invalidateQueries({ queryKey: ['myClaims'] });
        },
    });
}
