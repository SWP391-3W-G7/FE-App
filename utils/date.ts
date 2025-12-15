/**
 * Date utility functions
 * Chứa các helper functions xử lý ngày tháng
 */

/**
 * Format ngày thành relative time (vd: "2 hours ago", "3 days ago")
 * @param dateString - ISO date string từ API
 * @returns Chuỗi relative time
 */
export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('vi-VN');
}

/**
 * Format ngày thành định dạng YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}
