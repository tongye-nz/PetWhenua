import React from 'react';
import {
  Box,
  Typography,
  Alert
} from '@mui/material';
import { PetPictureUpload, PetBasicInfoForm, PetFormActions } from '../../features/pets';
import { usePetForm } from '../../../hooks/usePetForm';
import type { PetFormData } from '../../../models/pet.types';

export interface PetFormProps {
  initialData?: Partial<PetFormData>;
  onSubmit: (data: PetFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  submitLabel?: string;
}

const PetForm: React.FC<PetFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  submitLabel = 'Save Pet'
}) => {
  const {
    formData,
    errors,
    picturePreview,
    handleInputChange,
    handlePictureUpload,
    handleRemovePicture,
    handleSubmit
  } = usePetForm({ initialData, onSubmit });

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        {initialData.name ? 'Edit Pet Profile' : 'Add New Pet'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <PetPictureUpload
        profilePicture={picturePreview}
        onPictureUpload={handlePictureUpload}
        onRemovePicture={handleRemovePicture}
        error={errors.profilePicture}
      />

      <PetBasicInfoForm
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
      />

      <PetFormActions
        onCancel={onCancel}
        isLoading={isLoading}
        submitLabel={submitLabel}
        showCancel={!!onCancel}
      />
    </Box>
  );
};

export default PetForm;
