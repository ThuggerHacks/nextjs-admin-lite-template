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
  DatePicker,
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
  const [editForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [sucursals, setSucursals] = useState<Sucursal[]>([]);
  const [errorLogs, setErrorLogs] = useState<Array<{
    id: string;
    errorType: string;
    message: string;
    details?: any;
    createdAt: string;
    sucursal: {
      id: string;
      name: string;
      serverUrl: string;
    };
  }>>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(false);
  const [errorLogDateRange, setErrorLogDateRange] = useState<[string, string] | null>(null);

  const { user } = useUser();
  const { t } = useTranslation();

  // Load sucursals from API
  const loadSucursals = async () => {
    try {
      setLoading(true);
      const data = await sucursalService.getAll();
      setSucursals(data);
      
      // Perform health checks for all sucursals
      await performHealthChecks(data);
    } catch (error) {
      console.error('Failed to load sucursals:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Perform health checks for all sucursals
  const performHealthChecks = async (sucursalsData: Sucursal[]) => {
    setHealthCheckLoading(true);
    try {
      const healthResults: Record<string, { isOnline: boolean; responseTime?: number }> = {};
      
      // Check health for each sucursal concurrently
      const healthPromises = sucursalsData.map(async (sucursal) => {
        const health = await checkSucursalHealth(sucursal);
        healthResults[sucursal.id] = health;
      });
      
      await Promise.all(healthPromises);
      setHealthStatus(healthResults);
    } finally {
      setHealthCheckLoading(false);
    }
  };

  useEffect(() => {
    loadSucursals();
  }, []);

  const canManageSucursals = () => {
    return user?.role === UserRole.DEVELOPER;
  };

  const handleCreateSucursal = async (values: any) => {
    console.log('Form values submitted:', values);
    setLoading(true);
    try {
      const newSucursal = await sucursalService.create({
        name: values.name,
        description: values.description,
        location: values.location || '',
        serverUrl: values.serverUrl,
      });

      setSucursals(prev => [...prev, newSucursal]);
      setModalVisible(false);
      form.resetFields();
      message.success(t('common.success'));
    } catch (error: any) {
      console.error('Failed to create sucursal:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || t('common.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSucursal = async (values: any) => {
    if (!selectedSucursal) return;
    
    console.log('Edit form values submitted:', values);
    setLoading(true);
    try {
      const updatedSucursal = await sucursalService.update(selectedSucursal.id, {
        name: values.name,
        description: values.description,
        location: values.location,
        serverUrl: values.serverUrl,
      });

      setSucursals(prev => prev.map(s => s.id === selectedSucursal.id ? { ...s, ...updatedSucursal } : s));
      setEditModalVisible(false);
      setDetailsDrawerVisible(false);
      setSelectedSucursal(null);
      editForm.resetFields();
      message.success(t('common.success'));
    } catch (error: any) {
      console.error('Failed to update sucursal:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || t('common.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSucursal = async (sucursal: Sucursal) => {
    Modal.confirm({
      title: t('sucursal.confirmDelete'),
      content: t('sucursal.confirmDeleteMessage'),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        setLoading(true);
        try {
          await sucursalService.delete(sucursal.id);
          setSucursals(prev => prev.filter(s => s.id !== sucursal.id));
          setDetailsDrawerVisible(false);
          setSelectedSucursal(null);
          message.success(t('common.success'));
        } catch (error) {
          console.error('Failed to delete sucursal:', error);
          message.error(t('common.error'));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const openEditModal = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    editForm.setFieldsValue({
      name: sucursal.name,
      description: sucursal.description,
      location: sucursal.location,
      serverUrl: sucursal.serverUrl,
    });
    setEditModalVisible(true);
  };

  const refreshSucursalStatus = async (sucursalId: string) => {
    setRefreshing(sucursalId);
    try {
      // Find the sucursal to check
      const sucursal = sucursals.find(s => s.id === sucursalId);
      if (!sucursal) {
        message.error(t('common.error'));
        return;
      }

      // Perform local health check
      const health = await checkSucursalHealth(sucursal);
      
      // Update health status
      setHealthStatus(prev => ({
        ...prev,
        [sucursalId]: health
      }));

      if (health.isOnline) {
        message.success(t('sucursal.connectionSuccess'));
      } else {
        message.warning(t('sucursal.connectionFailed'));
      }
    } catch (error) {
      console.error('Failed to refresh sucursal status:', error);
      message.error(t('sucursal.serverUnreachable'));
    } finally {
      setRefreshing(null);
    }
  };

  // Local health check function to ping sucursal servers
  const checkSucursalHealth = async (sucursal: Sucursal): Promise<{ isOnline: boolean; responseTime?: number }> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(sucursal.serverUrl, {
        method: 'HEAD', // Use HEAD to minimize data transfer
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      // If we get ANY response (200, 404, 500, etc.), the server is online
      // We only care if the server is reachable, not if it returns a successful status
      return { isOnline: true, responseTime };
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Check the specific error type to determine if server is reachable
      if (error.name === 'AbortError') {
        // Timeout - server might be online but very slow, consider offline
        return { isOnline: false };
      }
      
      if (error.name === 'TypeError' && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('Network request failed') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED')
      )) {
        // Network error - server is truly unreachable/offline
        return { isOnline: false };
      }
      
      // For CORS errors or other HTTP-related errors, the server responded
      // which means it's online, we just can't access it due to browser restrictions
      if (error.message.includes('CORS') || error.message.includes('cors')) {
        return { isOnline: true, responseTime };
      }
      
      // Default: if we're not sure, assume offline to be safe
      return { isOnline: false };
    }
  };

  // Enhanced online detection with local health check
  const isOnline = (sucursal: Sucursal): boolean => {
    // Use local health check result if available, otherwise fallback to diagnostics
    return healthStatus[sucursal.id]?.isOnline ?? sucursal.diagnostics?.isOnline ?? true;
  };

  // Fetch error logs for a specific sucursal
  const fetchErrorLogs = async (sucursalId: string, startDate?: string, endDate?: string) => {
    try {
      setErrorLogsLoading(true);
      const data = await sucursalService.getErrorLogs(sucursalId, 1, 50, startDate, endDate);
      setErrorLogs(data.errorLogs);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
      message.error(t('common.error'));
      setErrorLogs([]);
    } finally {
      setErrorLogsLoading(false);
    }
  };

  // State for local health check results
  const [healthStatus, setHealthStatus] = useState<Record<string, { isOnline: boolean; responseTime?: number }>>({});

  const getServerStatusBadge = (sucursal: Sucursal) => {
    if (isOnline(sucursal)) {
      return <Badge status="success" text={t('sucursal.online')} />;
    } else {
      return <Badge status="error" text={t('sucursal.offline')} />;
    }
  };

  const getServerStatusColor = (sucursal: Sucursal) => {
    if (isOnline(sucursal)) {
      const responseTime = healthStatus[sucursal.id]?.responseTime || sucursal.diagnostics?.responseTime;
      return (responseTime && responseTime < 100) ? 'success' : 'normal';
    }
    return 'exception';
  };

  // This logColumns array is not used anymore - the table columns are defined inline in the drawer
  // Keeping it for reference but it's not needed

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
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={async () => {
                if (sucursals.length > 0) {
                  await performHealthChecks(sucursals);
                  message.success(t('common.success'));
                }
              }}
              loading={healthCheckLoading}
            >
              {t('common.refresh')}
            </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            {t('sucursal.addSucursal')}
          </Button>
          </Space>
        </div>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('sucursal.totalSucursals')}
              value={sucursals?.length || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('sucursal.online')}
              value={sucursals?.filter(s => isOnline(s))?.length || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('sucursal.offline')}
              value={sucursals?.filter(s => !isOnline(s))?.length || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('sucursal.avgUptime')}
              value={sucursals?.length ? (sucursals.reduce((acc, s) => acc + (s.diagnostics?.uptime || 100), 0) / sucursals.length) : 0}
              precision={1}
              suffix={t('sucursal.percent')}
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
                  <Tooltip title={t('sucursal.refreshStatusTooltip')}>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      loading={refreshing === sucursal.id}
                      onClick={() => refreshSucursalStatus(sucursal.id)}
                    />
                  </Tooltip>
                  <Tooltip title={t('common.edit')}>
                    <Button
                      size="small"
                      icon={<SettingOutlined />}
                      onClick={() => openEditModal(sucursal)}
                    />
                  </Tooltip>
                  <Tooltip title={t('sucursal.viewDetailsTooltip')}>
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedSucursal(sucursal);
                        setDetailsDrawerVisible(true);
                        // Fetch error logs when opening drawer
                        fetchErrorLogs(sucursal.id);
                      }}
                    />
                  </Tooltip>
                </Space>
              }
              className={`border-l-4 ${
                isOnline(sucursal) ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              <div className="space-y-3">
                <div>
                  <Text strong>{t('sucursal.url')}: </Text>
                  <Text code>{sucursal.serverUrl}</Text>
                </div>
                
                <div>
                  <Text type="secondary">{sucursal.description || t('sucursal.na')}</Text>
                </div>
                
                {sucursal.location && (
                  <div>
                    <Text strong>{t('sucursal.location')}: </Text>
                    <Text>{sucursal.location}</Text>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">{t('sucursal.responseTime')}</Text>
                    <div className="text-lg font-semibold">
                      {healthCheckLoading ? (
                        <span className="text-gray-400">{t('common.loading')}</span>
                      ) : (
                        healthStatus[sucursal.id]?.responseTime ? `${healthStatus[sucursal.id].responseTime}${t('sucursal.ms')}` : t('sucursal.na')
                      )}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">{t('sucursal.uptime')}</Text>
                    <div className="text-lg font-semibold">
                      {(sucursal.diagnostics?.uptime || 100).toFixed(1)}{t('sucursal.percent')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary">{t('sucursal.healthStatus')}</Text>
                  <div className="mt-1">
                    <Progress
                      percent={sucursal.diagnostics?.uptime || 100}
                      status={getServerStatusColor(sucursal)}
                      size="small"
                    />
                  </div>
                </div>
                
                {(sucursal.diagnostics?.errorCount || 0) > 0 && (
                  <Alert
                    message={`${sucursal.diagnostics?.errorCount} ${t('sucursal.errorsLogged')}`}
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
        title={t('sucursal.addNewSucursal')}
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
            label={t('sucursal.sucursalName')}
            name="name"
            rules={[{ required: true, message: t('sucursal.pleaseEnterSucursalName') }]}
          >
            <Input placeholder={t('sucursal.enterSucursalName')} size="large" />
          </Form.Item>

          <Form.Item
            label={t('sucursal.serverUrl')}
            name="serverUrl"
            rules={[
              { required: true, message: t('sucursal.pleaseEnterServerUrl') },
              { type: 'url', message: t('sucursal.pleaseEnterValidUrl') }
            ]}
          >
            <Input placeholder={t('sucursal.enterServerUrl')} size="large" />
          </Form.Item>

          <Form.Item
            label={t('sucursal.location')}
            name="location"
            rules={[{ required: true, message: t('sucursal.pleaseEnterLocation') }]}
          >
            <Input placeholder={t('sucursal.enterLocation')} size="large" />
          </Form.Item>

          <Form.Item
            label={t('sucursal.description')}
            name="description"
            rules={[{ required: true, message: t('sucursal.pleaseEnterDescription') }]}
          >
            <TextArea
              rows={3}
              placeholder={t('sucursal.enterDescription')}
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
                {t('sucursal.createSucursal')}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                {t('sucursal.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Sucursal Modal */}
      <Modal
        title={t('sucursal.editSucursal')}
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSucursal}
        >
          <Form.Item
            label={t('sucursal.sucursalName')}
            name="name"
            rules={[{ required: true, message: t('sucursal.pleaseEnterSucursalName') }]}
          >
            <Input placeholder={t('sucursal.enterSucursalName')} size="large" />
          </Form.Item>

          <Form.Item
            label={t('sucursal.serverUrl')}
            name="serverUrl"
            rules={[
              { required: true, message: t('sucursal.pleaseEnterServerUrl') },
              { type: 'url', message: t('sucursal.pleaseEnterValidUrl') }
            ]}
          >
            <Input placeholder={t('sucursal.enterServerUrl')} size="large" />
          </Form.Item>

          <Form.Item
            label={t('sucursal.location')}
            name="location"
            rules={[{ required: true, message: t('sucursal.pleaseEnterLocation') }]}
          >
            <Input placeholder={t('sucursal.enterLocation')} size="large" />
          </Form.Item>

          <Form.Item
            label={t('sucursal.description')}
            name="description"
            rules={[{ required: true, message: t('sucursal.pleaseEnterDescription') }]}
          >
            <TextArea
              rows={3}
              placeholder={t('sucursal.enterDescription')}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SettingOutlined />}
              >
                {t('sucursal.updateSucursal')}
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                }}
              >
                {t('sucursal.cancel')}
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
            <Card size="small" title={t('sucursal.basicInformation')}>
              <div className="space-y-2">
                <div><Text strong>{t('sucursal.name')}:</Text> {selectedSucursal.name}</div>
                <div><Text strong>{t('sucursal.url')}:</Text> <Text code>{selectedSucursal.serverUrl}</Text></div>
                <div><Text strong>{t('sucursal.description')}:</Text> {selectedSucursal.description || t('sucursal.na')}</div>
                {selectedSucursal.location && (
                  <div><Text strong>{t('sucursal.location')}:</Text> {selectedSucursal.location}</div>
                )}
                <div><Text strong>{t('sucursal.createdAt')}:</Text> {new Date(selectedSucursal.createdAt).toLocaleDateString()}</div>
                {selectedSucursal.createdBy && (
                  <div><Text strong>{t('sucursal.createdBy')}:</Text> {selectedSucursal.createdBy.name}</div>
                )}
              </div>
            </Card>

            {/* Current Status */}
            <Card size="small" title={t('sucursal.currentStatus')}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={t('sucursal.status')}
                    value={isOnline(selectedSucursal) ? t('sucursal.online') : t('sucursal.offline')}
                    valueStyle={{
                      color: isOnline(selectedSucursal) ? '#3f8600' : '#cf1322'
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('sucursal.responseTime')}
                    value={healthStatus[selectedSucursal.id]?.responseTime || selectedSucursal.diagnostics?.responseTime || t('sucursal.na')}
                    suffix={(healthStatus[selectedSucursal.id]?.responseTime || selectedSucursal.diagnostics?.responseTime) ? t('sucursal.ms') : ''}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('sucursal.uptime')}
                    value={selectedSucursal.diagnostics?.uptime || 100}
                    precision={2}
                    suffix={t('sucursal.percent')}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('sucursal.errorCount')}
                    value={selectedSucursal.diagnostics?.errorCount || 0}
                    valueStyle={{
                      color: (selectedSucursal.diagnostics?.errorCount || 0) > 0 ? '#cf1322' : '#3f8600'
                    }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Server Logs */}
            <Card 
              size="small" 
              title={t('sucursal.serverLogs')}
              extra={
                <Space>
                  <DatePicker.RangePicker
                    size="small"
                    placeholder={[t('common.startDate'), t('common.endDate')]}
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        const startDate = dates[0].format('YYYY-MM-DD');
                        const endDate = dates[1].format('YYYY-MM-DD');
                        setErrorLogDateRange([startDate, endDate]);
                        if (selectedSucursal) {
                          fetchErrorLogs(selectedSucursal.id, startDate, endDate);
                        }
                      } else {
                        setErrorLogDateRange(null);
                        if (selectedSucursal) {
                          fetchErrorLogs(selectedSucursal.id);
                        }
                      }
                    }}
                  />
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      if (selectedSucursal) {
                        const [startDate, endDate] = errorLogDateRange || [undefined, undefined];
                        fetchErrorLogs(selectedSucursal.id, startDate, endDate);
                      }
                    }}
                  >
                    {t('common.refresh')}
                  </Button>
                </Space>
              }
            >
              <Table
                dataSource={errorLogs}
                columns={[
                  {
                    title: t('sucursal.time'),
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date: string) => new Date(date).toLocaleString(),
                    // width: 150,
                  },
                  {
                    title: t('sucursal.errorType'),
                    dataIndex: 'errorType',
                    key: 'errorType',
                    render: (type: string) => (
                      <Tag color={type === 'ERROR' ? 'red' : type === 'WARNING' ? 'orange' : 'blue'}>
                        {type}
                      </Tag>
                    ),
                    // width: 100,
                  },
                  {
                    title: t('sucursal.description'),
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                  },
                  {
                    title: t('sucursal.details'),
                    dataIndex: 'errorDetails',
                    key: 'errorDetails',
                    render: (details: any, record: any) => {
                      const detailsText = details ? (
                        typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)
                      ) : '-';
                      
                      return (
                        <Tooltip title={detailsText} placement="topLeft">
                          <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                            {detailsText}
                          </Text>
                        </Tooltip>
                      );
                    },
                    ellipsis: true,
                    width: 200,
                  },
                ]}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 300 }}
                loading={errorLogsLoading}
                locale={{ emptyText: t('sucursal.na') }}
              />
            </Card>

            {/* Actions */}
            <Card size="small" title={t('sucursal.actions')}>
              <Space wrap>
                <Button
                  icon={<ReloadOutlined />}
                  loading={refreshing === selectedSucursal.id}
                  onClick={() => refreshSucursalStatus(selectedSucursal.id)}
                >
                  {t('sucursal.refreshStatus')}
                </Button>
                <Button 
                  icon={<SettingOutlined />}
                  onClick={() => openEditModal(selectedSucursal)}
                >
                  {t('common.edit')}
                </Button>
                <Button 
                  icon={<CloseCircleOutlined />}
                  danger
                  onClick={() => handleDeleteSucursal(selectedSucursal)}
                >
                  {t('common.delete')}
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
