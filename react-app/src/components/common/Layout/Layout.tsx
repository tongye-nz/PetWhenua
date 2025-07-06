import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../organisms';
import { Footer } from '../../organisms';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onSignInClick={handleSignInClick} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 