import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { HomeCarousel } from '../components/features/home/HomeCarousel';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleCardClick = (cardIndex: number) => {
    switch (cardIndex) {
      case 0: // Create your Pet Profile
        navigate('/my-pets');
        break;
      case 1: // Find a pet owner near you
        navigate('/users-near-me');
        break;
      case 2: // Find pets near you
        navigate('/pets-near-me');
        break;
      case 3: // Join Meetups & Events
        navigate('/posts/meetup');
        break;
      default:
        break;
    }
  };

  const steps = [
    {
      icon: '👤',
      title: 'Create your Pet Profile',
      description: 'Share your furry friend\'s story and connect with your community',
      gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)'
    },
    {
      icon: '📍',
      title: 'Find a pet owner near you',
      description: 'Find pet owners near you and build relationships for your pets',
      gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)'
    },
    {
      icon: '🐕',
      title: 'Find pets near you',
      description: 'Discover adorable pets in your area and connect with their owners',
      gradient: 'linear-gradient(135deg, #45b7d1, #96c93d)'
    },
    {
      icon: '📅',
      title: 'Join Meetups & Events',
      description: 'Attend local playdates and build lasting friendships',
      gradient: 'linear-gradient(135deg, #ffa726, #fb8c00)'
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/homepage.jpg") center/cover no-repeat',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Box sx={{ maxWidth: '800px', px: 2 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem', lg: '3.2rem' },
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              mb: 2
            }}
          >
            PetWhenua: Our Kiwi Pet Networking Community
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.8rem' },
              fontWeight: 'normal',
              opacity: 0.9,
            }}
          >
            Networking for your pet
          </Typography>
        </Box>
      </Box>

      {/* How It Works Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem', lg: '2.5rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2
            }}
          >
            How It Works
          </Typography>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.3rem' }
                }}
              >
                New Zealand's Pet Networking Community! PetWhenua is where pet lovers connect, share, and grow together. Whether you have a playful pup, a curious cat, or any other beloved companion, this platform helps you build real connections with fellow pet owners across Aotearoa.
              </Typography>
            </Box>

            {/* Why Join Section */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem', lg: '1.9rem' },
                  gap: 1
                }}
              >
                🎯 Why join PetWhenua?
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, maxWidth: '700px', width: '100%' }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' }, mt: 0.5 }}>🤝</Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, fontWeight: 'bold', mb: 0.5 }}>
                      Meet pet owners near you
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, color: 'text.secondary' }}>
                      Build genuine friendships with fellow pet lovers in your community
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, maxWidth: '700px', width: '100%' }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' }, mt: 0.5 }}>🐶</Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, fontWeight: 'bold', mb: 0.5 }}>
                      Discover pets in your area
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, color: 'text.secondary' }}>
                      Share your journey as a pet parent and connect with other pets
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, maxWidth: '700px', width: '100%' }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' }, mt: 0.5 }}>📅</Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, fontWeight: 'bold', mb: 0.5 }}>
                      Join local meetups and events
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, color: 'text.secondary' }}>
                      Socialise and have fun with organized pet-friendly activities
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Call to Action */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 2,
                  fontStyle: 'italic',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                }}
              >
                Start your journey with PetWhenua — where every paw has a story!
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 4,
              maxWidth: '1000px',
              mx: 'auto'
            }}
          >
            {steps.map((step, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                  bgcolor: 'background.paper',
                }}
                onClick={() => handleCardClick(index)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: step.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        fontSize: '2rem',
                        color: 'white',
                      }}
                    >
                      {step.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Dynamic Content Carousel */}
      <HomeCarousel />
    </Box>
  );
};

export default Home; 