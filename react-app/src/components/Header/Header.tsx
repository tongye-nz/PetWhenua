import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { headerStyles } from './HeaderStyles';

interface HeaderProps {
  onSignInClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Mobile detection and resize handler
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleLogoClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSignInClick = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownItemClick = (action: string) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    
    switch (action) {
      case 'details':
        console.log('Navigate to My Details');
        break;
      case 'pets':
        console.log('Navigate to My Pets');
        break;
      case 'messages':
        console.log('Navigate to Messages');
        break;
      case 'signout':
        setIsLoggedIn(false);
        console.log('Sign Out');
        break;
      default:
        break;
    }
  };

  const handleNavLinkClick = (href: string) => {
    console.log(`Navigate to ${href}`);
    setIsMobileMenuOpen(false);
  };

  const getDropdownItemStyle = (itemKey: string, isLast: boolean = false, isSignOut: boolean = false) => {
    let style = isMobile ? 
      { ...headerStyles.dropdownItem, ...headerStyles.dropdownItemMobile } : 
      headerStyles.dropdownItem;
    
    if (isLast) {
      style = { ...style, ...headerStyles.dropdownItemLast };
    }
    
    if (isSignOut) {
      style = { ...style, ...headerStyles.dropdownItemSignOut };
    }
    
    if (hoveredItem === itemKey) {
      style = { ...style, ...headerStyles.dropdownItemHover };
    }
    
    return style;
  };

  const dropdownItems = [
    { key: 'details', label: 'My Details', icon: '👤' },
    { key: 'pets', label: 'My Pets', icon: '🐾' },
    { key: 'messages', label: 'Messages', icon: '💬' },
    { key: 'signout', label: 'Sign Out', icon: '🚪', isSignOut: true }
  ];

  const navItems = [
    { label: 'Home', href: '#', active: true },
    { label: 'Menu1', href: '#', active: false },
    { label: 'Menu2', href: '#', active: false }
  ];

  return (
    <>
      <header style={headerStyles.header}>
        <div style={headerStyles.container}>
          <div style={headerStyles.headerContent}>
            {/* Logo */}
            <div 
              style={{ 
                ...headerStyles.logoImage, 
                cursor: 'pointer',
                ...(isMobile ? headerStyles.logoImageMobile : {})
              }}
              onClick={handleLogoClick}
            >
              <img 
                src="/logo.png" 
                alt="PetWhenua Logo" 
                style={isMobile ? 
                  { ...headerStyles.logoImage, ...headerStyles.logoImageMobile } : 
                  headerStyles.logoImage
                } 
              />
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav style={headerStyles.navDesktop}>
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    style={item.active ? headerStyles.navLinkActive : headerStyles.navLink}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavLinkClick(item.href);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            )}

                         {/* Header Right Section */}
             <div style={isMobile ? headerStyles.headerRightMobile : headerStyles.headerRightDesktop}>
               {/* Mobile Menu Button */}
               {isMobile && (
                 <div style={headerStyles.mobileMenuContainer} ref={mobileMenuRef}>
                   <IconButton
                     style={headerStyles.menuButton}
                     onClick={handleMobileMenuToggle}
                     aria-label="Toggle mobile menu"
                   >
                     <MenuIcon />
                   </IconButton>
                   
                   {/* Mobile Dropdown Menu */}
                   <div
                     style={{
                       ...headerStyles.mobileMenu,
                       ...(isMobileMenuOpen ? headerStyles.mobileMenuOpen : {})
                     }}
                   >
                     {/* Mobile Menu Header */}
                     <div style={headerStyles.mobileMenuHeader}>
                       <img 
                         src="/logo.png" 
                         alt="PetWhenua Logo" 
                         style={headerStyles.logoImageMobile}
                       />
                       <button
                         style={headerStyles.mobileMenuClose}
                         onClick={() => setIsMobileMenuOpen(false)}
                         aria-label="Close mobile menu"
                       >
                         ×
                       </button>
                     </div>

                     {/* Mobile Navigation Links */}
                     <div style={headerStyles.mobileNavLinks}>
                       {navItems.map((item) => (
                         <a
                           key={item.label}
                           href={item.href}
                           style={{
                             ...headerStyles.mobileNavLink,
                             ...(item.active ? headerStyles.mobileNavLinkActive : {}),
                             ...(hoveredItem === item.label ? headerStyles.mobileNavLinkHover : {})
                           }}
                           onClick={(e) => {
                             e.preventDefault();
                             handleNavLinkClick(item.href);
                           }}
                           onMouseEnter={() => setHoveredItem(item.label)}
                           onMouseLeave={() => setHoveredItem(null)}
                         >
                           {item.label}
                         </a>
                       ))}
                     </div>

                     {/* Mobile Profile Section */}
                     <div style={headerStyles.mobileProfileSection}>
                       {isLoggedIn ? (
                         <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                             <AccountCircleIcon
                               style={{
                                 ...headerStyles.profileImage,
                                 ...headerStyles.profileImageMobile,
                                 fontSize: '36px',
                                 color: '#667eea',
                               }}
                             />
                             <span style={{ fontWeight: 600, color: '#333' }}>My Account</span>
                           </div>
                           <div style={{ ...headerStyles.dropdown, ...headerStyles.dropdownMobile }}>
                             {dropdownItems.map((item, index) => (
                               <div
                                 key={item.key}
                                 style={getDropdownItemStyle(
                                   item.key, 
                                   index === dropdownItems.length - 1,
                                   item.isSignOut
                                 )}
                                 onClick={() => handleDropdownItemClick(item.key)}
                                 onMouseEnter={() => setHoveredItem(item.key)}
                                 onMouseLeave={() => setHoveredItem(null)}
                               >
                                 <span>{item.icon}</span>
                                 <span>{item.label}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <Button 
                           variant="contained" 
                           onClick={handleSignInClick}
                           fullWidth
                         >
                           Sign In
                         </Button>
                       )}
                     </div>
                   </div>
                 </div>
               )}

               {/* Desktop Profile/Sign In */}
               {!isMobile && (
                 <>
                   {isLoggedIn ? (
                     <div style={headerStyles.profileContainer} ref={dropdownRef}>
                       <AccountCircleIcon
                         style={{
                           ...headerStyles.profileImage,
                           ...(isProfileHovered ? headerStyles.profileImageHover : {}),
                           fontSize: '40px',
                           color: '#667eea',
                           cursor: 'pointer',
                         }}
                         onClick={handleProfileClick}
                         onMouseEnter={() => setIsProfileHovered(true)}
                         onMouseLeave={() => setIsProfileHovered(false)}
                       />
                       {isDropdownOpen && (
                         <div style={headerStyles.dropdown}>
                           {dropdownItems.map((item, index) => (
                             <div
                               key={item.key}
                               style={getDropdownItemStyle(
                                 item.key, 
                                 index === dropdownItems.length - 1,
                                 item.isSignOut
                               )}
                               onClick={() => handleDropdownItemClick(item.key)}
                               onMouseEnter={() => setHoveredItem(item.key)}
                               onMouseLeave={() => setHoveredItem(null)}
                             >
                               <span>{item.icon}</span>
                               <span>{item.label}</span>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   ) : (
                     <Button variant="contained" onClick={handleSignInClick}>
                       Sign In
                     </Button>
                   )}
                 </>
               )}
             </div>
          </div>
        </div>
      </header>

      {/* Temporary toggle button for demo purposes */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        fontSize: '12px',
        background: '#f0f0f0',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 1001
      }} onClick={() => setIsLoggedIn(!isLoggedIn)}>
        Demo: {isLoggedIn ? 'Logged In' : 'Not Logged In'} (Click to toggle)
      </div>
    </>
  );
};

export default Header;
