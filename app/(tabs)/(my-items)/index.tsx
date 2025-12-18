import { useMyClaims, useMyFoundItems } from '@/hooks/queries';
import type { FoundItemResponse, MyClaimResponse } from '@/types';
import { formatRelativeDate } from '@/utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle, Clock, Package, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ItemTab = 'myReports' | 'myClaims';

export default function MyItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ItemTab>('myReports');

  // React Query hook for My Claims
  const {
    data: claims,
    isLoading: isClaimsLoading,
    isError: isClaimsError,
    refetch: refetchClaims,
    isRefetching: isClaimsRefetching,
  } = useMyClaims();

  // React Query hook for My Found Items
  const {
    data: foundItems,
    isLoading: isFoundItemsLoading,
    isError: isFoundItemsError,
    refetch: refetchFoundItems,
    isRefetching: isFoundItemsRefetching,
  } = useMyFoundItems();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Open: '#3b82f6',
      'In Progress': '#f59e0b',
      Resolved: '#10b981',
      Closed: '#6b7280',
      Pending: '#f59e0b',
      Approved: '#10b981',
      Rejected: '#ef4444',
      Stored: '#8b5cf6',
      Returned: '#10b981',
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 16, color: '#fff' };
    switch (status) {
      case 'Approved':
      case 'Resolved':
      case 'Returned':
        return <CheckCircle {...iconProps} />;
      case 'Rejected':
      case 'Closed':
        return <X {...iconProps} />;
      case 'Pending':
      case 'Open':
        return <Clock {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  const handleFoundItemPress = (id: number) => {
    router.push(`/(tabs)/(my-items)/found-item/${id}` as any);
  };

  const handleClaimPress = (id: number) => {
    router.push(`/(tabs)/(my-items)/claim/${id}` as any);
  };

  const renderFoundItemCard = (item: FoundItemResponse) => (
    <TouchableOpacity
      key={item.foundItemId}
      style={styles.card}
      onPress={() => handleFoundItemPress(item.foundItemId)}
    >
      <View style={styles.cardWithImage}>
        {item.imageUrls && item.imageUrls.length > 0 && (
          <Image source={{ uri: item.imageUrls[0] }} style={styles.cardImage} />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              {getStatusIcon(item.status)}
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={[styles.typeBadge, styles.typeBadgeFound]}>
              <Text style={[styles.typeText, styles.typeTextFound]}>Found</Text>
            </View>
            <Text style={styles.cardLocation} numberOfLines={1}>
              {item.foundLocation}
            </Text>
          </View>
          <Text style={styles.cardDate}>{formatRelativeDate(item.foundDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderClaimCard = (claim: MyClaimResponse) => (
    <TouchableOpacity
      key={claim.claimId}
      style={styles.card}
      onPress={() => handleClaimPress(claim.claimId)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{claim.foundItemTitle || `Claim #${claim.claimId}`}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
          {getStatusIcon(claim.status)}
          <Text style={styles.statusText}>{claim.status}</Text>
        </View>
      </View>
      {claim.evidences.length > 0 && (
        <Text style={styles.cardLocation} numberOfLines={2}>
          {claim.evidences[0].description}
        </Text>
      )}
      <Text style={styles.cardDate}>Yêu cầu {formatRelativeDate(claim.claimDate)}</Text>
    </TouchableOpacity>
  );

  const renderReportsContent = () => {
    if (isFoundItemsLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    if (isFoundItemsError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchFoundItems()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!foundItems || foundItems.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Package size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
        </View>
      );
    }

    return foundItems.map(renderFoundItemCard);
  };

  const renderClaimsContent = () => {
    if (isClaimsLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    if (isClaimsError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchClaims()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!claims || claims.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Package size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Chưa có yêu cầu nhận đồ nào</Text>
        </View>
      );
    }

    return claims.map(renderClaimCard);
  };

  const handleRefresh = () => {
    if (activeTab === 'myReports') {
      refetchFoundItems();
    } else {
      refetchClaims();
    }
  };

  const isRefreshing = activeTab === 'myReports' ? isFoundItemsRefetching : isClaimsRefetching;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <Text style={styles.headerTitle}>My Activity</Text>
        <Text style={styles.headerSubtitle}>Track your reports and claims</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myReports' && styles.tabActive]}
          onPress={() => setActiveTab('myReports')}
        >
          <Text style={[styles.tabText, activeTab === 'myReports' && styles.tabTextActive]}>
            My Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myClaims' && styles.tabActive]}
          onPress={() => setActiveTab('myClaims')}
        >
          <Text style={[styles.tabText, activeTab === 'myClaims' && styles.tabTextActive]}>
            My Claims
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#667eea" />
        }
      >
        {activeTab === 'myReports' ? renderReportsContent() : renderClaimsContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardWithImage: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeLost: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  typeBadgeFound: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  typeTextLost: {
    color: '#dc2626',
  },
  typeTextFound: {
    color: '#16a34a',
  },
  cardLocation: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  cardDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});
