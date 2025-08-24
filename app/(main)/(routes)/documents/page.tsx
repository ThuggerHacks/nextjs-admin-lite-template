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
import DocumentsManager from '@/components/DocumentsManager';

const { Title, Text } = Typography;

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  
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
      key: 'all',
      label: (
        <span>
          <GlobalOutlined />
          {t('documents.allDocuments')}
        </span>
      ),
      children: (
        <DocumentsManager
          mode="all"
          canWrite={canManageDocuments()}
          canDelete={hasAdminAccess()}
          title={t('documents.allDocumentsTitle')}
        />
      ),
    },
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined />
          {t('documents.myDocuments')}
        </span>
      ),
      children: (
        <DocumentsManager
          mode="personal"
          canWrite={true}
          canDelete={true}
          title={t('documents.myDocumentsTitle')}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileOutlined style={{ color: '#1890ff' }} />
              {t('documents.documentManagementSystem')}
            </Title>
            <Text type="secondary">
              {t('documents.organizeAndAccessDocuments')}
            </Text>
          </Col>
        </Row>

        <Divider />

        {/* Features Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <GlobalOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <Title level={5}>{t('documents.allDocuments')}</Title>
              <Text type="secondary">{t('documents.companyWideDocuments')}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <UserOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <Title level={5}>{t('documents.myDocuments')}</Title>
              <Text type="secondary">{t('documents.privateDocumentStorage')}</Text>
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
