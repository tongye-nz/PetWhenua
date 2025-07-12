import { useState } from 'react';
import type { PetFormData, PetFormErrors } from '../models/pet.types';

interface UsePetFormProps {
  initialData?: Partial<PetFormData>;
  onSubmit: (data: PetFormData) => Promise<void>;
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

  // Handle profile picture upload
  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Image size must be less than 5MB'
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPicturePreview(result);
        handleInputChange('profilePicture', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const handleRemovePicture = () => {
    setPicturePreview('');
    handleInputChange('profilePicture', '');
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  return {
    formData,
    errors,
    picturePreview,
    handleInputChange,
    handlePictureUpload,
    handleRemovePicture,
    handleSubmit,
    validateForm
  };
};
