/**
 * Claim Requests API service
 * Chứa các functions gọi API liên quan đến Claim Requests
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { MyClaimResponse } from '@/types';
import { apiClient, apiClientFormData } from './api';

/**
 * Lấy danh sách claims của current user
 */
export async function getMyClaims(): Promise<MyClaimResponse[]> {
    return apiClient<MyClaimResponse[]>(API_ENDPOINTS.MY_CLAIMS);
}

/**
 * Lấy chi tiết một Claim Request theo ID
 */
export async function getClaimById(id: number): Promise<MyClaimResponse> {
    return apiClient<MyClaimResponse>(`${API_ENDPOINTS.CLAIM_REQUESTS}/${id}`);
}

/**
 * Payload để tạo Claim Request mới
 */
export interface CreateClaimPayload {
    foundItemId: number;
    evidenceTitle: string;
    evidenceDescription: string;
    campusId: number;
    lostItemId?: number;
    evidenceImages?: { uri: string; type: string; name: string }[];
}

/**
 * Tạo Claim Request mới với multipart/form-data (hỗ trợ upload image)
 */
export async function createClaimRequest(payload: CreateClaimPayload): Promise<MyClaimResponse> {
    const formData = new FormData();

    formData.append('FoundItemId', payload.foundItemId.toString());
    formData.append('EvidenceTitle', payload.evidenceTitle);
    formData.append('EvidenceDescription', payload.evidenceDescription);
    formData.append('CampusId', payload.campusId.toString());

    // Append LostItemId nếu có
    if (payload.lostItemId) {
        formData.append('LostItemId', payload.lostItemId.toString());
    }

    // Append images nếu có
    if (payload.evidenceImages && payload.evidenceImages.length > 0) {
        payload.evidenceImages.forEach((image) => {
            formData.append('EvidenceImages', {
                uri: image.uri,
                type: image.type,
                name: image.name,
            } as unknown as Blob);
        });
    }

    return apiClientFormData<MyClaimResponse>(API_ENDPOINTS.CLAIM_REQUESTS, formData);
}
