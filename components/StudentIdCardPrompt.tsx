/**
 * StudentIdCardPrompt Component
 * Displays a prompt when user hasn't uploaded student ID card
 * Includes modal for image selection and upload
 */

import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, Camera, Upload, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useUploadStudentIdCard } from '@/hooks/mutations/useUploadStudentIdCard';

interface StudentIdCardPromptProps {
    onUploadSuccess?: () => void;
}

interface SelectedImage {
    uri: string;
    type: string;
    name: string;
}

export function StudentIdCardPrompt({ onUploadSuccess }: StudentIdCardPromptProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
    const uploadMutation = useUploadStudentIdCard();

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 10],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedImage({
                    uri: asset.uri,
                    type: asset.mimeType || 'image/jpeg',
                    name: asset.fileName || `student_id_${Date.now()}.jpg`,
                });
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        }
    };

    const handleUpload = () => {
        if (!selectedImage) return;

        uploadMutation.mutate(selectedImage, {
            onSuccess: () => {
                Alert.alert('Thành công', 'Đã upload thẻ sinh viên!');
                setShowModal(false);
                setSelectedImage(null);
                onUploadSuccess?.();
            },
            onError: (error) => {
                Alert.alert('Lỗi', `Upload thất bại: ${error.message}`);
            },
        });
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    return (
        <>
            {/* Prompt Card */}
            <View style={styles.promptCard}>
                <View style={styles.promptIcon}>
                    <AlertTriangle size={24} color="#d97706" />
                </View>
                <View style={styles.promptContent}>
                    <Text style={styles.promptTitle}>Chưa có thẻ sinh viên</Text>
                    <Text style={styles.promptDescription}>
                        Vui lòng upload ảnh thẻ sinh viên để sử dụng đầy đủ tính năng.
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => setShowModal(true)}
                >
                    <Upload size={18} color="#fff" />
                    <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
            </View>

            {/* Upload Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Thẻ Sinh Viên</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {selectedImage ? (
                                <View style={styles.previewContainer}>
                                    <Image
                                        source={{ uri: selectedImage.uri }}
                                        style={styles.previewImage}
                                        resizeMode="contain"
                                    />
                                    <TouchableOpacity
                                        style={styles.changeImageButton}
                                        onPress={pickImage}
                                    >
                                        <Text style={styles.changeImageText}>Chọn ảnh khác</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.imagePicker}
                                    onPress={pickImage}
                                >
                                    <Camera size={48} color="#94a3b8" />
                                    <Text style={styles.imagePickerText}>
                                        Chạm để chọn ảnh thẻ sinh viên
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClose}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    (!selectedImage || uploadMutation.isPending) && styles.confirmButtonDisabled,
                                ]}
                                onPress={handleUpload}
                                disabled={!selectedImage || uploadMutation.isPending}
                            >
                                {uploadMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Upload size={18} color="#fff" />
                                        <Text style={styles.confirmButtonText}>Upload</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    promptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fcd34d',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginVertical: 12,
    },
    promptIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    promptContent: {
        flex: 1,
    },
    promptTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 4,
    },
    promptDescription: {
        fontSize: 12,
        color: '#a16207',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#0f172a',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    modalBody: {
        padding: 20,
    },
    imagePicker: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    imagePickerText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
    },
    previewContainer: {
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    changeImageButton: {
        marginTop: 12,
    },
    changeImageText: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#0f172a',
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
