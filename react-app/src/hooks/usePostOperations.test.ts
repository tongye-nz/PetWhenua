import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '../test/utils/test-utils'
import { usePostOperations } from './usePostOperations'
import { PostType, PostStatus } from '../models/post.types'
import type { CreatePostRequest } from '../models/post.types'

// Mock the PostContext
const mockPostContext = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  filters: {},
  fetchPosts: vi.fn(),
  fetchPost: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  updatePostStatus: vi.fn(),
  setFilters: vi.fn(),
  clearError: vi.fn()
}

vi.mock('../contexts/PostContext', () => ({
  usePost: () => mockPostContext
}))

const mockCreatePostRequest: CreatePostRequest = {
  title: 'Test Post',
  content: 'Test content',
  postType: PostType.Meetup,
  images: []
}

describe('usePostOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('state exposure', () => {
    it('should expose all post context state', () => {
      const { result } = renderHook(() => usePostOperations())
      
      expect(result.current.posts).toBe(mockPostContext.posts)
      expect(result.current.currentPost).toBe(mockPostContext.currentPost)
      expect(result.current.loading).toBe(mockPostContext.loading)
      expect(result.current.error).toBe(mockPostContext.error)
      expect(result.current.filters).toBe(mockPostContext.filters)
    })

    it('should expose context methods', () => {
      const { result } = renderHook(() => usePostOperations())
      
      expect(result.current.context.fetchPosts).toBe(mockPostContext.fetchPosts)
      expect(result.current.context.createPost).toBe(mockPostContext.createPost)
      expect(result.current.context.updatePost).toBe(mockPostContext.updatePost)
      expect(result.current.context.deletePost).toBe(mockPostContext.deletePost)
    })
  })

  describe('post loading operations', () => {
    it('should load all posts', () => {
      const { result } = renderHook(() => usePostOperations())
      
      act(() => {
        result.current.loadAllPosts()
      })
      
      expect(mockPostContext.fetchPosts).toHaveBeenCalledWith()
    })

    it('should load filtered posts', () => {
      const { result } = renderHook(() => usePostOperations())
      
      act(() => {
        result.current.loadFilteredPosts(PostType.BuySell, 123)
      })
      
      expect(mockPostContext.fetchPosts).toHaveBeenCalledWith({
        postType: PostType.BuySell,
        userId: 123
      })
    })

    it('should load user posts', () => {
      const { result } = renderHook(() => usePostOperations())
      
      act(() => {
        result.current.loadUserPosts(456)
      })
      
      expect(mockPostContext.fetchPosts).toHaveBeenCalledWith({
        userId: 456
      })
    })

         it('should load posts by type', () => {
       const { result } = renderHook(() => usePostOperations())
       
       act(() => {
         result.current.loadPostsByType(PostType.Announcement)
       })
       
       expect(mockPostContext.fetchPosts).toHaveBeenCalledWith({
         postType: PostType.Announcement
       })
     })
  })

  describe('post creation', () => {
    it('should create new post successfully', async () => {
      const mockNewPost = { id: 1, ...mockCreatePostRequest }
      mockPostContext.createPost.mockResolvedValue(mockNewPost)
      
      const { result } = renderHook(() => usePostOperations())
      
      let createdPost: unknown
      await act(async () => {
        createdPost = await result.current.createNewPost(mockCreatePostRequest)
      })
      
      expect(mockPostContext.createPost).toHaveBeenCalledWith(mockCreatePostRequest)
      expect(createdPost).toBe(mockNewPost)
    })

    it('should handle post creation failure', async () => {
      const error = new Error('Creation failed')
      mockPostContext.createPost.mockRejectedValue(error)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() => usePostOperations())
      
      await expect(async () => {
        await act(async () => {
          await result.current.createNewPost(mockCreatePostRequest)
        })
      }).rejects.toThrow('Creation failed')
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create post:', error)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('post status operations', () => {
    it('should mark post as sold', () => {
      const { result } = renderHook(() => usePostOperations())
      
      act(() => {
        result.current.markAsSold(123, 456, 'user')
      })
      
      expect(mockPostContext.updatePostStatus).toHaveBeenCalledWith(
        123,
        PostStatus.Sold,
        456,
        'user'
      )
    })

    it('should mark post as inactive', () => {
      const { result } = renderHook(() => usePostOperations())
      
      act(() => {
        result.current.markAsInactive(789, 101, 'admin')
      })
      
      expect(mockPostContext.updatePostStatus).toHaveBeenCalledWith(
        789,
        PostStatus.Inactive,
        101,
        'admin'
      )
    })
  })

  describe('filter operations', () => {
    it('should set post filters', () => {
      const { result } = renderHook(() => usePostOperations())
      const filters = { postType: PostType.BuySell, userId: 123 }
      
      act(() => {
        result.current.filterPosts(filters)
      })
      
      expect(mockPostContext.setFilters).toHaveBeenCalledWith(filters)
    })
  })

  describe('error handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => usePostOperations())
      
      act(() => {
        result.current.handleClearError()
      })
      
      expect(mockPostContext.clearError).toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete post workflow', async () => {
      const { result } = renderHook(() => usePostOperations())
      
      // Load posts
      act(() => {
        result.current.loadAllPosts()
      })
      
      // Create post
      const mockNewPost = { id: 1, ...mockCreatePostRequest }
      mockPostContext.createPost.mockResolvedValue(mockNewPost)
      
      await act(async () => {
        await result.current.createNewPost(mockCreatePostRequest)
      })
      
      // Mark as sold
      act(() => {
        result.current.markAsSold(1, 456, 'user')
      })
      
      // Clear any errors
      act(() => {
        result.current.handleClearError()
      })
      
      expect(mockPostContext.fetchPosts).toHaveBeenCalled()
      expect(mockPostContext.createPost).toHaveBeenCalledWith(mockCreatePostRequest)
      expect(mockPostContext.updatePostStatus).toHaveBeenCalledWith(1, PostStatus.Sold, 456, 'user')
      expect(mockPostContext.clearError).toHaveBeenCalled()
    })
  })
}) 