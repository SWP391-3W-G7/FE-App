export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
    LOGIN: '/Users/login',
    REGISTER: '/Users/register',
    LOST_ITEMS: '/lost-items',
    FOUND_ITEMS: '/FoundItems',
    CLAIMS: '/ClaimRequests',
    CATEGORIES: '/Categories',
    CAMPUSES: '/Campus/enum-values',
    IMAGES: '/Images',
} as const;
