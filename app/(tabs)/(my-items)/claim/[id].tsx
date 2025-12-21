import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Calendar,
    ChevronLeft,
    Clock,
    FileText,
    Package,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClaimDetail } from '@/hooks/queries/useClaimDetail';
import { formatRelativeDate } from '@/utils/date';

export default function ClaimDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const claimId = parseInt(id || '0', 10);
    const { data: claim, isLoading, isRefetching, refetch, error } = useClaimDetail(claimId);

    const handleBack = () => {
        router.back();
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Pending: '#f59e0b',
            Approved: '#10b981',
            Rejected: '#ef4444',
        };
        return colors[status] || '#64748b';
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#0f172a" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error || !claim) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Không thể tải thông tin</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết yêu cầu</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0f172a" />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Package size={24} color="#0f172a" />
                        <Text style={styles.itemTitle}>
                            {claim.foundItemTitle || `Claim #${claim.claimId}`}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
                        <Clock size={14} color="#fff" />
                        <Text style={styles.statusText}>{claim.status}</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.contentCard}>
                    <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>

                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#ede9fe' }]}>
                                <Calendar size={18} color="#0f172a" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Ngày yêu cầu</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(claim.claimDate).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                                <Text style={styles.infoSubValue}>{formatRelativeDate(claim.claimDate)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#ede9fe' }]}>
                                <User size={18} color="#0f172a" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Người yêu cầu</Text>
                                <Text style={styles.infoValue}>{claim.studentName || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Evidences Card */}
                {claim.evidences && claim.evidences.length > 0 && (
                    <View style={styles.contentCard}>
                        <Text style={styles.sectionTitle}>Bằng chứng ({claim.evidences.length})</Text>

                        {claim.evidences.map((evidence) => (
                            <View key={evidence.evidenceId} style={styles.evidenceItem}>
                                <View style={styles.evidenceHeader}>
                                    <FileText size={16} color="#0f172a" />
                                    <Text style={styles.evidenceTitle}>{evidence.title}</Text>
                                </View>
                                <Text style={styles.evidenceDescription}>{evidence.description}</Text>
                                <Text style={styles.evidenceDate}>
                                    {formatRelativeDate(evidence.createdAt)}
                                </Text>

                                {evidence.imageUrls && evidence.imageUrls.length > 0 && (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.evidenceImages}
                                    >
                                        {evidence.imageUrls.map((url, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: url }}
                                                style={styles.evidenceImage}
                                            />
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Logs Card */}
                {claim.actionLogs && claim.actionLogs.length > 0 && (
                    <View style={styles.contentCard}>
                        <Text style={styles.sectionTitle}>Lịch sử ({claim.actionLogs.length})</Text>

                        {claim.actionLogs.map((log, index) => (
                            <View
                                key={log.actionId}
                                style={[
                                    styles.logItem,
                                    index < claim.actionLogs.length - 1 && styles.logItemBorder
                                ]}
                            >
                                <View style={styles.logDot} />
                                <View style={styles.logContent}>
                                    <Text style={styles.logAction}>{log.actionType}</Text>
                                    <Text style={styles.logDetails}>{log.actionDetails}</Text>
                                    <View style={styles.logMeta}>
                                        <Text style={styles.logBy}>{log.performedByName}</Text>
                                        <Text style={styles.logDate}>
                                            {formatRelativeDate(log.actionDate)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

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
        backgroundColor: '#0f172a',
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
        padding: 16,
    },

    // Status Card
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    itemTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },

    // Content Card
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },

    // Info Section
    infoSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
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

    // Evidence
    evidenceItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    evidenceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    evidenceTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    evidenceDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    evidenceDate: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 8,
    },
    evidenceImages: {
        marginTop: 12,
    },
    evidenceImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
    },

    // Action Logs
    logItem: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    logItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    logDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0f172a',
        marginTop: 4,
        marginRight: 12,
    },
    logContent: {
        flex: 1,
    },
    logAction: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    logDetails: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    logMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    logBy: {
        fontSize: 12,
        color: '#0f172a',
    },
    logDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
