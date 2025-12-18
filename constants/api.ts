export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
    LOGIN: '/Users/login',
    REGISTER: '/Users/register',
    LOST_ITEMS: '/lost-items',
    FOUND_ITEMS: '/found-items',
    MY_FOUND_ITEMS: '/found-items/my-found-items',
    CLAIMS: '/ClaimRequests',
    MY_CLAIMS: '/claim-requests/my-claims',
    CLAIM_REQUESTS: '/claim-requests',
    CATEGORIES: '/Categories',
    CAMPUSES: '/Campus/enum-values',
    IMAGES: '/Images',
} as const;
