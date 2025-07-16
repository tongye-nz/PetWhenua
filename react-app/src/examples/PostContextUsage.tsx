/**
 * Example component demonstrating PostContext usage
 * This shows the integration patterns for Phase 4 components
 */
import React, { useEffect } from 'react';
import { usePost } from '../contexts/PostContext';
import { PostType } from '../models/post.types';

// Example: Posts List Component
export const ExamplePostsList: React.FC = () => {
  const { posts, loading, error, fetchPosts, clearError } = usePost();

  useEffect(() => {
    // Load posts when component mounts
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Posts ({posts.length})</h2>
      {posts.map((post) => (
        <div key={post.postId}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

// Example: Create Post Component
export const ExampleCreatePost: React.FC = () => {
  const { createPost, loading, error } = usePost();

  const handleSubmit = async (formData: any) => {
    try {
      await createPost({
        postType: PostType.Moment,
        title: formData.title,
        content: formData.content
      });
      // Post automatically added to context state
      console.log('Post created successfully!');
    } catch (error) {
      // Error automatically set in context
      console.error('Failed to create post');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(Object.fromEntries(formData));
    }}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Post'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

// Example: Filtered Posts Component
export const ExampleFilteredPosts: React.FC = () => {
  const { posts, filters, setFilters, fetchPosts } = usePost();

  const handleFilterChange = (postType: PostType) => {
    const newFilters = { ...filters, postType };
    setFilters(newFilters);
    fetchPosts(newFilters);
  };

  return (
    <div>
      <div>
        <button onClick={() => handleFilterChange(PostType.Moment)}>
          Moments
        </button>
        <button onClick={() => handleFilterChange(PostType.BuySell)}>
          Buy/Sell
        </button>
        <button onClick={() => handleFilterChange(PostType.Meetup)}>
          Meetups
        </button>
      </div>
      <div>
        Showing {posts.length} posts
        {filters.postType !== undefined && (
          <span> (filtered by type: {filters.postType})</span>
        )}
      </div>
    </div>
  );
};
