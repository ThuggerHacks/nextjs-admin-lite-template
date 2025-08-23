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
import { UserRole } from '@/types';
import { sucursalService } from '@/lib/services/sucursalService';
import type { Sucursal } from '@/lib/services/sucursalService';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function SucursalManagementPage() {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [sucursals, setSucursals] = useState<Sucursal[]>([]);

  const { user } = useUser();
  const { t } = useTranslation();

  // Load sucursals from API
  const loadSucursals = async () => {
    try {
      setLoading(true);
      const data = await sucursalService.getAll();
      setSucursals(data);
    } catch (error) {
      console.error('Failed to load sucursals:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursals();
  }, []);

  const canManageSucursals = () => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  const handleCreateSucursal = async (values: any) => {
    setLoading(true);
    try {
      const newSucursal = await sucursalService.create({
        name: values.name,
        description: values.description,
        serverUrl: values.serverUrl,
      });

      setSucursals(prev => [...prev, newSucursal]);
      setModalVisible(false);
      form.resetFields();
      message.success(t('common.success'));
    } catch (error) {
      console.error('Failed to create sucursal:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const refreshSucursalStatus = async (sucursalId: string) => {
    setRefreshing(sucursalId);
    try {
      // Ping the sucursal to get fresh status
      await sucursalService.ping(sucursalId);

      // Reload sucursals to get updated data
      await loadSucursals();

      message.success(t('common.success'));
    } catch (error) {
      console.error('Failed to refresh sucursal status:', error);
      message.error(t('common.error'));
    } finally {
      setRefreshing(null);
    }
  };

  const getServerStatusBadge = (sucursal: Sucursal) => {
    if (sucursal.diagnostics?.isOnline) {
      return <Badge status="success" text={t('common.active')} />;
    } else {
      return <Badge status="error" text={t('common.inactive')} />;
    }
  };

  const getServerStatusColor = (sucursal: Sucursal) => {
    if (sucursal.diagnostics?.isOnline) {
      return (sucursal.diagnostics.responseTime! < 100) ? 'success' : 'normal';
    }
    return 'exception';
  };

  const logColumns = [
    {
      title: t('common.time'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => new Date(timestamp).toLocaleTimeString(),
    },
    {
      title: t('common.status'),
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
      title: t('common.description'),
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: t('common.details'),
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
          message={t('common.error')}
          description={t('common.accessDenied')}
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
              {t('sucursal.management')}
            </Title>
            <Text type="secondary">
              {t('sucursal.manageSucursals')}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            {t('sucursal.addSucursal')}
          </Button>
        </div>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sucursals"
              value={sucursals?.length || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Online"
              value={sucursals?.filter(s => s.diagnostics?.isOnline)?.length || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Offline"
              value={sucursals?.filter(s => !s.diagnostics?.isOnline)?.length || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Uptime"
              value={sucursals?.length ? (sucursals.reduce((acc, s) => acc + (s.diagnostics?.uptime || 0), 0) / sucursals.length) : 0}
              precision={1}
              suffix="%"
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sucursals List */}
      <Row gutter={[16, 16]}>
        {sucursals?.map(sucursal => (
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
