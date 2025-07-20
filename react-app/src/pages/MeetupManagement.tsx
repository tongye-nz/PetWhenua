import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';
import { LoadingSpinner } from '../components/ui';
import { postService } from '../api/post.api';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/dateUtils';
import { PostStatus } from '../models/post.types';
import type { Post } from '../models/post.types';

interface SortConfig {
  field: keyof Post;
  direction: 'asc' | 'desc';
}

const MeetupManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [meetups, setMeetups] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail dialog state
  const [selectedMeetup, setSelectedMeetup] = useState<Post | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadPendingMeetups();
  }, []);

  const loadPendingMeetups = async () => {
    try {
      setLoading(true);
      setError('');
      const meetupsData = await postService.getPendingMeetupPosts();
      setMeetups(meetupsData);
    } catch (err: any) {
      console.error('Failed to load pending meetups:', err);
      setError('Failed to load pending meetups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort meetups
  const filteredAndSortedMeetups = useMemo(() => {
    let filtered = meetups.filter(meetup => {
      const matchesSearch = 
        meetup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meetup.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meetup.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meetup.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort meetups
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field] || '';
      const bValue = b[sortConfig.field] || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [meetups, searchTerm, sortConfig]);

  const handleSort = (field: keyof Post) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleApprove = async (meetup: Post) => {
    if (!currentUser) return;

    try {
      setActionLoading(prev => ({ ...prev, [meetup.postId]: true }));
      await postService.changePostStatus(meetup.postId, PostStatus.Active, currentUser.userId, currentUser.role);
      setSuccess(`Meetup "${meetup.title}" has been approved successfully`);
      await loadPendingMeetups();
    } catch (err: any) {
      setError(err.message || 'Failed to approve meetup. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [meetup.postId]: false }));
    }
  };

  const handleReject = async (meetup: Post) => {
    if (!currentUser) return;

    try {
      setActionLoading(prev => ({ ...prev, [meetup.postId]: true }));
      await postService.changePostStatus(meetup.postId, PostStatus.Inactive, currentUser.userId, currentUser.role);
      setSuccess(`Meetup "${meetup.title}" has been rejected`);
      await loadPendingMeetups();
    } catch (err: any) {
      setError(err.message || 'Failed to reject meetup. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [meetup.postId]: false }));
    }
  };

  const handleViewDetails = (meetup: Post) => {
    setSelectedMeetup(meetup);
    setDetailDialogOpen(true);
  };

  const getStatusChip = (status: number | string) => {
    // Handle both numeric and string enum values
    if (status === PostStatus.Pending || status === 'Pending') {
      return <Chip label="Pending" color="warning" size="small" />;
    }
    if (status === PostStatus.Active || status === 'Active') {
      return <Chip label="Active" color="success" size="small" />;
    }
    if (status === PostStatus.Inactive || status === 'Inactive') {
      return <Chip label="Rejected" color="error" size="small" />;
    }
    return <Chip label="Unknown" color="default" size="small" />;
  };

  if (loading) {
    return (
      <LoadingSpinner 
        size="large"
        centered
        containerProps={{ minHeight: "60vh" }}
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Meetup Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve pending meetup posts
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          placeholder="Search meetups by title, content, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 400 }}
        />
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredAndSortedMeetups.length} pending meetup{filteredAndSortedMeetups.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Meetups Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'title'}
                    direction={sortConfig.field === 'title' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>Creator</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'eventDate'}
                    direction={sortConfig.field === 'eventDate' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('eventDate')}
                  >
                    Event Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'createdAt'}
                    direction={sortConfig.field === 'createdAt' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created At
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedMeetups
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((meetup) => (
                  <TableRow key={meetup.postId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {meetup.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {meetup.content.length > 50 
                          ? `${meetup.content.substring(0, 50)}...` 
                          : meetup.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {meetup.user?.username || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {meetup.location || 'Not specified'}
                      </Typography>
                      {meetup.address && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {meetup.address}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {meetup.eventDate ? (
                        <Typography variant="body2">
                          {formatDateTime(meetup.eventDate)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not set
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(meetup.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(meetup.status)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(meetup)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(meetup)}
                            disabled={actionLoading[meetup.postId]}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(meetup)}
                            disabled={actionLoading[meetup.postId]}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedMeetups.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Meetup Details
        </DialogTitle>
        <DialogContent>
          {selectedMeetup && (
            <Box sx={{ mt: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedMeetup.title}
                  </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {getStatusChip(selectedMeetup.status)}
                      <Typography variant="body2" color="text.secondary">
                        Created by {selectedMeetup.user?.username || 'Unknown'} on {formatDateTime(selectedMeetup.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {selectedMeetup.content}
                    </Typography>

                    {selectedMeetup.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedMeetup.location}
                        </Typography>
                      </Box>
                    )}

                    {selectedMeetup.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 1 }}>
                        {selectedMeetup.address}
                      </Typography>
                    )}

                    {selectedMeetup.eventDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDateTime(selectedMeetup.eventDate)}
                        </Typography>
                      </Box>
                    )}

                    {selectedMeetup.category && (
                      <Chip label={selectedMeetup.category} size="small" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
          {selectedMeetup && (
            <>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  handleReject(selectedMeetup);
                  setDetailDialogOpen(false);
                }}
                disabled={actionLoading[selectedMeetup.postId]}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  handleApprove(selectedMeetup);
                  setDetailDialogOpen(false);
                }}
                disabled={actionLoading[selectedMeetup.postId]}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetupManagement; 