# Image Upload Implementation Plan for PetWhenua

## Overview
Implement a complete image upload system for posts with compression, file naming, and storage management.

## Requirements
- ✅ Limit of 9 images per post
- ✅ Image compression to optimize storage and loading
- ✅ Unique file naming to prevent conflicts between users
- ✅ Proper database storage with consistent file references
- ✅ User-friendly upload interface with preview

## 1. Backend Implementation

### 1.1 Image Storage Strategy

**File Storage Structure:**
```
wwwroot/
└── uploads/
    └── posts/
        └── {year}/
            └── {month}/
                └── {userId}_{postId}_{timestamp}_{hash}.{ext}
```

**File Naming Convention:**
- Format: `{userId}_{postId}_{timestamp}_{hash}.{ext}`
- Example: `123_456_20250716143022_a1b2c3d4.jpg`
- Prevents conflicts and ensures uniqueness

### 1.2 Backend Services to Create

#### A. Image Service Interface (`IImageService.cs`)
```csharp
public interface IImageService
{
    Task<List<string>> UploadImagesAsync(List<IFormFile> files, int userId, int? postId = null);
    Task<string> UploadImageAsync(IFormFile file, int userId, int? postId = null);
    Task<bool> DeleteImageAsync(string imageUrl);
    Task<bool> DeleteImagesAsync(List<string> imageUrls);
    Task<byte[]> CompressImageAsync(byte[] imageBytes, int maxWidth = 1200, int maxHeight = 800, int quality = 85);
    string GenerateUniqueFileName(string originalFileName, int userId, int? postId = null);
    bool IsValidImageFile(IFormFile file);
}
```

#### B. Image Service Implementation (`ImageService.cs`)
- Image compression using `System.Drawing` or `ImageSharp`
- File validation (format, size, dimensions)
- Unique file name generation
- File system operations

#### C. Enhanced Post Service
- Update post creation to handle image uploads
- Validate image count (max 9)
- Handle image deletion when posts are deleted

### 1.3 Database Schema Updates

#### Update Post Model
```csharp
public class Post
{
    // ...existing properties...
    
    [JsonPropertyName("images")]
    public List<string> Images { get; set; } = new();
    
    // Add validation attribute
    [MaxLength(9, ErrorMessage = "Maximum 9 images allowed per post")]
    public List<string> ValidatedImages => Images?.Take(9).ToList() ?? new();
}
```

#### Add Image Metadata Table (Optional but Recommended)
```csharp
public class PostImage
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string FileName { get; set; }
    public string OriginalFileName { get; set; }
    public long FileSize { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTime UploadedAt { get; set; }
    public int UploadedBy { get; set; }
    
    // Navigation properties
    public Post Post { get; set; }
    public User UploadedByUser { get; set; }
}
```

### 1.4 API Controllers

#### A. New ImageController (`ImageController.cs`)
```csharp
[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files, [FromForm] int userId, [FromForm] int? postId = null);
    
    [HttpDelete("{imageUrl}")]
    public async Task<IActionResult> DeleteImage(string imageUrl);
    
    [HttpGet("validate")]
    public IActionResult ValidateImages([FromQuery] int count);
}
```

#### B. Update PostsController
```csharp
[HttpPost("with-images")]
public async Task<IActionResult> CreatePostWithImages([FromForm] CreatePostWithImagesRequest request);
```

### 1.5 Configuration Updates

#### appsettings.json
```json
{
  "ImageUpload": {
    "MaxFileSize": 5242880,
    "MaxImagesPerPost": 9,
    "AllowedExtensions": [".jpg", ".jpeg", ".png", ".webp"],
    "CompressionQuality": 85,
    "MaxWidth": 1200,
    "MaxHeight": 800,
    "UploadPath": "wwwroot/uploads/posts"
  }
}
```

## 2. Frontend Implementation

### 2.1 New Components to Create

#### A. ImageUpload Component (`ImageUpload.tsx`)
```typescript
interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  error?: string;
}
```

Features:
- Drag & drop functionality
- Multiple file selection
- Image preview with thumbnails
- Progress indicators during upload
- Remove individual images
- Reorder images
- File validation feedback

#### B. ImagePreview Component (`ImagePreview.tsx`)
```typescript
interface ImagePreviewProps {
  images: string[];
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  readonly?: boolean;
}
```

#### C. ImageCompression Utility (`imageUtils.ts`)
```typescript
export const compressImage = async (file: File, maxWidth = 1200, maxHeight = 800, quality = 0.8): Promise<File>;
export const validateImageFile = (file: File): { valid: boolean; error?: string };
export const generateThumbnail = (file: File, size = 150): Promise<string>;
```

### 2.2 Update Existing Components

#### A. PostForm Component Updates
```typescript
// Add image upload section
const [images, setImages] = useState<string[]>([]);
const [uploadingImages, setUploadingImages] = useState(false);

// Add validation
const validateImages = () => {
  if (images.length > 9) {
    setErrors(prev => ({ ...prev, images: 'Maximum 9 images allowed' }));
    return false;
  }
  return true;
};
```

#### B. PostCard Component Updates
- Display image gallery with thumbnail grid
- Lightbox/modal for full-size image viewing
- Image carousel for multiple images

### 2.3 API Integration

#### A. Image API Service (`imageApi.ts`)
```typescript
export const imageApi = {
  uploadImages: async (files: File[], userId: number, postId?: number): Promise<string[]>,
  deleteImage: async (imageUrl: string): Promise<boolean>,
  validateImageCount: async (count: number): Promise<boolean>
};
```

#### B. Update Post API Service
```typescript
export const createPostWithImages = async (postData: CreatePostRequest, images: File[]): Promise<Post>;
```

## 3. Image Processing Pipeline

### 3.1 Client-Side Processing
1. **File Selection** → Validate file type and size
2. **Compression** → Reduce file size while maintaining quality
3. **Thumbnail Generation** → Create preview thumbnails
4. **Upload** → Send compressed images to server

### 3.2 Server-Side Processing
1. **Validation** → Verify file integrity and security
2. **Additional Compression** → Server-side optimization if needed
3. **File Naming** → Generate unique file names
4. **Storage** → Save to file system
5. **Database Update** → Store file references

## 4. Security Considerations

### 4.1 File Validation
- File type verification (not just extension)
- File size limits (5MB per image)
- Image dimension limits
- Malware scanning (future enhancement)

### 4.2 Access Control
- Only authenticated users can upload
- Users can only delete their own images
- Rate limiting on upload endpoints

### 4.3 File Storage Security
- Store files outside web root when possible
- Implement proper file serving with security headers
- Regular cleanup of orphaned files

## 5. Implementation Phases

### Phase 1: Backend Foundation (Days 1-3)
1. Create ImageService interface and implementation
2. Add image upload endpoints
3. Update Post model and database
4. Implement file compression and naming

### Phase 2: Frontend Components (Days 4-6)
1. Create ImageUpload component
2. Add client-side compression
3. Implement image preview and management
4. Update PostForm integration

### Phase 3: Integration & Testing (Days 7-8)
1. End-to-end testing
2. Performance optimization
3. Error handling improvements
4. User experience refinements

### Phase 4: Enhancement (Days 9-10)
1. Image editing features (crop, rotate)
2. Advanced compression options
3. Bulk operations
4. Analytics and monitoring

## 6. Database Migration

### Migration Script
```sql
-- Add image metadata table
CREATE TABLE PostImages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    Width INT NOT NULL,
    Height INT NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UploadedBy INT NOT NULL,
    FOREIGN KEY (PostId) REFERENCES Posts(PostId) ON DELETE CASCADE,
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserId)
);

-- Add indexes for performance
CREATE INDEX IX_PostImages_PostId ON PostImages(PostId);
CREATE INDEX IX_PostImages_UploadedBy ON PostImages(UploadedBy);
```

## 7. Configuration and Dependencies

### 7.1 Backend Dependencies
```xml
<!-- Add to PetWhenua.csproj -->
<PackageReference Include="SixLabors.ImageSharp" Version="3.0.2" />
<PackageReference Include="SixLabors.ImageSharp.Web" Version="3.0.2" />
```

### 7.2 Frontend Dependencies
```json
{
  "react-dropzone": "^14.2.3",
  "react-image-gallery": "^1.2.12",
  "browser-image-compression": "^2.0.2",
  "react-sortable-hoc": "^2.0.0"
}
```

## 8. Performance Considerations

### 8.1 Optimization Strategies
- Lazy loading for image galleries
- Progressive image loading
- CDN integration (future)
- Image caching strategies
- Thumbnail generation and caching

### 8.2 Monitoring
- Upload success/failure rates
- Average file sizes before/after compression
- Storage usage tracking
- Performance metrics

## 9. Testing Strategy

### 9.1 Unit Tests
- Image compression functionality
- File naming algorithms
- Validation logic
- API endpoints

### 9.2 Integration Tests
- End-to-end upload workflow
- Database consistency
- File system operations
- Error scenarios

### 9.3 User Testing
- Upload UX with different file types
- Mobile responsiveness
- Performance with large files
- Error message clarity

## 10. Future Enhancements

### 10.1 Advanced Features
- Image editing (crop, rotate, filters)
- AI-powered image tagging
- Automatic alt text generation
- Image optimization based on device
- Bulk upload operations

### 10.2 Infrastructure
- CDN integration (CloudFlare, AWS CloudFront)
- Cloud storage (AWS S3, Azure Blob)
- Image processing workers
- Analytics dashboard

## Success Metrics

1. **User Adoption**: % of posts with images increases
2. **Performance**: Upload success rate > 99%
3. **Storage Efficiency**: Average file size reduction > 60%
4. **User Experience**: Upload completion time < 10 seconds for 9 images
5. **System Stability**: No storage-related errors

## Conclusion

This implementation plan provides a complete, scalable image upload system that addresses all requirements while maintaining security, performance, and user experience standards. The phased approach allows for incremental development and testing.
