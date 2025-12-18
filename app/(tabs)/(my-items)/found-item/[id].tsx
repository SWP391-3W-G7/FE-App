import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Building2,
    Calendar,
    ChevronLeft,
    FileText,
    MapPin,
    Tag,
    UserCheck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFoundItemDetail } from '@/hooks/queries/useFoundItemDetail';
import { formatRelativeDate } from '@/utils/date';
import { getCategoryColor, getStatusColor } from '@/utils/status';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export default function MyFoundItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const itemId = parseInt(id || '0', 10);
    const { data: item, isLoading, isRefetching, refetch, error } = useFoundItemDetail(itemId);

    const handleBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (error || !item) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Không thể tải thông tin</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = item.imageUrls || [];
    const hasImages = images.length > 0;

    return (
        <View style={styles.container}>
            {/* Header with back button - Purple theme for My Items */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#667eea" />
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
                        <Text style={styles.noImageText}>Không có ảnh</Text>
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
                            <View style={[styles.iconContainer, { backgroundColor: '#ede9fe' }]}>
                                <MapPin size={18} color="#667eea" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Vị trí tìm thấy</Text>
                                <Text style={styles.infoValue}>{item.foundLocation}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#ede9fe' }]}>
                                <Calendar size={18} color="#667eea" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Ngày tìm thấy</Text>
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
                            <View style={[styles.iconContainer, { backgroundColor: '#ede9fe' }]}>
                                <Building2 size={18} color="#667eea" />
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
                            <Text style={styles.sectionTitle}>Mô tả</Text>
                            <Text style={styles.descriptionText}>{item.description}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <UserCheck size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryButtonText}>Xem yêu cầu nhận</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
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
        backgroundColor: '#667eea',
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
        backgroundColor: '#667eea',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#667eea',
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
});
