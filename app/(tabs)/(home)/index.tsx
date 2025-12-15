import { LinearGradient } from 'expo-linear-gradient';
import { Filter, MapPin, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'lost' | 'found';

// Interface cho Lost Item từ API
interface LostItem {
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

export default function HomeScreen() {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Lost Items từ API
  const fetchLostItems = async () => {
    const url = `${API_BASE_URL}${API_ENDPOINTS.LOST_ITEMS}`;
    console.log('========== LOST ITEMS API CALL ==========');
    console.log('URL:', url);
    console.log('Token:', token ? 'Present' : 'Missing');
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const elapsed = Date.now() - startTime;
      console.log(`Response status: ${response.status} (took ${elapsed}ms)`);

      if (response.ok) {
        const data: LostItem[] = await response.json();
        console.log('Lost Items received:', data.length, 'items');
        console.log('==========================================');
        setLostItems(data);
      } else {
        console.error('Failed to fetch lost items:', response.status);
        console.log('==========================================');
      }
    } catch (error) {
      console.error('Error fetching lost items:', error);
      console.log('==========================================');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLostItems();
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLostItems();
  };

  const mockFoundItems = [
    {
      id: 1,
      title: 'Red Water Bottle',
      location: 'Gym',
      date: '1 hour ago',
      category: 'Others',
    },
    {
      id: 2,
      title: 'Laptop Charger',
      location: 'Computer Lab',
      date: '3 hours ago',
      category: 'Electronics',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Electronics: '#3b82f6',
      Bags: '#10b981',
      Documents: '#f59e0b',
      Others: '#8b5cf6',
    };
    return colors[category] || '#64748b';
  };

  // Format date từ API
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.fullName || 'Student'}!</Text>
            <Text style={styles.subtitle}>{user?.campusName || 'Campus'}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lost' && styles.tabActive]}
          onPress={() => setActiveTab('lost')}
        >
          <Text style={[styles.tabText, activeTab === 'lost' && styles.tabTextActive]}>
            Lost Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'found' && styles.tabActive]}
          onPress={() => setActiveTab('found')}
        >
          <Text style={[styles.tabText, activeTab === 'found' && styles.tabTextActive]}>
            Found Items
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {isLoading && activeTab === 'lost' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : activeTab === 'lost' ? (
          lostItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No lost items found</Text>
            </View>
          ) : (
            lostItems.map((item) => (
              <TouchableOpacity key={item.lostItemId} style={styles.card}>
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <Image
                    source={{ uri: item.imageUrls[0] }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <View
                      style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.categoryName) }]}
                    >
                      <Text style={styles.categoryText}>{item.categoryName}</Text>
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.cardLocation} numberOfLines={1}>{item.lostLocation}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>{formatDate(item.lostDate)}</Text>
                    <View style={[styles.statusBadge, item.status === 'Closed' && styles.statusClosed]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          mockFoundItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View
                    style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}
                  >
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.cardLocation}>{item.location}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -24,
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
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
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
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
  },
  statusClosed: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});
