import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Building2,
    Calendar,
    Camera,
    ChevronDown,
    ChevronLeft,
    FileText,
    MapPin,
    Tag,
    UserCheck,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StudentIdCardPrompt } from '@/components/StudentIdCardPrompt';
import { useCreateClaim } from '@/hooks/mutations/useCreateClaim';
import { useFoundItemDetail } from '@/hooks/queries/useFoundItemDetail';
import { useMyLostItems } from '@/hooks/queries/useMyLostItems';
import { useUserProfile } from '@/hooks/queries/useUserProfile';
import { formatRelativeDate } from '@/utils/date';
import { getCategoryColor, getStatusColor } from '@/utils/status';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

interface ImageFile {
    uri: string;
    type: string;
    name: string;
}

export default function FoundItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Claim form state
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [evidenceTitle, setEvidenceTitle] = useState('');
    const [evidenceDescription, setEvidenceDescription] = useState('');
    const [evidenceImages, setEvidenceImages] = useState<ImageFile[]>([]);
    const [selectedLostItemId, setSelectedLostItemId] = useState<number | undefined>(undefined);
    const [showLostItemPicker, setShowLostItemPicker] = useState(false);
    const [showStudentIdPrompt, setShowStudentIdPrompt] = useState(false);

    const itemId = parseInt(id || '0', 10);
    const { data: item, isLoading, isRefetching, refetch, error } = useFoundItemDetail(itemId);
    const { data: myLostItems, isLoading: isLoadingLostItems } = useMyLostItems();
    const createClaimMutation = useCreateClaim();
    const { data: userProfile, refetch: refetchProfile } = useUserProfile();

    const handleBack = () => {
        router.back();
    };

    const handleClaimPress = () => {
        // Check if student ID card is uploaded first
        if (!userProfile?.studentIdCardUrl) {
            setShowStudentIdPrompt(true);
            return;
        }
        setShowClaimModal(true);
    };

    const handleCloseModal = () => {
        setShowClaimModal(false);
        setEvidenceTitle('');
        setEvidenceDescription('');
        setEvidenceImages([]);
        setSelectedLostItemId(undefined);
        setShowLostItemPicker(false);
    };

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập thư viện ảnh');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map((asset, index) => ({
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                name: asset.fileName || `evidence_${Date.now()}_${index}.jpg`,
            }));
            setEvidenceImages([...evidenceImages, ...newImages]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setEvidenceImages(evidenceImages.filter((_, i) => i !== index));
    };

    const handleSubmitClaim = async () => {
        if (!item) return;

        try {
            await createClaimMutation.mutateAsync({
                foundItemId: item.foundItemId,
                evidenceTitle: evidenceTitle.trim() || '',
                evidenceDescription: evidenceDescription.trim() || '',
                campusId: item.campusId,
                lostItemId: selectedLostItemId,
                evidenceImages: evidenceImages.length > 0 ? evidenceImages : undefined,
            });

            Alert.alert('Thành công', 'Yêu cầu nhận đồ đã được gửi!', [
                { text: 'OK', onPress: handleCloseModal },
            ]);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại.');
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Loading item details...</Text>
            </View>
        );
    }

    if (error || !item) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Failed to load item details</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = item.imageUrls || [];
    const hasImages = images.length > 0;

    return (
        <View style={styles.container}>
            {/* Header with back button - Green theme for Found Items */}
            <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Found Item</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#10b981" />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Image Carousel */}
                {hasImages ? (
                    <View style={styles.imageContainer}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                                setActiveImageIndex(index);
                            }}
                        >
                            {images.map((imageUrl, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: imageUrl }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                        {/* Image indicators */}
                        {images.length > 1 && (
                            <View style={styles.indicatorContainer}>
                                {images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.indicator,
                                            index === activeImageIndex && styles.indicatorActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.noImageContainer}>
                        <FileText size={48} color="#94a3b8" />
                        <Text style={styles.noImageText}>No image available</Text>
                    </View>
                )}

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Title and Status */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                    </View>

                    {/* Category Badge */}
                    <View style={styles.categoryRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.categoryName) }]}>
                            <Tag size={12} color="#fff" />
                            <Text style={styles.categoryText}>{item.categoryName}</Text>
                        </View>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
                                <MapPin size={18} color="#10b981" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Found Location</Text>
                                <Text style={styles.infoValue}>{item.foundLocation}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
                                <Calendar size={18} color="#10b981" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Found Date</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(item.foundDate).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                                <Text style={styles.infoSubValue}>{formatRelativeDate(item.foundDate)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
                                <Building2 size={18} color="#10b981" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Campus</Text>
                                <Text style={styles.infoValue}>{item.campusName}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    {item.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.descriptionText}>{item.description}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleClaimPress}>
                        <UserCheck size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryButtonText}>Claim This Item</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>

            {/* Claim Form Modal */}
            <Modal
                visible={showClaimModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yêu cầu nhận đồ</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Item Info */}
                            <View style={styles.claimItemInfo}>
                                <Text style={styles.claimItemLabel}>Món đồ:</Text>
                                <Text style={styles.claimItemName}>{item.title}</Text>
                            </View>

                            {/* Lost Item Picker - Link to existing lost report */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Liên kết báo cáo mất đồ (tùy chọn)</Text>
                                <Text style={styles.inputHelper}>Liên kết với báo cáo mất đồ của bạn để tăng độ ưu tiên</Text>

                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowLostItemPicker(!showLostItemPicker)}
                                >
                                    <Text style={[
                                        styles.pickerButtonText,
                                        !selectedLostItemId && styles.pickerButtonPlaceholder
                                    ]}>
                                        {selectedLostItemId
                                            ? myLostItems?.find(i => i.lostItemId === selectedLostItemId)?.title || 'Đã chọn'
                                            : 'Select your lost item report...'
                                        }
                                    </Text>
                                    <ChevronDown size={20} color="#64748b" />
                                </TouchableOpacity>

                                {/* Dropdown list */}
                                {showLostItemPicker && (
                                    <View style={styles.pickerDropdown}>
                                        {isLoadingLostItems ? (
                                            <ActivityIndicator size="small" color="#10b981" style={{ padding: 16 }} />
                                        ) : myLostItems && myLostItems.length > 0 ? (
                                            <ScrollView
                                                nestedScrollEnabled={true}
                                                style={{ maxHeight: 180 }}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                <TouchableOpacity
                                                    style={[styles.pickerOption, !selectedLostItemId && styles.pickerOptionSelected]}
                                                    onPress={() => {
                                                        setSelectedLostItemId(undefined);
                                                        setShowLostItemPicker(false);
                                                    }}
                                                >
                                                    <Text style={styles.pickerOptionText}>Không liên kết</Text>
                                                </TouchableOpacity>
                                                {myLostItems.map((lostItem) => (
                                                    <TouchableOpacity
                                                        key={lostItem.lostItemId}
                                                        style={[
                                                            styles.pickerOption,
                                                            selectedLostItemId === lostItem.lostItemId && styles.pickerOptionSelected
                                                        ]}
                                                        onPress={() => {
                                                            setSelectedLostItemId(lostItem.lostItemId);
                                                            setShowLostItemPicker(false);
                                                        }}
                                                    >
                                                        <Text style={styles.pickerOptionText} numberOfLines={1}>
                                                            {lostItem.title}
                                                        </Text>
                                                        <Text style={styles.pickerOptionSubtext}>
                                                            {lostItem.categoryName} • {lostItem.status}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        ) : (
                                            <Text style={styles.noLostItemsText}>You have no lost item reports</Text>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Evidence Title */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tiêu đề bằng chứng</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="VD: Đây là ví của tôi"
                                    placeholderTextColor="#94a3b8"
                                    value={evidenceTitle}
                                    onChangeText={setEvidenceTitle}
                                />
                            </View>

                            {/* Evidence Description */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Mô tả chi tiết</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="Mô tả chi tiết đặc điểm nhận dạng của món đồ..."
                                    placeholderTextColor="#94a3b8"
                                    value={evidenceDescription}
                                    onChangeText={setEvidenceDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Evidence Images */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Ảnh bằng chứng</Text>
                                <View style={styles.imagePickerRow}>
                                    <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
                                        <Camera size={24} color="#10b981" />
                                        <Text style={styles.addImageText}>Add images</Text>
                                    </TouchableOpacity>
                                    {evidenceImages.map((img, index) => (
                                        <View key={index} style={styles.previewImageContainer}>
                                            <Image source={{ uri: img.uri }} style={styles.previewImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => handleRemoveImage(index)}
                                            >
                                                <X size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    createClaimMutation.isPending && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmitClaim}
                                disabled={createClaimMutation.isPending}
                            >
                                {createClaimMutation.isPending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Student ID Card Upload Modal */}
            <Modal
                visible={showStudentIdPrompt}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStudentIdPrompt(false)}
            >
                <View style={styles.studentIdPromptOverlay}>
                    <StudentIdCardPrompt
                        onUploadSuccess={() => {
                            setShowStudentIdPrompt(false);
                            refetchProfile();
                        }}
                    />
                    <TouchableOpacity
                        style={styles.closePromptButton}
                        onPress={() => setShowStudentIdPrompt(false)}
                    >
                        <Text style={styles.closePromptText}>Để sau</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSpacer: {
        width: 40,
    },

    // ScrollView
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },

    // Image
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    indicatorActive: {
        backgroundColor: '#fff',
        width: 24,
    },
    noImageContainer: {
        height: IMAGE_HEIGHT,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    noImageText: {
        fontSize: 14,
        color: '#94a3b8',
    },

    // Content Card
    contentCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: -24,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    title: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    categoryRow: {
        marginTop: 12,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },

    // Info Section
    infoSection: {
        marginTop: 24,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    infoSubValue: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },

    // Description
    descriptionSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
    },

    // Actions
    actionSection: {
        marginHorizontal: 16,
        marginTop: 20,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    claimItemInfo: {
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    claimItemLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    claimItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10b981',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textArea: {
        height: 100,
    },
    imagePickerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#10b981',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    addImageText: {
        fontSize: 10,
        color: '#10b981',
    },
    previewImageContainer: {
        position: 'relative',
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },

    // Lost Item Picker styles
    inputHelper: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 8,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#1e293b',
        flex: 1,
    },
    pickerButtonPlaceholder: {
        color: '#94a3b8',
    },
    pickerDropdown: {
        marginTop: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: 200,
        overflow: 'hidden',
    },
    pickerOption: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    pickerOptionSelected: {
        backgroundColor: '#f0fdf4',
    },
    pickerOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    pickerOptionSubtext: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    noLostItemsText: {
        padding: 16,
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    studentIdPromptOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    closePromptButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    closePromptText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
