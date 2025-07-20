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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search
} from '@mui/icons-material';
import { LoadingSpinner } from '../components/ui';
import { userAPI, type UserListResponse } from '../api/user.api';
import { ROLE_LABELS } from '../utils/userRoles';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/dateUtils';

interface SortConfig {
  field: keyof UserListResponse;
  direction: 'asc' | 'desc';
}

const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Action loading state
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await userAPI.getAllUsersForAdmin();
      setUsers(usersData);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field] || '';
      const bValue = b[sortConfig.field] || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  const handleSort = (field: keyof UserListResponse) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusToggle = async (user: UserListResponse) => {
    if (user.userId === currentUser?.userId) return; // Prevent self-modification

    try {
      setActionLoading(prev => ({ ...prev, [user.userId]: true }));
      await userAPI.updateUserStatus(user.userId, !user.isActive);
      setSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [user.userId]: false }));
    }
  };

  const handleRoleChange = async (user: UserListResponse, newRole: string) => {
    if (user.userId === currentUser?.userId || !newRole || newRole === user.role) return;

    try {
      setActionLoading(prev => ({ ...prev, [user.userId]: true }));
      await userAPI.updateUserRole(user.userId, newRole);
      setSuccess(`User role updated to ${ROLE_LABELS[newRole as keyof typeof ROLE_LABELS] || newRole} successfully`);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [user.userId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  const getRoleSelect = (user: UserListResponse) => (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <Select
        value={user.role}
        onChange={(e) => handleRoleChange(user, e.target.value)}
        disabled={user.userId === currentUser?.userId || actionLoading[user.userId]}
        sx={{
          '& .MuiSelect-select': {
            py: 1,
            fontSize: '0.875rem'
          }
        }}
             >
         {Object.entries(ROLE_LABELS).map(([value, label]) => (
           <MenuItem key={value} value={value}>
             {label}
           </MenuItem>
         ))}
      </Select>
    </FormControl>
  );

  const getStatusSwitch = (user: UserListResponse) => (
    <FormControlLabel
      control={
        <Switch
          checked={user.isActive}
          onChange={() => handleStatusToggle(user)}
          disabled={user.userId === currentUser?.userId || actionLoading[user.userId]}
          color="success"
        />
      }
      label={user.isActive ? 'Active' : 'Inactive'}
      sx={{
        '& .MuiFormControlLabel-label': {
          fontSize: '0.875rem',
          color: user.isActive ? 'success.main' : 'text.secondary'
        }
      }}
    />
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LoadingSpinner 
          size="large"
          centered
          containerProps={{ minHeight: "60vh" }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts, roles, and permissions
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

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredAndSortedUsers.length} users found
          </Typography>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'userId'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('userId')}
                  >
                    User ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'username'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('username')}
                  >
                    Username
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'email'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'role'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('role')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'createdAt'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('createdAt')}
                  >
                    Registration
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'lastLoginAt'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    Last Login
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.firstName || user.lastName 
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : '-'
                      }
                    </TableCell>
                                         <TableCell>{getRoleSelect(user)}</TableCell>
                     <TableCell>{getStatusSwitch(user)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                         <TableCell>
                       {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                     </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAndSortedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>


    </Container>
  );
};

export default AdminPanel; 