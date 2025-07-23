import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';

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
              fontSize: isMobile ? '2.5rem' : '3.5rem',
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
              fontSize: isMobile ? '1.5rem' : '2rem',
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
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{ whiteSpace: 'pre-line', mb: 2 }}
          >
            🐾 Welcome to PetWhenua – New Zealand's Pet Networking Community!

            PetWhenua is where pet lovers connect, share, and grow together. Whether you have a playful pup, a curious cat, or any other beloved companion, this platform helps you build real connections with fellow pet owners across Aotearoa. Let’s create a space where our pets can thrive — together.

            🎯 Why join PetWhenua?

            - 🤝 Meet pet owners near you and build genuine friendships
            - 🐶 Discover pets in your area and share your journey as a pet parent
            - 📅 Join local meetups and events to socialise and have fun
            - 📸 Create your pet’s profile and celebrate their unique personality

            Start your journey with PetWhenua — where every paw has a story!
          </Typography>

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

      {/* Upcoming Meetup Section */}
      <Box
        sx={{
          py: 6,
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              color: 'white',
              maxWidth: '800px',
              mx: 'auto',
              position: 'relative',
            }}
          >
            <CardContent sx={{ p: 4 }}>
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
                    flexShrink: 0
                  }}
                >
                  🏃‍♂️
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    Upcoming Meetup
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      opacity: 0.9,
                    }}
                  >
                    Christchurch - 20 July at Hagley Park
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: 'white',
                      color: '#667eea',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#f0f0f0',
                      },
                    }}
                  >
                    Join Event
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 3
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'white',
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 