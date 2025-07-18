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

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading, error, fetchPosts, clearError } = usePost();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPosts({ userId: user.userId });
    }
  }, [user, fetchPosts]);

  const filterPostsByStatus = (status?: PostStatus): Post[] => {
    if (status === undefined) return posts;
    return posts.filter(post => post.status === status);
  };

  // **PERFORMANCE OPTIMIZATION: Memoize tab counts to prevent recalculation on every render**
  const counts = useMemo(() => {
    return {
      all: posts.length,
      active: posts.filter(p => p.status === 0).length, // PostStatus.Active
      inactive: posts.filter(p => p.status === 3).length, // PostStatus.Inactive
      sold: posts.filter(p => p.status === 1).length, // PostStatus.Sold
      expired: posts.filter(p => p.status === 2).length, // PostStatus.Expired
      cancelled: posts.filter(p => p.status === 4).length, // PostStatus.Cancelled
      pending: posts.filter(p => p.status === 5).length, // PostStatus.Pending
    };
  }, [posts]); // Only recalculate when posts array changes

  const tabs = [
    { label: 'All', status: undefined },
    { label: 'Active', status: 0 as PostStatus }, // PostStatus.Active
    { label: 'Inactive', status: 3 as PostStatus }, // PostStatus.Inactive
    { label: 'Sold', status: 1 as PostStatus }, // PostStatus.Sold
    { label: 'Expired', status: 2 as PostStatus }, // PostStatus.Expired
    { label: 'Cancelled', status: 4 as PostStatus }, // PostStatus.Cancelled
    { label: 'Pending', status: 5 as PostStatus }, // PostStatus.Pending
  ];

  // **PERFORMANCE OPTIMIZATION: Memoize current posts filtering**
  const currentPosts = useMemo(() => {
    return filterPostsByStatus(tabs[selectedTab].status);
  }, [posts, selectedTab]); // Only recalculate when posts or selected tab changes

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const handleEditPost = (post: Post) => {
    // Navigate to edit page (to be implemented later)
    console.log('Edit post:', post.postId);
  };

  const handleDeletePost = async (post: Post) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // The actual delete logic will be handled by PostContext
        console.log('Delete post:', post.postId);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
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
