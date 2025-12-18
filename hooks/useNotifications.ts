import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

import { createSignalRConnection } from '@/services/signalrService';

export interface Notification {
    id: string;
    message: string;
    title?: string;
    createdAt: Date;
    isRead: boolean;
    data?: Record<string, unknown>;
}

export const useNotifications = (token: string | null) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const connectionRef = useRef<ReturnType<typeof createSignalRConnection> | null>(null);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    // Get unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (!token) {
            setIsConnected(false);
            return;
        }

        const connection = createSignalRConnection(token);
        connectionRef.current = connection;

        connection
            .start()
            .then(() => {
                console.log("SignalR Connected!");
                setIsConnected(true);
                setConnectionError(null);

                // Listen for notifications from backend
                connection.on("ReceiveNotification", (data: { message: string; title?: string;[key: string]: unknown }) => {
                    console.log("New Notification:", data);

                    const newNotification: Notification = {
                        id: Date.now().toString(),
                        message: data.message,
                        title: data.title || "Thông báo mới",
                        createdAt: new Date(),
                        isRead: false,
                        data: data,
                    };

                    // Show local notification popup
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: newNotification.title || "Thông báo mới 🔔",
                            body: data.message,
                            data: data,
                        },
                        trigger: null,
                    });

                    // Add to state
                    setNotifications(prev => [newNotification, ...prev]);
                });
            })
            .catch(err => {
                console.error("SignalR Connection Error:", err);
                setIsConnected(false);
                setConnectionError(err.message || "Connection failed");
            });

        // Cleanup on unmount
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [token]);

    return {
        notifications,
        isConnected,
        connectionError,
        unreadCount,
        clearNotifications,
        markAsRead,
        markAllAsRead,
    };
};
