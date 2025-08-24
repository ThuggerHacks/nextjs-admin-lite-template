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
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: Record<string, number>;
    newThisMonth: number;
    growthRate: number;
  };
  departments: {
    total: number;
    withSupervisor: number;
    withoutSupervisor: number;
    activeUsers: number;
  };
  files: {
    total: number;
    totalSize: number;
    byType: Record<string, number>;
    uploadedToday: number;
    uploadedThisWeek: number;
  };
  goals: {
    total: number;
    published: number;
    completed: number;
    inProgress: number;
    overdue: number;
    byStatus: Record<string, number>;
    completionRate: number;
  };
  reports: {
    total: number;
    pending: number;
    reviewed: number;
    archived: number;
    submittedToday: number;
    responseRate: number;
  };
  libraries: {
    total: number;
    totalFiles: number;
    activeUsers: number;
    popularCategories: Array<{ name: string; count: number }>;
  };
  scans: {
    total: number;
    withPdf: number;
    totalFiles: number;
    today: number;
    thisWeek: number;
    successRate: number;
  };
  notifications: {
    total: number;
    unread: number;
    byType: Record<string, number>;
  };
  storage: {
    used: number;
    available: number;
    total: number;
    usagePercentage: number;
  };
  system: {
    uptime: number;
    memory: number;
    cpu: number;
    disk: number;
    lastBackup: string;
    nextMaintenance: string;
  };
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function ManagementDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);
  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [dataError, setDataError] = useState<string | null>(null);
  
  const { user, canAccess } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDataError(null);
      
      // Fetch dashboard statistics
      const statsResponse = await axios.get('/api/dashboard/stats', {
        params: { period }
      });
      
      // Fetch recent activity
      const activityResponse = await axios.get('/api/dashboard/activity', {
        params: { limit: 10, period }
      });
      
      // Fetch system alerts
      const alertsResponse = await axios.get('/api/dashboard/alerts');
      
      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
      setSystemAlerts(alertsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError('Failed to fetch dashboard data. Please check your connection.');
      // Fallback to mock data if API fails
      setStats(getMockStats());
      setRecentActivity(getMockActivity());
      setSystemAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const getMockStats = (): DashboardStats => ({
    users: {
      total: 156,
      active: 142,
      inactive: 8,
      pending: 6,
      byRole: { 'super_admin': 2, 'admin': 8, 'supervisor': 15, 'user': 131 },
      newThisMonth: 12,
      growthRate: 8.5
    },
    departments: {
      total: 12,
      withSupervisor: 10,
      withoutSupervisor: 2,
      activeUsers: 142
    },
    files: {
      total: 2456,
      totalSize: 15.8,
      byType: { 'pdf': 1200, 'docx': 800, 'xlsx': 456 },
      uploadedToday: 23,
      uploadedThisWeek: 156
    },
    goals: {
      total: 89,
      published: 67,
      completed: 45,
      inProgress: 22,
      overdue: 3,
      byStatus: { 'active': 22, 'completed': 45, 'draft': 22 },
      completionRate: 75.3
    },
    reports: {
      total: 1287,
      pending: 23,
      reviewed: 1200,
      archived: 64,
      submittedToday: 8,
      responseRate: 94.2
    },
    libraries: {
      total: 18,
      totalFiles: 1890,
      activeUsers: 89,
      popularCategories: [
        { name: 'Finance', count: 456 },
        { name: 'HR', count: 234 },
        { name: 'Operations', count: 189 }
      ]
    },
    scans: {
      total: 567,
      withPdf: 445,
      totalFiles: 567,
      today: 12,
      thisWeek: 89,
      successRate: 98.5
    },
    notifications: {
      total: 89,
      unread: 12,
      byType: { 'system': 23, 'user': 45, 'report': 21 }
    },
    storage: {
      used: 15.8,
      available: 84.2,
      total: 100,
      usagePercentage: 15.8
    },
    system: {
      uptime: 99.9,
      memory: 67.5,
      cpu: 23.1,
      disk: 15.8,
      lastBackup: '2024-01-15T10:30:00Z',
      nextMaintenance: '2024-01-20T02:00:00Z'
    }
  });

  const getMockActivity = (): ActivityLog[] => [
    {
      id: '1',
      userId: '1',
      action: 'submitted a new report',
      resource: 'report',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      user: { id: '1', name: 'João Silva', email: 'joao@example.com', avatar: 'JS' }
    },
    {
      id: '2',
      userId: '2',
      action: 'completed goal "Increase sales"',
      resource: 'goal',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: { id: '2', name: 'Maria Santos', email: 'maria@example.com', avatar: 'MS' }
    },
    {
      id: '3',
      userId: '3',
      action: 'uploaded document "Q1 Analysis"',
      resource: 'document',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', avatar: 'PC' }
    }
  ];

  const getMockAlerts = (): SystemAlert[] => [
    {
      id: '1',
      type: 'warning',
      title: 'Email service experiencing delays',
      message: 'Email delivery may be delayed by 5-10 minutes',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      acknowledged: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled maintenance tomorrow',
      message: 'System maintenance scheduled for 2 AM - 4 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      acknowledged: true
    }
  ];

  if (!canAccess([UserRole.SUPER_ADMIN])) {
    return (
      <Card className="shadow-lg border-0">
        <div className="text-center py-12">
          <div className="mb-4">
            <WarningOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />
          </div>
          <Title level={3} className="text-gray-700 mb-2">
            {t('common.accessDenied')}
          </Title>
          <Text type="secondary" className="text-lg">
            You don&apos;t have permission to access this page.
          </Text>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'green';
      case 'pending':
      case 'warning':
        return 'orange';
      case 'active':
      case 'info':
        return 'blue';
      case 'error':
        return 'red';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'info':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const quickActions = [
    {
      title: t('dashboard.scanDocument'),
      description: 'Scan and digitize documents',
      icon: <ScanOutlined style={{ fontSize: '28px', color: '#13c2c2' }} />,
      color: '#13c2c2',
      path: '/scanner',
      count: stats?.scans.total || 0,
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      title: t('dashboard.libraries'),
      description: 'Manage document libraries',
      icon: <BookOutlined style={{ fontSize: '28px', color: '#722ed1' }} />,
      color: '#722ed1',
      path: '/libraries',
      count: stats?.libraries.total || 0,
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: t('dashboard.documents'),
      description: 'Access all documents',
      icon: <FileOutlined style={{ fontSize: '28px', color: '#fa8c16' }} />,
      color: '#fa8c16',
      path: '/documents',
      count: stats?.files.total || 0,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const handleQuickAction = (path: string) => {
    router.push(path);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <RiseOutlined style={{ color: '#52c41a' }} />;
    if (value < 0) return <FallOutlined style={{ color: '#ff4d4f' }} />;
    return <LineChartOutlined style={{ color: '#8c8c8c' }} />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return '#52c41a';
    if (value < 0) return '#ff4d4f';
    return '#8c8c8c';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton active paragraph={{ rows: 3 }} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Error Alert */}
      {dataError && (
        <Alert
          message="Data Fetch Error"
          description={dataError}
          type="warning"
          showIcon
          closable
          className="mb-6"
          action={
            <Button size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        />
      )}

      {/* Header */}
      <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white mb-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <DashboardOutlined style={{ fontSize: '32px' }} />
              </div>
              <div>
                <Title level={1} className="text-white mb-2 !text-4xl font-bold drop-shadow-lg">
                  {t('navigation.dashboard')}
                </Title>
                <Text className="text-blue-100 text-lg drop-shadow">
                  {t('dashboard.welcomeTo')} {t('common.platformName')}
                </Text>
              </div>
            </div>
            <Space className="flex-wrap">
              <RangePicker 
                onChange={setDateRange}
                className="w-full lg:w-auto"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <Select 
                value={period} 
                onChange={setPeriod}
                style={{ width: 160, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                className="w-full lg:w-auto"
              >
                <Select.Option value="7">Last 7 days</Select.Option>
                <Select.Option value="30">Last 30 days</Select.Option>
                <Select.Option value="90">Last 90 days</Select.Option>
              </Select>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchDashboardData}
                loading={loading}
                className="w-full lg:w-auto bg-white/20 border-white/30 text-white hover:bg-white/30 hover:scale-105 transition-all duration-200"
                size="large"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              {stats && (
                <div className="text-blue-100 text-sm opacity-80">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              )}
            </Space>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-xl border-0 mb-6 bg-white/80 backdrop-blur-sm">
        <div className="mb-6">
          <Title level={3} className="flex items-center gap-3 mb-2">
            <RocketOutlined style={{ color: '#1890ff' }} />
            {t('dashboard.quickActions')}
          </Title>
          <Text type="secondary" className="text-base">
            Quick access to essential features
          </Text>
        </div>
        <Row gutter={[24, 24]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
                onClick={() => handleQuickAction(action.path)}
                bodyStyle={{ padding: '32px 24px' }}
              >
                <div className={`p-6 bg-gradient-to-br ${action.gradient} rounded-2xl mb-6 inline-block shadow-lg`}>
                  {action.icon}
                </div>
                <Title level={4} className="mb-3 text-gray-800">
                  {action.title}
                </Title>
                <Text type="secondary" className="block mb-4 text-base">
                  {action.description}
                </Text>
                <Badge 
                  count={action.count} 
                  showZero 
                  style={{ backgroundColor: action.color }}
                  className="text-white text-lg px-3 py-1"
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6"
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <BarChartOutlined />
              Overview
            </span>
          } 
          key="overview"
        >
          {/* Key Statistics */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-sm font-medium">
                      {t('dashboard.totalUsers')}
                    </Text>
                    <Title level={2} className="mb-2 text-gray-800">
                      {stats?.users.total.toLocaleString()}
                    </Title>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(stats?.users.growthRate || 0)}
                      <Text style={{ color: getTrendColor(stats?.users.growthRate || 0) }} className="font-medium">
                        {stats?.users.growthRate && stats.users.growthRate > 0 ? '+' : ''}{stats?.users.growthRate || 0}%
                      </Text>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-full">
                    <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active</span>
                    <span className="font-medium">{stats?.users.active}</span>
                  </div>
                  <Progress 
                    percent={Math.round((stats?.users.active || 0) / (stats?.users.total || 1) * 100)} 
                    showInfo={false}
                    strokeColor="#1890ff"
                    trailColor="#e6f7ff"
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-sm font-medium">
                      Reports
                    </Text>
                    <Title level={2} className="mb-2 text-gray-800">
                      {stats?.reports.total.toLocaleString()}
                    </Title>
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text className="text-green-600 font-medium">
                        {stats?.reports.responseRate}% response rate
                      </Text>
                    </div>
                  </div>
                  <div className="p-4 bg-green-100 rounded-full">
                    <FileTextOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pending</span>
                    <span className="font-medium text-orange-600">{stats?.reports.pending}</span>
                  </div>
                  <Progress 
                    percent={Math.round((stats?.reports.pending || 0) / (stats?.reports.total || 1) * 100)} 
                    showInfo={false}
                    strokeColor="#fa8c16"
                    trailColor="#fff7e6"
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-sm font-medium">
                      Goals
                    </Text>
                    <Title level={2} className="mb-2 text-gray-800">
                      {stats?.goals.total}
                    </Title>
                    <div className="flex items-center gap-2">
                      <TrophyOutlined style={{ color: '#fa8c16' }} />
                      <Text className="text-orange-600 font-medium">
                        {stats?.goals.completionRate}% complete
                      </Text>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-100 rounded-full">
                    <AimOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>In Progress</span>
                    <span className="font-medium text-blue-600">{stats?.goals.inProgress}</span>
                  </div>
                  <Progress 
                    percent={Math.round((stats?.goals.inProgress || 0) / (stats?.goals.total || 1) * 100)} 
                    showInfo={false}
                    strokeColor="#1890ff"
                    trailColor="#e6f7ff"
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-sm font-medium">
                      Storage
                    </Text>
                    <Title level={2} className="mb-2 text-gray-800">
                      {stats?.storage.used} GB
                    </Title>
                    <div className="flex items-center gap-2">
                      <CloudOutlined style={{ color: '#722ed1' }} />
                      <Text className="text-purple-600 font-medium">
                        {stats?.storage.usagePercentage}% used
                      </Text>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-full">
                    <FolderOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="font-medium text-green-600">{stats?.storage.available} GB</span>
                  </div>
                  <Progress 
                    percent={stats?.storage.usagePercentage || 0}
                    showInfo={false}
                    strokeColor="#722ed1"
                    trailColor="#f9f0ff"
                  />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity and System Health */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <span>Recent Activity</span>
                  </div>
                }
                extra={
                  <Button type="link" size="small" className="text-blue-600">
                    View All
                  </Button>
                }
                className="shadow-lg border-0 h-full bg-white/80 backdrop-blur-sm"
              >
                {recentActivity.length > 0 ? (
                  <List
                    dataSource={recentActivity}
                    renderItem={(item) => (
                      <List.Item className="hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200">
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              size="large"
                              className="bg-gradient-to-br from-blue-500 to-purple-500"
                            >
                              {item.user.avatar || item.user.name.charAt(0)}
                            </Avatar>
                          }
                          title={
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <span className="text-gray-800">
                                <strong>{item.user.name}</strong> {item.action}
                              </span>
                              <Tag color="blue" className="w-fit">
                                {item.resource}
                              </Tag>
                            </div>
                          }
                          description={
                            <div className="flex items-center gap-2 text-gray-500">
                              <ClockCircleOutlined />
                              <span>{formatDate(item.timestamp)}</span>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No recent activity" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <DatabaseOutlined style={{ color: '#52c41a' }} />
                    <span>System Health</span>
                  </div>
                }
                className="shadow-lg border-0 h-full bg-white/80 backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">System Uptime</span>
                      <Tag color="green">{stats?.system.uptime}%</Tag>
                    </div>
                    <Progress 
                      percent={stats?.system.uptime || 0} 
                      showInfo={false}
                      strokeColor="#52c41a"
                      trailColor="#f6ffed"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Memory Usage</span>
                      <Tag color="blue">{stats?.system.memory}%</Tag>
                    </div>
                    <Progress 
                      percent={stats?.system.memory || 0} 
                      showInfo={false}
                      strokeColor="#1890ff"
                      trailColor="#e6f7ff"
                    />
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-orange-800">CPU Usage</span>
                      <Tag color="orange">{stats?.system.cpu}%</Tag>
                    </div>
                    <Progress 
                      percent={stats?.system.cpu || 0} 
                      showInfo={false}
                      strokeColor="#fa8c16"
                      trailColor="#fff7e6"
                    />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <TeamOutlined />
              Users & Activity
            </span>
          } 
          key="users"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="User Growth" className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center py-8">
                  <div className="mb-4">
                    <RiseOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                  </div>
                  <Title level={2} className="text-green-600 mb-2">
                    +{stats?.users.newThisMonth}
                  </Title>
                  <Text className="text-gray-600">New users this month</Text>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Users</span>
                    <div className="text-right">
                      <div className="font-medium text-gray-800">{stats?.users.active}</div>
                      <Progress 
                        percent={Math.round((stats?.users.active || 0) / (stats?.users.total || 1) * 100)} 
                        size="small" 
                        showInfo={false}
                        strokeColor="#52c41a"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Approval</span>
                    <div className="text-right">
                      <div className="font-medium text-gray-800">{stats?.users.pending}</div>
                      <Progress 
                        percent={Math.round((stats?.users.pending || 0) / (stats?.users.total || 1) * 100)} 
                        size="small" 
                        showInfo={false}
                        strokeColor="#fa8c16"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Department Overview" className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Departments</span>
                      <Badge count={stats?.departments.total} showZero />
                    </div>
                    <Text type="secondary">
                      {stats?.departments.withSupervisor} with supervisors
                    </Text>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Active Users</span>
                      <Badge count={stats?.departments.activeUsers} showZero />
                    </div>
                    <Text type="secondary">
                      Across all departments
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <FileOutlined />
              Files & Storage
            </span>
          } 
          key="files"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title="File Statistics" className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white shadow-lg">
                      <Title level={2} className="text-white mb-2">
                        {stats?.files.total.toLocaleString()}
                      </Title>
                      <Text className="text-blue-100">Total Files</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="text-center p-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl text-white shadow-lg">
                      <Title level={2} className="text-white mb-2">
                        {stats?.files.totalSize} GB
                      </Title>
                      <Text className="text-green-100">Storage Used</Text>
                    </div>
                  </Col>
                </Row>
                
                <Divider />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Uploaded Today</span>
                    <Badge count={stats?.files.uploadedToday} showZero />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Uploaded This Week</span>
                    <Badge count={stats?.files.uploadedThisWeek} showZero />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Storage Breakdown" className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="space-y-4">
                  {stats?.files.byType && Object.entries(stats.files.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize">{type}</span>
                      <div className="text-right">
                        <div className="font-medium">{count}</div>
                        <Progress 
                          percent={Math.round((count / (stats?.files.total || 1)) * 100)} 
                          size="small" 
                          showInfo={false}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <WarningOutlined />
              Alerts & Monitoring
            </span>
          } 
          key="alerts"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card title="System Alerts" className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
                {systemAlerts.length > 0 ? (
                  <List
                    dataSource={systemAlerts}
                    renderItem={(alert) => (
                      <List.Item className="hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200">
                        <List.Item.Meta
                          avatar={
                            <div className="p-3 bg-gray-100 rounded-full">
                              {getAlertIcon(alert.type)}
                            </div>
                          }
                          title={
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-gray-800">{alert.title}</span>
                              <Tag color={getStatusColor(alert.type)}>
                                {alert.type}
                              </Tag>
                            </div>
                          }
                          description={
                            <div className="space-y-2">
                              <Text type="secondary">{alert.message}</Text>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <ClockCircleOutlined />
                                <span>{formatDate(alert.timestamp)}</span>
                                {!alert.acknowledged && (
                                  <Tag color="red">Unacknowledged</Tag>
                                )}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No system alerts" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}
