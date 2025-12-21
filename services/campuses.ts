/**
 * Campuses API service
 * Chứa các functions gọi API liên quan đến Campus
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { Campus } from '@/types';
import { apiClient } from './api';

/**
 * Lấy danh sách Campus từ endpoint /Campus
 * Endpoint này không yêu cầu authentication
 */
export async function getCampuses(): Promise<Campus[]> {
    return apiClient<Campus[]>(API_ENDPOINTS.CAMPUSES, {
        authenticated: false,
    });
}
