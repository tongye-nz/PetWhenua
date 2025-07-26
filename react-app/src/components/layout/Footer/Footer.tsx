import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack
} from '@mui/material';
import { GitHub, LinkedIn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleProjectInfoClick = () => {
    navigate('/project-info');
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: { xs: 3, md: 4 },
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: { xs: 3, md: 2 }
          }}
        >
          {/* Left Section - Logo and Links */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: { xs: 2, md: 4 }
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/logo.png" 
                alt="PetWhenua Logo" 
                style={{ 
                  height: '40px',
                  width: 'auto'
                }} 
              />
            </Box>

            {/* Links */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 3 }}
              alignItems="center"
            >
              <Link
                component="button"
                onClick={handleProjectInfoClick}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'text.primary',
                    textDecoration: 'underline'
                  }
                }}
              >
                Project Info
              </Link>
              <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: 'text.primary',
                    textDecoration: 'underline'
                  }
                }}
              >
                Meet the Developer
              </Link>
              <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: 'text.primary',
                    textDecoration: 'underline'
                  }
                }}
              >
                Contact Admin
              </Link>
            </Stack>
          </Box>

          {/* Right Section - Social Links */}
          <Stack 
            direction="row" 
            spacing={2}
            alignItems="center"
          >
            <Link
              href="https://github.com/tongye-nz/PetWhenua"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <GitHub sx={{ fontSize: '1.5rem' }} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/tongyenz/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <LinkedIn sx={{ fontSize: '1.5rem' }} />
            </Link>
          </Stack>
        </Box>

        {/* Copyright Section */}
        <Box
          sx={{
            mt: { xs: 3, md: 4 },
            pt: { xs: 2, md: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Copyright © Tong Ye 2025 for MSA Phase 2
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
