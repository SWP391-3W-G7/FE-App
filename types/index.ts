export interface User {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    roleId: number;
    status: string;
    campusId: number;
    roleName: string;
    campusName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName: string;
    campusId: string; // Campus name string like "HoChiMinh", not numeric ID
    phoneNumber?: string;
    studentIdCard?: {
        uri: string;
        type: string;
        name: string;
    };
}

export interface LoginResponse {
    token: string;
}

export interface Campus {
    campusId: number;
    campusName: string;
    address?: string;
    storageLocation?: string;
}

export interface Category {
    categoryId: number;
    categoryName: string;
}

export interface LostItem {
    lostItemId: number;
    lostDate: string;
    lostLocation: string;
    status: string;
    createdBy: number;
    categoryId: number;
    category?: Category;
    images?: ItemImage[];
    description?: string;
    title?: string;
}

export interface FoundItem {
    foundItemId: number;
    title: string;
    description: string;
    foundDate: string;
    foundLocation: string;
    status: string;
    createdBy: number;
    storedBy?: number;
    campusId: number;
    categoryId: number;
    category?: Category;
    campus?: Campus;
    images?: ItemImage[];
}

export interface ItemImage {
    imageId: number;
    imageURL: string;
    uploadedAt: string;
    uploadedBy: number;
}

export interface ClaimRequest {
    claimId: number;
    claimDate: string;
    status: string;
    foundItemId: number;
    studentId: number;
    foundItem?: FoundItem;
}

export type ItemStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected';

// API Response types - thêm các fields từ API response
export interface LostItemResponse {
    lostItemId: number;
    title: string;
    description: string;
    lostDate: string;
    lostLocation: string;
    status: string;
    campusId: number;
    campusName: string;
    categoryId: number;
    categoryName: string;
    imageUrls: string[];
}

export interface FoundItemResponse {
    foundItemId: number;
    title: string;
    description: string;
    foundDate: string;
    foundLocation: string;
    status: string;
    campusId: number;
    campusName: string;
    categoryId: number;
    categoryName: string;
    createdBy: number;
    storedBy: number | null;
    imageUrls: string[];
    claimRequests: unknown[] | null;
    actionLogs: unknown[] | null;
}

// /Campus/enum-values API response
export interface CampusEnumValue {
    id: number;
    name: string;
    description: string;
}

// My Claims API response types
export interface ClaimEvidence {
    evidenceId: number;
    title: string;
    description: string;
    createdAt: string;
    imageUrls: string[];
}

export interface ClaimActionLog {
    actionId: number;
    lostItemId: number | null;
    foundItemId: number | null;
    claimRequestId: number;
    actionType: string;
    actionDetails: string;
    oldStatus: string | null;
    newStatus: string;
    actionDate: string;
    performedBy: number;
    performedByName: string;
    campusId: number;
    campusName: string;
}

export interface MyClaimResponse {
    claimId: number;
    claimDate: string;
    status: string;
    foundItemId: number | null;
    lostItemId: number | null;
    foundItemTitle: string | null;
    studentId: number;
    studentName: string | null;
    evidences: ClaimEvidence[];
    actionLogs: ClaimActionLog[];
}
