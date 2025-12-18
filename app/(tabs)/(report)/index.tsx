import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, FileQuestion, FileText, X } from 'lucide-react-native';
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useCreateFoundItem } from '@/hooks/mutations/useCreateFoundItem';
import { useCreateLostItem } from '@/hooks/mutations/useCreateLostItem';
import { useCampuses } from '@/hooks/queries/useCampuses';
import { useCategories } from '@/hooks/queries/useCategories';

type ReportType = 'lost' | 'found';

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

export default function ReportScreen() {
  const { user } = useAuth();
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

  // Fetch categories và campuses từ API
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: campuses = [], isLoading: isLoadingCampuses } = useCampuses();

  // Mutations để tạo lost item và found item
  const createLostItemMutation = useCreateLostItem();
  const createFoundItemMutation = useCreateFoundItem();

  // Lấy tên category/campus hiện tại
  const selectedCategory = categories.find((c) => c.categoryId === formData.categoryId);
  const selectedCampus = campuses.find((c) => c.id === formData.campusId);

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <Text style={styles.headerTitle}>Report an Item</Text>
          <Text style={styles.headerSubtitle}>Help reunite lost items with their owners</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, reportType === 'lost' && styles.typeButtonActive]}
          onPress={() => setReportType('lost')}
        >
          <FileQuestion
            size={24}
            color={reportType === 'lost' ? '#fff' : '#667eea'}
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
            color={reportType === 'found' ? '#fff' : '#667eea'}
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
        <ScrollView
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                  <ActivityIndicator size="small" color="#667eea" />
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
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowCampusPicker(!showCampusPicker)}
            >
              <Text style={styles.pickerText}>
                {selectedCampus?.name || 'Select campus...'}
              </Text>
            </TouchableOpacity>
            {showCampusPicker && (
              <View style={styles.pickerOptions}>
                {isLoadingCampuses ? (
                  <ActivityIndicator size="small" color="#667eea" />
                ) : (
                  campuses.map((campus) => (
                    <TouchableOpacity
                      key={campus.id}
                      style={[
                        styles.pickerOption,
                        campus.id === formData.campusId && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, campusId: campus.id });
                        setShowCampusPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          campus.id === formData.campusId && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {campus.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
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
            <Camera size={20} color="#667eea" />
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
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
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
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#667eea',
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
    color: '#667eea',
    fontWeight: '600' as const,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 20,
    marginBottom: 24,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#667eea',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#667eea',
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
});
