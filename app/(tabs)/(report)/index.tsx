import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, FileQuestion, FileText, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StudentIdCardPrompt } from '@/components/StudentIdCardPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateFoundItem } from '@/hooks/mutations/useCreateFoundItem';
import { useCreateLostItem } from '@/hooks/mutations/useCreateLostItem';
import { useCampuses } from '@/hooks/queries/useCampuses';
import { useCategories } from '@/hooks/queries/useCategories';
import { useUserProfile } from '@/hooks/queries/useUserProfile';

type ReportType = 'lost' | 'found';

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

// Header animation constants
const HEADER_EXPANDED_HEIGHT = 120;
const HEADER_COLLAPSED_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT;

export default function ReportScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [reportType, setReportType] = useState<ReportType>('lost');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    categoryId: 0,
    campusId: 0,
    date: new Date().toISOString(),
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCampusPicker, setShowCampusPicker] = useState(false);
  const [showStudentIdPrompt, setShowStudentIdPrompt] = useState(false);

  // Fetch user profile to check if student ID card is uploaded
  const { data: userProfile, refetch: refetchProfile } = useUserProfile();

  // Reanimated shared values - run on UI thread  
  const scrollY = useSharedValue(0);

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

  // Fetch categories và campuses từ API
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: campuses = [], isLoading: isLoadingCampuses } = useCampuses();

  // Mutations để tạo lost item và found item
  const createLostItemMutation = useCreateLostItem();
  const createFoundItemMutation = useCreateFoundItem();

  // Get user's campus from user data
  const userCampusId = user?.campusId || 0;
  const userCampus = campuses.find((c) => c.campusId === userCampusId);

  // When switching to Found Item, auto-set campus to user's campus
  useEffect(() => {
    if (reportType === 'found' && userCampusId > 0) {
      setFormData((prev) => ({ ...prev, campusId: userCampusId }));
    }
  }, [reportType, userCampusId]);

  // Lấy tên category/campus hiện tại
  const selectedCategory = categories.find((c) => c.categoryId === formData.categoryId);
  const selectedCampus = campuses.find((c) => c.campusId === formData.campusId);

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.categoryId === 0) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (formData.campusId === 0) {
      Alert.alert('Error', 'Please select a campus');
      return;
    }

    // Check if student ID card is uploaded
    if (!userProfile?.studentIdCardUrl) {
      setShowStudentIdPrompt(true);
      return;
    }

    if (reportType === 'lost') {
      createLostItemMutation.mutate(
        {
          title: formData.title,
          description: formData.description,
          lostDate: formData.date,
          lostLocation: formData.location,
          campusId: formData.campusId,
          categoryId: formData.categoryId,
          images: images.length > 0 ? images : undefined,
        },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Your lost item report has been submitted successfully!', [
              { text: 'OK' },
            ]);
            // Reset form
            setFormData({
              title: '',
              description: '',
              location: '',
              categoryId: 0,
              campusId: 0,
              date: new Date().toISOString(),
            });
            setImages([]);
          },
          onError: (error) => {
            Alert.alert('Error', `Failed to submit report: ${error.message}`);
          },
        }
      );
    } else {
      createFoundItemMutation.mutate(
        {
          title: formData.title,
          description: formData.description,
          foundDate: formData.date,
          foundLocation: formData.location,
          campusId: formData.campusId,
          categoryId: formData.categoryId,
          images: images.length > 0 ? images : undefined,
        },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Your found item report has been submitted successfully!', [
              { text: 'OK' },
            ]);
            // Reset form
            setFormData({
              title: '',
              description: '',
              location: '',
              categoryId: 0,
              campusId: 0,
              date: new Date().toISOString(),
            });
            setImages([]);
          },
          onError: (error) => {
            Alert.alert('Error', `Failed to submit report: ${error.message}`);
          },
        }
      );
    }
  };

  const isSubmitting = createLostItemMutation.isPending || createFoundItemMutation.isPending;

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
          {/* Collapsible subtitle */}
          <Animated.View style={[styles.collapsibleContent, contentAnimatedStyle]}>
            <Text style={styles.headerSubtitle}>Help reunite lost items with their owners</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, reportType === 'lost' && styles.typeButtonActive]}
          onPress={() => setReportType('lost')}
        >
          <FileQuestion
            size={24}
            color={reportType === 'lost' ? '#fff' : '#0f172a'}
          />
          <Text style={[styles.typeText, reportType === 'lost' && styles.typeTextActive]}>
            Lost Item
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, reportType === 'found' && styles.typeButtonActive]}
          onPress={() => setReportType('found')}
        >
          <FileText
            size={24}
            color={reportType === 'found' ? '#fff' : '#0f172a'}
          />
          <Text style={[styles.typeText, reportType === 'found' && styles.typeTextActive]}>
            Found Item
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <Animated.ScrollView
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={1}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Item Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Black iPhone 13 Pro"
              placeholderTextColor="#94a3b8"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide additional details..."
              placeholderTextColor="#94a3b8"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Library Building A"
              placeholderTextColor="#94a3b8"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerText}>
                {selectedCategory?.categoryName || 'Select category...'}
              </Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {isLoadingCategories ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.categoryId}
                      style={[
                        styles.pickerOption,
                        cat.categoryId === formData.categoryId && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, categoryId: cat.categoryId });
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          cat.categoryId === formData.categoryId && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {cat.categoryName}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Campus <Text style={styles.required}>*</Text>
            </Text>
            {reportType === 'lost' ? (
              // Lost Item: Allow selecting any campus
              <>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowCampusPicker(!showCampusPicker)}
                >
                  <Text style={styles.pickerText}>
                    {selectedCampus?.campusName || 'Select campus...'}
                  </Text>
                </TouchableOpacity>
                {showCampusPicker && (
                  <View style={styles.pickerOptions}>
                    {isLoadingCampuses ? (
                      <ActivityIndicator size="small" color="#0f172a" />
                    ) : (
                      campuses.map((campus) => (
                        <TouchableOpacity
                          key={campus.campusId}
                          style={[
                            styles.pickerOption,
                            campus.campusId === formData.campusId && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setFormData({ ...formData, campusId: campus.campusId });
                            setShowCampusPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              campus.campusId === formData.campusId && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {campus.campusName}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </>
            ) : (
              // Found Item: Only show user's campus (read-only)
              <View style={[styles.picker, styles.pickerDisabled]}>
                <Text style={styles.pickerText}>
                  {userCampus?.campusName || 'Loading...'}
                </Text>
                <Text style={styles.campusHint}>
                  Bạn chỉ có thể báo cáo tìm thấy đồ vật tại campus đã đăng ký
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.date.split('T')[0]}
              onChangeText={(text) => setFormData({ ...formData, date: text + 'T00:00:00.000Z' })}
            />
          </View>

          {/* Selected Images */}
          {images.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Selected Photos ({images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Camera size={20} color="#0f172a" />
            <Text style={styles.uploadText}>
              {images.length > 0 ? 'Add More Photos' : 'Add Photos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Student ID Card Upload Modal */}
      {showStudentIdPrompt && (
        <View style={styles.studentIdPromptOverlay}>
          <StudentIdCardPrompt
            onUploadSuccess={() => {
              setShowStudentIdPrompt(false);
              refetchProfile();
            }}
          />
          <TouchableOpacity
            style={styles.closePromptButton}
            onPress={() => setShowStudentIdPrompt(false)}
          >
            <Text style={styles.closePromptText}>Để sau</Text>
          </TouchableOpacity>
        </View>
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
  collapsibleContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -12,
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  typeButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  typeTextActive: {
    color: '#fff',
  },
  formContainer: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#1e293b',
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#ede9fe',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  pickerOptionTextSelected: {
    color: '#0f172a',
    fontWeight: '600' as const,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0f172a',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 20,
    marginBottom: 24,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  submitButton: {
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerDisabled: {
    backgroundColor: '#f1f5f9',
  },
  campusHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  studentIdPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closePromptButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  closePromptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
