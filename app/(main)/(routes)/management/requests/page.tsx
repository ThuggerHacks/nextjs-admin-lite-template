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
  Tabs,
  Badge,
  Typography,
  Tooltip,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole, UserStatus } from '@/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface UserRequest {
  id: string;
  type: 'account' | 'access' | 'support' | 'feature';
  title: string;
  description: string;
  requestedBy: {
    name: string;
    email: string;
    department: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  response?: string;
}

// Mock requests data
const mockRequests: UserRequest[] = [
  {
    id: '1',
    type: 'account',
    title: 'New User Account Request',
    description: 'Request to create account for new employee Ana Silva in Marketing department.',
    requestedBy: {
      name: 'Carlos Manager',
      email: 'carlos.manager@company.com',
      department: 'Marketing',
    },
    status: 'pending',
    priority: 'high',
    createdAt: new Date('2024-03-15T10:30:00'),
  },
  {
    id: '2',
    type: 'access',
    title: 'Admin Access Request',
    description: 'Request admin privileges for project management system access.',
    requestedBy: {
      name: 'Pedro Costa',
      email: 'pedro.costa@company.com',
      department: 'IT',
    },
    status: 'in_review',
    priority: 'medium',
    createdAt: new Date('2024-03-14T14:20:00'),
  },
  {
    id: '3',
    type: 'support',
    title: 'Password Reset Issue',
    description: 'Unable to reset password, not receiving email confirmation.',
    requestedBy: {
      name: 'Maria Santos',
      email: 'maria.santos@company.com',
      department: 'Finance',
    },
    status: 'approved',
    priority: 'low',
    createdAt: new Date('2024-03-13T09:15:00'),
    reviewedAt: new Date('2024-03-13T11:30:00'),
    reviewedBy: 'João Silva',
    response: 'Password reset completed. Email configuration was updated.',
  },
  {
    id: '4',
    type: 'feature',
    title: 'Bulk Upload Feature',
    description: 'Request to add bulk file upload functionality to the documents section.',
    requestedBy: {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@company.com',
      department: 'Operations',
    },
    status: 'rejected',
    priority: 'low',
    createdAt: new Date('2024-03-12T16:45:00'),
    reviewedAt: new Date('2024-03-14T10:20:00'),
    reviewedBy: 'João Silva',
    response: 'Feature is already available in the Libraries section.',
  },
];

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState<UserRequest[]>(mockRequests);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  const { user, canAccess } = useUser();
  const { t } = useTranslation();

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

  const handleViewRequest = (request: UserRequest) => {
    setSelectedRequest(request);
    form.setFieldsValue({
      status: request.status,
      response: request.response || '',
    });
    setIsModalVisible(true);
  };

  const handleUpdateRequest = async (values: any) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? {
              ...req,
              status: values.status,
              response: values.response,
              reviewedAt: new Date(),
              reviewedBy: user?.name || 'Admin',
            }
          : req
      ));
      
      setIsModalVisible(false);
      form.resetFields();
      message.success('Request updated successfully');
    } catch (error) {
      message.error('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'in_review':
        return 'blue';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'account':
        return '👤';
      case 'access':
        return '🔐';
      case 'support':
        return '🛠️';
      case 'feature':
        return '⭐';
      default:
        return '📋';
    }
  };

  const getRequestCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      in_review: requests.filter(r => r.status === 'in_review').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const filteredRequests = activeTab === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeTab);

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTypeIcon(type)}</span>
          <span className="capitalize">{type}</span>
        </div>
      ),
    },
    {
      title: 'Request',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: UserRequest) => (
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500 mt-1">
            by {record.requestedBy.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: ['requestedBy', 'department'],
      key: 'department',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <div>
          <div>{date.toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">
            {date.toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserRequest) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewRequest(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Quick Approve">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  className="text-green-600"
                  onClick={() => {
                    setSelectedRequest(record);
                    form.setFieldsValue({ status: 'approved', response: '' });
                    setIsModalVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Quick Reject">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  className="text-red-600"
                  onClick={() => {
                    setSelectedRequest(record);
                    form.setFieldsValue({ status: 'rejected', response: '' });
                    setIsModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const counts = getRequestCounts();

  const tabItems = [
    {
      key: 'pending',
      label: (
        <Badge count={counts.pending} size="small">
          <span>Pending</span>
        </Badge>
      ),
    },
    {
      key: 'in_review',
      label: (
        <Badge count={counts.in_review} size="small">
          <span>In Review</span>
        </Badge>
      ),
    },
    {
      key: 'approved',
      label: (
        <Badge count={counts.approved} size="small">
          <span>Approved</span>
        </Badge>
      ),
    },
    {
      key: 'rejected',
      label: (
        <Badge count={counts.rejected} size="small">
          <span>Rejected</span>
        </Badge>
      ),
    },
    {
      key: 'all',
      label: 'All Requests',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3} className="mb-2">
          <MessageOutlined className="mr-2" />
          User Requests Management
        </Title>
        <Text type="secondary">
          Review and manage user requests for accounts, access, and support
        </Text>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
        
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Request Details Modal */}
      <Modal
        title={`Request Details - ${selectedRequest?.title}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Request Info */}
            <Card size="small" title="Request Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text strong>Type:</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{getTypeIcon(selectedRequest.type)}</span>
                    <span className="capitalize">{selectedRequest.type}</span>
                  </div>
                </div>
                <div>
                  <Text strong>Priority:</Text>
                  <div className="mt-1">
                    <Tag color={getPriorityColor(selectedRequest.priority)}>
                      {selectedRequest.priority.toUpperCase()}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text strong>Requested by:</Text>
                  <div className="mt-1">
                    <div>{selectedRequest.requestedBy.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedRequest.requestedBy.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedRequest.requestedBy.department}
                    </div>
                  </div>
                </div>
                <div>
                  <Text strong>Created:</Text>
                  <div className="mt-1">
                    <div>{selectedRequest.createdAt.toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">
                      {selectedRequest.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Text strong>Description:</Text>
                <div className="mt-1 p-3 bg-gray-50 rounded">
                  {selectedRequest.description}
                </div>
              </div>
            </Card>

            {/* Response Form */}
            <Form
              form={form}
              onFinish={handleUpdateRequest}
              layout="vertical"
            >
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="in_review">In Review</Select.Option>
                  <Select.Option value="approved">Approved</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Response"
                name="response"
              >
                <TextArea
                  rows={4}
                  placeholder="Enter response or additional notes..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Update Request
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
