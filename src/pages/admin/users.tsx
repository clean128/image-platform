// New admin users page component
import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks/use-api';
import { addToast } from '@heroui/react';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'user' | 'admin';
  isApproved: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'none';
  createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<'all' | 'user' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'approved' | 'pending'>('all');
  const [filterSubscription, setFilterSubscription] = React.useState<'all' | 'active' | 'trial' | 'expired' | 'none'>('all');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const rowsPerPage = 10;
  
  React.useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast({
        title: t('admin.fetchError'),
        description: t('admin.fetchUsersErrorMessage'),
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/approve`);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isApproved: true } : user
      ));
      
      addToast({
        title: t('admin.userApproved'),
        description: t('admin.userApprovedMessage'),
        color: 'success'
      });
    } catch (error) {
      console.error('Error approving user:', error);
      addToast({
        title: t('admin.approvalError'),
        description: t('admin.approvalErrorMessage'),
        color: 'danger'
      });
    }
  };
  
  const handleBlockUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/block`);
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      addToast({
        title: t('admin.userBlocked'),
        description: t('admin.userBlockedMessage'),
        color: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Error blocking user:', error);
      addToast({
        title: t('admin.blockError'),
        description: t('admin.blockErrorMessage'),
        color: 'danger'
      });
    }
  };
  
  const filteredUsers = React.useMemo(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.email.toLowerCase().includes(lowerSearchTerm) ||
          user.username.toLowerCase().includes(lowerSearchTerm) ||
          user.fullName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'approved' ? user.isApproved : !user.isApproved
      );
    }
    
    // Apply subscription filter
    if (filterSubscription !== 'all') {
      filtered = filtered.filter(user => user.subscriptionStatus === filterSubscription);
    }
    
    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, filterSubscription]);
  
  // Pagination
  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const renderCell = (user: User, columnKey: string) => {
    switch (columnKey) {
      case 'user':
        return (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">{user.fullName || user.username}</p>
              <p className="text-default-500 text-xs">@{user.username}</p>
            </div>
          </div>
        );
      case 'email':
        return <p>{user.email}</p>;
      case 'role':
        return (
          <Chip
            color={user.role === 'admin' ? 'danger' : 'primary'}
            size="sm"
            variant="flat"
          >
            {user.role}
          </Chip>
        );
      case 'status':
        return (
          <Chip
            color={user.isApproved ? 'success' : 'warning'}
            size="sm"
            variant="flat"
          >
            {user.isApproved ? t('admin.approved') : t('admin.pending')}
          </Chip>
        );
      case 'subscription':
        return (
          <Chip
            color={
              user.subscriptionStatus === 'active' ? 'success' :
              user.subscriptionStatus === 'trial' ? 'primary' :
              user.subscriptionStatus === 'expired' ? 'warning' : 'default'
            }
            size="sm"
            variant="flat"
          >
            {t(`subscription.status.${user.subscriptionStatus}`)}
          </Chip>
        );
      case 'createdAt':
        return <p>{new Date(user.createdAt).toLocaleDateString()}</p>;
      case 'actions':
        return (
          <div className="flex gap-2">
            {!user.isApproved && (
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="success"
                onPress={() => handleApproveUser(user.id)}
              >
                <Icon icon="lucide:check" width={16} />
              </Button>
            )}
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => {
                setSelectedUser(user);
                onOpen();
              }}
            >
              <Icon icon="lucide:ban" width={16} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {t('admin.manageUsers')}
          </h1>
          <p className="text-default-600">
            {t('admin.manageUsersDescription')}
          </p>
        </div>
        
        <Button
          color="primary"
          startContent={<Icon icon="lucide:refresh-cw" />}
          onPress={fetchUsers}
          isLoading={loading}
        >
          {t('admin.refreshList')}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder={t('admin.searchUsers')}
          value={searchTerm}
          onValueChange={setSearchTerm}
          startContent={<Icon icon="lucide:search" />}
          className="md:max-w-xs"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<Icon icon="lucide:chevron-down" width={16} />}
              >
                {t(`admin.roles.${filterRole}`)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by role"
              onAction={(key) => setFilterRole(key as any)}
            >
              <DropdownItem key="all">{t('admin.roles.all')}</DropdownItem>
              <DropdownItem key="user">{t('admin.roles.user')}</DropdownItem>
              <DropdownItem key="admin">{t('admin.roles.admin')}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<Icon icon="lucide:chevron-down" width={16} />}
              >
                {t(`admin.status.${filterStatus}`)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by status"
              onAction={(key) => setFilterStatus(key as any)}
            >
              <DropdownItem key="all">{t('admin.status.all')}</DropdownItem>
              <DropdownItem key="approved">{t('admin.status.approved')}</DropdownItem>
              <DropdownItem key="pending">{t('admin.status.pending')}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<Icon icon="lucide:chevron-down" width={16} />}
              >
                {t(`admin.subscription.${filterSubscription}`)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by subscription"
              onAction={(key) => setFilterSubscription(key as any)}
            >
              <DropdownItem key="all">{t('admin.subscription.all')}</DropdownItem>
              <DropdownItem key="active">{t('admin.subscription.active')}</DropdownItem>
              <DropdownItem key="trial">{t('admin.subscription.trial')}</DropdownItem>
              <DropdownItem key="expired">{t('admin.subscription.expired')}</DropdownItem>
              <DropdownItem key="none">{t('admin.subscription.none')}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      
      <Table
        aria-label="Users table"
        removeWrapper
        bottomContent={
          pages > 0 ? (
            <div className="flex justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn key="user">{t('admin.columns.user')}</TableColumn>
          <TableColumn key="email">{t('admin.columns.email')}</TableColumn>
          <TableColumn key="role">{t('admin.columns.role')}</TableColumn>
          <TableColumn key="status">{t('admin.columns.status')}</TableColumn>
          <TableColumn key="subscription">{t('admin.columns.subscription')}</TableColumn>
          <TableColumn key="createdAt">{t('admin.columns.createdAt')}</TableColumn>
          <TableColumn key="actions">{t('admin.columns.actions')}</TableColumn>
        </TableHeader>
        <TableBody
          items={paginatedUsers}
          loadingContent={
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
          loadingState={loading ? "loading" : "idle"}
          emptyContent={
            <div className="text-center py-6">
              <p className="text-default-500">{t('admin.noUsersFound')}</p>
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey.toString())}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t('admin.blockUser')}</ModalHeader>
              <ModalBody>
                <p>
                  {t('admin.blockUserConfirmation', { 
                    name: selectedUser?.fullName || selectedUser?.username || '' 
                  })}
                </p>
                <p className="text-danger text-sm mt-2">
                  {t('admin.blockUserWarning')}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  color="danger" 
                  onPress={() => selectedUser && handleBlockUser(selectedUser.id)}
                >
                  {t('admin.blockUser')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;