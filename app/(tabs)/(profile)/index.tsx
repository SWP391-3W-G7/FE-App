import { LogOut, Mail, MapPin, Phone, User as UserIcon } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StudentIdCardPrompt } from '@/components/StudentIdCardPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/queries/useUserProfile';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { data: profile, isLoading, isRefetching, refetch } = useUserProfile();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#0f172a']}
            tintColor="#0f172a"
          />
        }
      >
        <View style={styles.header}>
          {profile?.studentIdCardUrl ? (
            <RNImage
              source={{ uri: profile.studentIdCardUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: profile?.status === 'Active' ? '#dcfce7' : '#fef3c7' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: profile?.status === 'Active' ? '#16a34a' : '#d97706' }
              ]}>
                {profile?.status || 'Unknown'}
              </Text>
            </View>
            <Text style={styles.role}>{profile?.roleName || 'User'}</Text>
          </View>
        </View>

        {/* Student ID Card Upload Prompt */}
        {!profile?.studentIdCardUrl && (
          <StudentIdCardPrompt onUploadSuccess={() => refetch()} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <UserIcon size={20} color="#0f172a" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{profile?.username || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Mail size={20} color="#0f172a" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Phone size={20} color="#0f172a" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{profile?.phoneNumber || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MapPin size={20} color="#0f172a" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Campus</Text>
                <Text style={styles.infoValue}>{profile?.campusName || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Student ID Card Preview */}
        {profile?.studentIdCardUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thẻ sinh viên</Text>
            <View style={styles.studentIdCard}>
              <RNImage
                source={{ uri: profile.studentIdCardUrl }}
                style={styles.studentIdCardImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FPT Lost & Found v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  role: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  studentIdCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  studentIdCardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
