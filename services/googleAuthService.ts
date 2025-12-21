/**
 * Google Auth Service
 * Using @react-native-google-signin/google-signin
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';

import { API_BASE_URL } from '@/constants/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Web Client ID - required for @react-native-google-signin to get idToken
const WEB_CLIENT_ID = '147774139303-1gj0lp915h2eai79bhtuc8mj5j092obd.apps.googleusercontent.com';

export interface GoogleLoginResponse {
    token: string;
    email: string;
    fullName: string;
    roleName: string;
    campusName: string;
    campusId: number | null;
    status: string;
}

export interface UserData {
    userId: number;
    email: string;
    fullName: string;
    roleName: string;
    campusName: string;
    campusId: number;
    status: string;
    username?: string;
    roleId?: number;
}

/**
 * Configure Google Sign-In - call once in _layout.tsx or hook
 */
export function configureGoogleSignIn() {
    GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
    });
    console.log('Google Sign-In configured with webClientId:', WEB_CLIENT_ID);
}

/**
 * Perform Google login and authenticate with backend
 */
export async function googleLogin(campusId?: number): Promise<GoogleLoginResponse> {
    console.log('========== GOOGLE LOGIN START ==========');

    // 1. Check Play Services
    await GoogleSignin.hasPlayServices();

    // 2. Sign in with Google
    console.log('Signing in with Google...');
    await GoogleSignin.signIn();

    // 3. Get tokens
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;

    if (!idToken) {
        throw new Error('Không nhận được idToken từ Google');
    }

    console.log('Got idToken (first 50 chars):', idToken.substring(0, 50));
    console.log('IdToken length:', idToken.length);

    // 4. Send to backend
    const url = `${API_BASE_URL}/auth/google-mobile-login`;
    const requestBody = { idToken, campusId };

    console.log('========== SENDING TO BACKEND ==========');
    console.log('URL:', url);
    console.log('CampusId:', campusId);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
        let errorMessage = `Authentication failed: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || responseText;
        } catch {
            errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
    }

    const data: GoogleLoginResponse = JSON.parse(responseText);
    console.log('Auth success!');

    // 5. Save token and user data
    if (data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
    }

    console.log('========== GOOGLE LOGIN SUCCESS ==========');
    return data;
}

/**
 * Sign out from Google
 */
export async function googleLogout(): Promise<void> {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error('Google signOut error:', error);
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

/**
 * Get stored token
 */
export async function getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user data
 */
export async function getStoredUserData(): Promise<UserData | null> {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

// Re-export status codes
export { statusCodes };

