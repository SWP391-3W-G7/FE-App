/**
 * Campuses API service
 * Chứa các functions gọi API liên quan đến Campus
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { CampusEnumValue } from '@/types';
import { apiClient } from './api';

/**
 * Lấy danh sách Campus từ endpoint /Campus/enum-values
 * Endpoint này không yêu cầu authentication
 */
export async function getCampusEnumValues(): Promise<CampusEnumValue[]> {
    return apiClient<CampusEnumValue[]>(API_ENDPOINTS.CAMPUSES, {
        authenticated: false,
    });
}
