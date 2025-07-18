/**
 * Profile Image Processing Utilities
 * Handles auto-cropping, resizing, compression, and format standardization
 * for user and pet profile pictures
 */

export interface ProfileImageOptions {
  /** Target width and height for the profile picture */
  size?: number;
  /** Image quality (0-1) */
  quality?: number;
  /** Output format */
  format?: 'webp' | 'jpeg';
  /** Maximum file size in bytes */
  maxFileSize?: number;
}

export interface ProcessedImageResult {
  /** Processed image as a File object */
  file: File;
  /** Base64 data URL for preview */
  dataUrl: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Processed file size in bytes */
  processedSize: number;
  /** Compression ratio (0-1) */
  compressionRatio: number;
}

/**
 * Default options for user profile pictures
 */
export const USER_PROFILE_DEFAULTS: Required<ProfileImageOptions> = {
  size: 300,
  quality: 0.85,
  format: 'webp',
  maxFileSize: 500 * 1024, // 500KB
};

/**
 * Default options for pet profile pictures
 */
export const PET_PROFILE_DEFAULTS: Required<ProfileImageOptions> = {
  size: 250,
  quality: 0.8,
  format: 'webp',
  maxFileSize: 400 * 1024, // 400KB
};

/**
 * Creates a square crop from the center of an image
 */
const cropToSquare = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement): void => {
  const size = Math.min(img.width, img.height);
  const startX = (img.width - size) / 2;
  const startY = (img.height - size) / 2;
  
  canvas.width = size;
  canvas.height = size;
  
  ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
};

/**
 * Resizes canvas to target dimensions
 */
const resizeCanvas = (
  sourceCanvas: HTMLCanvasElement,
  targetSize: number
): HTMLCanvasElement => {
  const targetCanvas = document.createElement('canvas');
  const targetCtx = targetCanvas.getContext('2d')!;
  
  targetCanvas.width = targetSize;
  targetCanvas.height = targetSize;
  
  // Use high-quality image scaling
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  
  targetCtx.drawImage(sourceCanvas, 0, 0, targetSize, targetSize);
  
  return targetCanvas;
};

/**
 * Converts canvas to blob with specified format and quality
 */
const canvasToBlob = (canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      format,
      quality
    );
  });
};

/**
 * Loads an image file and returns an HTMLImageElement
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates if a file is a valid image for profile picture use
 */
export const validateProfileImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP' };
  }

  // Check file size (max 10MB for input)
  const maxInputSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxInputSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' };
  }

  // Check minimum dimensions by creating a temporary image
  return { valid: true };
};

/**
 * Main function to process profile images
 * Handles cropping, resizing, compression, and format conversion
 */
export const processProfileImage = async (
  file: File,
  options: ProfileImageOptions = {}
): Promise<ProcessedImageResult> => {
  // Validate input file
  const validation = validateProfileImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Merge with defaults (use user profile defaults as base)
  const config = { ...USER_PROFILE_DEFAULTS, ...options };
  
  try {
    // Load the image
    const img = await loadImage(file);
    
    // Check minimum dimensions
    const minDimension = Math.min(img.width, img.height);
    if (minDimension < 100) {
      throw new Error('Image must be at least 100x100 pixels');
    }

    // Create canvas for cropping
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d')!;
    
    // Crop to square
    cropToSquare(cropCanvas, cropCtx, img);
    
    // Resize if necessary
    let finalCanvas = cropCanvas;
    if (cropCanvas.width !== config.size) {
      finalCanvas = resizeCanvas(cropCanvas, config.size);
    }

    // Convert to blob with specified format and quality
    const mimeType = `image/${config.format}`;
    let blob = await canvasToBlob(finalCanvas, mimeType, config.quality);
    
    // If still too large, reduce quality iteratively
    let currentQuality = config.quality;
    while (blob.size > config.maxFileSize && currentQuality > 0.1) {
      currentQuality -= 0.1;
      blob = await canvasToBlob(finalCanvas, mimeType, currentQuality);
    }

    // Create file with proper name
    const extension = config.format === 'webp' ? '.webp' : '.jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const processedFile = new File([blob], `${baseName}_profile${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });

    // Create data URL for preview
    const dataUrl = finalCanvas.toDataURL(mimeType, currentQuality);

    // Clean up
    URL.revokeObjectURL(img.src);

    return {
      file: processedFile,
      dataUrl,
      originalSize: file.size,
      processedSize: blob.size,
      compressionRatio: blob.size / file.size,
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convenience function for processing user profile pictures
 */
export const processUserProfileImage = (file: File): Promise<ProcessedImageResult> => {
  return processProfileImage(file, USER_PROFILE_DEFAULTS);
};

/**
 * Convenience function for processing pet profile pictures
 */
export const processPetProfileImage = (file: File): Promise<ProcessedImageResult> => {
  return processProfileImage(file, PET_PROFILE_DEFAULTS);
};

/**
 * Utility to check if a browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = () => resolve(webP.width === 1);
    webP.onerror = () => resolve(false);
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Gets optimal format based on browser support
 */
export const getOptimalFormat = async (): Promise<'webp' | 'jpeg'> => {
  const webpSupported = await supportsWebP();
  return webpSupported ? 'webp' : 'jpeg';
}; 