import React from 'react';
import { Box, Typography } from '@mui/material';

export interface ProfileStatsProps {
  petCount: number;
  postsCount: number;
  followersCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  petCount,
  postsCount,
  followersCount,
}) => {
  const stats = [
    { label: 'Pets', value: petCount },
    { label: 'Posts', value: postsCount },
    { label: 'Followers', value: followersCount },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      padding: 2,
      backgroundColor: '#f5f5f5',
      borderRadius: 2,
      marginTop: 2,
    }}>
      {stats.map((stat, index) => (
        <Box key={index} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
            {stat.value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {stat.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ProfileStats;
