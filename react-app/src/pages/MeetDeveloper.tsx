import React from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  School,
  Psychology,
  Pets,
  Palette,
  CameraAlt,
  ChildCare,
  DeveloperBoard,
  Interests,
  CoffeeMaker
} from '@mui/icons-material';

const MeetDeveloper: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
              fontSize: isMobile ? '1.75rem' : '3rem'
            }}
          >
            Meet the Developer
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              fontWeight: 'normal',
              fontSize: isMobile ? '1rem' : '1.5rem'
            }}
          >
            Tong Ye - Full Stack Developer
          </Typography>
        </Box>

        {/* Profile Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Avatar
            src="/Developer.jpg"
            alt="Tong Ye"
            sx={{
              width: isMobile ? 120 : 180,
              height: isMobile ? 120 : 180,
              mx: 'auto',
              mb: 4,
              border: '4px solid',
              borderColor: 'primary.main'
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Hi, I'm a passionate and curious Full-Stack Developer with a diverse background in graphic design, 
            early childhood education, and veterinary medicine.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Education */}
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
            <School />
            Education
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              mb: 3
            }}
          >
            I recently graduated with a Master of Applied Computing from Lincoln University in June 2025.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Career Journey */}
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
            <Psychology />
            Career Journey
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
            Before transitioning into tech, I worked as a registered early childhood teacher in New Zealand, 
            and earlier as a licensed veterinarian in China. Although I had no formal IT background, 
            my strong interest in technology and problem-solving inspired me to pursue a career change — 
            a bold move that has opened up exciting opportunities in the tech world.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                <Pets />
              </Box>
              <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                  Full-Stack Developer
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Current role building web applications and exploring AI integration
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                <ChildCare />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                  Early Childhood Teacher (New Zealand)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Registered teacher with experience in child development and education
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                <DeveloperBoard />
              </Box>
              <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                  Licensed Veterinarian Assistant (China)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Professional experience in animal healthcare and medical practice
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Design Background */}
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
            <Palette />
            Design Background
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}
          >
            During my veterinary studies, I also worked on graphic design projects for pet clinics, 
            which sparked my appreciation for visual storytelling and user-centred design — 
            skills I now bring into software development.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Current Interests */}
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
            <Interests />
            Current Interests
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
            I'm especially interested in Full-Stack Development and Artificial Intelligence, 
            and I enjoy exploring how these fields can be combined to build intelligent, 
            meaningful applications that solve real-world problems.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Personal Life */}
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
            <CameraAlt />
            Personal Life
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.8,
                fontSize: '1.1rem'
              }}
            >
              I'm passionate about astrophotography, especially capturing the beauty of the Milky Way — 
              it's a hobby that fuels my curiosity and attention to detail. I also enjoy spending time 
              outdoors camping, where I can disconnect and recharge in nature. At home, I love making 
              pour-over coffee and experimenting with different styles of milk tea — small rituals that 
              bring calm and creativity into my daily routine.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.8,
                fontSize: '1.1rem'
              }}
            >
              I'm also a proud member of Mensa New Zealand, which highlights my ability as a super fast 
              learner and my strength in problem solving — qualities that support me well in the fast-paced 
              world of tech.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.8,
                fontSize: '1.1rem'
              }}
            >
              Beyond my technical work, I actively engage with the IT community by attending various tech 
              meetups and contributing as a volunteer photographer for CITA NZ (Chinese IT Association New Zealand). 
              I regularly capture moments at Christchurch meetup events, combining my passion for photography 
              with my commitment to supporting the local tech community. This involvement allows me to stay 
              connected with industry trends while giving back to the community that has helped shape my career.
            </Typography>

            {/* Personal Life Highlights */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
                <CameraAlt />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Astrophotography Enthusiast
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
                <CoffeeMaker />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Coffee Enthusiast
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
                <Psychology />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Mensa New Zealand Member
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
                <CameraAlt />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  CITA NZ Volunteer Photographer
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Philosophy */}
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
            My Philosophy
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              fontStyle: 'italic',
              maxWidth: '800px',
              mx: 'auto',
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            My multidisciplinary journey allows me to build software that blends empathy, logic, and creativity — 
            always with people in mind.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MeetDeveloper; 