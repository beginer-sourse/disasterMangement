import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Users, 
  Crown, 
  Star, 
  Shield, 
  ChevronUp, 
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  credits: number;
  verifiedReportsCount: number;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('credits');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'active'>('all');

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:5000/ws',
    onMessage: (data) => {
      console.log('WebSocket message received in user management:', data);
      if (data.type === 'NEW_USER') {
        // Refresh user list when new user registers
        loadUsers();
        toast.success('New user registered!');
      } else if (data.type === 'USER_UPDATED') {
        // Refresh user list when user is updated (blocked/unblocked)
        loadUsers();
      }
    },
    onOpen: () => {
      console.log('WebSocket connected to user management');
      // Send admin authentication message
      if (currentUser?.token) {
        sendMessage({
          type: 'ADMIN_AUTH',
          token: currentUser.token,
          role: currentUser.role
        });
      }
    },
    onClose: () => {
      console.log('WebSocket disconnected from user management');
    },
    onError: (error) => {
      console.error('WebSocket error in user management:', error);
    }
  });

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-12">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Only admin users can access user management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('disaster-alert-token');
      
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await adminAPI.getAllUsers(token, {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder
      });

      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.pages);
        setTotalUsers(response.pagination.total);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadUsers();
    }
  }, [currentUser, loadUsers]);

  useEffect(() => {
    // Filter users based on search term and status filter
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply status filter
    if (statusFilter === 'blocked') {
      filtered = filtered.filter(user => user.isBlocked);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter(user => !user.isBlocked);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };


  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('disaster-alert-token');
      if (!token) return;

      const response = await adminAPI.deleteUser(token, userId);
      
      if (response.success) {
        toast.success('User deleted successfully');
        loadUsers(); // Reload users
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to block user "${userName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('disaster-alert-token');
      if (!token) return;

      const response = await adminAPI.blockUser(token, userId);
      
      if (response.success) {
        toast.success('User blocked successfully');
        loadUsers(); // Reload users
      } else {
        toast.error('Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Error blocking user');
    }
  };

  const handleUnblockUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to unblock user "${userName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('disaster-alert-token');
      if (!token) return;

      const response = await adminAPI.unblockUser(token, userId);
      
      if (response.success) {
        toast.success('User unblocked successfully');
        loadUsers(); // Reload users
      } else {
        toast.error('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Error unblocking user');
    }
  };

  const getCreditBadgeColor = (credits: number) => {
    if (credits >= 100) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (credits >= 50) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (credits >= 20) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (credits >= 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getCreditLevel = (credits: number) => {
    if (credits >= 100) return { level: 'Expert', icon: Crown, color: 'text-purple-600' };
    if (credits >= 50) return { level: 'Advanced', icon: Star, color: 'text-blue-600' };
    if (credits >= 20) return { level: 'Intermediate', icon: Shield, color: 'text-green-600' };
    if (credits >= 10) return { level: 'Beginner', icon: Users, color: 'text-yellow-600' };
    return { level: 'New', icon: Users, color: 'text-gray-600' };
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {children}
      {sortBy === field && (
        sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </Button>
  );

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active: {users.filter(u => !u.isBlocked).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Blocked: {users.filter(u => u.isBlocked).length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUsers}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credits">Credits</SelectItem>
                  <SelectItem value="verifiedReportsCount">Verified Reports</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Join Date</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'blocked' | 'active')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="name">User</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="credits">Credits</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="verifiedReportsCount">Verified Reports</SortButton>
                </TableHead>
                <TableHead>Level</TableHead>
                <TableHead>
                  <SortButton field="role">Role</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="createdAt">Joined</SortButton>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const creditLevel = getCreditLevel(user.credits);
                const LevelIcon = creditLevel.icon;
                
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {user.isBlocked && (
                              <Badge variant="destructive" className="text-xs">
                                Blocked
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getCreditBadgeColor(user.credits)}>
                        {user.credits} pts
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-600" />
                        {user.verifiedReportsCount}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <LevelIcon className={`h-4 w-4 ${creditLevel.color}`} />
                        <span className="text-sm font-medium">{creditLevel.level}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? (
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Admin
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            User
                          </div>
                        )}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Block/Unblock User */}
                        {user._id !== currentUser?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => user.isBlocked ? handleUnblockUser(user._id, user.name) : handleBlockUser(user._id, user.name)}
                            className={user.isBlocked 
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
                              : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            }
                            title={user.isBlocked ? t('admin.unblockUser') : t('admin.blockUser')}
                          >
                            {user.isBlocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </Button>
                        )}
                        
                        {/* Delete User */}
                        {user._id !== currentUser?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={t('admin.deleteUser')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users have been registered yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
