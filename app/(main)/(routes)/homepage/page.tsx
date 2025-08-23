"use client";

import { Card, Row, Col, Statistic, Button, List, Avatar, Typography, Progress, Space } from "antd";
import {
  UserOutlined,
  FileOutlined,
  ClockCircleOutlined,
  AimOutlined,
  PlusOutlined,
  UploadOutlined,
  ScanOutlined,
  FileTextOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole, DashboardStats, Activity } from "@/types";

const { Title, Text } = Typography;

// Mock data
const mockStats: DashboardStats = {
  totalUsers: 45,
  storedFiles: 1247,
  pendingReports: 8,
  activeGoals: 12,
  newUsers: 3,
  recentActivity: [
    {
      id: '1',
      type: 'report',
      description: 'New report submitted by Pedro Costa',
      user: { id: '3', name: 'Pedro Costa' } as any,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    },
    {
      id: '2',
      type: 'file',
      description: 'Monthly report uploaded to HR library',
      user: { id: '2', name: 'Maria Santos' } as any,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      type: 'goal',
      description: 'Sales target updated for Q1',
      user: { id: '2', name: 'Maria Santos' } as any,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: '4',
      type: 'user',
      description: 'New user registered: Ana Silva',
      user: { id: '1', name: 'João Silva' } as any,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ],
};

export default function HomePage() {
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'report':
        return <FileTextOutlined />;
      case 'file':
        return <FileOutlined />;
      case 'goal':
        return <AimOutlined />;
      case 'user':
        return <UserOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <Title level={2}>
          {t("dashboard.welcomeTo")} {t("common.platformName")}, {user?.name || 'User'}! 👋
        </Title>
        <Text type="secondary">
          {t(`users.userTypes.${user?.role}`)} - {user?.department?.name || 'No Department'}
        </Text>
      </div>

      {/* Statistics Cards - Only for Admins and Super Admins */}
      {hasRole(UserRole.ADMIN) && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t("dashboard.totalUsers")}
                value={mockStats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t("dashboard.storedFiles")}
                value={mockStats.storedFiles}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t("dashboard.pendingReports")}
                value={mockStats.pendingReports}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t("dashboard.activeGoals")}
                value={mockStats.activeGoals}
                prefix={<AimOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title={t("dashboard.quickActions")} className="h-full">
            <Space direction="vertical" className="w-full" size="middle">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="large"
                block
                onClick={() => window.location.href = '/libraries'}
              >
                {t("dashboard.addFiles")}
              </Button>
              
              {hasRole(UserRole.ADMIN) && (
                <Button
                  icon={<FolderAddOutlined />}
                  size="large"
                  block
                  onClick={() => window.location.href = '/libraries'}
                >
                  {t("dashboard.createLibrary")}
                </Button>
              )}
              
              <Button
                icon={<ScanOutlined />}
                size="large"
                block
                onClick={() => window.location.href = '/scanner'}
              >
                {t("dashboard.scanDocument")}
              </Button>
              
              <Button
                icon={<FileTextOutlined />}
                size="large"
                block
                onClick={() => window.location.href = '/reports/submit'}
              >
                {t("dashboard.submitReport")}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card title={t("dashboard.recentActivity")} className="h-full">
            <List
              itemLayout="horizontal"
              dataSource={mockStats.recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={getActivityIcon(item.type)} />
                    }
                    title={item.description}
                    description={formatTimeAgo(item.timestamp)}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional content based on user role */}
      {hasRole(UserRole.SUPER_ADMIN) && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Card title={t("dashboard.companyOverview")}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Text strong>{t("dashboard.newUsersThisMonth")}</Text>
                  <Progress percent={75} status="active" />
                  <Text type="secondary">{mockStats.newUsers} {t("dashboard.newUsers").toLowerCase()}</Text>
                </Col>
                <Col xs={24} md={8}>
                  <Text strong>{t("dashboard.storageUsage")}</Text>
                  <Progress percent={60} status="normal" />
                  <Text type="secondary">2.3 GB / 10 GB used</Text>
                </Col>
                <Col xs={24} md={8}>
                  <Text strong>{t("dashboard.reportsResponseRate")}</Text>
                  <Progress percent={85} status="success" />
                  <Text type="secondary">85% responded within 24h</Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
