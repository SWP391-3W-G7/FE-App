import { LinearGradient } from 'expo-linear-gradient';
import { Bell, BellOff, CheckCheck, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
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

    const [refreshing, setRefreshing] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulating refresh - in real app, you might fetch from API
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleNotificationPress = (item: Notification) => {
        setSelectedNotification(item);
        if (!item.isRead) {
            markAsRead(item.id);
        }
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
                <Bell size={20} color={item.isRead ? '#94a3b8' : '#0f172a'} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                        {item.title || 'Notification'}
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
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
                New notifications will appear here
            </Text>
        </View>
    );

    const renderConnectionStatus = () => {
        if (connectionError) {
            return (
                <View style={styles.connectionError}>
                    <Text style={styles.connectionErrorText}>
                        ⚠️ Could not connect: {connectionError}
                    </Text>
                </View>
            );
        }

        if (!isConnected && token) {
            return (
                <View style={styles.connecting}>
                    <ActivityIndicator size="small" color="#0f172a" />
                    <Text style={styles.connectingText}>Connecting...</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                            <Text style={styles.headerSubtitle}>
                                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
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
                        {isConnected ? 'Connected' : 'Not connected'}
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
                        tintColor="#0f172a"
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Notification Detail Modal */}
            <Modal
                transparent
                visible={!!selectedNotification}
                animationType="fade"
                onRequestClose={() => setSelectedNotification(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.modalHeader, !selectedNotification?.isRead && styles.modalHeaderUnread]}>
                            <View style={styles.modalIconContainer}>
                                <Bell size={24} color={selectedNotification?.isRead ? '#64748b' : '#0f172a'} />
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedNotification(null)}
                            >
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
                            <Text style={styles.modalTimestamp}>
                                {selectedNotification && formatRelativeDate(selectedNotification.createdAt.toISOString())}
                                {' • '}
                                {selectedNotification && selectedNotification.createdAt.toLocaleString()}
                            </Text>
                            <Text style={styles.modalMessage}>{selectedNotification?.message}</Text>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setSelectedNotification(null)}
                            >
                                <Text style={styles.modalCloseButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        color: '#0f172a',
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
        borderLeftColor: '#0f172a',
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
        backgroundColor: '#0f172a',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalHeaderUnread: {
        backgroundColor: '#f8faff',
    },
    modalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    closeButton: {
        marginLeft: 'auto',
        padding: 8,
    },
    modalBody: {
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    modalTimestamp: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 16,
    },
    modalMessage: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    modalCloseButton: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#0f172a',
        fontWeight: '600',
        fontSize: 16,
    },
});
