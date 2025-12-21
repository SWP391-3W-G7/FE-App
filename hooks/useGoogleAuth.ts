/**
 * Google OAuth Authentication Hook
 * Using @react-native-google-signin/google-signin
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
    configureGoogleSignIn,
    getStoredUserData,
    googleLogin,
    GoogleLoginResponse,
    googleLogout,
    statusCodes,
    UserData,
} from '@/services/googleAuthService';

export function useGoogleAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);

    // Configure Google Sign-In on mount
    useEffect(() => {
        configureGoogleSignIn();

        // Check if already logged in
        getStoredUserData().then((data) => {
            if (data) setUser(data);
        });
    }, []);

    /**
     * Sign in with Google
     */
    const signInWithGoogle = useCallback(
        async (campusId?: number): Promise<GoogleLoginResponse | null> => {
            if (!campusId) {
                Alert.alert('Lỗi', 'Vui lòng chọn cơ sở trước khi đăng nhập bằng Google');
                return null;
            }

            setIsLoading(true);

            try {
                const result = await googleLogin(campusId);
                setUser(result as unknown as UserData);
                Alert.alert('Thành công', 'Đăng nhập Google thành công!');
                return result;
            } catch (error: any) {
                console.error('Google login error:', error);

                // Don't show alert if user cancelled
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    console.log('User cancelled sign in');
                    return null;
                }

                if (error.code === statusCodes.IN_PROGRESS) {
                    console.log('Sign in already in progress');
                    return null;
                }

                if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    Alert.alert('Lỗi', 'Google Play Services không khả dụng');
                    return null;
                }

                Alert.alert('Lỗi', error.message || 'Đăng nhập Google thất bại');
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * Sign out
     */
    const signOut = useCallback(async () => {
        await googleLogout();
        setUser(null);
    }, []);

    return {
        isLoading,
        user,
        signInWithGoogle,
        signOut,
    };
}
