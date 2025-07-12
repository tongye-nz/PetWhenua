import type { CSSProperties } from 'react';

export const userProfileStyles: Record<string, CSSProperties> = {
  background: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },

  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },

  title: {
    color: '#333',
    fontWeight: 'bold',
  },

  divider: {
    marginBottom: '2rem',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
  },

  alert: {
    marginBottom: '1.5rem',
    borderRadius: '8px',
  },

  contentContainer: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },

  leftSection: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '400px',
  },

  rightSection: {
    flex: '2',
    minWidth: '400px',
  },

  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },

  avatar: {
    width: '120px',
    height: '120px',
    fontSize: '2.5rem',
    backgroundColor: '#667eea',
    marginBottom: '1rem',
    border: '4px solid white',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },

  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },

  uploadButton: {
    backgroundColor: '#667eea',
    color: 'white',
    width: '40px',
    height: '40px',
  },

  uploadText: {
    marginTop: '0.5rem',
    color: '#666',
    fontSize: '0.75rem',
  },

  stats: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    width: '100%',
  },

  statNumber: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },

  statLabel: {
    color: '#666',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },

  joinDate: {
    color: '#888',
    fontSize: '0.875rem',
  },

  formSection: {
    width: '100%',
  },

  nameRow: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },

  halfWidth: {
    flex: '1',
    minWidth: '0',
  },

  textField: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
  },
}; 