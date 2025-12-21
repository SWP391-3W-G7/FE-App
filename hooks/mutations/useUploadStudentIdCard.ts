/**
 * Mutation hook for uploading student ID card
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ImageFile, uploadStudentIdCard } from '@/services/users';

/**
 * Hook to upload student ID card and invalidate profile cache
 */
export function useUploadStudentIdCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (image: ImageFile) => uploadStudentIdCard(image),
        onSuccess: () => {
            // Invalidate user profile to refetch with new studentIdCardUrl
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
}
