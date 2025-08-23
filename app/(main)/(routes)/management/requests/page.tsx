'use client';

import React, { useState, useEffect } from 'react';
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
import { requestService } from '@/lib/services/requestService';
import type { UserRequest } from '@/lib/services/requestService';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { user, canAccess } = useUser();
  const { t } = useTranslation();

  // Load requests from API
  const loadRequests = async (page = 1, limit = 10, status?: string) => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (status && status !== 'all') {
        params.status = status;
      }

      const response = await requestService.getAll(params);
      setRequests(response.requests);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load requests:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (!canAccess([UserRole.ADMIN, UserRole.SUPER_ADMIN])) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3>{t('common.error')}</h3>
          <p>{t('common.accessDenied')}</p>
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
      await requestService.update(selectedRequest.id, {
        status: values.status,
        response: values.response,
      });

      // Reload requests to get updated data
      await loadRequests(pagination.current, pagination.pageSize, activeTab);

      setIsModalVisible(false);
      form.resetFields();
      message.success(t('common.success'));
    } catch (error) {
      console.error('Failed to update request:', error);
      message.error(t('common.error'));
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
    const allRequests = requests; // Since we're loading all requests, we can count from the loaded data
    return {
      pending: allRequests.filter(r => r.status === 'pending').length,
      in_review: allRequests.filter(r => r.status === 'in_review').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length,
    };
  };

  const filteredRequests = activeTab === 'all'
    ? requests
    : requests.filter(r => r.status === activeTab);

  const columns = [
    {
      title: t('requests.type'),
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
      title: t('requests.title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: UserRequest) => (
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500 mt-1">
            {t('requests.by')} {record.requestedBy.name}
          </div>
        </div>
      ),
    },
    {
      title: t('users.department'),
      dataIndex: ['requestedBy', 'department'],
      key: 'department',
    },
    {
      title: t('requests.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('users.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">
            {new Date(date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: t('users.actions'),
      key: 'actions',
      render: (_: any, record: UserRequest) => (
        <Space>
          <Tooltip title={t('requests.viewDetails')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewRequest(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title={t('requests.quickApprove')}>
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
              <Tooltip title={t('requests.quickReject')}>
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
          <span>{t("common.pending")}</span>
        </Badge>
      ),
    },
    {
      key: 'approved',
      label: (
        <Badge count={counts.approved} size="small">
          <span>{t("common.approved")}</span>
        </Badge>
      ),
    },
    {
      key: 'all',
      label: t("common.all"),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3} className="mb-2">
          <MessageOutlined className="mr-2" />
          {t("navigation.requests")}
        </Title>
        <Text type="secondary">
          {t("requests.reviewRequests")}
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
        title={`${t("requests.requestDetails")} - ${selectedRequest?.title}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Request Info */}
            <Card size="small" title={t("requests.requestInformation")}>
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
                  <Text strong>{t("users.userDetails")}:</Text>
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
                  <Text strong>{t("users.createdAt")}:</Text>
                  <div className="mt-1">
                    <div>{new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Text strong>{t("common.description")}:</Text>
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
                label={t("common.status")}
                name="status"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Select placeholder={t("users.selectStatus")}>
                  <Select.Option value="pending">{t("common.pending")}</Select.Option>
                  <Select.Option value="approved">{t("common.approved")}</Select.Option>
                  <Select.Option value="rejected">{t("common.rejected")}</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={t("common.response")}
                name="response"
              >
                <TextArea
                  rows={4}
                  placeholder={t("common.response")}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {t("common.submit")}
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)}>
                    {t("common.cancel")}
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
