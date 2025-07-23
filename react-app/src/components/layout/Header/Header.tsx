import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme as useMuiTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { Button, ThemeToggle } from '../../ui';
import { useAuth } from '../../../contexts/AuthContext';
import { NotificationCenter } from '../../features/notifications';
import { isAdmin, isMeetupAdmin } from '../../../utils/userRoles';
import { getProfilePictureUrl } from '../../../utils/imageUrlUtils';

interface HeaderProps {
  onSignInClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, logout, user } = useAuth();
  
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSignInClick = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      navigate('/login');
    }
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavLinkClick = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  const handleDropdownItemClick = (action: string) => {
    setProfileAnchorEl(null);
    setMobileMenuOpen(false);
    
    switch (action) {
      case 'details':
        navigate('/profile');
        break;
      case 'pets':
        navigate('/my-pets');
        break;
      case 'posts':
        navigate('/my-posts');
        break;
      case 'connections':
        navigate('/pet-connection-requests');
        break;
      case 'weddingRequests':
        navigate('/wedding-requests');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'meetupAdmin':
        navigate('/admin/meetups');
        break;
      case 'signout':
        logout();
        navigate('/');
        break;
      default:
        break;
    }
  };

  const navItems = [
    { label: 'Home', href: '/', active: location.pathname === '/' },
    { label: 'Moment', href: '/posts/moment', active: location.pathname === '/posts/moment' },
    { label: 'Meetup', href: '/posts/meetup', active: location.pathname === '/posts/meetup' },
    { label: 'Pet Wedding', href: '/posts/pet-wedding', active: location.pathname === '/posts/pet-wedding' },
    { label: 'Buy & Sell', href: '/posts/buy-sell', active: location.pathname === '/posts/buy-sell' },
    { label: 'Library', href: '/posts/library', active: location.pathname === '/posts/library' },
    { label: 'Announcement', href: '/posts/announcement', active: location.pathname === '/posts/announcement' }
  ];

  const dropdownItems = [
    { key: 'details', label: 'My Details', icon: '👤' },
    { key: 'pets', label: 'My Pets', icon: '🐾' },
    { key: 'posts', label: 'My Posts', icon: '📝' },
    { key: 'connections', label: 'Connection Requests', icon: '🤝' },
    { key: 'weddingRequests', label: 'Wedding Requests', icon: '💒' },
    { key: 'messages', label: 'Messages', icon: '💬' },
    ...(isAdmin(user?.role || '') ? [{ key: 'admin', label: 'Admin Panel', icon: '⚙️' }] : []),
    ...(isMeetupAdmin(user?.role || '') ? [{ key: 'meetupAdmin', label: 'Meetup Management', icon: '📅' }] : []),
    { key: 'signout', label: 'Sign Out', icon: '🚪' }
  ];

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        bgcolor: 'background.paper',
        color: 'text.primary'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters
          sx={{ 
            justifyContent: 'space-between',
            py: 1
          }}
        >
          {/* Logo */}
          <Box 
            onClick={handleLogoClick}
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/logo.png" 
              alt="PetWhenua Logo" 
              style={{ 
                height: isMobile ? '48px' : '64px',
                width: 'auto'
              }} 
            />
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            gap: 3,
            alignItems: 'center'
          }}>
            {navItems.map((item) => (
              <Typography
                key={item.label}
                component="a"
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavLinkClick(item.href);
                }}
                sx={{
                  textDecoration: 'none',
                  color: item.active ? 'text.primary' : 'text.secondary',
                  fontWeight: item.active ? 600 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'text.primary'
                  },
                  transition: 'color 0.2s ease'
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Desktop Profile/Sign In */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {isAuthenticated ? (
                <>
                  <NotificationCenter />
                  <IconButton
                    onClick={handleProfileClick}
                    sx={{
                      p: 0,
                      '&:hover': {
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    <Avatar
                      src={getProfilePictureUrl(user?.profilePicture)}
                      sx={{ 
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {user?.firstName?.[0] || user?.username?.[0] || '?'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={profileAnchorEl}
                    open={Boolean(profileAnchorEl)}
                    onClose={handleProfileClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        minWidth: 180,
                        mt: 1
                      }
                    }}
                  >
                    {dropdownItems.map((item) => (
                      <MenuItem 
                        key={item.key}
                        onClick={() => handleDropdownItemClick(item.key)}
                        sx={{
                          gap: 1,
                          ...(item.key === 'signout' && {
                            color: 'error.main',
                            borderTop: '1px solid',
                            borderColor: 'divider'
                          }),
                          ...(item.key === 'admin' && {
                            color: 'warning.main',
                            fontWeight: 600
                          }),
                          ...(item.key === 'meetupAdmin' && {
                            color: 'info.main',
                            fontWeight: 600
                          })
                        }}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Button variant="primary" onClick={handleSignInClick}>
                  Sign In
                </Button>
              )}
            </Box>

            {/* Mobile Menu Button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Mobile Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <img 
              src="/logo.png" 
              alt="PetWhenua Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mobile Navigation */}
          <List>
            {navItems.map((item) => (
              <ListItem 
                key={item.label}
                onClick={() => handleNavLinkClick(item.href)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: item.active ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: item.active ? 600 : 400,
                    color: item.active ? 'primary.main' : 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Theme Toggle in Mobile */}
          <Box sx={{ px: 2, py: 1, mb: 2 }}>
            <ThemeToggle showLabel />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Mobile Profile Section */}
          {isAuthenticated ? (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mb: 2,
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1
              }}>
                <Avatar 
                  src={getProfilePictureUrl(user?.profilePicture)}
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {user?.firstName?.[0] || user?.username?.[0] || '?'}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                  My Account
                </Typography>
                <NotificationCenter />
              </Box>
              <List>
                {dropdownItems.map((item) => (
                  <ListItem 
                    key={item.key}
                    onClick={() => handleDropdownItemClick(item.key)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      },
                      ...(item.key === 'signout' && {
                        color: 'error.main',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        mt: 1
                      }),
                      ...(item.key === 'admin' && {
                        color: 'warning.main',
                        fontWeight: 600
                      }),
                      ...(item.key === 'meetupAdmin' && {
                        color: 'info.main',
                        fontWeight: 600
                      })
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSignInClick}
              fullWidth
            >
              Sign In
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;
