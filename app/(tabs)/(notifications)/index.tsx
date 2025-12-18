import { LinearGradient } from 'expo-linear-gradient';
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { Notification, useNotifications } from '@/hooks/useNotifications';
import { formatRelativeDate } from '@/utils/date';

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const {
        notifications,
        isConnected,
        connectionError,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    } = useNotifications(token);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulating refresh - in real app, you might fetch from API
        setTimeout(() => setRefreshing(false), 1000);
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
                <Bell size={20} color={item.isRead ? '#94a3b8' : '#667eea'} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                        {item.title || 'Thông báo'}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={styles.timestamp}>{formatRelativeDate(item.createdAt.toISOString())}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <BellOff size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={styles.emptySubtitle}>
                Các thông báo mới sẽ xuất hiện ở đây
            </Text>
        </View>
    );

    const renderConnectionStatus = () => {
        if (connectionError) {
            return (
                <View style={styles.connectionError}>
                    <Text style={styles.connectionErrorText}>
                        ⚠️ Không thể kết nối: {connectionError}
                    </Text>
                </View>
            );
        }

        if (!isConnected && token) {
            return (
                <View style={styles.connecting}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.connectingText}>Đang kết nối...</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Thông báo</Text>
                        {unreadCount > 0 && (
                            <Text style={styles.headerSubtitle}>
                                {unreadCount} thông báo chưa đọc
                            </Text>
                        )}
                    </View>
                    <View style={styles.headerActions}>
                        {notifications.length > 0 && (
                            <>
                                <TouchableOpacity
                                    style={styles.headerButton}
                                    onPress={markAllAsRead}
                                    activeOpacity={0.7}
                                >
                                    <CheckCheck size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.headerButton}
                                    onPress={clearNotifications}
                                    activeOpacity={0.7}
                                >
                                    <Trash2 size={20} color="#fff" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Connection Status Indicator */}
                <View style={styles.statusBar}>
                    <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
                    <Text style={styles.statusText}>
                        {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                    </Text>
                </View>
            </LinearGradient>

            {/* Connection Error/Loading */}
            {renderConnectionStatus()}

            {/* Notification List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                contentContainerStyle={[
                    styles.listContent,
                    notifications.length === 0 && styles.emptyListContent,
                ]}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#667eea"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#e0e7ff',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusConnected: {
        backgroundColor: '#4ade80',
    },
    statusDisconnected: {
        backgroundColor: '#facc15',
    },
    statusText: {
        fontSize: 12,
        color: '#e0e7ff',
    },
    connectionError: {
        backgroundColor: '#fef2f2',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#fecaca',
    },
    connectionErrorText: {
        color: '#dc2626',
        fontSize: 13,
        textAlign: 'center',
    },
    connecting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#f0f9ff',
        gap: 8,
    },
    connectingText: {
        color: '#667eea',
        fontSize: 13,
    },
    listContent: {
        padding: 16,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: '#f8faff',
        borderLeftWidth: 3,
        borderLeftColor: '#667eea',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    unreadIconContainer: {
        backgroundColor: '#eef2ff',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    unreadTitle: {
        color: '#1e293b',
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#667eea',
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 6,
    },
    timestamp: {
        fontSize: 12,
        color: '#94a3b8',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
