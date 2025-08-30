'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Progress,
  Typography,
  Space,
  Button,
  DatePicker,
  Select,
  Tag,
  Avatar,
  Tooltip,
  Divider,
  Badge,
  Spin,
  Alert,
  Empty,
  Skeleton,
  Tabs,
  Table,
  Descriptions,
  Divider as AntDivider,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  AimOutlined,
  FolderOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ScanOutlined,
  BookOutlined,
  FileOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  GlobalOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  HeartOutlined,
  TrophyOutlined,
  BarChartOutlined as ChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  BellOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/lib/services/userService';
import { notificationService, Notification } from '@/lib/services/notificationService';
import { documentsService, DocumentItem } from '@/lib/services/documentsService';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: {
      USER: number;
      SUPERVISOR: number;
      ADMIN: number;
      SUPER_ADMIN: number;
      DEVELOPER: number;
    };
    byDepartment: Array<{
      departmentName: string;
      count: number;
    }>;
  };
  notifications: Notification[];
  recentDocuments: DocumentItem[];
  loading: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      byRole: {
        USER: 0,
        SUPERVISOR: 0,
        ADMIN: 0,
        SUPER_ADMIN: 0,
        DEVELOPER: 0,
      },
      byDepartment: [] as Array<{ departmentName: string; count: number }>,
    },
    notifications: [],
    recentDocuments: [],
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user) return;
    
      setLoading(true);
    setError(null);
    try {
      // Load all users to calculate statistics (using existing working route)
      console.log('Loading users for stats calculation...');
      const usersResponse = await userService.getAll({ page: 1, limit: 1000 });
      console.log('Users loaded:', usersResponse);
      
      // Calculate user statistics from the user list
      const allUsers = usersResponse.users;
      const userStats = {
        total: allUsers.length,
        active: allUsers.filter(u => u.status === 'ACTIVE').length,
        inactive: allUsers.filter(u => u.status === 'INACTIVE').length,
        pending: allUsers.filter(u => u.status === 'PENDING').length,
        byRole: {
          USER: allUsers.filter(u => u.role === 'USER').length,
          SUPERVISOR: allUsers.filter(u => u.role === 'SUPERVISOR').length,
          ADMIN: allUsers.filter(u => u.role === 'ADMIN').length,
          SUPER_ADMIN: allUsers.filter(u => u.role === 'SUPER_ADMIN').length,
          DEVELOPER: allUsers.filter(u => u.role === 'DEVELOPER').length,
        },
        byDepartment: []
      };
      
      // Calculate department statistics
      const departmentMap = new Map();
      allUsers.forEach(user => {
        const deptName = user.department?.name || 'No Department';
        if (departmentMap.has(deptName)) {
          departmentMap.set(deptName, departmentMap.get(deptName) + 1);
        } else {
          departmentMap.set(deptName, 1);
        }
      });
      
      userStats.byDepartment = Array.from(departmentMap.entries()).map(([name, count]) => ({
        departmentName: name,
        count: count
      }));
      
      console.log('Calculated user stats:', userStats);
      
      // Load recent documents
      console.log('Loading recent documents...');
      const documentsResponse = await documentsService.getAllDocuments({
        type: 'all',
        page: 1,
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      console.log('Recent documents loaded:', documentsResponse);
      
      // Load recent notifications for the current user
      setNotificationsLoading(true);
      console.log('Loading notifications...');
      const notificationsResponse = await notificationService.getAll({ page: 1, limit: 10 });
      console.log('Notifications loaded:', notificationsResponse);
      
      setStats({
        users: userStats,
        notifications: notificationsResponse.notifications,
        recentDocuments: documentsResponse.items.slice(0, 5), // Show only 5 most recent
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      
      // Fallback to basic stats if the endpoint fails
      setStats(prev => ({ 
        ...prev, 
    users: {
          total: 0,
          active: 0,
          inactive: 0,
          pending: 0,
          byRole: {
            USER: 0,
            SUPERVISOR: 0,
            ADMIN: 0,
            SUPER_ADMIN: 0,
            DEVELOPER: 0,
          },
          byDepartment: [] as Array<{ departmentName: string; count: number }>,
        },
        recentDocuments: [],
        loading: false 
      }));
    } finally {
      setLoading(false);
      setNotificationsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle quick action navigation
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'documents':
        router.push('/documents');
        break;
      case 'libraries':
        router.push('/libraries');
        break;
      case 'scanner':
        router.push('/scanner');
        break;
      default:
        break;
    }
  };

  // Handle document actions
  const handleViewDocument = (doc: any) => {
    // TODO: Implement document view functionality
    console.log('View document:', doc);
  };

  const handleDownloadDocument = (doc: any) => {
    // TODO: Implement document download functionality
    console.log('Download document:', doc);
  };

  const handleOpenFolder = (folder: DocumentItem) => {
    // Navigate to documents page and open the folder
    router.push(`/documents?folder=${folder.id}`);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM_UPDATE':
        return <SettingOutlined />;
      case 'USER_CREATION':
        return <UserOutlined />;
      case 'FILE_UPLOAD':
        return <FileOutlined />;
      case 'GOAL_UPDATE':
        return <AimOutlined />;
      case 'REPORT_SUBMITTED':
        return <FileTextOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SYSTEM_UPDATE':
        return 'blue';
      case 'USER_CREATION':
        return 'green';
      case 'FILE_UPLOAD':
        return 'orange';
      case 'GOAL_UPDATE':
        return 'purple';
      case 'REPORT_SUBMITTED':
        return 'cyan';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Notifications table columns
  const notificationColumns = [
    {
      title: t("dashboard.notifications.columns.type"),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getNotificationColor(type)} icon={getNotificationIcon(type)}>
          {type.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: t("dashboard.notifications.columns.title"),
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: t("dashboard.notifications.columns.description"),
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => <Text>{description}</Text>,
    },
    {
      title: t("dashboard.notifications.columns.date"),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: t("dashboard.notifications.columns.status"),
      dataIndex: 'isRead',
      key: 'isRead',
      render: (isRead: boolean) => (
        <Tag color={isRead ? 'green' : 'orange'}>
          {isRead ? t("dashboard.notifications.status.read") : t("dashboard.notifications.status.unread")}
        </Tag>
      ),
    },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Check if user can access dashboard
  if (user.role === UserRole.SUPERVISOR) {
  return (
      <div className="p-6">
        <Alert
          message="Access Denied"
          description="Supervisors cannot access the dashboard. Please use the homepage instead."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <DashboardOutlined />
          {t("dashboard.title")}
                </Title>
        <Text type="secondary">
          {t("dashboard.welcomeBack", { name: user.name })}
                </Text>
              </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Dashboard"
          description={
            <div>
              <p>{error}</p>
              <p className="mt-2">
                <strong>Debug Info:</strong> Check browser console for more details. 
                The backend stats endpoint might not be working.
              </p>
            </div>
          }
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

                      {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card>
              <Statistic
                title={t("dashboard.statistics.totalUsers")}
                value={stats.users.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
                />
              </Card>
            </Col>
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card>
              <Statistic
                title={t("dashboard.statistics.activeUsers")}
                value={stats.users.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
                loading={loading}
              />
              </Card>
            </Col>
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card>
              <Statistic
                title={t("dashboard.statistics.adminUsers")}
                value={stats.users.byRole.ADMIN + stats.users.byRole.SUPER_ADMIN}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#722ed1' }}
                loading={loading}
                suffix={
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ({stats.users.byRole.ADMIN} Admin + {stats.users.byRole.SUPER_ADMIN} Super)
                    </Text>
                }
              />
              </Card>
            </Col>
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card>
              <Statistic
                title={t("dashboard.statistics.pendingUsers")}
                value={stats.users.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                loading={loading}
              />
              </Card>
            </Col>
        </Row>

        {/* Fallback Message when stats fail */}
        {error && stats.users.total === 0 && (
          <Alert
            message="Dashboard Data Unavailable"
            description="Unable to load user statistics. This might be due to backend connectivity issues or authentication problems."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

          <Row gutter={[24, 24]}>
        {/* Quick Actions */}
        <Col xs={24} md={24} lg={12} xl={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                <RocketOutlined />
                {t("dashboard.quickActions.title")}
                  </div>
                }
            className="h-full"
          >
            <Space direction="vertical" className="w-full" size="middle">
              <Button
                type="primary"
                icon={<FileOutlined />}
                size="large"
                block
                onClick={() => handleQuickAction('documents')}
              >
                {t("dashboard.quickActions.goToDocuments")}
                  </Button>
              
              <Button
                icon={<FolderOpenOutlined />}
                size="large"
                block
                onClick={() => handleQuickAction('libraries')}
              >
                {t("dashboard.quickActions.goToLibraries")}
              </Button>
              
              <Button
                icon={<ScanOutlined />}
                              size="large"
                block
                onClick={() => handleQuickAction('scanner')}
              >
                {t("dashboard.quickActions.scanner")}
              </Button>
            </Space>
          </Card>
        </Col>

                  {/* Recent Documents */}
          <Col xs={24} md={24} lg={12} xl={12}>
            <Card
                          title={
                <div className="flex items-center gap-2">
                  <FileTextOutlined />
                  {t("dashboard.recentDocuments.title")}
                            </div>
                          }
              className="h-full"
              extra={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={loadDashboardData}
                  loading={loading}
                >
                  {t("dashboard.recentDocuments.refresh")}
                </Button>
              }
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <Table
                  size="small"
                  dataSource={stats.recentDocuments || []}
                  pagination={false}
                  scroll={{ x: 300 }}
                  locale={{
                    emptyText: <Empty description={t("dashboard.recentDocuments.noDocuments")} />
                  }}
                  columns={[
                    {
                      title: t("dashboard.recentDocuments.columns.name"),
                      dataIndex: 'name',
                      key: 'name',
                      render: (name: string, record: DocumentItem) => (
                        <Space>
                          {record.type === 'folder' ? 
                            <FolderOutlined style={{ color: '#52c41a' }} /> : 
                            <FileTextOutlined style={{ color: '#1890ff' }} />
                          }
                          <Text strong>{name}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: t("dashboard.recentDocuments.columns.uploadedBy"),
                      dataIndex: 'userName',
                      key: 'userName',
                      render: (userName: string) => (
                        <Text type="secondary">{userName || 'Unknown'}</Text>
                      ),
                    },
                    {
                      title: t("dashboard.recentDocuments.columns.date"),
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date: string) => (
                        <Text type="secondary">{formatDate(date)}</Text>
                      ),
                    },
                    {
                      title: t("dashboard.recentDocuments.columns.actions"),
                      key: 'actions',
                      render: (_, record: DocumentItem) => (
                        <Space>
                          {record.type === 'folder' ? (
                            <Button
                              type="text"
                              size="small"
                              icon={<FolderOpenOutlined />}
                              onClick={() => handleOpenFolder(record)}
                              title={t("dashboard.recentDocuments.openFolder")}
                            />
                          ) : (
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownloadDocument(record)}
                              title={t("dashboard.recentDocuments.downloadFile")}
                            />
                          )}
                        </Space>
                      ),
                    },
                  ]}
                />
                )}
              </Card>
            </Col>
      </Row>

      {/* Recent Notifications */}
      <Row gutter={[24, 24]} className="mt-6">
        <Col span={24}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                <BellOutlined />
                {t("dashboard.notifications.title")}
                  </div>
                }
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadDashboardData}
                loading={loading}
              >
                {t("dashboard.notifications.refresh")}
              </Button>
            }
          >
            <Table
              columns={notificationColumns}
              dataSource={stats.notifications}
              rowKey="id"
              loading={notificationsLoading}
              pagination={false}
              size="small"
              scroll={{ x: 400 }}
              locale={{
                emptyText: <Empty description={t("dashboard.notifications.noNotifications")} />
              }}
            />
              </Card>
            </Col>
          </Row>

      {/* Additional Statistics */}
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} md={24} lg={12} xl={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
              <TeamOutlined />
                {t("dashboard.userStats.title")}
              </div>
            }
          >
            <Space direction="vertical" className="w-full" size="small">
              <div className="flex justify-between items-center">
                <Text>{t("dashboard.userStats.regularUsers")}:</Text>
                <Text strong>{stats.users.byRole.USER}</Text>
                  </div>
              <div className="flex justify-between items-center">
                <Text>{t("dashboard.userStats.supervisors")}:</Text>
                <Text strong>{stats.users.byRole.SUPERVISOR}</Text>
                </div>
                  <div className="flex justify-between items-center">
                <Text>{t("dashboard.userStats.admins")}:</Text>
                <Text strong>{stats.users.byRole.ADMIN}</Text>
                    </div>
              <div className="flex justify-between items-center">
                <Text>{t("dashboard.userStats.superAdmins")}:</Text>
                <Text strong>{stats.users.byRole.SUPER_ADMIN}</Text>
                  </div>
                  <div className="flex justify-between items-center">
                <Text>{t("dashboard.userStats.developers")}:</Text>
                <Text strong>{stats.users.byRole.DEVELOPER}</Text>
                    </div>
            </Space>
              </Card>
            </Col>

        <Col xs={24} md={24} lg={12} xl={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <BarChartOutlined />
                {t("dashboard.systemOverview.title")}
                    </div>
            }
          >
            <Space direction="vertical" className="w-full" size="small">
                  <div className="flex justify-between items-center">
                <Text>{t("dashboard.systemOverview.totalDepartments")}:</Text>
                <Text strong>{stats.users.byDepartment.length}</Text>
                  </div>
                  <div className="flex justify-between items-center">
                <Text>{t("dashboard.systemOverview.inactiveUsers")}:</Text>
                <Text strong>{stats.users.inactive}</Text>
                  </div>

            </Space>
              </Card>
            </Col>
          </Row>
    </div>
  );
}
