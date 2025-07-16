import imageCompression from 'browser-image-compression';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageCompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality?: number;
}

/**
 * Validates if a file is a valid image
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size (5MB limit)
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 5MB` 
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} is not supported. Allowed types: JPG, PNG, WebP` 
    };
  }

  return { valid: true };
};

/**
 * Compresses an image file while maintaining aspect ratio
 */
export const compressImage = async (
  file: File,
  options: Partial<ImageCompressionOptions> = {}
): Promise<File> => {
  const defaultOptions: ImageCompressionOptions = {
    maxSizeMB: 2, // Target 2MB after compression
    maxWidthOrHeight: 1000, // Max dimension
    useWebWorker: true,
    quality: 0.75, // 75% quality
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    
    // Preserve the original filename by creating a new File object with the correct name
    const renamedFile = new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: compressedFile.lastModified,
    });
    
    // Log compression results
    console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(renamedFile.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Filename preserved: ${file.name} → ${renamedFile.name}`);
    
    return renamedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Generates a thumbnail preview URL for an image file
 */
export const generateThumbnail = (file: File, size: number = 150): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const { width, height } = calculateThumbnailDimensions(img.width, img.height, size);
      
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(thumbnailUrl);
    };

    img.onerror = () => reject(new Error('Failed to generate thumbnail'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate thumbnail dimensions while maintaining aspect ratio
 */
const calculateThumbnailDimensions = (
  originalWidth: number, 
  originalHeight: number, 
  maxSize: number
): { width: number; height: number } => {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = Math.min(maxSize / originalWidth, maxSize / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
};

/**
 * Converts file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if browser supports the File API
 */
export const isFileAPISupported = (): boolean => {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
};
