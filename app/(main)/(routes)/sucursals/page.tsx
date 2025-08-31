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
  Spin,
  Empty,
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
  FileTextOutlined,
  SyncOutlined,
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
  const [syncing, setSyncing] = useState<string | null>(null);
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
  const [errorLogsError, setErrorLogsError] = useState<string | null>(null);

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
    return user?.role === UserRole.DEVELOPER || user?.role === UserRole.SUPER_ADMIN;
  };

  const canViewErrorLogs = () => {
    return user?.role === UserRole.DEVELOPER || user?.role === UserRole.SUPER_ADMIN;
  };

  const handleCreateSucursal = async (values: any) => {
    console.log('Form values submitted:', values);
    setLoading(true);
    try {
      // First create the sucursal locally
      const newSucursal = await sucursalService.create({
        name: values.name,
        description: values.description,
        location: values.location || '',
        serverUrl: values.serverUrl,
      });

      // Add to local state
      setSucursals(prev => [...prev, newSucursal]);
      
      // Now sync this new sucursal to all existing sucursals
      try {
        const syncResults = await sucursalService.syncNewSucursalToAll(
          {
            name: values.name,
            description: values.description,
            location: values.location || '',
            serverUrl: values.serverUrl,
          },
          sucursals
        );

        if (syncResults.success) {
          message.success(`${t('common.success')} - Sucursal synced to all servers`);
        } else {
          // Show warning if some syncs failed
          const warningMsg = `Sucursal created but sync failed for: ${syncResults.failed.join(', ')}`;
          message.warning(warningMsg);
          console.warn('Sync results:', syncResults);
        }
      } catch (syncError: any) {
        console.error('Failed to sync sucursal to other servers:', syncError);
        message.warning('Sucursal created locally but failed to sync to other servers');
      }

      setModalVisible(false);
      form.resetFields();
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
  const fetchErrorLogs = async (sucursalId: string, serverUrl: string, startDate?: string, endDate?: string) => {
    if (!canViewErrorLogs()) {
      setErrorLogsError('Access denied: Insufficient permissions to view error logs');
      setErrorLogs([]);
      return;
    }

    try {
      setErrorLogsLoading(true);
      setErrorLogsError(null);
      const data = await sucursalService.getErrorLogs(sucursalId, selectedSucursal?.serverUrl || '', 1, 50, startDate, endDate);
      setErrorLogs(data.errorLogs || []);
    } catch (error: any) {
      console.error('Failed to fetch error logs:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch error logs';
      setErrorLogsError(errorMessage);
      setErrorLogs([]);
      
      // Show user-friendly error message
      if (error.response?.status === 403) {
        message.error('Access denied: You need DEVELOPER or SUPER_ADMIN role to view error logs');
      } else {
        message.error(`Failed to fetch error logs: ${errorMessage}`);
      }
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

  // Sync sucursals from local server to target sucursal
  const handleSyncSucursals = async (targetSucursal: Sucursal) => {
    try {
      setSyncing(targetSucursal.id);
      
      // Check if target sucursal is online
      if (!isOnline(targetSucursal)) {
        message.error(`${targetSucursal.name} is offline. Cannot sync sucursals.`);
        return;
      }
      
      // Get all local sucursals
      const localSucursals = await sucursalService.getAll();
      
      // Filter out the target sucursal itself
      const sucursalsToSync = localSucursals.filter(s => s.id !== targetSucursal.id);
      
      if (sucursalsToSync.length === 0) {
        message.info('No sucursals to sync');
        return;
      }

      // Send each sucursal to the target server
      let successCount = 0;
      let errorCount = 0;

      for (const sucursal of sucursalsToSync) {
        try {
          const response = await fetch(`${targetSucursal.serverUrl}/api/sucursals`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              name: sucursal.name,
              description: sucursal.description,
              location: sucursal.location,
              serverUrl: sucursal.serverUrl,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to sync sucursal ${sucursal.name}:`, response.statusText);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error syncing sucursal ${sucursal.name}:`, error);
        }
      }

      if (errorCount === 0) {
        message.success(`Successfully synced ${successCount} sucursals to ${targetSucursal.name}`);
      } else if (successCount > 0) {
        message.warning(`Synced ${successCount} sucursals, ${errorCount} failed`);
      } else {
        message.error(`Failed to sync any sucursals to ${targetSucursal.name}`);
      }
    } catch (error) {
      console.error('Failed to sync sucursals:', error);
      message.error('Failed to sync sucursals');
    } finally {
      setSyncing(null);
    }
  };

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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <Title level={3} className="mb-2">
              <DatabaseOutlined className="mr-2" />
              {t('sucursal.management')}
            </Title>
            <Text type="secondary">
              {t('sucursal.manageSucursals')}
            </Text>
          </div>
          <Space direction="vertical" className="w-full lg:w-auto">
            <Button
              icon={<ReloadOutlined />}
              onClick={async () => {
                if (sucursals.length > 0) {
                  await performHealthChecks(sucursals);
                  message.success(t('common.success'));
                }
              }}
              loading={healthCheckLoading}
              className="w-full lg:w-auto"
            >
              {t('common.refresh')}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              className="w-full lg:w-auto"
            >
              {t('sucursal.addSucursal')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('sucursal.totalSucursals')}
              value={sucursals?.length || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('sucursal.online')}
              value={sucursals?.filter(s => isOnline(s))?.length || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('sucursal.offline')}
              value={sucursals?.filter(s => !isOnline(s))?.length || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <span className="text-base font-medium">{sucursal.name}</span>
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
                        fetchErrorLogs(sucursal.id, sucursal.serverUrl);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Sync Sucursals">
                    <Button
                      size="small"
                      icon={<SyncOutlined />}
                      loading={syncing === sucursal.id}
                      onClick={() => handleSyncSucursals(sucursal)}
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
                  <Text code className="break-all">{sucursal.serverUrl}</Text>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        open={modalVisible}
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
        open={editModalVisible}
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
        open={detailsDrawerVisible}
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
                <div><Text strong>{t('sucursal.url')}:</Text> <Text code className="break-all">{selectedSucursal.serverUrl}</Text></div>
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
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={t('sucursal.status')}
                    value={isOnline(selectedSucursal) ? t('sucursal.online') : t('sucursal.offline')}
                    valueStyle={{
                      color: isOnline(selectedSucursal) ? '#3f8600' : '#cf1322'
                    }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={t('sucursal.responseTime')}
                    value={healthStatus[selectedSucursal.id]?.responseTime || selectedSucursal.diagnostics?.responseTime || t('sucursal.na')}
                    suffix={(healthStatus[selectedSucursal.id]?.responseTime || selectedSucursal.diagnostics?.responseTime) ? t('sucursal.ms') : ''}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title={t('sucursal.uptime')}
                    value={selectedSucursal.diagnostics?.uptime || 100}
                    precision={2}
                    suffix={t('sucursal.percent')}
                  />
                </Col>
                <Col xs={24} sm={12}>
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
              title={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <span>{t('sucursal.serverLogs')}</span>
                  {!canViewErrorLogs() && (
                    <Tag color="orange" icon={<WarningOutlined />}>
                      Requires DEVELOPER role
                    </Tag>
                  )}
                </div>
              }
              extra={
                canViewErrorLogs() && (
                  <Space direction="vertical" className="w-full sm:w-auto">
                    <DatePicker.RangePicker
                      size="small"
                      placeholder={[t('common.startDate'), t('common.endDate')]}
                      onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                          const startDate = dates[0].format('YYYY-MM-DD');
                          const endDate = dates[1].format('YYYY-MM-DD');
                          setErrorLogDateRange([startDate, endDate]);
                          if (selectedSucursal) {
                            fetchErrorLogs(selectedSucursal.id, selectedSucursal.serverUrl, startDate, endDate);
                          }
                        } else {
                          setErrorLogDateRange(null);
                          if (selectedSucursal) {
                            fetchErrorLogs(selectedSucursal.id, selectedSucursal.serverUrl);
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
                          fetchErrorLogs(selectedSucursal.id, selectedSucursal.serverUrl, startDate, endDate);
                        }
                      }}
                    >
                      {t('common.refresh')}
                    </Button>
                  </Space>
                )
              }
            >
              {!canViewErrorLogs() ? (
                <Alert
                  message="Access Denied"
                  description="You need DEVELOPER or SUPER_ADMIN role to view error logs"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              ) : errorLogsError ? (
                <Alert
                  message="Error Loading Logs"
                  description={errorLogsError}
                  type="error"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                />
              ) : (
                <Table
                    dataSource={errorLogs}
                    columns={[
                    {
                      title: t('sucursal.time'),
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date: string) => new Date(date).toLocaleString(),
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
                    },
                    {
                      title: t('sucursal.description'),
                      dataIndex: 'description',
                      key: 'description',
                      ellipsis: true,
                      render: (text: string) => (
                        <Tooltip title={text} placement="topLeft">
                          <Text ellipsis>{text}</Text>
                        </Tooltip>
                      ),
                    },
                    {
                      title: t('sucursal.details'),
                      dataIndex: 'errorDetails',
                      key: 'errorDetails',
                      render: (details: any) => {
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
                    },
                  ]}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  scroll={{ y: 300, x: 600 }}
                  loading={errorLogsLoading}
                  locale={{ 
                    emptyText: errorLogs.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No error logs found"
                      />
                    ) : 'No data'
                  }}
                />
              )}
            </Card>

            {/* Actions */}
            <Card size="small" title={t('sucursal.actions')}>
              <Space>
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
