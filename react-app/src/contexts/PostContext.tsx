import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { postService } from '../api/post.api';
import { useSignalR } from './SignalRContext';
import type { Post, PostFilters, CreatePostRequest, PostStatus } from '../models/post.types';

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  filters: PostFilters;
}

interface PostContextType extends PostState {
  fetchPosts: (filters?: PostFilters) => Promise<void>;
  fetchPost: (id: number) => Promise<void>;
  createPost: (postData: CreatePostRequest) => Promise<Post>;
  updatePost: (id: number, postData: Partial<Post>) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  updatePostStatus: (id: number, status: PostStatus, userId: number, userRole: string) => Promise<void>;
  setFilters: (filters: PostFilters) => void;
  clearError: () => void;
}

export type { PostContextType };

const PostContext = createContext<PostContextType | undefined>(undefined);

type PostAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_POSTS_SUCCESS'; payload: Post[] }
  | { type: 'FETCH_POST_SUCCESS'; payload: Post }
  | { type: 'CREATE_POST_SUCCESS'; payload: Post }
  | { type: 'UPDATE_POST_SUCCESS'; payload: Post }
  | { type: 'DELETE_POST_SUCCESS'; payload: number }
  | { type: 'SET_FILTERS'; payload: PostFilters }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: PostState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  filters: {}
};

const postReducer = (state: PostState, action: PostAction): PostState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_POSTS_SUCCESS':
      return { ...state, loading: false, posts: action.payload };
    case 'FETCH_POST_SUCCESS':
      return { ...state, loading: false, currentPost: action.payload };
    case 'CREATE_POST_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        posts: [action.payload, ...state.posts] 
      };
    case 'UPDATE_POST_SUCCESS':
      return {
        ...state,
        loading: false,
        posts: state.posts.map(post => 
          post.postId === action.payload.postId ? action.payload : post
        ),
        currentPost: state.currentPost?.postId === action.payload.postId 
          ? action.payload 
          : state.currentPost
      };
    case 'DELETE_POST_SUCCESS':
      return {
        ...state,
        loading: false,
        posts: state.posts.filter(post => post.postId !== action.payload)
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(postReducer, initialState);
  const { setPetWeddingDeletionHandler } = useSignalR();

  // Handle pet wedding deletion notifications
  useEffect(() => {
    const handlePetWeddingDeletion = (postId: number) => {
      // Remove the deleted post from the posts list
      dispatch({ type: 'DELETE_POST_SUCCESS', payload: postId });
    };

    setPetWeddingDeletionHandler(handlePetWeddingDeletion);

    // Cleanup
    return () => {
      setPetWeddingDeletionHandler(() => {});
    };
  }, [setPetWeddingDeletionHandler]);

  const fetchPosts = useCallback(async (filters: PostFilters = {}) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const posts = await postService.getPosts(filters);
      dispatch({ type: 'FETCH_POSTS_SUCCESS', payload: posts });
    } catch (error: any) {
      console.error('fetchPosts error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch posts';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  const fetchPost = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const post = await postService.getPost(id);
      dispatch({ type: 'FETCH_POST_SUCCESS', payload: post });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch post' });
    }
  }, []);

  const createPost = useCallback(async (postData: CreatePostRequest): Promise<Post> => {
    try {
      dispatch({ type: 'FETCH_START' });
      const newPost = await postService.createPost(postData);
      dispatch({ type: 'CREATE_POST_SUCCESS', payload: newPost });
      return newPost;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to create post' });
      throw error;
    }
  }, []);

  const updatePost = useCallback(async (id: number, postData: Partial<Post>): Promise<void> => {
    try {
      dispatch({ type: 'FETCH_START' });
      await postService.updatePost(id, postData);
      
      // Refetch the post to get the latest data from server (including any backend status changes)
      const updatedPost = await postService.getPost(id);
      dispatch({ type: 'UPDATE_POST_SUCCESS', payload: updatedPost });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update post' });
      throw error;
    }
  }, []);

  const deletePost = useCallback(async (id: number): Promise<void> => {
    try {
      dispatch({ type: 'FETCH_START' });
      await postService.deletePost(id);
      dispatch({ type: 'DELETE_POST_SUCCESS', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete post' });
      throw error;
    }
  }, []);

  const updatePostStatus = useCallback(async (id: number, status: PostStatus, userId: number, userRole: string): Promise<void> => {
    try {
      dispatch({ type: 'FETCH_START' });
      const updatedPost = await postService.updatePostStatus(id, { status, userId, userRole });
      dispatch({ type: 'UPDATE_POST_SUCCESS', payload: updatedPost });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update post status' });
      throw error;
    }
  }, []);

  const setFilters = useCallback((filters: PostFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: PostContextType = {
    ...state,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    updatePostStatus,
    setFilters,
    clearError
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
