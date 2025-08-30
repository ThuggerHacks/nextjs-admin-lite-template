'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Row,
  Col,
  Statistic,
  Tooltip,
  Drawer,
  Dropdown,
  MenuProps,
  Typography,

} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  DownOutlined,
  CheckOutlined,
  CloseOutlined,
  ExportOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  FolderOpenOutlined,
  UploadOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole, UserStatus } from '@/types';
import FileManager from '@/components/FileManager/FileManager';
import EnhancedFileManager from '@/components/EnhancedFileManager';
import { userService } from '@/lib/services/userService';
import { departmentService } from '@/lib/services/departmentService';
import type { User as UserType } from '@/lib/services/userService';
import type { Department } from '@/lib/services/departmentService';
import { SupervisorRoute } from '@/components/auth/RouteGuard';

const { TextArea } = Input;
const { Title } = Typography;

export default function UserManagementPage() {
  // Add custom styles for mobile drawer
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mobile-full-drawer .ant-drawer-content-wrapper {
        width: 100vw !important;
        height: 100vh !important;
      }
      .mobile-full-drawer .ant-drawer-content {
        border-radius: 0 !important;
        height: 100vh !important;
      }
      .mobile-full-drawer .ant-drawer-body {
        padding: 4px !important;
        height: calc(100vh - 60px) !important;
        overflow: auto !important;
      }
      .mobile-full-drawer .ant-drawer-header {
        padding: 8px 12px !important;
        height: 60px !important;
        border-bottom: 1px solid #f0f0f0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userFilesDrawerVisible, setUserFilesDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [screenSize, setScreenSize] = useState('lg');
  
  const { user, hasRole, canAccess } = useUser();
  const { t } = useTranslation();

  // Handle screen size changes for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 992) setScreenSize('md');
      else if (width < 1200) setScreenSize('lg');
      else setScreenSize('xl');
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load users
  const loadUsers = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      
      // For supervisors and admins, only fetch users from their department
      const params: any = { page, limit };
      if ((hasRole(UserRole.SUPERVISOR) || hasRole(UserRole.ADMIN)) && user?.departmentId) {
        params.departmentId = user.departmentId;
      }
      
      const response = await userService.getAll(params);
      setUsers(response.users);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t, hasRole, user?.departmentId]);

  // Load departments for dropdown
  const loadDepartments = useCallback(async () => {
    try {
      setDepartmentsLoading(true);
      const departments = await departmentService.getAllDepartments();
      setDepartments(departments);
    } catch (error) {
      console.error('Failed to load departments:', error);
      message.error(t('common.error'));
    } finally {
      setDepartmentsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
    loadDepartments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to avoid infinite loops

  // Filter users based on current user role and filters
  const getFilteredUsers = () => {
    let filteredUsers = users; // Backend already filters by department for supervisors/admins

    // Apply search filter
    if (searchText) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }

    // Apply department filter (only for super admins who can see all departments)
    if (departmentFilter && (hasRole(UserRole.SUPER_ADMIN) || hasRole(UserRole.DEVELOPER))) {
      filteredUsers = filteredUsers.filter(user => user.departmentId === departmentFilter);
    }

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  // Calculate statistics based on filtered users
  const stats = {
    total: filteredUsers.length,
    superAdmins: filteredUsers.filter(u => u.role === UserRole.SUPER_ADMIN).length,
    admins: filteredUsers.filter(u => u.role === UserRole.ADMIN).length,
    normalUsers: filteredUsers.filter(u => u.role === UserRole.USER).length,
    activeUsers: filteredUsers.filter(u => u.status === UserStatus.ACTIVE).length,
    inactiveUsers: filteredUsers.filter(u => u.status === UserStatus.INACTIVE).length,
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (userData: UserType) => {
    setEditingUser(userData);
    form.setFieldsValue({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      departmentId: userData.departmentId,
      phone: userData.phone,
      status: userData.status,
    });
    setIsModalVisible(true);
  };

  const handlePromoteToSuperAdmin = async (userId: string) => {
    try {
      const updatedUser = await userService.promoteToSuperAdmin(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      message.success(t('common.success'));
    } catch (error) {
      console.error('Failed to promote user:', error);
      message.error(t('common.error'));
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await userService.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      message.success(t('common.success'));
    } catch (error) {
      console.error('Failed to remove user:', error);
      message.error(t('common.error'));
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    try {
      const result = await userService.resetPassword(userId);
      
      // Show the temporary password in a modal
      Modal.info({
        title: t('users.passwordReset'),
        content: (
          <div>
            <p><strong>{t('users.email')}:</strong> {userEmail}</p>
            <p><strong>{t('users.temporaryPassword')}:</strong> 
              <code style={{ background: '#f0f0f0', padding: '4px 8px', margin: '0 8px', borderRadius: '4px' }}>
                {result.tempPassword}
              </code>
            </p>
            {/* <p style={{ color: '#666' }}>{t('users.emailSent')}</p> */}
          </div>
        ),
        width: 500,
      });
    } catch (error) {
      console.error('Failed to reset password:', error);
      message.error(t('common.error'));
    }
  };

  const handleViewUserFiles = (userId: string) => {
    setSelectedUserId(userId);
    setUserFilesDrawerVisible(true);
  };

  const handleExportToPDF = async () => {
    try {
      setLoading(true);
      const csvContent = await userService.exportToCSV();
      
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Users exported successfully');
    } catch (error) {
      console.error('Failed to export users:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };



  const handleSaveUser = async (values: any) => {
    setLoading(true);
    try {
      const userData = {
        name: values.name,
        email: values.email,
        role: values.role || UserRole.USER,
        departmentId: values.departmentId,
        phone: values.phone,
        status: values.status,
      };

      if (editingUser) {
        // Update existing user
        const updatedUser = await userService.update(editingUser.id, userData);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
        // Create new user
        const newUser = await userService.create(userData);
        setUsers(prev => [...prev, newUser]);
      }

      setIsModalVisible(false);
      form.resetFields();
      message.success(t('common.success'));
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleTag = (role: UserRole) => {
    const roleColors: Record<string, string> = {
      [UserRole.SUPER_ADMIN]: 'red',
      [UserRole.ADMIN]: 'orange',
      [UserRole.USER]: 'blue',
      [UserRole.SUPERVISOR]: 'green',
    };

    const roleLabels: Record<string, string> = {
      [UserRole.SUPER_ADMIN]: t('users.superAdmins'),
      [UserRole.ADMIN]: t('users.admins'),
      [UserRole.USER]: t('users.normalUsers'),
      [UserRole.SUPERVISOR]: t('users.supervisors'),
    };

    return (
      <Tag color={roleColors[role] || 'default'} icon={role === UserRole.SUPER_ADMIN ? <CrownOutlined /> : undefined}>
        {roleLabels[role] || role}
      </Tag>
    );
  };

  const getStatusTag = (status: UserStatus) => {
    return (
      <Tag color={status === UserStatus.ACTIVE ? 'green' : 'red'}>
        {status === UserStatus.ACTIVE ? t('common.active') : t('common.inactive')}
      </Tag>
    );
  };

  const getUserActions = (userData: UserType): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'edit',
        label: t('users.editUser'),
        icon: <EditOutlined />,
        onClick: () => handleEditUser(userData),
      },
      {
        key: 'files',
        label: t('users.viewFiles'),
        icon: <FolderOpenOutlined />,
        onClick: () => handleViewUserFiles(userData.id),
      },
    ];

    // Super admin specific actions
    if (hasRole(UserRole.SUPER_ADMIN)) {
      if (userData.role !== UserRole.SUPER_ADMIN) {
        items.push({
          key: 'promote',
          label: t('users.promoteToSuperAdmin'),
          icon: <CrownOutlined />,
          onClick: () => handlePromoteToSuperAdmin(userData.id),
        });
      }
      
      items.push({
        key: 'reset-password',
        label: t('users.resetPassword'),
        icon: <LockOutlined />,
        onClick: () => handleResetPassword(userData.id, userData.email),
      });
      
      // Only show remove option if target user is not a super admin
      if (userData.role !== UserRole.SUPER_ADMIN) {
        items.push({
          key: 'remove',
          label: (
            <Popconfirm
              title={t('users.removeUserConfirm')}
              description={t('users.removeUserWarning')}
              onConfirm={() => handleRemoveUser(userData.id)}
              okText={t('common.yes')}
              cancelText={t('common.no')}
              okType="danger"
            >
              <span>{t('users.removeUser')}</span>
            </Popconfirm>
          ),
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {}, // Empty onClick since Popconfirm handles the action
        });
      }
    }

    // Supervisors and Admins can reset passwords for users in their department
    if ((hasRole(UserRole.SUPERVISOR) || hasRole(UserRole.ADMIN)) && 
        userData.departmentId === user?.departmentId) {
      items.push({
        key: 'reset-password',
        label: t('users.resetPassword'),
        icon: <LockOutlined />,
        onClick: () => handleResetPassword(userData.id, userData.email),
      });
    }

    return items;
  };

  const columns = [
    {
      title: t('users.user'),
      key: 'user',
      width: screenSize === 'xs' || screenSize === 'sm' ? 200 : screenSize === 'md' ? 220 : 250,
      fixed: screenSize !== 'xs' && screenSize !== 'sm' ? 'left' as const : false,
      render: (record: UserType) => (
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size={screenSize === 'xs' || screenSize === 'sm' ? "small" : "default"} icon={<UserOutlined />} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="font-medium truncate" style={{ 
                maxWidth: screenSize === 'xs' || screenSize === 'sm' ? 120 : screenSize === 'md' ? 150 : 180 
              }}>
                {record.name}
              </div>
              <div className="text-gray-500 text-sm truncate" style={{ 
                maxWidth: screenSize === 'xs' || screenSize === 'sm' ? 120 : screenSize === 'md' ? 150 : 180 
              }}>
                {record.email}
              </div>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      key: 'role',
      width: screenSize === 'xs' || screenSize === 'sm' ? 80 : screenSize === 'md' ? 100 : 120,
      render: (role: UserRole) => getRoleTag(role),
      responsive: screenSize === 'xs' ? ['md' as const] : undefined,
    },
    {
      title: t('users.department'),
      dataIndex: 'departmentId',
      key: 'department',
      width: screenSize === 'xs' || screenSize === 'sm' ? 120 : screenSize === 'md' ? 135 : 150,
      render: (departmentId: string, record: UserType) => {
        const department = departments.find(d => d.id === departmentId);
        const deptName = department?.name || record.department?.name || 'N/A';
        const maxWidth = screenSize === 'xs' || screenSize === 'sm' ? 100 : screenSize === 'md' ? 120 : 140;
        return (
          <div className="truncate" style={{ maxWidth }} title={deptName}>
            {deptName}
          </div>
        );
      },
      responsive: screenSize === 'xs' ? ['sm' as const] : undefined,
    },
    {
      title: t('users.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: screenSize === 'xs' || screenSize === 'sm' ? 110 : 130,
      render: (phone: string) => phone || 'N/A',
      responsive: screenSize === 'xs' || screenSize === 'sm' ? ['lg' as const] : undefined,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: screenSize === 'xs' || screenSize === 'sm' ? 80 : 100,
      render: (status: UserStatus) => getStatusTag(status),
    },
    {
      title: t('users.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: screenSize === 'xs' || screenSize === 'sm' ? 100 : 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
      responsive: screenSize === 'xs' || screenSize === 'sm' ? ['xl' as const] : undefined,
    },
    {
      title: t('users.actions'),
      key: 'actions',
      width: screenSize === 'xs' || screenSize === 'sm' ? 60 : 120,
      fixed: screenSize !== 'xs' && screenSize !== 'sm' ? 'right' as const : false,
      render: (record: UserType) => (
        <Dropdown menu={{ items: getUserActions(record) }} trigger={['click']}>
          <Button 
            size={screenSize === 'xs' || screenSize === 'sm' ? "small" : "middle"} 
            icon={<MoreOutlined />}
          >
            {screenSize !== 'xs' && screenSize !== 'sm' ? t('users.actions') : ''}
          </Button>
        </Dropdown>
      ),
    },
  ];

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6 -m-2">
      <style jsx>{`
        .users-table-responsive {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          -webkit-overflow-scrolling: touch;
          margin: 0;
          padding: 0;
          border-radius: 8px;
        }
        
        .users-table-responsive .ant-table {
          min-width: 800px;
          width: 100%;
        }
        
        .users-table-responsive .ant-table-container {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        
        .users-table-responsive .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
          white-space: nowrap;
          padding: 12px 8px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .users-table-responsive .ant-table-tbody > tr:hover > td {
          background: #f8f9fa !important;
        }
        
        .users-table-responsive .ant-table-tbody > tr > td {
          white-space: nowrap;
          padding: 12px 8px;
          vertical-align: top;
        }
        
        .users-table-responsive .ant-table-tbody > tr > td:first-child {
          position: sticky;
          left: 0;
          background: white;
          z-index: 5;
        }
        
        .users-table-responsive .ant-table-tbody > tr > td:last-child {
          position: sticky;
          right: 0;
          background: white;
          z-index: 5;
        }
        
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .users-table-responsive .ant-table {
            min-width: 700px;
            font-size: 12px;
          }
          
          .users-table-responsive .ant-table-thead > tr > th,
          .users-table-responsive .ant-table-tbody > tr > td {
            padding: 8px 4px;
            font-size: 12px;
          }
          
          .users-table-responsive .ant-table-tbody > tr > td:first-child,
          .users-table-responsive .ant-table-tbody > tr > td:last-child {
            background: #fafafa;
          }
        }
        
        /* Tablet optimizations */
        @media (min-width: 769px) and (max-width: 1024px) {
          .users-table-responsive .ant-table {
            min-width: 800px;
          }
        }
        
        /* Desktop and larger screens */
        @media (min-width: 1025px) {
          .users-table-responsive .ant-table {
            min-width: 100%;
          }
        }
        
        /* Ultra-wide screens */
        @media (min-width: 1440px) {
          .space-y-6 {
            max-width: 1600px;
            margin: 0 auto;
          }
        }
        
        /* Improved card responsiveness */
        .ant-card .ant-card-head {
          padding: 12px 16px;
        }
        
        .ant-card .ant-card-body {
          padding: 16px;
        }
        
        @media (max-width: 768px) {
          .ant-card .ant-card-head {
            padding: 8px 12px;
          }
          .ant-card .ant-card-body {
            padding: 12px;
          }
        }
        
        /* Table scrollbar styling */
        .users-table-responsive::-webkit-scrollbar {
          height: 8px;
        }
        
        .users-table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .users-table-responsive::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        .users-table-responsive::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Ensure proper spacing in table cells */
        .users-table-responsive .ant-table-cell {
          word-break: keep-all;
          white-space: nowrap;
        }
        
        /* Responsive table wrapper */
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        /* Responsive File Drawer */
        .responsive-file-drawer .ant-drawer-body {
          padding: 12px;
        }
        
        .responsive-file-drawer .ant-drawer-header {
          padding: 12px 16px;
        }
        
        .responsive-file-drawer .ant-drawer-header-title {
          font-size: 16px;
          font-weight: 600;
        }
        
        .responsive-file-drawer .ant-drawer-close {
          font-size: 16px;
        }
        
        .file-manager-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        
        /* Mobile optimizations for drawer */
        @media (max-width: 768px) {
          .responsive-file-drawer .ant-drawer-body {
            padding: 12px;
          }
          
          .responsive-file-drawer .ant-drawer-header {
            padding: 12px 16px;
          }
          
          .responsive-file-drawer .ant-drawer-header-title {
            font-size: 14px;
          }
          
          .responsive-file-drawer .ant-drawer-close {
            font-size: 14px;
          }
          
          /* Ensure drawer takes full height on mobile */
          .responsive-file-drawer.ant-drawer-bottom {
            height: 100vh !important;
            max-height: 100vh !important;
          }
          
          /* Optimize file manager for mobile */
          .file-manager-container {
            height: calc(100vh - 120px);
            overflow: hidden;
          }
        }
        
        /* Tablet optimizations */
        @media (min-width: 769px) and (max-width: 1024px) {
          .responsive-file-drawer .ant-drawer-body {
            padding: 16px;
          }
          
          .responsive-file-drawer .ant-drawer-header {
            padding: 16px 20px;
          }
          
          .file-manager-container {
            height: calc(100vh - 140px);
          }
        }
        
        /* Desktop optimizations */
        @media (min-width: 1025px) {
          .responsive-file-drawer .ant-drawer-body {
            padding: 24px;
          }
          
          .responsive-file-drawer .ant-drawer-header {
            padding: 16px 24px;
          }
          
          .file-manager-container {
            height: calc(100vh - 160px);
          }
        }
        
        /* Ensure proper drawer positioning on different screen sizes */
        .responsive-file-drawer.ant-drawer-right {
          width: 100% !important;
          max-width: 800px;
        }
        
        @media (max-width: 768px) {
          .responsive-file-drawer.ant-drawer-right {
            width: 100% !important;
            max-width: 100%;
          }
        }
        
        /* File manager specific responsive styles */
        .file-manager-container .ant-upload-drag {
          border-radius: 8px;
          padding: 16px;
        }
        
        .file-manager-container .ant-table {
          font-size: 12px;
        }
        
        .file-manager-container .ant-table-thead > tr > th,
        .file-manager-container .ant-table-tbody > tr > td {
          padding: 8px 4px;
        }
        
        @media (max-width: 768px) {
          .file-manager-container .ant-upload-drag {
            padding: 12px;
          }
          
          .file-manager-container .ant-table {
            font-size: 11px;
          }
          
          .file-manager-container .ant-table-thead > tr > th,
          .file-manager-container .ant-table-tbody > tr > td {
            padding: 6px 2px;
          }
          
          .file-manager-container .ant-btn {
            font-size: 12px;
            padding: 4px 8px;
            height: auto;
          }
          
          .file-manager-container .ant-input {
            font-size: 12px;
            padding: 4px 8px;
          }
        }
        
        /* Ensure proper scrolling in file manager */
        .file-manager-container {
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Optimize file manager toolbar for mobile */
        @media (max-width: 768px) {
          .file-manager-container .ant-space {
            gap: 8px !important;
          }
          
          .file-manager-container .ant-space-item {
            margin-bottom: 8px;
          }
        }
      `}</style>
      {/* Header */}
      <Card className="w-full">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <Title level={3} className="mb-2 text-lg md:text-xl lg:text-2xl">
              👥 {t("users.userManagement")}
            </Title>
            <p className="text-gray-600 text-sm md:text-base">
              {t("users.manageUsers")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* <Button 
              icon={<ExportOutlined />} 
              onClick={handleExportToPDF}
              className="w-full sm:w-auto"
            >
              {t("users.exportUsers")}
            </Button> */}
            {canAccess([UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
                className="w-full sm:w-auto"
              >
                {t("users.createUser")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="w-full">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title={t("users.totalUsers")}
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '1.25rem' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title={t("users.superAdmins")}
              value={stats.superAdmins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322', fontSize: '1.25rem' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title={t("users.admins")}
              value={stats.admins}
              prefix={<UserSwitchOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '1.25rem' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title={t("users.normalUsers")}
              value={stats.normalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '1.25rem' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title={t("common.active")}
              value={stats.activeUsers}
              valueStyle={{ color: '#3f8600', fontSize: '1.25rem' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title={t("common.inactive")}
              value={stats.inactiveUsers}
              valueStyle={{ color: '#cf1322', fontSize: '1.25rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title={t("common.filter")} className="w-full">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder={t("users.searchByName")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<UserOutlined />}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder={t("users.filterByStatus")}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              className="w-full"
            >
              <Select.Option value="ACTIVE">{t('common.active')}</Select.Option>
              <Select.Option value="INACTIVE">{t('common.inactive')}</Select.Option>
              <Select.Option value="PENDING">{t('common.pending')}</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder={t("users.filterByDepartment")}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
              className="w-full"
              loading={departmentsLoading}
            >
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card title={t("users.usersList")}>
        <div className="table-wrapper">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
            className="users-table-responsive"
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>

      {/* User Form Modal */}
      <Modal
        title={editingUser ? t('users.editUser') : t('users.createUser')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSaveUser}
          layout="vertical"
        >
          <Form.Item
            label={t("users.name")}
            name="name"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("users.enterUserName")} />
          </Form.Item>

          <Form.Item
            label={t("users.email")}
            name="email"
            rules={[
              { required: true, message: t('common.required') },
              { type: 'email', message: t('auth.invalidEmailFormat') }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t("users.enterEmailAddress")} />
          </Form.Item>

          <Form.Item
            label={t("users.role")}
            name="role"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select placeholder={t("users.selectRole")}>
              <Select.Option value={UserRole.USER}>{t("users.normalUsers")}</Select.Option>
              {/* Supervisors can promote users to supervisor role */}
              {(hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPERVISOR) || hasRole(UserRole.SUPER_ADMIN)) && (
                <Select.Option value={UserRole.SUPERVISOR}>{t("users.supervisors")}</Select.Option>
              )}
              {/* Only super admins can create admins */}
              {hasRole(UserRole.SUPER_ADMIN) && (
                <Select.Option value={UserRole.ADMIN}>{t("users.admins")}</Select.Option>
              )}
              {/* Only super admins can create super admins */}
              {hasRole(UserRole.SUPER_ADMIN) && (
                <Select.Option value={UserRole.SUPER_ADMIN}>{t("users.superAdmins")}</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label={t("users.department")}
            name="departmentId"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select 
              placeholder={t("users.selectDepartment")}
              loading={departmentsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              disabled={!hasRole(UserRole.SUPER_ADMIN) && !hasRole(UserRole.DEVELOPER)}
            >
              {departments
                .filter(dept => 
                  hasRole(UserRole.SUPER_ADMIN) || 
                  hasRole(UserRole.DEVELOPER) || 
                  dept.id === user?.departmentId
                )
                .map(dept => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>





          <Form.Item
            label={t("users.phone")}
            name="phone"
          >
            <Input prefix={<PhoneOutlined />} placeholder={t("users.enterPhoneNumber")} />
          </Form.Item>

          <Form.Item
            label={t("common.status")}
            name="status"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select placeholder={t("users.selectStatus")}>
              <Select.Option value={UserStatus.ACTIVE}>{t('common.active')}</Select.Option>
              <Select.Option value={UserStatus.INACTIVE}>{t('common.inactive')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? t('common.save') : t('common.create')}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Files Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <FolderOpenOutlined />
            <span className="truncate">
              {selectedUser ? `${selectedUser.name} - ${t('users.files')}` : t('users.files')}
            </span>
          </div>
        }
        placement={screenSize === 'xs' ? 'bottom' : screenSize === 'sm' ? 'bottom' : 'right'}
        size="large"
        onClose={() => setUserFilesDrawerVisible(false)}
        open={userFilesDrawerVisible}
        className={`responsive-file-drawer ${screenSize === 'xs' ? 'mobile-full-drawer' : ''}`}
        maskClosable={true}
        keyboard={true}
        destroyOnClose={false}
        closable={screenSize !== 'xs'}
        styles={{
          body: {
            padding: screenSize === 'xs' ? '4px' : screenSize === 'sm' ? '8px' : '16px',
            overflow: 'auto',
            maxHeight: screenSize === 'xs' ? 'calc(100vh - 100px)' : 'calc(100vh - 80px)',
            height: screenSize === 'xs' ? 'calc(100vh - 100px)' : 'auto',
          },
          header: {
            padding: screenSize === 'xs' ? '8px 12px' : screenSize === 'sm' ? '12px 16px' : '16px 20px',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            zIndex: 1,
          },
          wrapper: {
            width: screenSize === 'xs' ? '100vw' : 
                   screenSize === 'sm' ? '100vw' : 
                   screenSize === 'md' ? '80vw' : 
                   undefined,
          },
          content: {
            borderRadius: screenSize === 'xs' || screenSize === 'sm' ? '16px 16px 0 0' : '8px 0 0 8px',
            boxShadow: screenSize === 'xs' || screenSize === 'sm' ? '0 -4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
        extra={
          <div className="flex items-center gap-2">
            {screenSize === 'xs' && (
              <Button
                type="primary"
                size="large"
                icon={<CloseOutlined />}
                onClick={() => setUserFilesDrawerVisible(false)}
                className="flex md:hidden"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setUserFilesDrawerVisible(false)}
              className="hidden md:flex"
            />
          </div>
        }
      >
        {selectedUserId && (
          <div className="file-manager-container">
            <div className={`mb-4 p-3 bg-gray-50 rounded-lg ${screenSize === 'xs' ? 'mx-2' : 'mx-0'}`}>
              <div className={`flex items-center justify-between mb-2 ${screenSize === 'xs' ? 'flex-col items-start gap-2' : ''}`}>
                <Typography.Text strong className={`${screenSize === 'xs' ? 'text-base' : 'text-sm'}`}>
                  {t('users.viewingFilesFor')}: {selectedUser?.name}
                </Typography.Text>
                <Tag color="blue" className={`${screenSize === 'xs' ? 'text-sm' : 'text-xs'}`}>
                  {selectedUser?.role}
                </Tag>
              </div>
              <div className={`${screenSize === 'xs' ? 'text-sm' : 'text-xs'} text-gray-500`}>
                {t('users.fileManagerDescription')}
              </div>
            </div>
            
            <div className="file-manager-wrapper" style={{ 
              minHeight: screenSize === 'xs' ? 'calc(100vh - 140px)' : 'calc(100vh - 300px)',
              height: screenSize === 'xs' ? 'calc(100vh - 140px)' : 'auto',
              overflow: 'auto',
              padding: screenSize === 'xs' ? '0 2px' : '0',
              borderRadius: screenSize === 'xs' ? '8px' : '0',
              backgroundColor: screenSize === 'xs' ? '#fafafa' : 'transparent',
              width: '100%'
            }}>
              <EnhancedFileManager
                mode="user-files"
                libraryName={`${selectedUser?.name || 'User'} Files`}
                canWrite={hasRole(UserRole.SUPER_ADMIN)}
                canDelete={hasRole(UserRole.SUPER_ADMIN)}
                title={`${selectedUser?.name || 'User'} Personal Files`}
                rootPath={`/Users/${selectedUser?.name || 'User'}`}
                userId={selectedUserId}
              />
            </div>
          </div>
        )}
      </Drawer>


    </div>
  );
}
