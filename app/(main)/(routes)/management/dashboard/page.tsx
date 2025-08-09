'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  List,
  Progress,
  Typography,
  Space,
  Button,
  DatePicker,
  Select,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  AimOutlined,
  FolderOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mock dashboard data
const mockStats = {
  totalUsers: 156,
  activeUsers: 142,
  totalReports: 1287,
  pendingReports: 23,
  totalGoals: 89,
  completedGoals: 67,
  totalDocuments: 2456,
  publicDocuments: 234,
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'report',
    user: 'João Silva',
    action: 'submitted a new report',
    time: '2 minutes ago',
    status: 'pending',
  },
  {
    id: '2',
    type: 'goal',
    user: 'Maria Santos',
    action: 'completed goal "Increase sales"',
    time: '15 minutes ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'document',
    user: 'Pedro Costa',
    action: 'uploaded document "Q1 Analysis"',
    time: '1 hour ago',
    status: 'active',
  },
  {
    id: '4',
    type: 'user',
    user: 'Ana Oliveira',
    action: 'registered new account',
    time: '2 hours ago',
    status: 'pending',
  },
];

const mockSystemHealth = [
  { name: 'Database', status: 'healthy', uptime: 99.9 },
  { name: 'File Storage', status: 'healthy', uptime: 99.8 },
  { name: 'Authentication', status: 'healthy', uptime: 100 },
  { name: 'Email Service', status: 'warning', uptime: 95.2 },
];

export default function ManagementDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);
  
  const { user, canAccess } = useUser();
  const { t } = useTranslation();

  if (!canAccess([UserRole.SUPER_ADMIN])) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3>Access Denied</h3>
          <p>You don&apos;t have permission to access this page.</p>
        </div>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'goal':
        return <AimOutlined style={{ color: '#52c41a' }} />;
      case 'document':
        return <FolderOutlined style={{ color: '#fa8c16' }} />;
      case 'user':
        return <UserOutlined style={{ color: '#722ed1' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'active':
        return 'blue';
      case 'healthy':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-2">Management Dashboard</Title>
            <Text type="secondary">System overview and administration panel</Text>
          </div>
          <Space>
            <RangePicker onChange={setDateRange} />
            <Select defaultValue="30" style={{ width: 120 }}>
              <Select.Option value="7">Last 7 days</Select.Option>
              <Select.Option value="30">Last 30 days</Select.Option>
              <Select.Option value="90">Last 90 days</Select.Option>
            </Select>
          </Space>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={mockStats.totalUsers}
              prefix={<UserOutlined />}
              suffix={
                <Tag color="green">
                  +{mockStats.activeUsers} active
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reports"
              value={mockStats.totalReports}
              prefix={<FileTextOutlined />}
              suffix={
                <Tag color="orange">
                  {mockStats.pendingReports} pending
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Goals"
              value={mockStats.totalGoals}
              prefix={<AimOutlined />}
              suffix={
                <Tag color="green">
                  {Math.round((mockStats.completedGoals / mockStats.totalGoals) * 100)}% complete
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Documents"
              value={mockStats.totalDocuments}
              prefix={<FolderOutlined />}
              suffix={
                <Tag color="blue">
                  {mockStats.publicDocuments} public
                </Tag>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <Card title="Recent Activity" 
            extra={
              <Button type="link" size="small">
                View All
              </Button>
            }
          >
            <List
              dataSource={mockRecentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getActivityIcon(item.type)}
                    title={
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>{item.user}</strong> {item.action}
                        </span>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status}
                        </Tag>
                      </div>
                    }
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* System Health */}
        <Col xs={24} lg={8}>
          <Card title="System Health">
            <div className="space-y-4">
              {mockSystemHealth.map((service) => (
                <div key={service.name} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-500">
                      Uptime: {service.uptime}%
                    </div>
                  </div>
                  <div className="text-right">
                    <Tag color={getStatusColor(service.status)}>
                      {service.status}
                    </Tag>
                    <div className="mt-1" style={{ width: 80 }}>
                      <Progress
                        percent={service.uptime}
                        size="small"
                        showInfo={false}
                        strokeColor={
                          service.status === 'healthy' ? '#52c41a' : 
                          service.status === 'warning' ? '#fa8c16' : '#ff4d4f'
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="User Engagement">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Daily Active Users</span>
                <div className="text-right">
                  <div className="font-medium">89%</div>
                  <Progress percent={89} size="small" showInfo={false} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Report Completion Rate</span>
                <div className="text-right">
                  <div className="font-medium">94%</div>
                  <Progress percent={94} size="small" showInfo={false} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Goal Achievement Rate</span>
                <div className="text-right">
                  <div className="font-medium">75%</div>
                  <Progress percent={75} size="small" showInfo={false} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Document Usage</span>
                <div className="text-right">
                  <div className="font-medium">67%</div>
                  <Progress percent={67} size="small" showInfo={false} />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="System Alerts">
            <List
              dataSource={[
                {
                  title: 'Email service experiencing delays',
                  type: 'warning',
                  time: '10 minutes ago',
                },
                {
                  title: 'Scheduled maintenance tomorrow 2 AM',
                  type: 'info',
                  time: '2 hours ago',
                },
                {
                  title: 'Backup completed successfully',
                  type: 'success',
                  time: '6 hours ago',
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.type === 'warning' ? <WarningOutlined style={{ color: '#fa8c16' }} /> :
                      item.type === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    }
                    title={item.title}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
