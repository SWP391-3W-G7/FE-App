/**
 * Base API client với authentication header và error handling.
 * Tập trung logic fetch để tránh duplicate code trong các services.
 */

import { API_BASE_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

interface ApiOptions extends RequestInit {
    authenticated?: boolean;
}

interface ApiError extends Error {
    status: number;
    statusText: string;
}

/**
 * Lấy token từ AsyncStorage
 */
async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

/**
 * Base fetch wrapper với logging và error handling
 */
export async function apiClient<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const { authenticated = true, ...fetchOptions } = options;

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`========== API CALL: ${fetchOptions.method || 'GET'} ==========`);
    console.log('URL:', url);
    const startTime = Date.now();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // Thêm token nếu cần authentication
    if (authenticated) {
        const token = await getToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            console.log('Token: Present');
        } else {
            console.log('Token: Missing');
        }
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        const elapsed = Date.now() - startTime;
        console.log(`Response status: ${response.status} (took ${elapsed}ms)`);

        if (!response.ok) {
            const error = new Error(`API Error: ${response.statusText}`) as ApiError;
            error.status = response.status;
            error.statusText = response.statusText;
            console.error('API call failed:', response.status);
            console.log('==========================================');
            throw error;
        }

        const data = await response.json();
        console.log('==========================================');
        return data as T;
    } catch (error) {
        console.error('API Error:', error);
        console.log('==========================================');
        throw error;
    }
}

/**
 * API client cho multipart/form-data (file upload)
 * Không set Content-Type header vì browser sẽ tự set với boundary
 */
export async function apiClientFormData<T>(
    endpoint: string,
    formData: FormData,
    options: Omit<ApiOptions, 'body'> = {}
): Promise<T> {
    const { authenticated = true, ...fetchOptions } = options;

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`========== API CALL: POST (FormData) ==========`);
    console.log('URL:', url);
    const startTime = Date.now();

    const headers: Record<string, string> = {};

    // Thêm token nếu cần authentication
    if (authenticated) {
        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Token: Present');
        } else {
            console.log('Token: Missing');
        }
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            ...fetchOptions,
            headers,
            body: formData,
        });

        const elapsed = Date.now() - startTime;
        console.log(`Response status: ${response.status} (took ${elapsed}ms)`);

        if (!response.ok) {
            const error = new Error(`API Error: ${response.statusText}`) as ApiError;
            error.status = response.status;
            error.statusText = response.statusText;
            console.error('API call failed:', response.status);
            console.log('==========================================');
            throw error;
        }

        const data = await response.json();
        console.log('==========================================');
        return data as T;
    } catch (error) {
        console.error('API Error:', error);
        console.log('==========================================');
        throw error;
    }
}
