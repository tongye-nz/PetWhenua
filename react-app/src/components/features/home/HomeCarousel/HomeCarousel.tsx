import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Container
} from '@mui/material';
import {
  ArrowBackIosNew,
  ArrowForwardIos,
  CalendarToday,
  Announcement as AnnouncementIcon,
  LibraryBooks,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../../../api/post.api';
import { PostType, PostStatus, type Post } from '../../../../models/post.types';
import { formatDate, isDateInFuture } from '../../../../utils/dateUtils';

interface CarouselSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  data?: Post;
  loading: boolean;
}

export const HomeCarousel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<CarouselSection[]>([
    {
      id: 'meetup',
      title: 'Upcoming Meetup',
      icon: <CalendarToday />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      loading: true
    },
    {
      id: 'announcement',
      title: 'Latest Announcement',
      icon: <AnnouncementIcon />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      loading: true
    },
    {
      id: 'library',
      title: 'Latest Library Post',
      icon: <LibraryBooks />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      loading: true
    }
  ]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSectionData();
  }, []);

  const loadSectionData = async () => {
    try {
      // Fetch upcoming meetup
      const meetupPosts = await postService.getPosts({
        postType: PostType.Meetup,
        status: PostStatus.Active
      });
      
      const upcomingMeetup = meetupPosts
        .filter(post => post.eventDate && isDateInFuture(post.eventDate))
        .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())[0];

      // Fetch latest announcement
      const announcementPosts = await postService.getPosts({
        postType: PostType.Announcement,
        status: PostStatus.Active
      });
      
      const latestAnnouncement = announcementPosts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      // Fetch latest library post
      const libraryPosts = await postService.getPosts({
        postType: PostType.Library,
        status: PostStatus.Active
      });
      
      const latestLibraryPost = libraryPosts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      // Update sections with data
      setSections(prev => prev.map(section => {
        let data: Post | undefined;
        
        switch (section.id) {
          case 'meetup':
            data = upcomingMeetup;
            break;
          case 'announcement':
            data = latestAnnouncement;
            break;
          case 'library':
            data = latestLibraryPost;
            break;
        }

        return {
          ...section,
          data,
          loading: false
        };
      }));

    } catch (error) {
      console.error('Failed to load carousel data:', error);
      setSections(prev => prev.map(section => ({ ...section, loading: false })));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
    if (isRightSwipe && currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const goToNext = () => {
    setCurrentSection(prev => (prev + 1) % sections.length);
  };

  const goToPrevious = () => {
    setCurrentSection(prev => (prev - 1 + sections.length) % sections.length);
  };

  const handleSectionClick = (section: CarouselSection) => {
    if (!section.data) return;

    switch (section.id) {
      case 'meetup':
        navigate(`/posts/meetup`);
        break;
      case 'announcement':
        navigate(`/posts/announcement`);
        break;
      case 'library':
        navigate(`/posts/library`);
        break;
      default:
        navigate(`/post/${section.data.postId}`);
    }
  };

  const formatContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderSectionContent = (section: CarouselSection) => {
    if (section.loading) {
      return (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={60} height={60} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={24} />
            </Box>
          </Box>
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Box>
      );
    }

    if (!section.data) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              fontSize: '2.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              p: 2,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              color: 'white'
            }}
          >
            {section.icon}
          </Box>
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            No {section.title.split(' ')[1]} Available
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            Check back later for updates
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: section.id === 'meetup' ? '#667eea' : section.id === 'announcement' ? '#f5576c' : '#00f2fe',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#f0f0f0',
              },
            }}
            onClick={() => handleSectionClick(section)}
          >
            Explore More
          </Button>
        </Box>
      );
    }

    const { data } = section;
    
    return (
      <Box sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          <Box
            sx={{
              fontSize: '2.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              p: 2,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              flexShrink: 0,
              color: 'white'
            }}
          >
            {section.icon}
          </Box>
          <Box sx={{ flex: 1, color: 'white' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {data.title}
            </Typography>
            
            {/* Event date for meetups */}
            {section.id === 'meetup' && data.eventDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.9 }}>
                <CalendarToday sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {formatDate(data.eventDate)}
                </Typography>
              </Box>
            )}
            
            {/* Location for meetups */}
            {section.id === 'meetup' && data.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.9 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {data.location}
                </Typography>
              </Box>
            )}
            
            {/* Content preview */}
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              {formatContent(data.content)}
            </Typography>
            
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: section.id === 'meetup' ? '#667eea' : section.id === 'announcement' ? '#f5576c' : '#00f2fe',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#f0f0f0',
                },
              }}
              onClick={() => handleSectionClick(section)}
            >
              {section.id === 'meetup' ? 'Join Event' : 'Read More'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            maxWidth: '800px',
            mx: 'auto',
            borderRadius: 4
          }}
        >
          {/* Navigation Arrows */}
          {!isMobile && (
            <>
              <IconButton
                onClick={goToPrevious}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: 'white',
                  }
                }}
              >
                <ArrowBackIosNew />
              </IconButton>

              <IconButton
                onClick={goToNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: 'white',
                  },
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* Carousel Container with Slide Transitions */}
          <Box
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                transform: `translateX(-${currentSection * 100}%)`,
                transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                width: '100%'
              }}
            >
              {sections.map((section) => (
                <Card
                  key={section.id}
                  sx={{
                    width: '100%',
                    flexShrink: 0,
                    background: section.gradient,
                    color: 'white',
                    cursor: section.data ? 'pointer' : 'default',
                    minHeight: '300px'
                  }}
                  onClick={() => handleSectionClick(section)}
                >
                  <CardContent sx={{ p: 0, height: '100%' }}>
                    {renderSectionContent(section)}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Pagination Dots */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mt: 3
            }}
          >
            {sections.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSection(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentSection ? 'primary.main' : 'rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}; 