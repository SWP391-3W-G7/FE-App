import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowUp, Filter, MapPin, Search } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useFoundItems } from '@/hooks/queries/useFoundItems';
import { useLostItems } from '@/hooks/queries/useLostItems';
import { formatRelativeDate } from '@/utils/date';
import { getCategoryColor } from '@/utils/status';

type TabType = 'lost' | 'found';

// Header dimensions
const HEADER_EXPANDED_HEIGHT = 180; // Full header with greeting + search
const HEADER_COLLAPSED_HEIGHT = 56; // Just the title bar
const SCROLL_THRESHOLD = 50;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);

  // Animated values
  const headerHeight = useRef(new Animated.Value(HEADER_EXPANDED_HEIGHT)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

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

  // Collapse animation
  const collapse = useCallback(() => {
    if (isCollapsed) return;
    setIsCollapsed(true);
    Animated.parallel([
      Animated.spring(headerHeight, {
        toValue: HEADER_COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 15,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isCollapsed, headerHeight, contentOpacity]);

  // Expand animation
  const expand = useCallback(() => {
    if (!isCollapsed) return;
    setIsCollapsed(false);
    Animated.parallel([
      Animated.spring(headerHeight, {
        toValue: HEADER_EXPANDED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 15,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isCollapsed, headerHeight, contentOpacity]);

  // FAB animations
  const showFab = useCallback(() => {
    setShowScrollToTop(true);
    Animated.parallel([
      Animated.spring(fabOpacity, { toValue: 1, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
    ]).start();
  }, [fabOpacity, fabScale]);

  const hideFab = useCallback(() => {
    Animated.parallel([
      Animated.timing(fabOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 0, useNativeDriver: true }),
    ]).start(() => setShowScrollToTop(false));
  }, [fabOpacity, fabScale]);

  // Scroll handler
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const isGoingDown = currentScrollY > lastScrollY.current;

      // FAB visibility
      if (currentScrollY > SCROLL_THRESHOLD && !showScrollToTop) showFab();
      else if (currentScrollY <= SCROLL_THRESHOLD && showScrollToTop) hideFab();

      // Header collapse/expand
      if (isGoingDown && currentScrollY > 30 && !isCollapsed) collapse();
      else if (!isGoingDown && currentScrollY < 30 && isCollapsed) expand();

      lastScrollY.current = currentScrollY;
    },
    [showScrollToTop, showFab, hideFab, collapse, expand, isCollapsed]
  );

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    expand();
    hideFab();
  }, [expand, hideFab]);

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <Animated.View style={{ height: Animated.add(headerHeight, insets.top) }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top }]}
        >
          {/* Title - always visible */}
          <View style={styles.titleBar}>
            <Text style={styles.title}>Lost & Found</Text>
          </View>

          {/* Collapsible content */}
          <Animated.View style={[styles.collapsibleContent, { opacity: contentOpacity }]}>
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
                <Filter size={20} color="#667eea" />
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#667eea" />
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
          style={[styles.fab, { opacity: fabOpacity, transform: [{ scale: fabScale }], bottom: insets.bottom + 20 }]}
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
    backgroundColor: '#667eea',
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
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
