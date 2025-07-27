import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { PaginationInfo } from '../../../models/pagination.types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    onPageSizeChange(Number(event.target.value));
  };

  if (pagination.totalCount === 0) {
    return null;
  }

  const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mt: 3,
        mb: 2
      }}
    >
      {/* Results info */}
      <Typography variant="body2" color="text.secondary">
        Showing {startItem} to {endItem} of {pagination.totalCount} results
      </Typography>

      {/* Pagination controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        {/* Page size selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Posts per page</InputLabel>
          <Select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            label="Posts per page"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
          </Select>
        </FormControl>

        {/* Page navigation */}
        {pagination.totalPages > 1 && (
          <MuiPagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="medium"
          />
        )}
      </Stack>
    </Box>
  );
}; 