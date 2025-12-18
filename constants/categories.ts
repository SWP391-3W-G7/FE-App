/**
 * Categories constants
 * Danh sách các category cho Lost/Found items
 */

/**
 * Danh sách categories
 */
export const CATEGORIES = [
    'Electronics',
    'Bags',
    'Documents',
    'Clothing',
    'Keys',
    'Others',
] as const;

export type CategoryType = typeof CATEGORIES[number];
