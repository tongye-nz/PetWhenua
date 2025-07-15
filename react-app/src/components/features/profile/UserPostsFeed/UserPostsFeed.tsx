import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Skeleton,
  Alert
} from '@mui/material';
import { Article, PhotoCamera, Pets } from '@mui/icons-material';
import { postService } from '../../../../api/post.api';
import { PostType, type Post } from '../../../../models/post.types';

export interface UserPostsFeedProps {
  userId: number;
  isOwnProfile: boolean;
  maxPosts?: number;
}

const UserPostsFeed: React.FC<UserPostsFeedProps> = ({
  userId,
  isOwnProfile,
  maxPosts = 20
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadUserPosts();
  }, [userId]);

  const loadUserPosts = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError('');

    try {
      // Load user's posts - filter for 'moment' type posts
      const userPosts = await postService.getUserPosts(userId);
      const momentPosts = userPosts.filter((post: Post) => post.postType === PostType.Moment);
      
      // Sort by creation date (newest first) and limit results
      const sortedPosts = momentPosts
        .sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxPosts);
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPostIcon = (postType: number) => {
    switch (postType) {
      case PostType.Moment:
        return <PhotoCamera sx={{ fontSize: 16, color: 'text.secondary' }} />;
      case PostType.PetWedding:
        return <Pets sx={{ fontSize: 16, color: 'text.secondary' }} />;
      default:
        return <Article sx={{ fontSize: 16, color: 'text.secondary' }} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Article /> {isOwnProfile ? 'My Moments' : 'Moments'}
        </Typography>
        
        {[...Array(3)].map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Article /> {isOwnProfile ? 'My Moments' : 'Moments'}
        </Typography>
        
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Article /> {isOwnProfile ? 'My Moments' : 'Moments'}
        </Typography>
        
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {isOwnProfile ? 'No moments yet' : 'No moments to show'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isOwnProfile 
                ? 'Share your first moment to get started!' 
                : 'This user hasn\'t shared any moments yet.'
              }
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Posts display
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Article /> {isOwnProfile ? 'My Moments' : 'Moments'} ({posts.length})
      </Typography>
      
      {posts.map((post) => (
        <Card key={post.postId} sx={{ mb: 2 }}>
          <CardContent>
            {/* Post Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={post.user?.profilePicture}
                sx={{ width: 40, height: 40 }}
              >
                {post.user?.firstName?.[0] || post.user?.username?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  {post.user?.firstName && post.user?.lastName 
                    ? `${post.user.firstName} ${post.user.lastName}`
                    : post.user?.username
                  }
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getPostIcon(post.postType)}
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(post.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Post Title */}
            {post.title && (
              <Typography variant="h6" sx={{ mb: 1 }}>
                {post.title}
              </Typography>
            )}

            {/* Post Content */}
            {post.content && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>
            )}

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {post.images.length === 1 ? (
                  <img
                    src={post.images[0]}
                    alt="Post image"
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: post.images.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr',
                    gap: 1,
                    maxHeight: '300px'
                  }}>
                    {post.images.slice(0, 4).map((image, imageIndex) => (
                      <Box
                        key={imageIndex}
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '8px'
                        }}
                      >
                        <img
                          src={image}
                          alt={`Post image ${imageIndex + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover'
                          }}
                        />
                        {imageIndex === 3 && post.images.length > 4 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            +{post.images.length - 4}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Location Information */}
            {post.location && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                📍 {post.location}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
      
      {posts.length === maxPosts && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          Showing first {maxPosts} moments
        </Typography>
      )}
    </Box>
  );
};

export default UserPostsFeed;
