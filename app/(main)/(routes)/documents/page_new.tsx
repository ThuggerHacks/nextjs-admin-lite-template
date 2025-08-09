'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tabs,
  Divider,
} from 'antd';
import {
  FileOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';
import EnhancedFileManager from '@/components/EnhancedFileManager';

const { Title, Text } = Typography;

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('public');
  
  const { user } = useUser();
  const { t } = useTranslation();

  const hasAdminAccess = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  };

  const canManageDocuments = () => {
    return hasAdminAccess() || user?.isDepartmentAdmin;
  };

  const tabItems = [
    {
      key: 'public',
      label: (
        <span>
          <GlobalOutlined />
          Public Documents
        </span>
      ),
      children: (
        <EnhancedFileManager
          mode="documents"
          libraryId="public-docs"
          libraryName="Public Documents"
          canWrite={canManageDocuments()}
          canDelete={hasAdminAccess()}
          title="Public Documents - Available to All Users"
          rootPath="/Public Documents"
        />
      ),
    },
    {
      key: 'department',
      label: (
        <span>
          <TeamOutlined />
          Department Documents
        </span>
      ),
      children: (
        <EnhancedFileManager
          mode="documents"
          libraryId={`dept-docs-${user?.department?.toLowerCase().replace(' ', '-')}`}
          libraryName={`${user?.department} Documents`}
          canWrite={canManageDocuments()}
          canDelete={user?.isDepartmentAdmin || hasAdminAccess()}
          title={`${user?.department} Department Documents`}
          rootPath={`/Departments/${user?.department}`}
        />
      ),
    },
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined />
          My Documents
        </span>
      ),
      children: (
        <EnhancedFileManager
          mode="user-files"
          libraryId={`user-docs-${user?.id}`}
          libraryName="My Documents"
          canWrite={true}
          canDelete={true}
          title="My Personal Documents"
          rootPath={`/Users/${user?.name}/Documents`}
          userId={user?.id}
        />
      ),
    },
  ];

  // Add admin-only tabs
  if (hasAdminAccess()) {
    tabItems.push({
      key: 'all-departments',
      label: (
        <span>
          <FolderOutlined />
          All Departments
        </span>
      ),
      children: (
        <EnhancedFileManager
          mode="documents"
          libraryId="all-dept-docs"
          libraryName="All Department Documents"
          canWrite={true}
          canDelete={true}
          title="All Department Documents - Admin View"
          rootPath="/Departments"
        />
      ),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileOutlined style={{ color: '#1890ff' }} />
              Document Management System
            </Title>
            <Text type="secondary">
              Organize and access documents with hierarchical folder structure, multiple view modes, and collaborative features
            </Text>
          </Col>
        </Row>

        <Divider />

        {/* Features Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <GlobalOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <Title level={5}>Public Access</Title>
              <Text type="secondary">Company-wide documents accessible to all employees</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <TeamOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <Title level={5}>Department Files</Title>
              <Text type="secondary">Department-specific documents with role-based access</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <UserOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <Title level={5}>Personal Space</Title>
              <Text type="secondary">Private document storage for individual users</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Document Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}
