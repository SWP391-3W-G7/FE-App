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

        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds base delay

        const connect = async () => {
            const connection = createSignalRConnection(token);
            connectionRef.current = connection;

            try {
                await connection.start();

                if (!isMounted) return;

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
            } catch (err) {
                if (!isMounted) return;

                // Silent logging - don't spam console.error
                console.log(`SignalR: Connection attempt ${retryCount + 1}/${maxRetries} failed`);

                setIsConnected(false);
                setConnectionError("Notification service unavailable");

                // Retry with exponential backoff
                if (retryCount < maxRetries - 1) {
                    retryCount++;
                    setTimeout(connect, retryDelay * Math.pow(2, retryCount));
                }
            }
        };

        connect();

        // Cleanup on unmount
        return () => {
            isMounted = false;
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
