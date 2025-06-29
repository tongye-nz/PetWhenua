import type { CSSProperties } from 'react';

export const footerStyles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  footer: {
    background: '#f8f9fa',
    padding: '2rem 0',
    borderTop: '1px solid #eee',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  logoImage: {
    height: '1.8rem',
    width: 'auto',
    objectFit: 'contain' as const,
  },
  footerLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  footerLink: {
    textDecoration: 'none',
    color: '#666',
    fontSize: '0.9rem',
    transition: 'color 0.3s ease',
  },
  socialLinks: {
    display: 'flex',
    gap: '1rem',
  },
  socialLink: {
    textDecoration: 'none',
    fontSize: '1.2rem',
    transition: 'transform 0.3s ease',
  },
};
