import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Pets,
  Code,
  Palette,
  School,
  Psychology,
  Event,
  ShoppingCart,
  LocalHospital,
  GitHub,
  LinkedIn,
  CloudQueue,
  Storage,
  Build,
  WebAsset
} from '@mui/icons-material';

const ProjectInfo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const techStack = [
    { name: 'React + TypeScript', icon: <WebAsset />, color: '#61dafb' },
    { name: 'Material UI', icon: <Palette />, color: '#1976d2' },
    { name: 'C# .NET 8', icon: <Code />, color: '#512bd4' },
    { name: 'Entity Framework', icon: <Build />, color: '#512bd4' },
    { name: 'Azure SQL', icon: <Storage />, color: '#0078d4' },
    { name: 'Microsoft Azure', icon: <CloudQueue /> }
  ];

  const features = [
    { 
      icon: <Event />, 
      title: 'Pet Events & Meetups', 
      description: 'Organise and join pet-related events, including fun features like pet weddings.' 
    },
    { 
      icon: <ShoppingCart />, 
      title: 'Pet Marketplace', 
      description: 'Buy and sell pet-related items within a trusted community.' 
    },
    { 
      icon: <LocalHospital />, 
      title: 'Vet Discovery', 
      description: 'Discover and connect with local veterinarians.' 
    },
    { 
      icon: <Pets />, 
      title: 'Pet Profiles', 
      description: 'Share memorable moments and create profiles for your beloved pets.' 
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              fontSize: isMobile ? '1.75rem' : '3rem'
            }}
          >
            <Pets sx={{ fontSize: isMobile ? '1.75rem' : '2.5rem', color: 'primary.main' }} />
            Project Info: PetWhenua
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              fontWeight: 'normal',
              fontSize: isMobile ? '1rem' : '1.5rem'
            }}
          >
            A Networking Platform for Pet Owners
          </Typography>
        </Box>

        {/* Project Background */}
        <Box sx={{ mb: 8 }}>
                      <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: isMobile ? '1.5rem' : '2.25rem'
              }}
            >
              📌 Project Background
            </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              mb: 4
            }}
          >
            This project was developed as part of the Microsoft Student Accelerator (MSA) Phase 2 - Software Stream. 
            The key requirement of this phase is to build a full stack networking web application that demonstrates 
            proficiency in both frontend and backend technologies. Participants must independently complete the project 
            and implement at least three advanced features.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <School />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Microsoft Student Accelerator (MSA) Phase 2 - Software Stream
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Tech Stack */}
        <Box sx={{ mb: 8 }}>
                      <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: isMobile ? '1.5rem' : '2.25rem'
              }}
            >
              🛠️ Tech Stack
            </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              mb: 6
            }}
          >
            To fulfil the requirements, I developed this project entirely on my own using the following technologies:
          </Typography>
          
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
              Frontend
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.1rem' }}>
              React with TypeScript, styled using Material UI (MUI) for a consistent and responsive user interface. 
              Routing is handled with React Router.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
              Backend
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.1rem' }}>
              C# with .NET 8, using Entity Framework Core for ORM and Azure SQL for data persistence.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
              Deployment
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.1rem' }}>
              Both the frontend and backend are deployed using Microsoft Azure.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
              Additional Features
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem' }}>
              Includes theme switching (light/dark mode), state management, and a responsive UI design.
            </Typography>
          </Box>

          {/* Tech Stack Chips */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            flexWrap="wrap"
            useFlexGap
          >
            {techStack.map((tech, index) => (
              <Chip
                key={index}
                icon={tech.icon}
                label={tech.name}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiChip-icon': {
                    color: 'white'
                  },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* About the Idea */}
        <Box sx={{ mb: 8 }}>
                      <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: isMobile ? '1.5rem' : '2.25rem'
              }}
            >
              🧠 About the Idea
            </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              mb: 6
            }}
          >
            As a former registered veterinarian, I have a deep understanding of animal behaviour, welfare, 
            and the unique bond between people and their pets. My passion for animals inspired me to build 
            a networking platform specifically designed for pet owners in New Zealand.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 6, color: 'primary.main' }}>
            <Psychology />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Former Registered Veterinarian
            </Typography>
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 4
            }}
          >
            PetWhenua creates a space where pet lovers can:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 6 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 3,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Design and Assets */}
        <Box sx={{ mb: 8 }}>
                      <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: isMobile ? '1.5rem' : '2.25rem'
              }}
            >
              🎨 Design and Assets
            </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}
          >
            All images used in this project are copyright-free, sourced from open-license platforms. 
            The logo and overall design aesthetic were created entirely by myself. This is a solo project — 
            from idea generation and UX/UI design to full stack implementation and deployment, 
            every part of this app was built independently.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Developer Info */}
        <Box sx={{ textAlign: 'center' }}>
                      <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 4,
                fontSize: isMobile ? '1.25rem' : '1.75rem'
              }}
            >
              Meet the Developer
            </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              mb: 6
            }}
          >
            Tong Ye - Full Stack Developer & Former Veterinarian
          </Typography>
          
          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Box
              component="a"
              href="https://github.com/tongye-nz/PetWhenua"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
                textDecoration: 'none',
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <GitHub />
              <Typography variant="body1">GitHub</Typography>
            </Box>
            
            <Box
              component="a"
              href="https://www.linkedin.com/in/tongyenz/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
                textDecoration: 'none',
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <LinkedIn />
              <Typography variant="body1">LinkedIn</Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectInfo; 