import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Alert, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem
} from '@mui/material';
import { Button, Input, LocationInput } from '../../ui';
import type { CreatePostRequest, UpdatePostRequest, PostType, Post } from '../../../models/post.types';
import type { CreatePetWeddingRequest } from '../../../models/petWedding.types';
import { useAuth } from '../../../contexts/AuthContext';
import { usePost } from '../../../contexts/PostContext';
import { petWeddingService } from '../../../api/petWedding.api';

export interface PostFormData {
  title: string;
  content: string;
  images: string[];
  location?: string;
  address?: string;
  price?: number;
  eventDate?: string;
  category?: string;
  postType: PostType;
  selectedPetIds?: number[];
}

export interface PostFormErrors {
  title?: string;
  content?: string;
  postType?: string;
  price?: string;
  eventDate?: string;
  location?: string;
  address?: string;
  selectedPetIds?: string;
  general?: string;
}

export interface PostFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<PostFormData>;
  onSubmit: (data: CreatePostRequest | UpdatePostRequest, createdPost?: Post) => void;
  onCancel?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuth();
  const { createPost, loading, error } = usePost();
  
  // Role-based post type filtering
  const getAvailablePostTypes = () => {
    const allPostTypes = [
      { value: 5, label: 'Moment', description: 'Share a special moment with your pet', requiredRole: 'member' },
      { value: 2, label: 'Buy/Sell', description: 'Buy or sell pet-related items', requiredRole: 'member' },
      { value: 0, label: 'Meetup', description: 'Organize pet meetups and playdates', requiredRole: 'member' },
      { value: 1, label: 'Pet Wedding', description: 'Announce pet weddings and ceremonies', requiredRole: 'member' },
      { value: 3, label: 'Library', description: 'Share educational content and resources', requiredRole: 'vet' },
      { value: 4, label: 'Announcement', description: 'General announcements and news', requiredRole: 'site_admin' },
    ];

    // Role hierarchy for permission checks
    const roleHierarchy: { [key: string]: number } = {
      'member': 1,
      'vet': 2,
      'meetup_admin': 3,
      'site_admin': 4
    };

    const userLevel = roleHierarchy[user?.role || 'member'] || 1;

    return allPostTypes.filter(postType => {
      const requiredLevel = roleHierarchy[postType.requiredRole] || 1;
      return userLevel >= requiredLevel;
    });
  };

  const postTypeOptions = getAvailablePostTypes();
  
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    images: initialData?.images || [],
    location: initialData?.location || '',
    address: initialData?.address || '',
    price: initialData?.price,
    eventDate: initialData?.eventDate || '',
    category: initialData?.category || '',
    postType: initialData?.postType ?? (postTypeOptions[0]?.value as PostType || 5 as PostType), // Default to first available post type (Moment = 5)
    selectedPetIds: initialData?.selectedPetIds || [],
  });

  const [errors, setErrors] = useState<PostFormErrors>({});

  const handleInputChange = (field: keyof PostFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'price' ? (value ? parseFloat(value) : undefined) : value
    }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof PostFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: keyof PostFormData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear field error
    if (errors[field as keyof PostFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PostFormErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    // PostType specific validations
    if (formData.postType === 2) { // Buy/Sell
      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'Price is required for Buy/Sell posts';
      }
      // Location is required for Buy/Sell
      if (!formData.location?.trim()) {
        newErrors.location = 'Location is required for Buy/Sell posts';
      }
    }

    if (formData.postType === 0 || formData.postType === 1) { // Meetup or Pet Wedding
      if (!formData.eventDate) {
        newErrors.eventDate = 'Event date is required for this post type';
      } else {
        const eventDate = new Date(formData.eventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          newErrors.eventDate = 'Event date cannot be in the past';
        }
      }
      // Location is required for Meetup and Pet Wedding
      if (!formData.location?.trim()) {
        newErrors.location = `Location is required for ${formData.postType === 0 ? 'Meetup' : 'Pet Wedding'} posts`;
      }
      
      // Additional validation for Pet Wedding
      if (formData.postType === 1) { // Pet Wedding
        if (!formData.address?.trim() || formData.address.length < 5) {
          newErrors.address = 'Address is required and must be at least 5 characters long for Pet Wedding posts';
        }
        
        if (!formData.selectedPetIds || formData.selectedPetIds.length !== 2) {
          newErrors.selectedPetIds = 'You must select exactly 2 pets for a Pet Wedding';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    try {
      const submitData = mode === 'create' 
        ? {
            userId: user.userId,
            userRole: user.role,
            postType: formData.postType,
            title: formData.title,
            content: formData.content,
            images: formData.images,
            location: formData.location || undefined,
            address: formData.address || undefined,
            price: formData.price || undefined,
            eventDate: formData.eventDate || undefined,
            category: formData.category || undefined,
            selectedPetIds: formData.selectedPetIds || undefined,
          } as CreatePostRequest
        : {
            title: formData.title,
            content: formData.content,
            images: formData.images,
            location: formData.location || undefined,
            address: formData.address || undefined,
            price: formData.price || undefined,
            eventDate: formData.eventDate || undefined,
            category: formData.category || undefined,
            selectedPetIds: formData.selectedPetIds || undefined,
          } as UpdatePostRequest;

      if (mode === 'create') {
        let createdPost: Post;
        
        // Handle Pet Wedding posts with special service
        if (formData.postType === 1 && formData.selectedPetIds && formData.selectedPetIds.length === 2) {
          // Pet Wedding
          const petWeddingRequest: CreatePetWeddingRequest = {
            title: formData.title,
            content: formData.content,
            petIds: formData.selectedPetIds,
            location: formData.location || '',
            address: formData.address || '',
            eventDate: formData.eventDate || '',
            images: formData.images,
            category: formData.category
          };
          
          const result = await petWeddingService.createPetWedding(petWeddingRequest);
          createdPost = result.wedding;
        } else {
          // Regular post creation
          createdPost = await createPost(submitData as CreatePostRequest);
        }
        
        onSubmit(submitData, createdPost);
      } else {
        // For edit mode, we'd need the post ID - this will be implemented when we have actual editing
        console.log('Edit mode submit:', submitData);
        onSubmit(submitData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const requiresPrice = formData.postType === 2; // Buy/Sell
  const requiresEventDate = formData.postType === 0 || formData.postType === 1; // Meetup or Pet Wedding
  const requiresLocation = formData.postType === 2 || formData.postType === 0 || formData.postType === 1; // Buy/Sell, Meetup, Pet Wedding
  const showCategory = formData.postType === 2; // Buy/Sell only

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        {mode === 'create' ? 'Create New Post' : 'Edit Post'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Post Type Selection */}
        <FormControl fullWidth required>
          <InputLabel>Post Type</InputLabel>
          <Select
            value={formData.postType}
            onChange={handleSelectChange('postType')}
            label="Post Type"
            error={!!errors.postType}
            disabled={loading}
          >
            {postTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.postType && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              {errors.postType}
            </Typography>
          )}
        </FormControl>

        {/* Title */}
        <Input
          label="Title"
          value={formData.title}
          onChange={handleInputChange('title')}
          error={!!errors.title}
          helperText={errors.title}
          required
          disabled={loading}
          placeholder="Enter a catchy title for your post"
        />

        {/* Content */}
        <Input
          label="Content"
          value={formData.content}
          onChange={handleInputChange('content')}
          error={!!errors.content}
          helperText={errors.content}
          required
          multiline
          rows={4}
          disabled={loading}
          placeholder="Tell us more about your post..."
        />

        {/* Conditional Fields */}
        {requiresPrice && (
          <Input
            label="Price"
            type="number"
            value={formData.price?.toString() || ''}
            onChange={handleInputChange('price')}
            error={!!errors.price}
            helperText={errors.price}
            required
            disabled={loading}
            placeholder="Enter price in NZD"
            inputProps={{ min: 0, step: 0.01 }}
          />
        )}

        {requiresEventDate && (
          <Input
            label="Event Date"
            type="datetime-local"
            value={formData.eventDate}
            onChange={handleInputChange('eventDate')}
            error={!!errors.eventDate}
            helperText={errors.eventDate}
            required
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        )}

        {/* Location Field */}
        <LocationInput
          label="Location"
          value={formData.location || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          disabled={loading}
          placeholder={requiresLocation ? "Enter location (required)" : "Add location (optional)"}
          error={!!errors.location}
          helperText={errors.location}
          required={requiresLocation}
        />

        {/* Address Field - only for Pet Wedding */}
        {formData.postType === 1 && ( // Pet Wedding
          <Input
            label="Address"
            value={formData.address || ''}
            onChange={handleInputChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
            disabled={loading}
            placeholder="Enter the venue address for the Pet Wedding"
          />
        )}

        {/* Pet Selection - only for Pet Wedding */}
        {formData.postType === 1 && ( // Pet Wedding
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Pets for Wedding
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose exactly 2 pets to participate in this wedding ceremony
            </Typography>
            {/* TODO: Integrate PetWeddingSelection component with proper data loading */}
            <Alert severity="info">
              Pet selection component will be integrated once pet data loading is implemented
            </Alert>
            {errors.selectedPetIds && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.selectedPetIds}
              </Typography>
            )}
          </Box>
        )}

        {/* Category Field - only for Moment and Buy/Sell */}
        {showCategory && (
          <Input
            label="Category"
            value={formData.category || ''}
            onChange={handleInputChange('category')}
            disabled={loading}
            placeholder="Add category tags (optional)"
          />
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {mode === 'create' ? 'Create Post' : 'Update Post'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="large"
              fullWidth
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default PostForm;
