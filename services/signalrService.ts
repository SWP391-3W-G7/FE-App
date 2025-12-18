import * as signalR from "@microsoft/signalr";

// Extract base URL without /api suffix for SignalR hub
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const BASE_URL = API_URL.replace(/\/api$/, "");

export const createSignalRConnection = (accessToken: string) => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/notificationHub`, {
            accessTokenFactory: () => accessToken,
        })
        // Suppress all SignalR logs to prevent console spam
        .configureLogging(signalR.LogLevel.None)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

    // Silently handle disconnects
    connection.onclose(() => {
        // Silent - no logging
    });

    return connection;
};

export type { signalR };

