"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, List, Button, Space, Tag, Badge, Empty, Tabs, message, Spin, Pagination } from "antd";
import { 
  BellOutlined, 
  FileTextOutlined, 
  AimOutlined, 
  UserOutlined, 
  AlertOutlined,
  FileOutlined,
  MessageOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { notificationService, Notification as NotificationType } from "@/lib/services/notificationService";
import { UserRole } from "@/types";

const { TabPane } = Tabs;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  // Load notifications with pagination
  const loadNotifications = useCallback(async (page = 1, pageSize = 10, filter?: 'all' | 'unread' | 'read') => {
    if (!user) return;
    
    setLoading(true);
    try {
      let response;
      
      if (filter === 'unread') {
        response = await notificationService.getUnread({ page, limit: pageSize });
      } else if (filter === 'read') {
        response = await notificationService.getRead({ page, limit: pageSize });
      } else {
        response = await notificationService.getAll({ page, limit: pageSize });
      }

      setNotifications(response.notifications);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages,
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notifications on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadNotifications(1, pagination.pageSize, activeTab as 'all' | 'unread' | 'read');
    }
  }, [user, activeTab, loadNotifications]);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadNotifications(1, pagination.pageSize, key as 'all' | 'unread' | 'read');
  };

  // Handle pagination change
  const handlePageChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || pagination.pageSize;
    setPagination(prev => ({ ...prev, current: page, pageSize: newPageSize }));
    loadNotifications(page, newPageSize, activeTab as 'all' | 'unread' | 'read');
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      message.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      message.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      message.success('All notifications marked as read');
      // Reload to get updated counts
      loadNotifications(pagination.current, pagination.pageSize, activeTab as 'all' | 'unread' | 'read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      message.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.delete(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      message.success('Notification deleted');
      // Reload to get updated counts
      loadNotifications(pagination.current, pagination.pageSize, activeTab as 'all' | 'unread' | 'read');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      message.error('Failed to delete notification');
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    loadNotifications(pagination.current, pagination.pageSize, activeTab as 'all' | 'unread' | 'read');
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return <FileTextOutlined className="text-blue-500" />;
      case 'GOAL_UPDATED':
        return <AimOutlined className="text-green-500" />;
      case 'USER_REQUEST':
        return <UserOutlined className="text-purple-500" />;
      case 'SYSTEM_ALERT':
        return <AlertOutlined className="text-red-500" />;
      case 'NEW_FILE':
        return <FileOutlined className="text-orange-500" />;
      case 'RESPONSE_RECEIVED':
        return <MessageOutlined className="text-teal-500" />;
      default:
        return <BellOutlined />;
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return 'blue';
      case 'GOAL_UPDATED':
        return 'green';
      case 'USER_REQUEST':
        return 'purple';
      case 'SYSTEM_ALERT':
        return 'red';
      case 'NEW_FILE':
        return 'orange';
      case 'RESPONSE_RECEIVED':
        return 'cyan';
      default:
        return 'default';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('notifications.timeAgo.justNow');
    if (diffInMinutes < 60) return `${diffInMinutes}${t('notifications.timeAgo.minutesAgo')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${t('notifications.timeAgo.hoursAgo')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}${t('notifications.timeAgo.daysAgo')}`;
    
    return date.toLocaleDateString();
  };

  // Get notification type display text
  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return t('notifications.types.reportSubmitted');
      case 'GOAL_UPDATED':
        return t('notifications.types.goalUpdated');
      case 'USER_REQUEST':
        return t('notifications.types.userRequest');
      case 'SYSTEM_ALERT':
        return t('notifications.types.systemAlert');
      case 'NEW_FILE':
        return t('notifications.types.newFile');
      case 'RESPONSE_RECEIVED':
        return t('notifications.types.responseReceived');
      default:
        return type.replace('_', ' ');
    }
  };

  // Filter notifications for current user
  const getUserNotifications = () => {
    if (!user) return [];
    
    return notifications.filter(notification => 
      notification.userId === user.id || 
      notification.userId === 'all' ||
      (hasRole(UserRole.ADMIN) && notification.type === 'REPORT_SUBMITTED') ||
      (hasRole(UserRole.SUPER_ADMIN) && notification.type === 'USER_REQUEST')
    );
  };

  const userNotifications = getUserNotifications();
  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  const unreadNotifications = userNotifications.filter(n => !n.isRead);
  const readNotifications = userNotifications.filter(n => n.isRead);

  const renderNotificationItem = (notification: NotificationType) => (
    <List.Item
      key={notification.id}
      className={`${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} hover:bg-gray-50`}
      actions={[
        <Space key="actions">
          {!notification.isRead && (
            <Button 
              size="small" 
              icon={<CheckOutlined />}
              onClick={() => markAsRead(notification.id)}
            >
              {t("notifications.markAsRead")}
            </Button>
          )}
          <Button 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteNotification(notification.id)}
          />
        </Space>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Badge dot={!notification.isRead}>
            {getNotificationIcon(notification.type)}
          </Badge>
        }
        title={
          <div className="flex items-center justify-between">
            <span className={!notification.isRead ? 'font-semibold' : ''}>{notification.title}</span>
            <div className="flex items-center gap-2">
              <Tag color={getNotificationTypeColor(notification.type)}>
                {getNotificationTypeText(notification.type)}
              </Tag>
              <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
            </div>
          </div>
        }
        description={notification.description}
      />
    </List.Item>
  );

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <Empty description="Please log in to view notifications" />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Badge count={unreadCount} size="small">
                  <BellOutlined />
                </Badge>
                {t("notifications.notifications")}
              </h2>
              <p className="text-gray-600 mt-2">
                {t("notifications.stayUpdated")}
              </p>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refreshNotifications}
                loading={loading}
              >
                {t("common.refresh")}
              </Button>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} icon={<CheckOutlined />}>
                  {t("notifications.markAllAsRead")} ({unreadCount})
                </Button>
              )}
            </Space>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane tab={`${t("notifications.all")} (${userNotifications.length})`} key="all">
                {userNotifications.length === 0 ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("notifications.noNotifications")}
                  />
                ) : (
                  <List
                    dataSource={userNotifications}
                    renderItem={renderNotificationItem}
                    pagination={false}
                  />
                )}
              </TabPane>

              <TabPane tab={`${t("notifications.unread")} (${unreadCount})`} key="unread">
                {unreadNotifications.length === 0 ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("notifications.noUnreadNotifications")}
                  />
                ) : (
                  <List
                    dataSource={unreadNotifications}
                    renderItem={renderNotificationItem}
                    pagination={false}
                  />
                )}
              </TabPane>

              <TabPane tab={`${t("notifications.read")} (${readNotifications.length})`} key="read">
                {readNotifications.length === 0 ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("notifications.noReadNotifications")}
                  />
                ) : (
                  <List
                    dataSource={readNotifications}
                    renderItem={renderNotificationItem}
                    pagination={false}
                  />
                )}
              </TabPane>
            </Tabs>

            {/* Custom pagination */}
            {pagination.total > pagination.pageSize && (
              <div className="mt-6 text-center">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                  pageSizeOptions={['5', '10', '20', '50']}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
