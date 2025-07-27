/**
 * Hook for testing PostContext functionality
 * This demonstrates the usage patterns and validates the implementation
 */
import { usePost } from '../contexts/PostContext';
import { PostType, PostStatus } from '../models/post.types';
import type { CreatePostRequest, PostFilters } from '../models/post.types';

export const usePostOperations = () => {
  const {
    posts,
    currentPost,
    loading,
    error,
    filters,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    updatePostStatus,
    setFilters,
    clearError
  } = usePost();

  // Example operations that components can use
  const operations = {
    // Load all posts
    loadAllPosts: () => fetchPosts(),
    
    // Load posts with filters
    loadFilteredPosts: (postType?: PostType, userId?: number) => 
      fetchPosts({ postType, userId }),
    
    // Load user's posts
    loadUserPosts: (userId: number) => 
      fetchPosts({ userId }),
    
    // Load posts by type
    loadPostsByType: (postType: PostType) => 
      fetchPosts({ postType }),
    
    // Create a new post
    createNewPost: async (postData: CreatePostRequest) => {
      try {
        const newPost = await createPost(postData);
        return newPost;
      } catch (error) {
        console.error('Failed to create post:', error);
        throw error;
      }
    },
    
    // Update post status (mark as sold, etc.)
    markAsSold: (postId: number, userId: number, userRole: string) =>
      updatePostStatus(postId, PostStatus.Sold, userId, userRole),
    
    // Mark post as inactive
    markAsInactive: (postId: number, userId: number, userRole: string) =>
      updatePostStatus(postId, PostStatus.Inactive, userId, userRole),
    
    // Set filters for posts display
    filterPosts: (filters: PostFilters) => setFilters(filters),
    
    // Clear current error
    handleClearError: () => clearError()
  };

  return {
    // State
    posts,
    currentPost,
    loading,
    error,
    filters,
    
    // Operations
    ...operations,
    
    // Raw context methods (for advanced usage)
    context: {
      fetchPosts,
      fetchPost,
      createPost,
      updatePost,
      deletePost,
      updatePostStatus,
      setFilters,
      clearError
    }
  };
};
