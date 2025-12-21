import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowUp, Filter, MapPin, Search } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useFoundItems } from '@/hooks/queries/useFoundItems';
import { useLostItems } from '@/hooks/queries/useLostItems';
import { formatRelativeDate } from '@/utils/date';
import { getCategoryColor } from '@/utils/status';

type TabType = 'lost' | 'found';

// Header dimensions
const HEADER_EXPANDED_HEIGHT = 180;
const HEADER_COLLAPSED_HEIGHT = 56;
const SCROLL_THRESHOLD = 50;
const HEADER_SCROLL_DISTANCE = HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Refs
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Reanimated shared values - run on UI thread
  const scrollY = useSharedValue(0);
  const fabScale = useSharedValue(0);

  // Scroll handler - runs on UI thread (worklet)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles - computed on UI thread
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      'clamp'
    );
    return { height: height + insets.top };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      'clamp'
    );
    return { opacity };
  });

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fabScale.value,
      transform: [{ scale: fabScale.value }],
    };
  });

  // React Query hooks
  const {
    data: lostItems = [],
    isLoading: isLoadingLost,
    isRefetching: isRefetchingLost,
    refetch: refetchLost,
  } = useLostItems();

  const {
    data: foundItems = [],
    isLoading: isLoadingFound,
    isRefetching: isRefetchingFound,
    refetch: refetchFound,
  } = useFoundItems();

  const isLoading = activeTab === 'lost' ? isLoadingLost : isLoadingFound;
  const isRefetching = activeTab === 'lost' ? isRefetchingLost : isRefetchingFound;

  const onRefresh = () => {
    if (activeTab === 'lost') {
      refetchLost();
    } else {
      refetchFound();
    }
  };

  // FAB animations
  const showFab = useCallback(() => {
    setShowScrollToTop(true);
    fabScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [fabScale]);

  const hideFab = useCallback(() => {
    fabScale.value = withSpring(0, { damping: 15, stiffness: 150 });
    setTimeout(() => setShowScrollToTop(false), 200);
  }, [fabScale]);

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    hideFab();
  }, [hideFab]);

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <Animated.View style={headerAnimatedStyle}>
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top }]}
        >
          {/* Title - always visible */}
          <View style={styles.titleBar}>
            <Text style={styles.title}>Lost & Found</Text>
          </View>

          {/* Collapsible content */}
          <Animated.View style={[styles.collapsibleContent, contentAnimatedStyle]}>
            <View style={styles.greetingRow}>

              <Text style={styles.campus}>{user?.campusName || 'Campus'}</Text>
            </View>

            <View style={styles.searchRow}>
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
                <Filter size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Tabs */}
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

      {/* Item List */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        onScroll={scrollHandler}
        scrollEventThrottle={1}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#0f172a" />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0f172a" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : activeTab === 'lost' ? (
          lostItems.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No lost items found</Text>
            </View>
          ) : (
            lostItems.map((item) => (
              <TouchableOpacity
                key={item.lostItemId}
                style={styles.card}
                onPress={() => router.push(`/(tabs)/(home)/lost-item/${item.lostItemId}` as any)}
                activeOpacity={0.7}
              >
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <Image source={{ uri: item.imageUrls[0] }} style={styles.cardImage} resizeMode="cover" />
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.categoryName) }]}>
                      <Text style={styles.categoryText}>{item.categoryName}</Text>
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.cardLocation} numberOfLines={1}>{item.lostLocation}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>{formatRelativeDate(item.lostDate)}</Text>
                    <View style={[styles.statusBadge, item.status === 'Closed' && styles.statusClosed]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : foundItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No found items</Text>
          </View>
        ) : (
          foundItems.map((item) => (
            <TouchableOpacity
              key={item.foundItemId}
              style={styles.card}
              onPress={() => router.push(`/(tabs)/(home)/found-item/${item.foundItemId}` as any)}
              activeOpacity={0.7}
            >
              {item.imageUrls && item.imageUrls.length > 0 && (
                <Image source={{ uri: item.imageUrls[0] }} style={styles.cardImage} resizeMode="cover" />
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.categoryName) }]}>
                    <Text style={styles.categoryText}>{item.categoryName}</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.cardLocation} numberOfLines={1}>{item.foundLocation}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>{formatRelativeDate(item.foundDate)}</Text>
                  <View style={[styles.statusBadge, item.status === 'Returned' && styles.statusClosed]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>

      {/* Scroll to Top FAB */}
      {showScrollToTop && (
        <Animated.View
          style={[styles.fab, fabAnimatedStyle, { bottom: insets.bottom + 20 }]}
        >
          <TouchableOpacity style={styles.fabButton} onPress={scrollToTop} activeOpacity={0.8}>
            <ArrowUp size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleBar: {
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  collapsibleContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  greetingRow: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  campus: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  searchRow: {
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
    zIndex: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#0f172a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 16,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
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
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    fontWeight: '500',
    color: '#374151',
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
