import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Fab,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Button, Text, LoadingSpinner, Pagination } from '../components/ui';
import { PostsGrid } from '../components/features/posts';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import { NZ_REGIONS, type District } from '../data/nzLocations';
import { userFollowService } from '../api/userFollow.api';
import { postService } from '../api/post.api';
import type { Post, PostFilters, PostType } from '../models/post.types';
import type { PaginationInfo } from '../models/pagination.types';

const Posts: React.FC = () => {
  const { postType: postTypeParam } = useParams<{ postType?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearError } = usePost();
  
  // Pagination state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [filters, setFilters] = useState<PostFilters>({});
  
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [showingFollowingPosts, setShowingFollowingPosts] = useState<boolean>(false);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [followingLoading, setFollowingLoading] = useState<boolean>(false);

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (newFilters: PostFilters = {}, page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getPostsPaginated(newFilters, { page, pageSize });
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('fetchPosts error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch posts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get districts for a selected region
  const getDistrictsForRegion = (regionName: string): District[] => {
    const region = NZ_REGIONS.find(r => r.Name === regionName);
    return region ? region.Districts : [];
  };

  // Map URL parameter to PostType
  const getPostTypeFromParam = (param?: string): PostType | undefined => {
    if (!param) return undefined;
    
    const typeMap: { [key: string]: PostType } = {
      'meetup': 0, // PostType.Meetup
      'pet-wedding': 1, // PostType.PetWedding
      'buy-sell': 2, // PostType.BuySell  
      'library': 3, // PostType.Library
      'announcement': 4, // PostType.Announcement
      'moment': 5 // PostType.Moment
    };
    
    return typeMap[param];
  };

  useEffect(() => {
    const postType = getPostTypeFromParam(postTypeParam);
    const initialFilters = postType !== undefined ? { postType } : {};
    setFilters(initialFilters);
    fetchPosts(initialFilters, 1, pagination.pageSize);
  }, [postTypeParam, fetchPosts]);

  const handleFilterChange = useCallback((newFilters: Partial<PostFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchPosts(updatedFilters, 1, pagination.pageSize); // Reset to page 1 when filters change
  }, [filters, fetchPosts, pagination.pageSize]);

  const handlePageChange = useCallback((page: number) => {
    fetchPosts(filters, page, pagination.pageSize);
  }, [filters, fetchPosts, pagination.pageSize]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    fetchPosts(filters, 1, pageSize); // Reset to page 1 when page size changes
  }, [filters, fetchPosts]);

  // Update available districts when region changes
  useEffect(() => {
    if (filters.region) {
      const districts = getDistrictsForRegion(filters.region);
      setAvailableDistricts(districts);
      
      // Clear district filter if it's no longer valid for the new region
      if (filters.district && !districts.some(d => d.Name === filters.district)) {
        handleFilterChange({ district: undefined });
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [filters.region, filters.district, handleFilterChange]);

  // Re-filter following posts when filters change
  useEffect(() => {
    if (showingFollowingPosts) {
      // Re-apply current filters to the original following posts
      const refetchFollowingPosts = async () => {
        try {
          setFollowingLoading(true);
          
          // Get list of users the current user is following
          const followedUsers = await userFollowService.getMyFollowing();
          
          if (followedUsers.length === 0) {
            setFollowingPosts([]);
            setFollowingLoading(false);
            return;
          }
          
          // Get posts from all followed users
          const allFollowingPosts: Post[] = [];
          
          await Promise.all(
            followedUsers.map(async (user) => {
              try {
                const userPosts = await postService.getUserPosts(user.userId);
                allFollowingPosts.push(...userPosts);
              } catch (error) {
                console.error(`Failed to fetch posts for user ${user.userId}:`, error);
              }
            })
          );
          
          // Apply current filters
          let filteredFollowingPosts = allFollowingPosts;
          
          if (filters.postType !== undefined) {
            filteredFollowingPosts = filteredFollowingPosts.filter(post => post.postType === filters.postType);
          }
          
          if (filters.region) {
            filteredFollowingPosts = filteredFollowingPosts.filter(post => 
              post.location && post.location.includes(filters.region!)
            );
          }
          
          if (filters.district) {
            filteredFollowingPosts = filteredFollowingPosts.filter(post => 
              post.location && post.location.includes(filters.district!)
            );
          }
          
          filteredFollowingPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setFollowingPosts(filteredFollowingPosts);
        } catch (error) {
          console.error('Failed to re-filter following posts:', error);
        } finally {
          setFollowingLoading(false);
        }
      };
      
      refetchFollowingPosts();
    } else {
      // Refetch regular posts when not showing following posts
      fetchPosts(filters, 1, pagination.pageSize);
    }
  }, [filters.postType, filters.region, filters.district, showingFollowingPosts, fetchPosts, filters, pagination.pageSize]);

  const handleCreatePost = () => {
    // Navigate to create post page
    navigate('/create-post');
  };

  const handleEditPost = (post: Post) => {
    // Pet wedding posts cannot be edited due to complex approval logic
    if (post.postType === 1) { // PostType.PetWedding
      alert('Pet wedding posts cannot be edited. Please delete and create a new one if changes are needed.');
      return;
    }
    
    // Navigate to edit page
    navigate(`/edit-post/${post.postId}`);
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

  // Handle following posts toggle
  const handleFollowingPostsToggle = useCallback(async () => {
    if (showingFollowingPosts) {
      // If already showing following posts, switch back to all posts
      setShowingFollowingPosts(false);
      setFollowingPosts([]);
      // Refresh the main posts list
      fetchPosts(filters, 1, pagination.pageSize);
    } else {
      // Show posts from followed users
      try {
        setFollowingLoading(true);
        setShowingFollowingPosts(true);
        
        // Get list of users the current user is following
        const followedUsers = await userFollowService.getMyFollowing();
        
        if (followedUsers.length === 0) {
          // User is not following anyone
          setFollowingPosts([]);
          setFollowingLoading(false);
          return;
        }
        
        // Get posts from all followed users
        const allFollowingPosts: Post[] = [];
        
        // Fetch posts from each followed user
        await Promise.all(
          followedUsers.map(async (user) => {
            try {
              const userPosts = await postService.getUserPosts(user.userId);
              allFollowingPosts.push(...userPosts);
            } catch (error) {
              console.error(`Failed to fetch posts for user ${user.userId}:`, error);
            }
          })
        );
        
        // Apply current filters to the following posts
        let filteredFollowingPosts = allFollowingPosts;
        
        // Filter by post type if specified
        if (filters.postType !== undefined) {
          filteredFollowingPosts = filteredFollowingPosts.filter(post => post.postType === filters.postType);
        }
        
        // Filter by region if specified
        if (filters.region) {
          filteredFollowingPosts = filteredFollowingPosts.filter(post => 
            post.location && post.location.includes(filters.region!)
          );
        }
        
        // Filter by district if specified
        if (filters.district) {
          filteredFollowingPosts = filteredFollowingPosts.filter(post => 
            post.location && post.location.includes(filters.district!)
          );
        }
        
        // Sort posts by creation date (newest first)
        filteredFollowingPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setFollowingPosts(filteredFollowingPosts);
      } catch (error) {
        console.error('Failed to fetch following posts:', error);
        setShowingFollowingPosts(false);
      } finally {
        setFollowingLoading(false);
      }
    }
  }, [showingFollowingPosts, filters, fetchPosts]);

  // Get display name for current post type
  const getPostTypeDisplayName = (postType?: PostType): string => {
    if (postType === undefined) return 'All Posts';
    const typeMap: { [key: number]: string } = {
      0: 'Meetup Posts',
      1: 'Pet Wedding Posts',
      2: 'Buy & Sell Posts', 
      3: 'Library Posts',
      4: 'Announcement Posts',
      5: 'Moment Posts'
    };
    return typeMap[postType] || 'Community Posts';
  };

  const postTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 0, label: 'Meetup' },
    { value: 1, label: 'Pet Wedding' },
    { value: 2, label: 'Buy/Sell' },
    { value: 3, label: 'Library' },
    { value: 4, label: 'Announcement' },
    { value: 5, label: 'Moment' },
  ];

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
          {showingFollowingPosts ? 'Posts from Following' : getPostTypeDisplayName(filters.postType)}
        </Text>
        {user && (
          <Button 
            variant="primary" 
            onClick={handleCreatePost}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Add sx={{ mr: 1 }} />
            Create Post
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Text variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
            Filters
          </Text>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 2,
              alignItems: 'end'
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Post Type</InputLabel>
              <Select
                value={filters.postType ?? ''}
                label="Post Type"
                onChange={(e) => {
                  const value = String(e.target.value);
                  handleFilterChange({ 
                    postType: value === '' ? undefined : Number(value) as PostType
                  });
                }}
              >
                {postTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={filters.region ?? ''}
                label="Region"
                onChange={(e) => {
                  const value = String(e.target.value);
                  handleFilterChange({ 
                    region: value === '' ? undefined : value,
                    district: undefined // Clear district when region changes
                  });
                }}
              >
                <MenuItem value="">All Regions</MenuItem>
                {NZ_REGIONS.map((region) => (
                  <MenuItem key={region.LocalityId} value={region.Name}>
                    {region.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>District</InputLabel>
              <Select
                value={filters.district ?? ''}
                label="District"
                disabled={!filters.region}
                onChange={(e) => {
                  const value = String(e.target.value);
                  handleFilterChange({ 
                    district: value === '' ? undefined : value
                  });
                }}
              >
                <MenuItem value="">All Districts</MenuItem>
                {availableDistricts.map((district) => (
                  <MenuItem key={district.DistrictId} value={district.Name}>
                    {district.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {user && (
              <Button 
                variant={showingFollowingPosts ? 'primary' : 'outline'}
                onClick={handleFollowingPostsToggle}
                fullWidth
                disabled={followingLoading}
              >
                {followingLoading ? 'Loading...' : showingFollowingPosts ? 'All Posts' : 'Following Posts'}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                setShowingFollowingPosts(false);
                setFollowingPosts([]);
                handleFilterChange({ 
                  postType: undefined, 
                  userId: undefined, 
                  region: undefined, 
                  district: undefined 
                });
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

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

      {/* Posts Grid */}
      <PostsGrid
        posts={showingFollowingPosts ? followingPosts : posts}
        onViewPost={handleViewPost}
        onEditPost={user ? handleEditPost : undefined}
        onDeletePost={user ? handleDeletePost : undefined}
        isLoading={showingFollowingPosts ? followingLoading : loading}
        showActions={!!user}
        emptyMessage={
          showingFollowingPosts
            ? filters.postType !== undefined || filters.region || filters.district
              ? `No ${filters.postType !== undefined ? getPostTypeDisplayName(filters.postType).toLowerCase().replace(' posts', '') + ' posts' : 'posts'} from users you follow matching your filters.`
              : 'No posts from users you follow. Try following some users to see their posts here!'
            : filters.postType !== undefined || filters.userId !== undefined
            ? 'No posts found matching your filters'
            : 'No posts found'
        }
      />

      {/* Pagination Controls */}
      {!showingFollowingPosts && posts.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Floating Action Button for Mobile */}
      {user && (
        <Fab
          color="primary"
          aria-label="create post"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={handleCreatePost}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Posts;
