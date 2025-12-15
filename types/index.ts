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
    campusId: number;
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
