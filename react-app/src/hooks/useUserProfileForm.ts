import { useState, useEffect } from 'react';
import type { UserProfileData, UserProfileFormErrors, UserProfileField } from '../types/userProfile.types';
import { validateUserProfile, hasValidationErrors } from '../utils/userProfileValidation';

interface UseUserProfileFormProps {
  initialData: UserProfileData;
  onSave?: (data: UserProfileData) => Promise<void>;
}

export const useUserProfileForm = ({ initialData, onSave }: UseUserProfileFormProps) => {
  // Form state
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const [originalData, setOriginalData] = useState<UserProfileData>(initialData);
  const [errors, setErrors] = useState<UserProfileFormErrors>({});
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Update form data when initial data changes
  useEffect(() => {
    setFormData(initialData);
    setOriginalData(initialData);
  }, [initialData]);

  // Generic input change handler
  const handleInputChange = (field: UserProfileField, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field as keyof UserProfileFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const validationErrors = validateUserProfile(formData);
    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  };

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
    setErrors({});
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(originalData);
    setErrors({});
    setError('');
    setSuccess('');
  };

  // Save form
  const saveForm = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      setLoading(true);
      setError('');

      await onSave?.(formData);
      
      setOriginalData(formData);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if form has changes
  const hasChanges = (): boolean => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Reset all state
  const resetForm = () => {
    setFormData(initialData);
    setOriginalData(initialData);
    setErrors({});
    setIsEditing(false);
    setLoading(false);
    setSuccess('');
    setError('');
  };

  return {
    // Form data
    formData,
    errors,
    
    // UI state
    isEditing,
    loading,
    success,
    error,
    
    // Actions
    handleInputChange,
    startEditing,
    cancelEditing,
    saveForm,
    validateForm,
    resetForm,
    
    // Computed
    hasChanges: hasChanges(),
    isValid: !hasValidationErrors(errors)
  };
}; 