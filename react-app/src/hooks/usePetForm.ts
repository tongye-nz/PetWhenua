import { useState } from 'react';
import type { PetFormData, PetFormErrors } from '../models/pet.types';

interface UsePetFormProps {
  initialData?: Partial<PetFormData>;
  onSubmit: (data: PetFormData, processedImageFile?: File | null) => Promise<void>;
}

const initialFormData: PetFormData = {
  name: '',
  species: '',
  breed: '',
  birthYear: '',
  birthMonth: '',
  gender: '',
  description: '',
  profilePicture: ''
};

export const usePetForm = ({ initialData = {}, onSubmit }: UsePetFormProps) => {
  const [formData, setFormData] = useState<PetFormData>({
    ...initialFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<PetFormErrors>({});
  const [picturePreview, setPicturePreview] = useState<string>(initialData.profilePicture || '');
  const [processedImageFile, setProcessedImageFile] = useState<File | null>(null);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: PetFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Pet name must be less than 100 characters';
    }

    if (!formData.species) {
      newErrors.species = 'Species is required';
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

    if (!formData.birthYear || formData.birthYear < 1990 || formData.birthYear > currentYear) {
      newErrors.birthYear = 'Please enter a valid birth year';
    }

    if (formData.birthMonth && (formData.birthMonth < 1 || formData.birthMonth > 12)) {
      newErrors.birthMonth = 'Please enter a valid birth month (1-12)';
    }

    // Additional validation: prevent future birth month in current year
    if (formData.birthYear && formData.birthMonth && 
        formData.birthYear === currentYear && 
        formData.birthMonth > currentMonth) {
      newErrors.birthMonth = 'Birth month cannot be in the future';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof PetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle profile picture upload with processed image
  const handlePictureUpload = async (processedImage: import('../utils/profileImageUtils').ProcessedImageResult) => {
    // Clear any previous errors
    setErrors(prev => ({
      ...prev,
      profilePicture: undefined
    }));

    // Use the processed image data URL for immediate preview only
    setPicturePreview(processedImage.dataUrl);
    
    // DO NOT store the Base64 data URL in the form data's profilePicture field
    // This prevents Base64 data from being saved to the database
    // The profilePicture field should only contain actual file URLs
    
    // Store the processed file for upload handling
    setProcessedImageFile(processedImage.file);

    console.log(`Pet picture processed: ${(processedImage.originalSize / 1024).toFixed(1)}KB → ${(processedImage.processedSize / 1024).toFixed(1)}KB`);
  };

  // Handle profile picture processing errors
  const handlePictureError = (error: string) => {
    setErrors(prev => ({
      ...prev,
      profilePicture: error
    }));
  };

  // Handle successful profile picture upload by updating form data with file URL
  const handlePictureUploadSuccess = (fileUrl: string) => {
    handleInputChange('profilePicture', fileUrl);
    // Keep the current preview - it will show the same image
    console.log(`Pet profile picture URL updated: ${fileUrl}`);
  };

  // Remove profile picture
  const handleRemovePicture = () => {
    setPicturePreview('');
    handleInputChange('profilePicture', '');
    setProcessedImageFile(null);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData, processedImageFile);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  return {
    formData,
    errors,
    picturePreview,
    processedImageFile,
    handleInputChange,
    handlePictureUpload,
    handlePictureUploadSuccess,
    handlePictureError,
    handleRemovePicture,
    handleSubmit,
    validateForm
  };
};
