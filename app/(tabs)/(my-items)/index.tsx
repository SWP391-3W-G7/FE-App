import { CheckCircle, Clock, Package, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ItemTab = 'myReports' | 'myClaims';

export default function MyItemsScreen() {
  const [activeTab, setActiveTab] = useState<ItemTab>('myReports');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const mockReports = [
    {
      id: 1,
      title: 'Black iPhone 13 Pro',
      type: 'lost',
      status: 'Open',
      date: '2 hours ago',
      location: 'Library Building A',
    },
    {
      id: 2,
      title: 'Red Water Bottle',
      type: 'found',
      status: 'In Progress',
      date: '1 day ago',
      location: 'Gym',
    },
  ];

  const mockClaims = [
    {
      id: 1,
      itemTitle: 'Blue Backpack',
      status: 'Pending',
      claimedDate: '1 day ago',
      location: 'Cafeteria',
    },
    {
      id: 2,
      itemTitle: 'Laptop Charger',
      status: 'Approved',
      claimedDate: '3 days ago',
      location: 'Computer Lab',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Open: '#3b82f6',
      'In Progress': '#f59e0b',
      Resolved: '#10b981',
      Closed: '#6b7280',
      Pending: '#f59e0b',
      Approved: '#10b981',
      Rejected: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 16, color: '#fff' };
    switch (status) {
      case 'Approved':
      case 'Resolved':
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activity</Text>
        <Text style={styles.headerSubtitle}>Track your reports and claims</Text>
      </View>

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {activeTab === 'myReports' ? (
          mockReports.map((report) => (
            <TouchableOpacity key={report.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{report.title}</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}
                >
                  {getStatusIcon(report.status)}
                  <Text style={styles.statusText}>{report.status}</Text>
                </View>
              </View>
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.typeBadge,
                    report.type === 'lost' ? styles.typeBadgeLost : styles.typeBadgeFound,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      report.type === 'lost' ? styles.typeTextLost : styles.typeTextFound,
                    ]}
                  >
                    {report.type === 'lost' ? 'Lost' : 'Found'}
                  </Text>
                </View>
                <Text style={styles.cardLocation}>{report.location}</Text>
              </View>
              <Text style={styles.cardDate}>{report.date}</Text>
            </TouchableOpacity>
          ))
        ) : (
          mockClaims.map((claim) => (
            <TouchableOpacity key={claim.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{claim.itemTitle}</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}
                >
                  {getStatusIcon(claim.status)}
                  <Text style={styles.statusText}>{claim.status}</Text>
                </View>
              </View>
              <Text style={styles.cardLocation}>{claim.location}</Text>
              <Text style={styles.cardDate}>Claimed {claim.claimedDate}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    fontSize: 12,
    fontWeight: '600' as const,
  },
  typeTextLost: {
    color: '#dc2626',
  },
  typeTextFound: {
    color: '#16a34a',
  },
  cardLocation: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
