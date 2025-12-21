import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { AlertCircle, Camera, Check, ChevronDown, Lock, Mail, MapPin, Phone, User, X } from 'lucide-react-native';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useCampuses } from '@/hooks/queries/useCampuses';

interface ImageFile {
    uri: string;
    type: string;
    name: string;
}

export default function RegisterScreen() {
    const { register, isRegistering, registerError } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        campusName: '', // Changed to store campus name string
        phoneNumber: '',
    });
    const [selectedCampusId, setSelectedCampusId] = useState(0);
    const [showCampusPicker, setShowCampusPicker] = useState(false);
    const [studentIdCard, setStudentIdCard] = useState<ImageFile | null>(null);

    // Sử dụng React Query hook thay vì useState + useEffect + fetch
    const { data: campuses = [], isLoading: isLoadingCampuses } = useCampuses();

    // Set default campus khi campuses load xong
    useEffect(() => {
        if (campuses.length > 0 && selectedCampusId === 0) {
            setSelectedCampusId(campuses[0].campusId);
            setFormData(prev => ({ ...prev, campusName: campuses[0].campusName }));
        }
    }, [campuses]);

    // Email validation regex
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Pick student ID card image
    const pickStudentIdCard = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh để chọn ảnh thẻ sinh viên');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const fileName = asset.uri.split('/').pop() || 'student_id.jpg';
            const fileType = asset.mimeType || 'image/jpeg';

            setStudentIdCard({
                uri: asset.uri,
                type: fileType,
                name: fileName,
            });
        }
    };

    const handleRegister = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Validate email format
        if (!isValidEmail(formData.email)) {
            Alert.alert('Lỗi', 'Email không đúng định dạng');
            return;
        }

        // Validate phone number (exactly 9 digits)
        if (formData.phoneNumber && formData.phoneNumber.length !== 9) {
            Alert.alert('Lỗi', 'Số điện thoại phải có đúng 9 chữ số');
            return;
        }

        // Validate student ID card
        if (!studentIdCard) {
            Alert.alert('Lỗi', 'Vui lòng chọn ảnh thẻ sinh viên');
            return;
        }

        register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            campusId: formData.campusName, // Send campus name string
            phoneNumber: formData.phoneNumber || undefined,
            studentIdCard: studentIdCard,
        }, {
            onSuccess: () => {
                Alert.alert('Thành công', 'Tài khoản đã được tạo! Vui lòng đăng đợi xác nhận từ admin.', [
                    { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) },
                ]);
            },
        });
    };

    const selectedCampus = campuses.find((c) => c.campusId === selectedCampusId);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
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
                                <User size={20} color="#0f172a" />
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
                                <User size={20} color="#0f172a" />
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
                                <Mail size={20} color="#0f172a" />
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
                                <Lock size={20} color="#0f172a" />
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

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIcon}>
                                <Phone size={20} color="#0f172a" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Số điện thoại (9 chữ số)"
                                placeholderTextColor="#94a3b8"
                                value={formData.phoneNumber}
                                onChangeText={(text) => {
                                    // Only allow numeric input and limit to 9 digits
                                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 9);
                                    setFormData({ ...formData, phoneNumber: numericText });
                                }}
                                keyboardType="number-pad"
                                maxLength={9}
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
                                <MapPin size={20} color="#0f172a" />
                            </View>
                            <View style={styles.pickerButton}>
                                {isLoadingCampuses ? (
                                    <ActivityIndicator size="small" color="#0f172a" />
                                ) : (
                                    <Text style={styles.pickerText}>
                                        {selectedCampus?.campusName || 'Chọn cơ sở'}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.pickerArrow}>
                                <ChevronDown size={20} color="#94a3b8" />
                            </View>
                        </TouchableOpacity>

                        {/* Student ID Card Picker */}
                        <TouchableOpacity
                            style={styles.imagePickerContainer}
                            onPress={pickStudentIdCard}
                            disabled={isRegistering}
                        >
                            {studentIdCard ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{ uri: studentIdCard.uri }}
                                        style={styles.imagePreview}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => setStudentIdCard(null)}
                                    >
                                        <X size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Camera size={32} color="#0f172a" />
                                    <Text style={styles.imagePlaceholderText}>
                                        Chọn ảnh thẻ sinh viên
                                    </Text>
                                    <Text style={styles.imagePlaceholderSubtext}>
                                        Bắt buộc để xác minh tài khoản
                                    </Text>
                                </View>
                            )}
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
                    <SafeAreaView edges={['bottom']} style={styles.modalContent}>
                        {/* Header với gradient */}
                        <LinearGradient
                            colors={['#0f172a', '#1e293b']}
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
                            {campuses.map((campus, index) => (
                                <TouchableOpacity
                                    key={campus.campusId}
                                    style={[
                                        styles.campusItem,
                                        campus.campusId === selectedCampusId && styles.campusItemSelected,
                                        index === campuses.length - 1 && styles.campusItemLast,
                                    ]}
                                    onPress={() => {
                                        setSelectedCampusId(campus.campusId);
                                        setFormData({ ...formData, campusName: campus.campusName });
                                        setShowCampusPicker(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.campusItemContent}>
                                        <Text
                                            style={[
                                                styles.campusItemText,
                                                campus.campusId === selectedCampusId && styles.campusItemTextSelected,
                                            ]}
                                        >
                                            {campus.campusName}
                                        </Text>
                                    </View>
                                    {campus.campusId === selectedCampusId && (
                                        <View style={styles.checkIcon}>
                                            <Check size={20} color="#0f172a" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </SafeAreaView>
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
    // Image picker styles
    imagePickerContainer: {
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#0f172a',
    },
    imagePlaceholderSubtext: {
        fontSize: 12,
        color: '#94a3b8',
    },
    imagePreviewContainer: {
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 160,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: 4,
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
        borderColor: '#0f172a',
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
        color: '#0f172a',
        fontWeight: '600' as const,
    },
    checkIcon: {
        marginLeft: 12,
    },
    button: {
        backgroundColor: '#0f172a',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#0f172a',
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
        color: '#0f172a',
        fontSize: 14,
        fontWeight: 'bold' as const,
    },
});
