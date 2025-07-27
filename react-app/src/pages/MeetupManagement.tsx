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
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
  Divider
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  LocationOn,
  CalendarToday,
  Person,
  AccessTime
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [meetups, setMeetups] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail dialog state
  const [selectedMeetup, setSelectedMeetup] = useState<Post | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadPendingMeetups();
  }, []);

  // Update rows per page when screen size changes
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
    setPage(0);
  }, [isMobile]);

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
    const filtered = meetups.filter(meetup => {
      const matchesSearch = 
        meetup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meetup.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meetup.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meetup.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort meetups
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
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
    
    setActionLoading(prev => ({ ...prev, [meetup.postId]: true }));
    try {
      await postService.changePostStatus(meetup.postId, PostStatus.Active, currentUser.userId, currentUser.role);
      setSuccess(`Meetup "${meetup.title}" has been approved successfully.`);
      await loadPendingMeetups();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Failed to approve meetup:', err);
      setError('Failed to approve meetup. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [meetup.postId]: false }));
    }
  };

  const handleReject = async (meetup: Post) => {
    if (!currentUser) return;
    
    setActionLoading(prev => ({ ...prev, [meetup.postId]: true }));
    try {
      await postService.changePostStatus(meetup.postId, PostStatus.Inactive, currentUser.userId, currentUser.role);
      setSuccess(`Meetup "${meetup.title}" has been rejected.`);
      await loadPendingMeetups();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Failed to reject meetup:', err);
      setError('Failed to reject meetup. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [meetup.postId]: false }));
    }
  };

  const handleViewDetails = (meetup: Post) => {
    setSelectedMeetup(meetup);
    setDetailDialogOpen(true);
  };

  const getStatusChip = (status: PostStatus | string) => {
    if (status === PostStatus.Pending || status === 'Pending') {
      return <Chip label="Pending" color="warning" size="small" />;
    }
    if (status === PostStatus.Active || status === 'Active') {
      return <Chip label="Active" color="success" size="small" />;
    }
    if (status === PostStatus.Inactive || status === 'Inactive') {
      return <Chip label="Rejected" color="error" size="small" />;
    }
    return <Chip label={status.toString()} size="small" />;
  };

  // Mobile Card Component
  const MeetupCard: React.FC<{ meetup: Post }> = ({ meetup }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3" sx={{ 
              fontSize: '1.1rem',
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 0.5,
              wordBreak: 'break-word'
            }}>
              {meetup.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {meetup.content}
            </Typography>
          </Box>
          <Box sx={{ ml: 2, flexShrink: 0 }}>
            {getStatusChip(meetup.status)}
          </Box>
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person fontSize="small" color="action" />
            <Typography variant="body2">
              {meetup.user?.username || 'Unknown'}
            </Typography>
          </Box>
          
          {meetup.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {meetup.location}
              </Typography>
            </Box>
          )}

          {meetup.eventDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2">
                {formatDateTime(meetup.eventDate)}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created {formatDateTime(meetup.createdAt)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => handleViewDetails(meetup)}
            sx={{ flex: 1, minWidth: 'fit-content' }}
          >
            View
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => handleApprove(meetup)}
            disabled={actionLoading[meetup.postId]}
            sx={{ flex: 1, minWidth: 'fit-content' }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleReject(meetup)}
            disabled={actionLoading[meetup.postId]}
            sx={{ flex: 1, minWidth: 'fit-content' }}
          >
            Reject
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontSize: { xs: '1.75rem', md: '2.125rem' },
        fontWeight: 600 
      }}>
        Meetup Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve pending meetup posts
      </Typography>

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
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <TextField
          fullWidth
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
          sx={{ 
            maxWidth: { xs: '100%', md: 600 },
            '& .MuiInputBase-root': {
              fontSize: { xs: '0.9rem', md: '1rem' }
            }
          }}
        />
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredAndSortedMeetups.length} pending meetup{filteredAndSortedMeetups.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Mobile/Tablet Card Layout */}
      {isMobile ? (
        <Box>
          {filteredAndSortedMeetups
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((meetup) => (
              <MeetupCard key={meetup.postId} meetup={meetup} />
            ))}
          
          {filteredAndSortedMeetups.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No pending meetups found.
              </Typography>
            </Paper>
          )}

          {/* Mobile Pagination */}
          <Paper sx={{ mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              component="div"
              count={filteredAndSortedMeetups.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Paper>
        </Box>
      ) : (
        /* Desktop Table Layout */
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
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                          {meetup.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
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
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {meetup.location || 'Not specified'}
                        </Typography>
                        {meetup.address && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ wordBreak: 'break-word' }}>
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
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
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
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            ...(isMobile && {
              m: 0,
              height: '100%',
              maxHeight: '100%'
            })
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          pb: 1
        }}>
          Meetup Details
        </DialogTitle>
        <DialogContent>
          {selectedMeetup && (
            <Box sx={{ mt: 1 }}>
              <Card>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    wordBreak: 'break-word'
                  }}>
                    {selectedMeetup.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {getStatusChip(selectedMeetup.status)}
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      Created by {selectedMeetup.user?.username || 'Unknown'} on {formatDateTime(selectedMeetup.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" paragraph sx={{ wordBreak: 'break-word' }}>
                    {selectedMeetup.content}
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {selectedMeetup.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {selectedMeetup.location}
                        </Typography>
                      </Box>
                    )}

                    {selectedMeetup.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3, wordBreak: 'break-word' }}>
                        {selectedMeetup.address}
                      </Typography>
                    )}

                    {selectedMeetup.eventDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDateTime(selectedMeetup.eventDate)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {selectedMeetup.category && (
                    <Chip label={selectedMeetup.category} size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => setDetailDialogOpen(false)}
            sx={{ 
              order: { xs: 3, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
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
                sx={{ 
                  order: { xs: 2, sm: 2 },
                  width: { xs: '100%', sm: 'auto' }
                }}
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
                sx={{ 
                  order: { xs: 1, sm: 3 },
                  width: { xs: '100%', sm: 'auto' }
                }}
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