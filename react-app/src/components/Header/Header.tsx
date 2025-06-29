import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { headerStyles } from './HeaderStyles';

interface HeaderProps {
  onSignInClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.container}>
        <div style={headerStyles.headerContent}>
          <div 
            style={{ ...headerStyles.logoImage, cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            <img src="/logo.png" alt="PetWhenua Logo" style={headerStyles.logoImage} />
          </div>
          <nav style={headerStyles.nav}>
            <a href="#" style={headerStyles.navLinkActive}>Home</a>
            <a href="#" style={headerStyles.navLink}>Menu1</a>
            <a href="#" style={headerStyles.navLink}>Menu2</a>
          </nav>
          <div style={headerStyles.headerRight}>
            <Button variant="contained" onClick={onSignInClick}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
