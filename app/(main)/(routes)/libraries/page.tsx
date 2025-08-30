'use client';

import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  FolderOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import LibrariesManager from '@/components/LibrariesManager';

const { Title, Text } = Typography;

export default function LibrariesPage() {
  const { user } = useUser();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FolderOutlined style={{ color: '#1890ff' }} />
              {t('libraries.libraryManagementSystem')}
            </Title>
            <Text type="secondary">
              {t('libraries.organizeAndAccessLibraries')}
            </Text>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <UserOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <Title level={5}>{t('libraries.myLibraries')}</Title>
              <Text type="secondary">{t('libraries.privateLibraryStorage')}</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Library Manager - Only My Libraries */}
      <Card>
        <LibrariesManager
          mode="personal"
          canWrite={true}
          canDelete={true}
          title={t('libraries.myLibraries')}
        />
      </Card>
    </div>
  );
}
