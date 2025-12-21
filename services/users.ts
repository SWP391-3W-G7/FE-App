/**
 * User-related API services
 */

import { API_ENDPOINTS } from '@/constants/api';
import { apiClientFormData } from './api';

export interface UploadStudentIdResponse {
    message: string;
}

export interface ImageFile {
    uri: string;
    type: string;
    name: string;
}

/**
 * Upload student ID card image
 * Endpoint: POST /api/Users/upload-student-id-card
 */
export async function uploadStudentIdCard(image: ImageFile): Promise<UploadStudentIdResponse> {
    const formData = new FormData();
    formData.append('studentIdCard', {
        uri: image.uri,
        type: image.type,
        name: image.name,
    } as unknown as Blob);

    return apiClientFormData<UploadStudentIdResponse>(API_ENDPOINTS.UPLOAD_STUDENT_ID, formData);
}
