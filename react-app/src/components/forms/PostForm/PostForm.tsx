import React, { useState, useEffect } from 'react';
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
import type { SelectChangeEvent } from '@mui/material';
import { Button, Input, LocationInput, DateTimeInput } from '../../ui';
import PetWeddingSelection from '../PetWeddingSelection/PetWeddingSelection';
import ImageUpload from '../../ImageUpload';
import type { UploadedImage } from '../../ImageUpload';
import { imageApi } from '../../../api/imageApi';
import type { CreatePostRequest, UpdatePostRequest, Post, PostStatus, PostTypeString, PostStatusString } from '../../../models/post.types';
import { PostType, PostTypeUtils } from '../../../models/post.types';
import { BUY_SELL_CATEGORIES } from '../../../data';
import { shouldUsePredefinedCategories } from '../../../utils';
import type { CreatePetWeddingRequest, SelectablePet } from '../../../models/petWedding.types';
import { useAuth } from '../../../contexts/AuthContext';
import { usePost } from '../../../contexts/PostContext';
import { formatDateTimeForInput, getCurrentNzTimeForInput, isInputDateTimeInFuture } from '../../../utils/dateUtils';
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
  postType: PostType | PostTypeString;
  selectedPetIds?: number[];
  status?: PostStatus | PostStatusString;
  createdAt?: string;
}

export interface PostFormErrors {
  title?: string;
  content?: string;
  images?: string;
  postType?: string;
  price?: string;
  eventDate?: string;
  location?: string;
  address?: string;
  category?: string;
  selectedPetIds?: string;
  general?: string;
}

export interface PostFormProps {
  mode: 'create' | 'edit';
  postId?: number; // Required for edit mode
  initialData?: Partial<PostFormData>;
  initialImages?: UploadedImage[];
  onSubmit: (data: CreatePostRequest | UpdatePostRequest, createdPost?: Post) => void;
  onCancel?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({
  mode,
  postId,
  initialData,
  initialImages = [],
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
    eventDate: formatDateTimeForInput(initialData?.eventDate),
    category: initialData?.category || '',
    postType: initialData?.postType 
      ? PostTypeUtils.toNumeric(initialData.postType) 
      : (postTypeOptions[0]?.value as PostType || PostType.Moment), // Convert string enum to numeric or use default
    selectedPetIds: initialData?.selectedPetIds || [],
    status: initialData?.status,
    createdAt: initialData?.createdAt,
  });

  const [errors, setErrors] = useState<PostFormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(initialImages);
  
  // Pet Wedding specific state
  const [selectablePets, setSelectablePets] = useState<SelectablePet[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState<string>('');

  // Load selectable pets when Pet Wedding is selected
  useEffect(() => {
    if (PostTypeUtils.isPetWedding(formData.postType)) {
      loadSelectablePets();
    }
  }, [formData.postType]);

  const loadSelectablePets = async () => {
    try {
      setPetsLoading(true);
      setPetsError('');
      const pets = await petWeddingService.getSelectablePetsForWedding();
      setSelectablePets(pets);
    } catch (error) {
      console.error('Failed to load selectable pets:', error);
      setPetsError('Failed to load available pets. Please try again.');
    } finally {
      setPetsLoading(false);
    }
  };

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
    event: SelectChangeEvent<string | number>
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
    if (PostTypeUtils.isBuySell(formData.postType)) {
      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'Price is required for Buy/Sell posts';
      }
      // Location is required for Buy/Sell
      if (!formData.location?.trim()) {
        newErrors.location = 'Location is required for Buy/Sell posts';
      }
      // Category is required for Buy/Sell posts
      if (!formData.category?.trim()) {
        newErrors.category = 'Category is required for Buy/Sell posts';
      }
    }

    if (PostTypeUtils.isMeetup(formData.postType) || PostTypeUtils.isPetWedding(formData.postType)) { // Meetup or Pet Wedding
      if (!formData.eventDate) {
        newErrors.eventDate = 'Event date and time are required for this post type';
      } else {
        // Check if the selected datetime is in the future (New Zealand time)
        if (!isInputDateTimeInFuture(formData.eventDate)) {
          newErrors.eventDate = 'Event date and time must be in the future (New Zealand time)';
        }
        
        // Check if the selected datetime is too far in the future (optional - 2 years max)
        const inputDate = new Date(formData.eventDate);
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        if (inputDate > twoYearsFromNow) {
          newErrors.eventDate = 'Event date cannot be more than 2 years in the future';
        }
        
        // Validate datetime format
        if (isNaN(inputDate.getTime())) {
          newErrors.eventDate = 'Please enter a valid date and time';
        }
      }
      // Location is required for Meetup and Pet Wedding
      if (!formData.location?.trim()) {
        const postTypeName = PostTypeUtils.isMeetup(formData.postType) ? 'Meetup' : 'Pet Wedding';
        newErrors.location = `Location is required for ${postTypeName} posts`;
      }
      
      // Additional validation for Meetup and Pet Wedding
      if (PostTypeUtils.isMeetup(formData.postType) || PostTypeUtils.isPetWedding(formData.postType)) {
        if (!formData.address?.trim() || formData.address.length < 5) {
          const postTypeName = PostTypeUtils.isMeetup(formData.postType) ? 'Meetup' : 'Pet Wedding';
          newErrors.address = `Address is required and must be at least 5 characters long for ${postTypeName} posts`;
        }
      }
      
      // Additional validation specifically for Pet Wedding
      if (PostTypeUtils.isPetWedding(formData.postType)) {
        if (!formData.selectedPetIds || formData.selectedPetIds.length !== 2) {
          newErrors.selectedPetIds = 'You must select exactly 2 pets for a Pet Wedding';
        }
      }
    }

    // Image validation
    if (uploadedImages.length > 9) {
      newErrors.images = 'Maximum 9 images allowed per post';
    }

    // Check for any images with errors
    const imagesWithErrors = uploadedImages.filter(img => img.error);
    if (imagesWithErrors.length > 0) {
      newErrors.images = `${imagesWithErrors.length} image(s) have errors. Please fix or remove them.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Clear any previous errors and success messages
    setErrors({});
    setSuccessMessage('');
    setIsNavigating(false);
    
    if (!validateForm() || !user) {
      return;
    }

    try {
      // Step 1: Upload images if any
      let uploadedImageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        console.log('Uploading images:', uploadedImages.length);
        // Separate existing images from new uploads
        const existingImages = uploadedImages.filter(img => img.isExisting && img.originalUrl);
        const newFileUploads = uploadedImages.filter(img => img.compressed || img.file);
        
        const imagesToUpload = newFileUploads.map((img, index) => {
          const file = img.compressed || img.file!;
          
          // Ensure file has a valid name
          if (!file.name || file.name === 'blob' || !file.name.includes('.')) {
            const originalName = img.file?.name || 'image';
            const extension = originalName.split('.').pop() || 'jpg';
            const newName = `image_${Date.now()}_${index}.${extension}`;
            
            console.warn(`File had invalid name "${file.name}", renaming to "${newName}"`);
            
            return new File([file], newName, {
              type: file.type || 'image/jpeg',
              lastModified: file.lastModified || Date.now(),
            });
          }
          
          return file;
        });
        
        // Combine existing image URLs with newly uploaded URLs
        const existingImageUrls = existingImages.map(img => img.originalUrl!);
        
        if (imagesToUpload.length > 0) {
          console.log('Images to upload:', imagesToUpload.length);
          console.log('File details:', imagesToUpload.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
          })));
          
          const uploadResult = await imageApi.uploadImages(imagesToUpload, user.userId);
          console.log('Upload result:', uploadResult);
          
          if (uploadResult.success) {
            uploadedImageUrls = [...existingImageUrls, ...uploadResult.imageUrls];
            console.log('All image URLs (existing + new):', uploadedImageUrls);
          } else {
            console.error('Image upload failed:', uploadResult.errorMessage);
            throw new Error(uploadResult.errorMessage || 'Failed to upload images');
          }
        } else {
          // Only existing images, no new uploads
          uploadedImageUrls = existingImageUrls;
          console.log('Using existing images only:', uploadedImageUrls);
        }
      }

      // Prepare data for submission
      const submitData: CreatePostRequest | UpdatePostRequest = mode === 'create' 
        ? {
            userId: user?.userId,
            userRole: user?.role,
            postType: formData.postType,
            title: formData.title,
            content: formData.content,
            images: uploadedImageUrls,
            location: formData.location || undefined,
            address: formData.address || undefined,
            price: formData.price || undefined,
            eventDate: formData.eventDate || undefined,
            category: formData.category || undefined,
            selectedPetIds: formData.selectedPetIds || undefined,
          } as CreatePostRequest
        : {
            postId: postId,
            userId: user?.userId || 0,
            postType: formData.postType,
            title: formData.title || '',
            content: formData.content || '',
            status: formData.status !== undefined ? formData.status : 0, // Default to Active if not set
            images: uploadedImageUrls,
            location: formData.location || undefined,
            address: formData.address || undefined,
            price: formData.price || undefined,
            eventDate: formData.eventDate || undefined,
            category: formData.category || undefined,
            selectedPetIds: formData.selectedPetIds || undefined,
            createdAt: formData.createdAt,
            updatedAt: new Date().toISOString()
          } as UpdatePostRequest;

      console.log('Submit data:', submitData);

      if (mode === 'create') {
        let createdPost: Post;
        
        // Handle Pet Wedding posts with special service
        if (PostTypeUtils.isPetWedding(formData.postType) && formData.selectedPetIds && formData.selectedPetIds.length === 2) {
          // Pet Wedding
          const petWeddingRequest: CreatePetWeddingRequest = {
            title: formData.title,
            content: formData.content,
            petIds: formData.selectedPetIds,
            location: formData.location || '',
            address: formData.address || '',
            eventDate: formData.eventDate || '',
            images: uploadedImageUrls,
            category: formData.category
          };
          
          const result = await petWeddingService.createPetWedding(petWeddingRequest);
          createdPost = result.wedding;
        } else {
          // Regular post creation
          createdPost = await createPost(submitData as CreatePostRequest);
        }
        
        // Show success message for creation
        setSuccessMessage('Post created successfully!');
        setErrors({}); // Clear any previous errors
        setIsNavigating(true); // Disable form during navigation
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);

        // Delay navigation to allow user to see success message
        setTimeout(() => {
          onSubmit(submitData, createdPost);
        }, 2000); // 2 second delay before navigation
      } else {
        // Edit mode - update existing post
        if (!postId) {
          throw new Error('Post ID is required for edit mode');
        }

        if (!user?.userId) {
          throw new Error('User ID is required for post update');
        }

        // Validate required fields before API call
        if (!user?.userId) {
          throw new Error('User ID is required for post update');
        }
        
        const updateData = submitData as UpdatePostRequest;
        if (!updateData.title || !updateData.content) {
          throw new Error('Title and content are required');
        }
        
        if (updateData.status === undefined || updateData.status === null) {
          throw new Error('Post status is required');
        }

        // Import and use the post service to update the post
        const { postService } = await import('../../../api/post.api');
        await postService.updatePost(postId, submitData);
        
        // Show success message
        setSuccessMessage('Post updated successfully!');
        setErrors({}); // Clear any previous errors
        setIsNavigating(true); // Disable form during navigation
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        
        // Delay navigation to allow user to see success message
        setTimeout(() => {
          onSubmit(submitData);
        }, 2000); // 2 second delay before navigation
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Log more detailed error information for debugging
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]> }; headers?: unknown } };
      if (error && typeof error === 'object' && axiosError.response) {
        console.error('Response status:', axiosError.response.status);
        console.error('Response data:', axiosError.response.data);
        console.error('Response headers:', axiosError.response.headers);
        
        // Extract specific validation errors for user display
        const responseData = axiosError.response.data;
        if (responseData && responseData.errors) {
          console.error('Validation errors:', responseData.errors);
          // Display specific validation errors to user
          const validationMessages: string[] = [];
          for (const [field, messages] of Object.entries(responseData.errors)) {
            if (Array.isArray(messages)) {
              validationMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              validationMessages.push(`${field}: ${messages}`);
            }
          }
          if (validationMessages.length > 0) {
            setErrors({ general: `Validation errors: ${validationMessages.join('; ')}` });
            return;
          }
        }
      }
      
      // Set a more specific error message
      let errorMessage = mode === 'create' ? 'Failed to create post' : 'Failed to update post';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to get the most specific error message from the response
        const errorObj = error as { response?: { data?: string | { message?: string; error?: string } }; message?: string };
        const responseError = errorObj.response?.data;
        if (typeof responseError === 'string') {
          errorMessage = responseError;
        } else if (typeof responseError === 'object' && responseError?.message) {
          errorMessage = responseError.message;
        } else if (typeof responseError === 'object' && responseError?.error) {
          errorMessage = responseError.error;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        } else {
          errorMessage = 'Unknown error occurred';
        }
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    }
  };

  const requiresPrice = PostTypeUtils.isBuySell(formData.postType);
  const requiresEventDate = PostTypeUtils.isMeetup(formData.postType) || PostTypeUtils.isPetWedding(formData.postType);
  const requiresLocation = PostTypeUtils.isBuySell(formData.postType) || PostTypeUtils.isMeetup(formData.postType) || PostTypeUtils.isPetWedding(formData.postType);
  const showCategory = PostTypeUtils.isBuySell(formData.postType);

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

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
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
            disabled={loading || mode === 'edit'}
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
          {mode === 'edit' && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Post type cannot be changed when editing
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

        {/* Image Upload - new feature */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Upload Images
          </Typography>
          <ImageUpload
            maxImages={9}
            onImagesChange={(images: UploadedImage[]) => {
              setUploadedImages(images);
              setFormData(prev => ({
                ...prev,
                images: images.map(img => img.preview)
              }));
              // Clear image errors when images are uploaded
              if (images.length > 0 && errors.images) {
                setErrors(prev => ({ ...prev, images: undefined }));
              }
            }}
            initialImages={uploadedImages}
            disabled={loading}
            showCompression={true}
          />
          {errors.images && (
            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
              {errors.images}
            </Typography>
          )}
        </Box>

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
          <DateTimeInput
            label="Event Date & Time"
            value={formData.eventDate}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, eventDate: value }));
              
              // Real-time validation for event date
              if (value) {
                if (!isInputDateTimeInFuture(value)) {
                  setErrors(prev => ({
                    ...prev,
                    eventDate: 'Event date and time must be in the future (New Zealand time)'
                  }));
                } else {
                  // Clear error if date is valid
                  setErrors(prev => ({
                    ...prev,
                    eventDate: undefined
                  }));
                }
              } else {
                // Clear error when field is empty (will be caught by required validation)
                setErrors(prev => ({
                  ...prev,
                  eventDate: undefined
                }));
              }
            }}
            error={!!errors.eventDate}
            helperText={errors.eventDate || 'Select a future date and time for your event (New Zealand time)'}
            required
            disabled={loading}
            min={getCurrentNzTimeForInput()} // Current New Zealand time
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

        {/* Address Field - for Meetup and Pet Wedding */}
        {(PostTypeUtils.isMeetup(formData.postType) || PostTypeUtils.isPetWedding(formData.postType)) && (
          <Input
            label="Address"
            value={formData.address || ''}
            onChange={handleInputChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
            disabled={loading}
            placeholder={
              PostTypeUtils.isMeetup(formData.postType)
                ? "Enter the venue address for the Meetup" 
                : "Enter the venue address for the Pet Wedding"
            }
          />
        )}

        {/* Pet Selection - only for Pet Wedding */}
        {PostTypeUtils.isPetWedding(formData.postType) && (
          <PetWeddingSelection
            selectedPetIds={formData.selectedPetIds || []}
            onSelectedPetsChange={(petIds) => {
              setFormData(prev => ({ ...prev, selectedPetIds: petIds }));
              // Clear any existing error when pets are selected
              if (petIds.length === 2 && errors.selectedPetIds) {
                setErrors(prev => ({ ...prev, selectedPetIds: undefined }));
              }
            }}
            selectablePets={selectablePets}
            loading={petsLoading}
            error={petsError}
          />
        )}

        {/* Category Field - only for Buy/Sell with predefined options */}
        {showCategory && (
          shouldUsePredefinedCategories(formData.postType) ? (
            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category || ''}
                onChange={handleSelectChange('category')}
                label="Category *"
                disabled={loading}
                error={!!errors.category}
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {BUY_SELL_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>
          ) : (
            <Input
              label="Category"
              value={formData.category || ''}
              onChange={handleInputChange('category')}
              disabled={loading}
              placeholder="Add category tags (optional)"
            />
          )
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading || isNavigating}
            disabled={loading || isNavigating}
          >
            {isNavigating 
              ? (mode === 'create' ? 'Post Created! Redirecting...' : 'Post Updated! Redirecting...') 
              : (mode === 'create' ? 'Create Post' : 'Update Post')
            }
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="large"
              fullWidth
              onClick={onCancel}
              disabled={loading || isNavigating}
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
