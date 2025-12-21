/**
 * Hook to fetch current user's profile from API
 */
import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/api';

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    roleId: number;
    status: string;
    campusId: number;
    phoneNumber: string;
    roleName: string;
    campusName: string;
    studentIdCardUrl: string;
}

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: () => apiClient<UserProfile>(API_ENDPOINTS.USER_PROFILE),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
