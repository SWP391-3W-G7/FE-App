export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
    LOGIN: '/Users/login',
    REGISTER: '/Users/register',
    USER_PROFILE: '/Users/profile',
    UPLOAD_STUDENT_ID: '/Users/upload-student-id-card',
    LOST_ITEMS: '/lost-items',
    FOUND_ITEMS: '/found-items',
    MY_FOUND_ITEMS: '/found-items/my-found-items',
    CLAIMS: '/ClaimRequests',
    MY_CLAIMS: '/claim-requests/my-claims',
    CLAIM_REQUESTS: '/claim-requests',
    CATEGORIES: '/Categories',
    CAMPUSES: '/Campus',
    IMAGES: '/Images',
} as const;
