'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  List,
  Badge,
  Tag,
  Statistic,
  Timeline,
  Table,
  Tooltip,
  Drawer,
  Progress,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Sucursal, SucursalDiagnostics, SucursalLog, UserRole } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function SucursalManagementPage() {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  
  const { user } = useUser();
  const { t } = useTranslation();

  // Mock sucursal data
  const [sucursals, setSucursals] = useState<Sucursal[]>([
    {
      id: '1',
      name: 'São Paulo Branch',
      serverUrl: 'https://sp.empresa.com',
      description: 'Main branch server in São Paulo',
      createdBy: user!,
      createdAt: new Date('2024-01-15'),
      isActive: true,
      lastPing: new Date(),
      diagnostics: {
        isOnline: true,
        responseTime: 120,
        lastCheck: new Date(),
        uptime: 99.5,
        errorCount: 2,
        logs: [
          {
            id: '1',
            timestamp: new Date(),
            level: 'info',
            message: 'Server started successfully',
            details: { port: 8080, environment: 'production' }
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 3600000),
            level: 'warning',
            message: 'High memory usage detected',
            details: { usage: '85%', threshold: '80%' }
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 7200000),
            level: 'error',
            message: 'Database connection timeout',
            details: { retries: 3, timeout: '30s' }
          },
        ]
      }
    },
    {
      id: '2',
      name: 'Rio de Janeiro Branch',
      serverUrl: 'https://rj.empresa.com',
      description: 'Secondary branch server in Rio de Janeiro',
      createdBy: user!,
      createdAt: new Date('2024-02-01'),
      isActive: true,
      lastPing: new Date(Date.now() - 300000),
      diagnostics: {
        isOnline: false,
        responseTime: undefined,
        lastCheck: new Date(Date.now() - 300000),
        uptime: 87.2,
        errorCount: 8,
        logs: [
          {
            id: '4',
            timestamp: new Date(Date.now() - 300000),
            level: 'error',
            message: 'Server connection lost',
            details: { lastResponse: '5 minutes ago' }
          },
          {
            id: '5',
            timestamp: new Date(Date.now() - 600000),
            level: 'warning',
            message: 'Disk space running low',
            details: { available: '15%', threshold: '20%' }
          },
        ]
      }
    },
    {
      id: '3',
      name: 'Belo Horizonte Branch',
      serverUrl: 'https://bh.empresa.com',
      description: 'Regional branch server in Belo Horizonte',
      createdBy: user!,
      createdAt: new Date('2024-03-01'),
      isActive: true,
      lastPing: new Date(Date.now() - 60000),
      diagnostics: {
        isOnline: true,
        responseTime: 89,
        lastCheck: new Date(),
        uptime: 95.8,
        errorCount: 1,
        logs: [
          {
            id: '6',
            timestamp: new Date(),
            level: 'info',
            message: 'Regular health check passed',
            details: { status: 'healthy', services: 12 }
          },
        ]
      }
    },
  ]);

  const canManageSucursals = () => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  const handleCreateSucursal = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSucursal: Sucursal = {
        id: Date.now().toString(),
        name: values.name,
        serverUrl: values.serverUrl,
        description: values.description,
        createdBy: user!,
        createdAt: new Date(),
        isActive: true,
        diagnostics: {
          isOnline: false,
          lastCheck: new Date(),
          uptime: 0,
          errorCount: 0,
          logs: [
            {
              id: Date.now().toString(),
              timestamp: new Date(),
              level: 'info',
              message: 'Sucursal created - waiting for first health check',
              details: {}
            }
          ]
        }
      };
      
      setSucursals(prev => [...prev, newSucursal]);
      setModalVisible(false);
      form.resetFields();
      message.success('Sucursal created successfully!');
    } catch (error) {
      message.error('Failed to create sucursal');
    } finally {
      setLoading(false);
    }
  };

  const refreshSucursalStatus = async (sucursalId: string) => {
    setRefreshing(sucursalId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSucursals(prev => prev.map(s => {
        if (s.id === sucursalId) {
          const isOnline = Math.random() > 0.3; // 70% chance of being online
          return {
            ...s,
            lastPing: new Date(),
            diagnostics: {
              ...s.diagnostics,
              isOnline,
              responseTime: isOnline ? Math.floor(Math.random() * 200) + 50 : undefined,
              lastCheck: new Date(),
            }
          };
        }
        return s;
      }));
      
      message.success('Status refreshed');
    } catch (error) {
      message.error('Failed to refresh status');
    } finally {
      setRefreshing(null);
    }
  };

  const getServerStatusBadge = (sucursal: Sucursal) => {
    if (sucursal.diagnostics.isOnline) {
      return <Badge status="success" text="Online" />;
    } else {
      return <Badge status="error" text="Offline" />;
    }
  };

  const getServerStatusColor = (sucursal: Sucursal) => {
    if (sucursal.diagnostics.isOnline) {
      return sucursal.diagnostics.responseTime! < 100 ? 'success' : 'normal';
    }
    return 'exception';
  };

  const logColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: Date) => timestamp.toLocaleTimeString(),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const colors = {
          info: 'blue',
          warning: 'orange',
          error: 'red',
        };
        return <Tag color={colors[level as keyof typeof colors]}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details: any) => (
        <Tooltip title={<pre>{JSON.stringify(details, null, 2)}</pre>}>
          <Button size="small" icon={<InfoCircleOutlined />} />
        </Tooltip>
      ),
    },
  ];

  if (!canManageSucursals()) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert
          message="Access Denied"
          description="Only Super Administrators can access Sucursal Management"
          type="warning"
          icon={<WarningOutlined />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-2">
              <DatabaseOutlined className="mr-2" />
              Sucursal Management
            </Title>
            <Text type="secondary">
              Manage and monitor branch servers across all locations
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add New Sucursal
          </Button>
        </div>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sucursals"
              value={sucursals.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Online"
              value={sucursals.filter(s => s.diagnostics.isOnline).length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Offline"
              value={sucursals.filter(s => !s.diagnostics.isOnline).length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Uptime"
              value={sucursals.reduce((acc, s) => acc + s.diagnostics.uptime, 0) / sucursals.length}
              precision={1}
              suffix="%"
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sucursals List */}
      <Row gutter={[16, 16]}>
        {sucursals.map(sucursal => (
          <Col key={sucursal.id} xs={24} lg={12} xl={8}>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>{sucursal.name}</span>
                  {getServerStatusBadge(sucursal)}
                </div>
              }
              extra={
                <Space>
                  <Tooltip title="Refresh Status">
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      loading={refreshing === sucursal.id}
                      onClick={() => refreshSucursalStatus(sucursal.id)}
                    />
                  </Tooltip>
                  <Tooltip title="View Details">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedSucursal(sucursal);
                        setDetailsDrawerVisible(true);
                      }}
                    />
                  </Tooltip>
                </Space>
              }
              className={`border-l-4 ${
                sucursal.diagnostics.isOnline ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              <div className="space-y-3">
                <div>
                  <Text strong>URL: </Text>
                  <Text code>{sucursal.serverUrl}</Text>
                </div>
                
                <div>
                  <Text type="secondary">{sucursal.description}</Text>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Response Time</Text>
                    <div className="text-lg font-semibold">
                      {sucursal.diagnostics.responseTime ? `${sucursal.diagnostics.responseTime}ms` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Uptime</Text>
                    <div className="text-lg font-semibold">
                      {sucursal.diagnostics.uptime.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary">Health Status</Text>
                  <div className="mt-1">
                    <Progress
                      percent={sucursal.diagnostics.uptime}
                      status={getServerStatusColor(sucursal)}
                      size="small"
                    />
                  </div>
                </div>
                
                {sucursal.diagnostics.errorCount > 0 && (
                  <Alert
                    message={`${sucursal.diagnostics.errorCount} error(s) logged`}
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                  />
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create Sucursal Modal */}
      <Modal
        title="Add New Sucursal"
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSucursal}
        >
          <Form.Item
            label="Sucursal Name"
            name="name"
            rules={[{ required: true, message: 'Please enter sucursal name' }]}
          >
            <Input placeholder="e.g., São Paulo Branch" size="large" />
          </Form.Item>

          <Form.Item
            label="Server URL"
            name="serverUrl"
            rules={[
              { required: true, message: 'Please enter server URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://example.empresa.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the purpose and location of this sucursal..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<PlusOutlined />}
              >
                Create Sucursal
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={selectedSucursal?.name}
        placement="right"
        width={800}
        visible={detailsDrawerVisible}
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedSucursal(null);
        }}
      >
        {selectedSucursal && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card size="small" title="Basic Information">
              <div className="space-y-2">
                <div><Text strong>Name:</Text> {selectedSucursal.name}</div>
                <div><Text strong>URL:</Text> <Text code>{selectedSucursal.serverUrl}</Text></div>
                <div><Text strong>Description:</Text> {selectedSucursal.description}</div>
                <div><Text strong>Created:</Text> {selectedSucursal.createdAt.toLocaleDateString()}</div>
                <div><Text strong>Created By:</Text> {selectedSucursal.createdBy.name}</div>
              </div>
            </Card>

            {/* Current Status */}
            <Card size="small" title="Current Status">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Status"
                    value={selectedSucursal.diagnostics.isOnline ? 'Online' : 'Offline'}
                    valueStyle={{
                      color: selectedSucursal.diagnostics.isOnline ? '#3f8600' : '#cf1322'
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Response Time"
                    value={selectedSucursal.diagnostics.responseTime || 'N/A'}
                    suffix={selectedSucursal.diagnostics.responseTime ? 'ms' : ''}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Uptime"
                    value={selectedSucursal.diagnostics.uptime}
                    precision={2}
                    suffix="%"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Error Count"
                    value={selectedSucursal.diagnostics.errorCount}
                    valueStyle={{
                      color: selectedSucursal.diagnostics.errorCount > 0 ? '#cf1322' : '#3f8600'
                    }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Server Logs */}
            <Card size="small" title="Server Logs">
              <Table
                dataSource={selectedSucursal.diagnostics.logs}
                columns={logColumns}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 300 }}
              />
            </Card>

            {/* Actions */}
            <Card size="small" title="Actions">
              <Space wrap>
                <Button
                  icon={<ReloadOutlined />}
                  loading={refreshing === selectedSucursal.id}
                  onClick={() => refreshSucursalStatus(selectedSucursal.id)}
                >
                  Refresh Status
                </Button>
                <Button icon={<SettingOutlined />}>
                  Configuration
                </Button>
                <Button icon={<GlobalOutlined />}>
                  View in Browser
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
