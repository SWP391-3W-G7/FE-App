/**
 * Date utility functions
 * Chứa các helper functions xử lý ngày tháng
 */

/**
 * Convert UTC date string to Vietnam timezone (UTC+7)
 * API trả về thời gian UTC, cần convert sang giờ Việt Nam
 */
export function convertToVietnamTime(dateString: string): Date {
    const date = new Date(dateString);
    // Nếu dateString không có timezone info (kết thúc bằng Z hoặc +/-), 
    // coi như là UTC và thêm 7 giờ
    if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
        // Server trả về UTC time không có Z suffix
        return new Date(date.getTime() + (7 * 60 * 60 * 1000));
    }
    return date;
}

/**
 * Format ngày thành relative time (vd: "2 giờ trước", "3 ngày trước")
 * @param dateString - ISO date string từ API (UTC)
 * @returns Chuỗi relative time
 */
export function formatRelativeDate(dateString: string): string {
    const date = convertToVietnamTime(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
}

/**
 * Format ngày thành định dạng đầy đủ tiếng Việt với giờ
 * @param dateString - ISO date string từ API (UTC)
 */
export function formatFullDateTime(dateString: string): string {
    const date = convertToVietnamTime(dateString);
    return date.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format ngày thành định dạng ngày tháng tiếng Việt (không có giờ)
 * @param dateString - ISO date string từ API (UTC)
 */
export function formatDateVN(dateString: string): string {
    const date = convertToVietnamTime(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format ngày thành định dạng YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}
