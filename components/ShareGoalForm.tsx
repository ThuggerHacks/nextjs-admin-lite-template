'use client';

import React, { useState } from 'react';
import { Form, Select, Input, Button, Space, Alert, message } from 'antd';
import { useTranslation } from '@/contexts/LanguageContext';
import { goalService } from '@/lib/services/goalService';

const { TextArea } = Input;

interface ShareGoalFormProps {
  goal: any;
  shareableUsers: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ShareGoalForm({ goal, shareableUsers, onSuccess, onCancel }: ShareGoalFormProps) {
  const [form] = Form.useForm();
  const [sharing, setSharing] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    if (!values.sharedWithIds || values.sharedWithIds.length === 0) {
      message.error(t('goals.pleaseSelectUsers'));
      return;
    }

    setSharing(true);
    try {
      const result = await goalService.shareGoal(goal.id, values.sharedWithIds, values.message);
      
      if (result.success) {
        message.success(result.message || t('goals.goalSharedSuccessfully'));
        onSuccess();
      } else {
        message.error(result.error || t('goals.failedToShareGoal'));
      }
    } catch (error) {
      console.error('Error sharing goal:', error);
      message.error(t('goals.failedToShareGoal'));
    } finally {
      setSharing(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Alert
        message={t('goals.shareGoalInfo')}
        description={t('goals.shareGoalDescription')}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        label={t('goals.selectUsersToShare')}
        name="sharedWithIds"
        rules={[{ required: true, message: t('goals.pleaseSelectUsers') }]}
      >
        <Select
          mode="multiple"
          placeholder={t('goals.selectUsers')}
          showSearch
          filterOption={(input, option) => {
            const user = shareableUsers.find(u => u.id === option?.value);
            return user?.name.toLowerCase().includes(input.toLowerCase()) || 
                   user?.email.toLowerCase().includes(input.toLowerCase()) || false;
          }}
        >
          {shareableUsers.map(user => (
            <Select.Option key={user.id} value={user.id}>
              <div>
                <div>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {user.email} - {user.role} {user.department?.name && `(${user.department.name})`}
                </div>
              </div>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={t('goals.message')}
        name="message"
      >
        <TextArea
          rows={3}
          placeholder={t('goals.shareMessagePlaceholder')}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={sharing}>
            {sharing ? t('goals.sharing') : t('goals.shareGoal')}
          </Button>
          <Button onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

