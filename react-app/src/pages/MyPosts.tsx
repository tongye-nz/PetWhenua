import React, { useState, useEffect } from 'react';
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
import { postService } from '../api/post.api';
import type { Post, PostStatus } from '../models/post.types';

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const clearError = () => setError(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user?.userId) return;
      
      setLoading(true);
      try {
        const data = await postService.getMyPosts(user.userId);
        setPosts(data.posts);
        setStatusBreakdown(data.statusBreakdown);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your posts');
        console.error('Error fetching my posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [user?.userId]);

  const filterPostsByStatus = (status?: PostStatus): Post[] => {
    if (status === undefined) return posts;
    return posts.filter(post => post.status === status);
  };

  const getTabCounts = () => {
    return {
      all: posts.length,
      active: statusBreakdown['Active'] || 0,
      inactive: statusBreakdown['Inactive'] || 0,
      sold: statusBreakdown['Sold'] || 0,
      expired: statusBreakdown['Expired'] || 0,
      cancelled: statusBreakdown['Cancelled'] || 0,
      pending: statusBreakdown['Pending'] || 0,
    };
  };

  const tabs = [
    { label: 'All', status: undefined, key: 'all' },
    { label: 'Active', status: 0 as PostStatus, key: 'active' }, // PostStatus.Active
    { label: 'Inactive', status: 3 as PostStatus, key: 'inactive' }, // PostStatus.Inactive
    { label: 'Pending', status: 5 as PostStatus, key: 'pending' }, // PostStatus.Pending
    { label: 'Sold', status: 1 as PostStatus, key: 'sold' }, // PostStatus.Sold
    { label: 'Expired', status: 2 as PostStatus, key: 'expired' }, // PostStatus.Expired
    { label: 'Cancelled', status: 4 as PostStatus, key: 'cancelled' }, // PostStatus.Cancelled
  ];

  const counts = getTabCounts();
  const currentPosts = filterPostsByStatus(tabs[selectedTab].status);

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
          {tabs.map((tab) => (
            <Tab 
              key={tab.key} 
              label={`${tab.label} (${counts[tab.key as keyof typeof counts] || 0})`} 
            />
          ))}
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
