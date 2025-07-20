import React from 'react';
import { Box } from '@mui/material';
import { Text } from '../../../ui';

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
      p: 2,
      bgcolor: 'action.hover',
      borderRadius: 2,
      mt: 2,
    }}>
      {stats.map((stat, index) => (
        <Box key={index} sx={{ textAlign: 'center' }}>
          <Text variant="h6" weight="bold" sx={{ color: 'success.main' }}>
            {stat.value}
          </Text>
          <Text variant="body2" sx={{ color: 'text.secondary' }}>
            {stat.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default ProfileStats;
