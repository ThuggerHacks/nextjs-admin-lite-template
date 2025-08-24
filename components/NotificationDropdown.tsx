'use client';

import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, List, Avatar, Button, Empty, Spin, Typography } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { notificationService, Notification } from '@/lib/services/notificationService';
import { message } from 'antd';

const { Text, Paragraph } = Typography;

interface NotificationDropdownProps {
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  trigger = ['click'],
  placement = 'bottomRight'
}) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      setLoadingCount(true);
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoadingCount(false);
    }
  };

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await notificationService.getAll({ page: 1, limit: 10 });
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown visibility change
  const handleDropdownVisibleChange = (visible: boolean) => {
    setDropdownVisible(visible);
    if (visible) {
      fetchNotifications();
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      message.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      message.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      message.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.delete(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      message.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      message.error('Failed to delete notification');
    }
  };

  // Format notification time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'USER_CREATION':
        return <Avatar style={{ backgroundColor: '#FFA500' }}>U</Avatar>;
      case 'FILE_UPLOADED':
        return <Avatar style={{ backgroundColor: '#52c41a' }}>F</Avatar>;
      case 'GOAL_UPDATED':
        return <Avatar style={{ backgroundColor: '#FFA500' }}>G</Avatar>;
      case 'REPORT_SUBMITTED':
        return <Avatar style={{ backgroundColor: '#722ed1' }}>R</Avatar>;
      default:
        return <Avatar style={{ backgroundColor: '#8c8c8c' }}>N</Avatar>;
    }
  };

  // Dropdown content
  const dropdownContent = (
    <div style={{ 
      width: 400, 
      maxHeight: 500, 
      overflow: 'hidden',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            icon={<CheckCircleOutlined />}
          >
            {t('notifications.markAllAsRead')}
          </Button>
        )}
      </div>

      <div style={{ maxHeight: 400, overflow: 'auto', backgroundColor: 'white' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white' }}>
            <Spin size="small" />
            <div style={{ marginTop: 8 }}>{t('common.loading')}</div>
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('notifications.noNotifications')}
            style={{ padding: '40px 20px', backgroundColor: 'white' }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  backgroundColor: notification.isRead ? 'white' : '#fff7ed',
                  borderLeft: notification.isRead ? 'none' : '3px solid #FFA500',
                  position: 'relative'
                }}
                actions={[
                  !notification.isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    />
                  ),
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  />
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(notification.type)}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#FFA500'
                          }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                        style={{ margin: 0, fontSize: '13px', color: '#666' }}
                      >
                        {notification.description}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTime(notification.createdAt)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
          backgroundColor: 'white'
        }}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              // Navigate to full notifications page
              window.location.href = '/notifications';
            }}
          >
            {t('common.view')} All {t('notifications.notifications')}
          </Button>
        </div>
      )}
    </div>
  );

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={trigger}
      placement={placement}
      open={dropdownVisible}
      onOpenChange={handleDropdownVisibleChange}
      arrow
    >
      <Badge count={loadingCount ? 0 : unreadCount} overflowCount={99}>
        <Button
          type="text"
          icon={<BellOutlined />}
          size="large"
          loading={loadingCount}
          style={{
            border: 'none',
            boxShadow: 'none'
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
