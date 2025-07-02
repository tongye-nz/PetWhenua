import type { CSSProperties } from 'react';

// Responsive breakpoints
const breakpoints = {
  mobile: '768px',
  tablet: '1024px'
};

export const headerStyles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  header: {
    background: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: 100,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoImage: {
    height: '4rem',
    width: 'auto',
    objectFit: 'contain' as const,
  },
  // Desktop navigation
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navDesktop: {
    display: 'flex',
    gap: '2rem',
  },
  navMobile: {
    display: 'none',
  },
  navLink: {
    textDecoration: 'none',
    color: '#666',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  navLinkActive: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerRightDesktop: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerRightMobile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // Menu button styles
  menuButton: {
    color: '#333',
    padding: '8px',
  },
  // Mobile menu dropdown (no longer slide-out)
  mobileMenuContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  mobileMenu: {
    position: 'absolute',
    top: '50px',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e0e0e0',
    minWidth: '280px',
    zIndex: 1000,
    overflow: 'hidden',
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateY(-10px)',
    transition: 'all 0.3s ease',
  },
  mobileMenuOpen: {
    opacity: 1,
    visibility: 'visible',
    transform: 'translateY(0)',
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
  },
  mobileMenuClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
  },
  mobileNavLinks: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 0',
  },
  mobileNavLink: {
    textDecoration: 'none',
    color: '#666',
    fontWeight: 500,
    fontSize: '16px',
    padding: '12px 20px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease',
  },
  mobileNavLinkActive: {
    color: '#333',
    fontWeight: 600,
  },
  mobileNavLinkHover: {
    backgroundColor: '#f5f5f5',
  },
  mobileProfileSection: {
    borderTop: '1px solid #e0e0e0',
    padding: '16px 20px',
  },
  location: {
    color: '#666',
    fontSize: '0.9rem',
  },
  // Profile dropdown styles
  profileContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    cursor: 'pointer',
    border: '2px solid #667eea',
    transition: 'border-color 0.3s ease',
  },
  profileImageMobile: {
    width: '36px',
    height: '36px',
  },
  profileImageHover: {
    borderColor: '#764ba2',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: '0',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e0e0e0',
    minWidth: '180px',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownMobile: {
    position: 'static',
    boxShadow: 'none',
    border: 'none',
    borderRadius: '0',
    minWidth: 'auto',
    width: '100%',
  },
  dropdownItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dropdownItemMobile: {
    padding: '12px 0',
    fontSize: '16px',
  },
  dropdownItemHover: {
    backgroundColor: '#f5f5f5',
  },
  dropdownItemLast: {
    borderBottom: 'none',
  },
  dropdownItemSignOut: {
    color: '#ff4444',
    borderTop: '1px solid #e0e0e0',
  },
  // Responsive logo
  logoImageMobile: {
    height: '3rem',
  },
  // Hide/show elements based on screen size
  hideOnMobile: {
    display: 'block',
  },
  showOnMobile: {
    display: 'none',
  },
};

// Media query helper functions
export const getResponsiveStyle = (isMobile: boolean, desktopStyle: CSSProperties, mobileStyle: CSSProperties): CSSProperties => {
  return isMobile ? { ...desktopStyle, ...mobileStyle } : desktopStyle;
};

export { breakpoints };
