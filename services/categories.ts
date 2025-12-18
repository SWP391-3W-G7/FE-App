/**
 * Categories API service
 * Chứa các functions gọi API liên quan đến Categories
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { Category } from '@/types';
import { apiClient } from './api';

/**
 * Lấy danh sách Categories
 */
export async function getCategories(): Promise<Category[]> {
    return apiClient<Category[]>(API_ENDPOINTS.CATEGORIES);
}
