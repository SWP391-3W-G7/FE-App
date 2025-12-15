/**
 * Lost Items API service
 * Chứa các functions gọi API liên quan đến Lost Items
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { LostItemResponse } from '@/types';
import { apiClient, apiClientFormData } from './api';

/**
 * Lấy danh sách Lost Items
 */
export async function getLostItems(): Promise<LostItemResponse[]> {
    return apiClient<LostItemResponse[]>(API_ENDPOINTS.LOST_ITEMS);
}

/**
 * Lấy chi tiết một Lost Item theo ID
 */
export async function getLostItemById(id: number): Promise<LostItemResponse> {
    return apiClient<LostItemResponse>(`${API_ENDPOINTS.LOST_ITEMS}/${id}`);
}

/**
 * Payload để tạo Lost Item mới
 */
export interface CreateLostItemPayload {
    title: string;
    description: string;
    lostDate: string;
    lostLocation: string;
    campusId: number;
    categoryId: number;
    images?: { uri: string; type: string; name: string }[];
}

/**
 * Tạo Lost Item mới với multipart/form-data (hỗ trợ upload image)
 */
export async function createLostItem(payload: CreateLostItemPayload): Promise<LostItemResponse> {
    const formData = new FormData();

    formData.append('Title', payload.title);
    formData.append('Description', payload.description);
    formData.append('LostDate', payload.lostDate);
    formData.append('LostLocation', payload.lostLocation);
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

    return apiClientFormData<LostItemResponse>(API_ENDPOINTS.LOST_ITEMS, formData);
}

