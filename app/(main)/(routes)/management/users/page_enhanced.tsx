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

  const handleEditUser = (userData: User) => {
    setEditingUser(userData);
    form.setFieldsValue({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      status: userData.status,
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
      ...filteredUsers.map(userData => [
        userData.name,
        userData.email,
        userData.role,
        userData.department,
        userData.phone || '',
        userData.status,
        userData.createdAt.toLocaleDateString()
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

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
      message.success(t('common.success'));
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingUser) {
        // Update existing user
        setUsers(prev => prev.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                name: values.name,
                email: values.email,
                role: values.role,
                department: values.department,
                phone: values.phone,
                status: values.status,
              }
            : u
        ));
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          name: values.name,
          email: values.email,
          role: values.role,
          department: values.department,
          phone: values.phone,
          status: values.status,
          createdAt: new Date(),
        };
        setUsers(prev => [...prev, newUser]);
      }

      setIsModalVisible(false);
      form.resetFields();
      message.success(t('common.success'));
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleTag = (role: UserRole) => {
    const roleColors = {
      [UserRole.SUPER_ADMIN]: 'red',
      [UserRole.ADMIN]: 'orange',
      [UserRole.USER]: 'blue',
    };
    
    const roleLabels = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.USER]: 'User',
    };

    return (
      <Tag color={roleColors[role]} icon={role === UserRole.SUPER_ADMIN ? <CrownOutlined /> : undefined}>
        {roleLabels[role]}
      </Tag>
    );
  };

  const getStatusTag = (status: UserStatus) => {
    return (
      <Tag color={status === UserStatus.ACTIVE ? 'green' : 'red'}>
        {status === UserStatus.ACTIVE ? 'Active' : 'Inactive'}
      </Tag>
    );
  };

  const getUserActions = (userData: User): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'edit',
        label: 'Edit User',
        icon: <EditOutlined />,
        onClick: () => handleEditUser(userData),
      },
      {
        key: 'files',
        label: 'View Files',
        icon: <FolderOpenOutlined />,
        onClick: () => handleViewUserFiles(userData.id),
      },
    ];

    // Super admin specific actions
    if (hasRole(UserRole.SUPER_ADMIN)) {
      if (userData.role !== UserRole.SUPER_ADMIN) {
        items.push({
          key: 'promote',
          label: 'Promote to Super Admin',
          icon: <CrownOutlined />,
          onClick: () => handlePromoteToSuperAdmin(userData.id),
        });
      }
      
      items.push({
        key: 'remove',
        label: 'Remove User',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleRemoveUser(userData.id),
      });
    }

    return items;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => getRoleTag(role),
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
      render: (phone: string) => phone || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => getStatusTag(status),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Dropdown menu={{ items: getUserActions(record) }} trigger={['click']}>
          <Button icon={<DownOutlined />}>
            Actions
          </Button>
        </Dropdown>
      ),
    },
  ];

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-2">
              👥 {t("navigation.users")}
            </Title>
            <p className="text-gray-600">
              Manage users, roles, and permissions
            </p>
          </div>
          <Space>
            <Button 
              icon={<ExportOutlined />} 
              onClick={handleExportToPDF}
            >
              Export to PDF
            </Button>
            {canAccess([UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
              >
                {t("common.create")} User
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Super Admins"
              value={stats.superAdmins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Admins"
              value={stats.admins}
              prefix={<UserSwitchOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Normal Users"
              value={stats.normalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Active"
              value={stats.activeUsers}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Inactive"
              value={stats.inactiveUsers}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card title="Users List">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* User Form Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Create User"}
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
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select user role">
              <Select.Option value={UserRole.USER}>User</Select.Option>
              <Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
              {hasRole(UserRole.SUPER_ADMIN) && (
                <Select.Option value={UserRole.SUPER_ADMIN}>Super Admin</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select 
              placeholder="Select department"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {departmentOptions.map(dept => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select user status">
              <Select.Option value={UserStatus.ACTIVE}>Active</Select.Option>
              <Select.Option value={UserStatus.INACTIVE}>Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Files Drawer */}
      <Drawer
        title={selectedUser ? `${selectedUser.name}'s Files` : 'User Files'}
        placement="right"
        size="large"
        onClose={() => setUserFilesDrawerVisible(false)}
        open={userFilesDrawerVisible}
      >
        {selectedUserId && (
          <FileManager
            libraryId={`user-${selectedUserId}`}
            libraryName={`${selectedUser?.name || 'User'} Files`}
            canWrite={hasRole(UserRole.SUPER_ADMIN)}
            canDelete={hasRole(UserRole.SUPER_ADMIN)}
          />
        )}
      </Drawer>
    </div>
  );
}
