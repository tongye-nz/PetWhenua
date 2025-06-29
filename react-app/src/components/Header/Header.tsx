import React, { useState } from 'react';
import { headerStyles } from './HeaderStyles';

const Header: React.FC = () => {
  const [hoveredSignIn, setHoveredSignIn] = useState(false);

  const signInBtnStyle = {
    ...headerStyles.signInBtn,
    backgroundColor: hoveredSignIn ? '#f5f5f5' : 'transparent',
  };

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.container}>
        <div style={headerStyles.headerContent}>
          <div style={headerStyles.logoImage}>
            <img src="/logo.png" alt="PetWhenua Logo" style={headerStyles.logoImage} />
          </div>
          <nav style={headerStyles.nav}>
            <a href="#" style={headerStyles.navLinkActive}>Home</a>
            <a href="#" style={headerStyles.navLink}>Menu1</a>
            <a href="#" style={headerStyles.navLink}>Menu2</a>
          </nav>
          <div style={headerStyles.headerRight}>
            <button 
              style={signInBtnStyle}
              onMouseEnter={() => setHoveredSignIn(true)}
              onMouseLeave={() => setHoveredSignIn(false)}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
