import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { AlertCircle, Check, ChevronDown, Lock, Mail, MapPin, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

// Interface cho Campus từ API /Campus/enum-values
interface Campus {
    id: number;
    name: string;
    description: string;
}

export default function RegisterScreen() {
    const { register, isRegistering, registerError } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        campusId: 0, // Default 0, sẽ được set khi fetch xong
    });
    const [showCampusPicker, setShowCampusPicker] = useState(false);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [isLoadingCampuses, setIsLoadingCampuses] = useState(true);

    // Fetch danh sách campus từ API khi component mount
    useEffect(() => {
        const fetchCampuses = async () => {
            const url = `${API_BASE_URL}${API_ENDPOINTS.CAMPUSES}`;
            console.log('========== CAMPUS API CALL ==========');
            console.log('URL:', url);
            const startTime = Date.now();

            try {
                const response = await fetch(url);
                const elapsed = Date.now() - startTime;
                console.log(`Response status: ${response.status} (took ${elapsed}ms)`);

                if (response.ok) {
                    const data: Campus[] = await response.json();
                    console.log('Campuses received:', data.length, 'items');
                    console.log('======================================');
                    setCampuses(data);
                    // Set default campus nếu có data
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, campusId: data[0].id }));
                    }
                } else {
                    console.error('Failed to fetch campuses:', response.status);
                }
            } catch (error) {
                console.error('Error fetching campuses:', error);
                console.log('======================================');
            } finally {
                setIsLoadingCampuses(false);
            }
        };

        fetchCampuses();
    }, []);

    const handleRegister = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        register(formData, {
            onSuccess: () => {
                Alert.alert('Success', 'Account created! Please log in.', [
                    { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) },
                ]);
            },
        });
    };

    const selectedCampus = campuses.find((c: Campus) => c.id === formData.campusId);

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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join FPT Lost & Found community</Text>
                    </View>

                    <View style={styles.form}>
                        {registerError && (
                            <View style={styles.errorContainer}>
                                <AlertCircle size={20} color="#ef4444" />
                                <Text style={styles.errorText}>Registration failed. Please try again.</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIcon}>
                                <User size={20} color="#667eea" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#94a3b8"
                                value={formData.fullName}
                                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                autoCapitalize="words"
                                editable={!isRegistering}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIcon}>
                                <User size={20} color="#667eea" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#94a3b8"
                                value={formData.username}
                                onChangeText={(text) => setFormData({ ...formData, username: text })}
                                autoCapitalize="none"
                                editable={!isRegistering}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIcon}>
                                <Mail size={20} color="#667eea" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#94a3b8"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!isRegistering}
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
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                autoCapitalize="none"
                                editable={!isRegistering}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => setShowCampusPicker(true)}
                            disabled={isRegistering || isLoadingCampuses}
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

                        <TouchableOpacity
                            style={[styles.button, isRegistering && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Sign In</Text>
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
                        {/* Header với gradient */}
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

                        {/* Danh sách campus */}
                        <ScrollView style={styles.campusListModal} showsVerticalScrollIndicator={false}>
                            {campuses.map((campus: Campus, index: number) => (
                                <TouchableOpacity
                                    key={campus.id}
                                    style={[
                                        styles.campusItem,
                                        campus.id === formData.campusId && styles.campusItemSelected,
                                        index === campuses.length - 1 && styles.campusItemLast,
                                    ]}
                                    onPress={() => {
                                        setFormData({ ...formData, campusId: campus.id });
                                        setShowCampusPicker(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.campusItemContent}>
                                        <Text
                                            style={[
                                                styles.campusItemText,
                                                campus.id === formData.campusId && styles.campusItemTextSelected,
                                            ]}
                                        >
                                            {campus.description}
                                        </Text>
                                    </View>
                                    {campus.id === formData.campusId && (
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
        paddingVertical: 48,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
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
});
