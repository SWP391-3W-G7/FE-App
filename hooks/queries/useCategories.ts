/**
 * React Query hook for Categories
 * Sử dụng @tanstack/react-query để quản lý server state
 */

import { getCategories } from '@/services/categories';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key cho Categories
 */
export const categoriesQueryKey = ['categories'] as const;

/**
 * Hook để fetch danh sách Categories
 * Sử dụng React Query để tự động caching, refetching, loading/error states
 * staleTime set cao vì danh sách categories ít thay đổi
 */
export function useCategories() {
    return useQuery({
        queryKey: categoriesQueryKey,
        queryFn: getCategories,
        staleTime: 1000 * 60 * 60, // 1 hour - category list rarely changes
    });
}
