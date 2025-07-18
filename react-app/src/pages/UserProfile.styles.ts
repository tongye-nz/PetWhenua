import type { CSSProperties } from 'react';

export const userProfileStyles: Record<string, CSSProperties> = {
  background: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },

  container: {
    maxWidth: '1400px',
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

  // Layout sections for profile components
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },

  rightSection: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },

  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  // Form field layouts
  nameRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },

  halfWidth: {
    flex: '1 1 50%',
    minWidth: '0',
  },

  textField: {
    width: '100%',
    marginBottom: '1rem',
  },

  // Enhanced Avatar Section
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '1.5rem',
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

  // Profile Summary Stats
  stats: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    width: '100%',
    marginBottom: '1rem',
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

  // Followed Users Section
  followedUsersSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxHeight: '400px',
    overflowY: 'auto',
  },

  followedUsersTitle: {
    marginBottom: '1rem',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1.1rem',
  },

  // Posts Feed Section
  postsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
    maxHeight: '80vh',
    overflowY: 'auto',
  },

  postsSectionTitle: {
    marginBottom: '1rem',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  emptyPostsState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#666',
  },

  emptyPostsIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },

  // Post Card Styles
  postCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

  postCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },

  postHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },

  postAvatar: {
    width: '40px',
    height: '40px',
  },

  postUserInfo: {
    flex: 1,
  },

  postUsername: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.9rem',
  },

  postDate: {
    color: '#666',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  postContent: {
    color: '#444',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },

  postImages: {
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },

  postImage: {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'cover',
  },

  postImageGrid: {
    display: 'grid',
    gap: '0.5rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  },

  postLocation: {
    color: '#666',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  },
};