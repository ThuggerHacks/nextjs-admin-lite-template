'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tag,
  Avatar,
  Typography,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Department, User, UserRole } from '../../../../types';

const { Title } = Typography;
const { TextArea } = Input;

// Mock departments data
const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Human Resources',
    description: 'Manages employee relations, recruitment, and company policies',
    adminId: '1',
    adminUser: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: UserRole.ADMIN,
      department: 'Human Resources',
      status: 'active' as any,
      createdAt: new Date('2024-01-15')
    },
    createdBy: {
      id: '1',
      name: 'System Admin',
      email: 'admin@company.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date('2024-01-01')
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-20'),
    isActive: true,
    memberCount: 12
  },
  {
    id: '2',
    name: 'Information Technology',
    description: 'Responsible for technology infrastructure and software development',
    adminId: '2',
    adminUser: {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: UserRole.ADMIN,
      department: 'Information Technology',
      status: 'active' as any,
      createdAt: new Date('2024-02-01')
    },
    createdBy: {
      id: '1',
      name: 'System Admin',
      email: 'admin@company.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date('2024-01-01')
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-07-15'),
    isActive: true,
    memberCount: 18
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Handles brand promotion, customer engagement, and market research',
    adminId: '3',
    adminUser: {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: UserRole.ADMIN,
      department: 'Marketing',
      status: 'active' as any,
      createdAt: new Date('2024-03-10')
    },
    createdBy: {
      id: '1',
      name: 'System Admin',
      email: 'admin@company.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date('2024-01-01')
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-06-25'),
    isActive: true,
    memberCount: 8
  },
  {
    id: '4',
    name: 'Finance',
    description: 'Manages financial planning, budgeting, and accounting operations',
    createdBy: {
      id: '1',
      name: 'System Admin',
      email: 'admin@company.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date('2024-01-01')
    },
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-07-30'),
    isActive: true,
    memberCount: 6
  }
];

// Mock users for admin selection
const mockUsers: User[] = [
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: UserRole.USER,
    department: 'Finance',
    status: 'active' as any,
    createdAt: new Date('2024-04-01')
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    role: UserRole.USER,
    department: 'Marketing',
    status: 'active' as any,
    createdAt: new Date('2024-05-15')
  },
  {
    id: '6',
    name: 'James Brown',
    email: 'james.brown@company.com',
    role: UserRole.USER,
    department: 'Human Resources',
    status: 'active' as any,
    createdAt: new Date('2024-06-01')
  }
];

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Department) => (
        <Space direction="vertical" size={0}>
          <Title level={5} style={{ margin: 0 }}>{text}</Title>
          {record.description && (
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description.length > 50 
                ? record.description.substring(0, 50) + '...'
                : record.description
              }
            </Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Admin',
      dataIndex: 'adminUser',
      key: 'admin',
      render: (adminUser: User | undefined) => (
        adminUser ? (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <div>{adminUser.name}</div>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                {adminUser.email}
              </Typography.Text>
            </div>
          </Space>
        ) : (
          <Tag color="orange">No Admin Assigned</Tag>
        )
      ),
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => (
        <Space>
          <TeamOutlined />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
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
      render: (_: any, record: Department) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Department"
            description="Are you sure you want to delete this department?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
      adminId: department.adminId,
      isActive: department.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
    message.success('Department deleted successfully');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const selectedAdmin = mockUsers.find(user => user.id === values.adminId);
      
      if (editingDepartment) {
        // Update existing department
        const updatedDepartments = departments.map(dept =>
          dept.id === editingDepartment.id
            ? {
                ...dept,
                ...values,
                adminUser: selectedAdmin,
                updatedAt: new Date(),
              }
            : dept
        );
        setDepartments(updatedDepartments);
        message.success('Department updated successfully');
      } else {
        // Add new department
        const newDepartment: Department = {
          id: String(Date.now()),
          ...values,
          adminUser: selectedAdmin,
          createdBy: {
            id: '1',
            name: 'Current User',
            email: 'current@company.com',
            role: UserRole.SUPER_ADMIN,
            department: 'IT',
            status: 'active' as any,
            createdAt: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          memberCount: 0,
        };
        setDepartments([...departments, newDepartment]);
        message.success('Department created successfully');
      }
      
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingDepartment(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: '8px' }} />
            Department Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Department
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          pagination={{
            total: departments.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} departments`,
          }}
        />
      </Card>

      <Modal
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Department Name"
            rules={[
              { required: true, message: 'Please input department name!' },
              { min: 2, message: 'Department name must be at least 2 characters!' }
            ]}
          >
            <Input placeholder="Enter department name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={3} 
              placeholder="Enter department description"
            />
          </Form.Item>

          <Form.Item
            name="adminId"
            label="Department Admin"
          >
            <Select
              placeholder="Select department admin"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {mockUsers.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <div>{user.name}</div>
                      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {user.email}
                      </Typography.Text>
                    </div>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
