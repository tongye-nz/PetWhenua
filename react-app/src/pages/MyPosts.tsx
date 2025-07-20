import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Button, Text, LoadingSpinner } from '../components/ui';
import { PostsGrid } from '../components/features/posts';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import type { Post, PostStatus } from '../models/post.types';
import { PostStatusUtils } from '../models/post.types';

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading, error, fetchPosts, clearError, deletePost } = usePost();
  const [selectedTab, setSelectedTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchPosts({ userId: user.userId });
    }
  }, [user, fetchPosts]);

  const filterPostsByStatus = (status?: PostStatus): Post[] => {
    if (status === undefined) return posts;
    return posts.filter(post => {
      if (status === 0) return PostStatusUtils.isActive(post.status);
      if (status === 1) return PostStatusUtils.isSold(post.status);
      if (status === 2) return PostStatusUtils.isExpired(post.status);
      if (status === 3) return PostStatusUtils.isInactive(post.status);
      if (status === 4) return PostStatusUtils.isCancelled(post.status);
      if (status === 5) return PostStatusUtils.isPending(post.status);
      return false;
    });
  };

  // **PERFORMANCE OPTIMIZATION: Memoize tab counts to prevent recalculation on every render**
  const counts = useMemo(() => {
    return {
      all: posts.length,
      active: posts.filter(p => PostStatusUtils.isActive(p.status)).length,
      inactive: posts.filter(p => PostStatusUtils.isInactive(p.status)).length,
      sold: posts.filter(p => PostStatusUtils.isSold(p.status)).length,
      expired: posts.filter(p => PostStatusUtils.isExpired(p.status)).length,
      cancelled: posts.filter(p => PostStatusUtils.isCancelled(p.status)).length,
      pending: posts.filter(p => PostStatusUtils.isPending(p.status)).length,
    };
  }, [posts]);

  const tabs = [
    { label: 'All', status: undefined },
    { label: 'Active', status: 0 as PostStatus }, // Using numeric values for consistency with existing code
    { label: 'Inactive', status: 3 as PostStatus },
    { label: 'Sold', status: 1 as PostStatus },
    { label: 'Expired', status: 2 as PostStatus },
    { label: 'Cancelled', status: 4 as PostStatus },
    { label: 'Pending', status: 5 as PostStatus },
  ];

  // **PERFORMANCE OPTIMIZATION: Memoize current posts filtering**
  const currentPosts = useMemo(() => {
    return filterPostsByStatus(tabs[selectedTab].status);
  }, [posts, selectedTab]); // Only recalculate when posts or selected tab changes

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const handleEditPost = (post: Post) => {
    // Navigate to edit page
    navigate(`/edit-post/${post.postId}`);
  };

  const handleDeletePost = async (post: Post) => {
    // Clear any existing messages
    setSuccessMessage('');
    setDeleteError('');
    
    try {
      // Use PostContext's deletePost method to actually delete the post
      await deletePost(post.postId);
      
      // Show success message
      setSuccessMessage(`Post "${post.title}" has been deleted successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('Failed to delete post:', error);
      setDeleteError('Failed to delete post. Please try again.');
      
      // Clear error message after 8 seconds
      setTimeout(() => setDeleteError(''), 8000);
    }
  };

  const handleViewPost = (post: Post) => {
    navigate(`/post/${post.postId}`);
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          You must be logged in to view your posts.
        </Alert>
      </Container>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" py={4}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text variant="h4" component="h1" fontWeight="bold">
          My Posts
        </Text>
        <Button 
          variant="primary" 
          onClick={handleCreatePost}
        >
          <Add sx={{ mr: 1 }} />
          Create Post
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Delete Error Message */}
      {deleteError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setDeleteError('')}
        >
          {deleteError}
        </Alert>
      )}

      {/* Status Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All (${counts.all})`} />
          <Tab label={`Active (${counts.active})`} />
          <Tab label={`Inactive (${counts.inactive})`} />
          <Tab label={`Sold (${counts.sold})`} />
          <Tab label={`Expired (${counts.expired})`} />
          <Tab label={`Cancelled (${counts.cancelled})`} />
          <Tab label={`Pending (${counts.pending})`} />
        </Tabs>
      </Card>

      {/* Posts Grid */}
      <PostsGrid
        posts={currentPosts}
        onViewPost={handleViewPost}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        isLoading={loading}
        showActions={true}
        emptyMessage={
          selectedTab === 0 
            ? 'You haven\'t created any posts yet' 
            : `You don't have any ${tabs[selectedTab].label.toLowerCase()} posts yet`
        }
      />

      {/* Empty State for All Posts */}
      {selectedTab === 0 && currentPosts.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Text variant="h6" color="text.secondary" gutterBottom>
            Create your first post to get started!
          </Text>
          <Text variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share moments, sell items, organize meetups, and connect with the pet community.
          </Text>
          <Button variant="primary" onClick={handleCreatePost}>
            Create Your First Post
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MyPosts;
