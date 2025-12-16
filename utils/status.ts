/**
 * Status & Category color utility functions
 * Chứa các helper functions liên quan đến màu sắc status và category
 */

/**
 * Màu sắc cho các status của item/claim
 */
export const STATUS_COLORS: Record<string, string> = {
    Open: '#3b82f6',
    'In Progress': '#f59e0b',
    Resolved: '#10b981',
    Closed: '#6b7280',
    Pending: '#f59e0b',
    Approved: '#10b981',
    Rejected: '#ef4444',
    Lost: '#ef4444',
    Found: '#10b981',
    Returned: '#3b82f6',
};

/**
 * Lấy màu dựa trên status
 * @param status - Status string
 * @returns Hex color code
 */
export function getStatusColor(status: string): string {
    return STATUS_COLORS[status] || '#64748b';
}

/**
 * Màu sắc cho các category
 */
export const CATEGORY_COLORS: Record<string, string> = {
    Electronics: '#3b82f6',
    Bags: '#10b981',
    Documents: '#f59e0b',
    Clothing: '#8b5cf6',
    Keys: '#ec4899',
    Others: '#64748b',
};

/**
 * Lấy màu dựa trên category
 * @param category - Category name
 * @returns Hex color code
 */
export function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || '#64748b';
}
