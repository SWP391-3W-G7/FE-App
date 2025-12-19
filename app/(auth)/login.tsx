import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { AlertCircle, Check, ChevronDown, Lock, Mail, MapPin, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useCampuses } from '@/hooks/queries/useCampuses';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoggingIn, loginError } = useAuth();
    const { handleGoogleLogin, isLoading: isGoogleLoading, redirectUri } = useGoogleAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedCampusId, setSelectedCampusId] = useState(0);
    const [showCampusPicker, setShowCampusPicker] = useState(false);

    // Fetch campuses for Google login
    const { data: campuses = [], isLoading: isLoadingCampuses } = useCampuses();

    // Set default campus when loaded
    useEffect(() => {
        if (campuses.length > 0 && selectedCampusId === 0) {
            setSelectedCampusId(campuses[0].id);
        }
    }, [campuses]);

    // Log redirect URI for debugging
    useEffect(() => {
        console.log('Current Redirect URI:', redirectUri);
    }, [redirectUri]);

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        login({ email, password });
    };

    const onGoogleLogin = async () => {
        const success = await handleGoogleLogin(selectedCampusId);
        if (success) {
            // Reload to trigger auth state change
            router.replace('/(tabs)/(home)' as any);
        }
    };

    const selectedCampus = campuses.find((c) => c.id === selectedCampusId);

    const isDisabled = isLoggingIn || isGoogleLoading;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>FPT Lost & Found</Text>
                        <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>
                    </View>

                    <View style={styles.form}>
                        {loginError && (
                            <View style={styles.errorContainer}>
                                <AlertCircle size={20} color="#ef4444" />
                                <Text style={styles.errorText}>Invalid email or password</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIcon}>
                                <Mail size={20} color="#667eea" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!isDisabled}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIcon}>
                                <Lock size={20} color="#667eea" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password"
                                editable={!isDisabled}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isDisabled && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isDisabled}
                        >
                            {isLoggingIn ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>hoặc</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Campus Picker for Google Login */}
                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => setShowCampusPicker(true)}
                            disabled={isDisabled || isLoadingCampuses}
                        >
                            <View style={styles.inputIcon}>
                                <MapPin size={20} color="#667eea" />
                            </View>
                            <View style={styles.pickerButton}>
                                {isLoadingCampuses ? (
                                    <ActivityIndicator size="small" color="#667eea" />
                                ) : (
                                    <Text style={styles.pickerText}>
                                        {selectedCampus?.description || 'Chọn cơ sở'}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.pickerArrow}>
                                <ChevronDown size={20} color="#94a3b8" />
                            </View>
                        </TouchableOpacity>

                        {/* Google Login Button */}
                        <TouchableOpacity
                            style={[styles.googleButton, isDisabled && styles.buttonDisabled]}
                            onPress={onGoogleLogin}
                            disabled={isDisabled}
                        >
                            {isGoogleLoading ? (
                                <ActivityIndicator color="#1e293b" />
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Campus Dropdown Modal */}
            <Modal
                visible={showCampusPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCampusPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header with gradient */}
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.modalHeader}
                        >
                            <View style={styles.modalHeaderContent}>
                                <MapPin size={20} color="#fff" />
                                <Text style={styles.modalTitle}>Chọn cơ sở</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowCampusPicker(false)}
                            >
                                <X size={22} color="#fff" />
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Campus list */}
                        <ScrollView style={styles.campusListModal} showsVerticalScrollIndicator={false}>
                            {campuses.map((campus, index) => (
                                <TouchableOpacity
                                    key={campus.id}
                                    style={[
                                        styles.campusItem,
                                        campus.id === selectedCampusId && styles.campusItemSelected,
                                        index === campuses.length - 1 && styles.campusItemLast,
                                    ]}
                                    onPress={() => {
                                        setSelectedCampusId(campus.id);
                                        setShowCampusPicker(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.campusItemContent}>
                                        <Text
                                            style={[
                                                styles.campusItemText,
                                                campus.id === selectedCampusId && styles.campusItemTextSelected,
                                            ]}
                                        >
                                            {campus.description}
                                        </Text>
                                    </View>
                                    {campus.id === selectedCampusId && (
                                        <View style={styles.checkIcon}>
                                            <Check size={20} color="#667eea" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#e0e7ff',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        flex: 1,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    inputIcon: {
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1e293b',
    },
    pickerButton: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    pickerArrow: {
        paddingRight: 16,
    },
    pickerText: {
        fontSize: 16,
        color: '#1e293b',
    },
    button: {
        backgroundColor: '#667eea',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold' as const,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#94a3b8',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        gap: 12,
    },
    googleIcon: {
        width: 24,
        height: 24,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#1e293b',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
    },
    linkText: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: 'bold' as const,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#fff',
    },
    modalCloseButton: {
        padding: 4,
    },
    campusListModal: {
        paddingVertical: 8,
    },
    campusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginHorizontal: 12,
        marginVertical: 4,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    campusItemSelected: {
        backgroundColor: '#ede9fe',
        borderWidth: 2,
        borderColor: '#667eea',
    },
    campusItemLast: {
        marginBottom: 20,
    },
    campusItemContent: {
        flex: 1,
    },
    campusItemText: {
        fontSize: 16,
        color: '#374151',
    },
    campusItemTextSelected: {
        color: '#667eea',
        fontWeight: '600' as const,
    },
    checkIcon: {
        marginLeft: 12,
    },
});
