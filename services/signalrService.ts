import * as signalR from "@microsoft/signalr";

// Extract base URL without /api suffix for SignalR hub
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const BASE_URL = API_URL.replace(/\/api$/, "");

export const createSignalRConnection = (accessToken: string) => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/notificationHub?access_token=${accessToken}`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();

    return connection;
};

export type { signalR };
