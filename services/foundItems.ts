/**
 * Found Items API service
 * Chứa các functions gọi API liên quan đến Found Items
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { FoundItemResponse } from '@/types';
import { apiClient, apiClientFormData } from './api';

/**
 * Lấy danh sách Found Items
 */
export async function getFoundItems(): Promise<FoundItemResponse[]> {
    return apiClient<FoundItemResponse[]>(API_ENDPOINTS.FOUND_ITEMS);
}

/**
 * Lấy danh sách Found Items của current user
 */
export async function getMyFoundItems(): Promise<FoundItemResponse[]> {
    return apiClient<FoundItemResponse[]>(API_ENDPOINTS.MY_FOUND_ITEMS);
}

/**
 * Lấy chi tiết một Found Item theo ID (dành cho user đã đăng nhập)
 * Endpoint: /found-items/{id}/user-details (requires auth)
 */
export async function getFoundItemById(id: number): Promise<FoundItemResponse> {
    return apiClient<FoundItemResponse>(`${API_ENDPOINTS.FOUND_ITEMS}/${id}/user-details`);
}

/**
 * Payload để tạo Found Item mới
 */
export interface CreateFoundItemPayload {
    title: string;
    description: string;
    foundDate: string;
    foundLocation: string;
    campusId: number;
    categoryId: number;
    images?: { uri: string; type: string; name: string }[];
}

/**
 * Tạo Found Item mới với multipart/form-data (hỗ trợ upload image)
 * Endpoint: /found-items/public
 */
export async function createFoundItem(payload: CreateFoundItemPayload): Promise<FoundItemResponse> {
    const formData = new FormData();

    formData.append('Title', payload.title);
    formData.append('Description', payload.description);
    formData.append('FoundDate', payload.foundDate);
    formData.append('FoundLocation', payload.foundLocation);
    formData.append('CampusId', payload.campusId.toString());
    formData.append('CategoryId', payload.categoryId.toString());

    // Append images nếu có
    if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image) => {
            formData.append('Images', {
                uri: image.uri,
                type: image.type,
                name: image.name,
            } as unknown as Blob);
        });
    }

    // Endpoint đặc biệt cho public found items: /found-items/public
    return apiClientFormData<FoundItemResponse>(`${API_ENDPOINTS.FOUND_ITEMS}/public`, formData);
}

