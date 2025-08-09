'use client';

import React, { useState } from 'react';
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
  TreeSelect,
  Dropdown,
  MenuProps,
  Typography,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  DownOutlined,
  FolderOutlined,
  FileOutlined,
  ExportOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { User, UserRole, UserStatus } from '@/types';
import FileManager from '@/components/FileManager/FileManager';

const { TextArea } = Input;
const { Title } = Typography;

// Department options
const departmentOptions = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Operations',
  'Legal',
  'Sales',
  'Support',
  'Engineering',
  'Product',
  'Customer Success',
  'Business Development',
];

// Mock users data (enhanced with more users)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: UserRole.SUPER_ADMIN,
    department: 'IT',
    phone: '+55 11 99999-9999',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: UserRole.ADMIN,
    department: 'HR',
    phone: '+55 11 88888-8888',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: UserRole.USER,
    department: 'Finance',
    phone: '+55 11 77777-7777',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@company.com',
    role: UserRole.ADMIN,
    department: 'Marketing',
    phone: '+55 11 66666-6666',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '5',
    name: 'Carlos Silva',
    email: 'carlos@empresa.com',
    role: UserRole.USER,
    department: 'Operations',
    phone: '+55 11 55555-5555',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-04-12'),
  },
  {
    id: '6',
    name: 'Lucia Fernandes',
    email: 'lucia@empresa.com',
    role: UserRole.USER,
    department: 'Legal',
    phone: '+55 11 44444-4444',
    status: UserStatus.INACTIVE,
    createdAt: new Date('2024-03-30'),
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userFilesDrawerVisible, setUserFilesDrawerVisible] = useState(false);
  
  const { user, hasRole, canAccess } = useUser();
  const { t } = useTranslation();

  // Calculate statistics
  const stats = {
    total: users.length,
    superAdmins: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
    admins: users.filter(u => u.role === UserRole.ADMIN).length,
    normalUsers: users.filter(u => u.role === UserRole.USER).length,
    activeUsers: users.filter(u => u.status === UserStatus.ACTIVE).length,
    inactiveUsers: users.filter(u => u.status === UserStatus.INACTIVE).length,
  };

  // Filter users based on current user role
  const getFilteredUsers = () => {
    if (hasRole(UserRole.SUPER_ADMIN)) {
      return users; // Super admins see all users
    }
    if (hasRole(UserRole.ADMIN)) {
      // Admins see only normal users, not other admins or super admins
      return users.filter(u => u.role === UserRole.USER);
    }
    return []; // Normal users shouldn't access this page
  };

  const filteredUsers = getFilteredUsers();

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  const handlePromoteToSuperAdmin = async (userId: string) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: UserRole.SUPER_ADMIN } : u
      ));
      message.success('User promoted to Super Admin successfully!');
    } catch (error) {
      message.error('Failed to promote user');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
      message.success('User removed successfully!');
    } catch (error) {
      message.error('Failed to remove user');
    }
  };

  const handleViewUserFiles = (userId: string) => {
    setSelectedUserId(userId);
    setUserFilesDrawerVisible(true);
  };

  const handleExportToPDF = () => {
    // Mock PDF export functionality
    message.info('Exporting users to PDF... (Mock functionality)');
    
    // In a real app, you would use a PDF library like jsPDF or similar
    const csvContent = [
      ['Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Created At'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.department,
        user.phone || '',
        user.status,
        user.createdAt.toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    message.success('Users exported to CSV successfully!');
  };
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(prev => prev.filter(u => u.id !== userId));
      message.success(t('common.success'));
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser) {
        // Update existing user
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...values }
            : u
        ));
        message.success('User updated successfully');
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date(),
        };
        setUsers(prev => [...prev, newUser]);
        message.success('User created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'red';
      case UserRole.ADMIN:
        return 'orange';
      case UserRole.USER:
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {role.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => (
        <Tag color={status === UserStatus.ACTIVE ? 'green' : 'red'}>
          {status === UserStatus.ACTIVE ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            disabled={!canAccess([UserRole.SUPER_ADMIN, UserRole.ADMIN])}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            disabled={!hasRole(UserRole.SUPER_ADMIN)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={!hasRole(UserRole.SUPER_ADMIN)}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!canAccess([UserRole.ADMIN, UserRole.SUPER_ADMIN])) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3>Access Denied</h3>
          <p>You don&apos;t have permission to access this page.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>{t('navigation.userManagement')}</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
              disabled={!canAccess([UserRole.SUPER_ADMIN, UserRole.ADMIN])}
            >
              Add User
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value={UserRole.USER}>User</Select.Option>
              {hasRole(UserRole.SUPER_ADMIN) && (
                <>
                  <Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
                  <Select.Option value={UserRole.SUPER_ADMIN}>Super Admin</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value={UserStatus.ACTIVE}>Active</Select.Option>
              <Select.Option value={UserStatus.INACTIVE}>Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
