import { LinearGradient } from 'expo-linear-gradient';
import { FileQuestion, FileText, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReportType = 'lost' | 'found';

const CATEGORIES = ['Electronics', 'Bags', 'Documents', 'Clothing', 'Keys', 'Others'];

export default function ReportScreen() {
  const [reportType, setReportType] = useState<ReportType>('lost');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!formData.title || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Success',
        `Your ${reportType} item report has been submitted successfully!`,
        [{ text: 'OK' }]
      );
      setFormData({
        title: '',
        description: '',
        location: '',
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
      });
    }, 1500);
  };

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
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerText}>{formData.category}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerOption,
                      cat === formData.category && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, category: cat });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        cat === formData.category && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />
          </View>

          <TouchableOpacity style={styles.uploadButton}>
            <Plus size={20} color="#667eea" />
            <Text style={styles.uploadText}>Add Photos</Text>
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
});
