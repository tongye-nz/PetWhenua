import type { CSSProperties } from 'react';

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
  nav: {
    display: 'flex',
    gap: '2rem',
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
  location: {
    color: '#666',
    fontSize: '0.9rem',
  },
};
