"use client";

import { useState } from "react";
import { Card, List, Button, Space, Tag, Badge, Empty, Tabs } from "antd";
import { 
  BellOutlined, 
  FileTextOutlined, 
  AimOutlined, 
  UserOutlined, 
  AlertOutlined,
  FileOutlined,
  MessageOutlined,
  CheckOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Notification, NotificationType, UserRole } from "@/types";

const { TabPane } = Tabs;

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: NotificationType.REPORT_SUBMITTED,
    title: 'New Report Submitted',
    message: 'Pedro Costa submitted a monthly sales report for your review.',
    read: false,
    userId: '2', // Admin Maria Santos
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    relatedId: '1',
  },
  {
    id: '2',
    type: NotificationType.GOAL_UPDATED,
    title: 'Goal Progress Updated',
    message: 'Q1 Sales Target goal has been updated. Current progress: 125%',
    read: false,
    userId: '3', // User Pedro Costa
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    relatedId: '1',
  },
  {
    id: '3',
    type: NotificationType.USER_REQUEST,
    title: 'New User Registration Request',
    message: 'Ana Silva has requested access to the platform.',
    read: true,
    userId: '1', // Super Admin João Silva
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    relatedId: '3',
  },
  {
    id: '4',
    type: NotificationType.RESPONSE_RECEIVED,
    title: 'Report Response Received',
    message: 'Your system performance report has been reviewed and responded to.',
    read: false,
    userId: '4', // User Ana Silva
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    relatedId: '2',
  },
  {
    id: '5',
    type: NotificationType.NEW_FILE,
    title: 'New File Uploaded',
    message: 'Employee Handbook has been updated in HR Documents library.',
    read: true,
    userId: '5', // All users in HR
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    relatedId: '2',
  },
  {
    id: '6',
    type: NotificationType.SYSTEM_ALERT,
    title: 'System Maintenance Scheduled',
    message: 'Planned maintenance window scheduled for this weekend.',
    read: false,
    userId: 'all', // All users
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  // Filter notifications for current user
  const getUserNotifications = () => {
    if (!user) return [];
    
    return notifications.filter(notification => 
      notification.userId === user.id || 
      notification.userId === 'all' ||
      (hasRole(UserRole.ADMIN) && notification.type === NotificationType.REPORT_SUBMITTED) ||
      (hasRole(UserRole.SUPER_ADMIN) && notification.type === NotificationType.USER_REQUEST)
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.REPORT_SUBMITTED:
        return <FileTextOutlined className="text-blue-500" />;
      case NotificationType.GOAL_UPDATED:
        return <AimOutlined className="text-green-500" />;
      case NotificationType.USER_REQUEST:
        return <UserOutlined className="text-purple-500" />;
      case NotificationType.SYSTEM_ALERT:
        return <AlertOutlined className="text-red-500" />;
      case NotificationType.NEW_FILE:
        return <FileOutlined className="text-orange-500" />;
      case NotificationType.RESPONSE_RECEIVED:
        return <MessageOutlined className="text-teal-500" />;
      default:
        return <BellOutlined />;
    }
  };

  const getNotificationTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.REPORT_SUBMITTED:
        return 'blue';
      case NotificationType.GOAL_UPDATED:
        return 'green';
      case NotificationType.USER_REQUEST:
        return 'purple';
      case NotificationType.SYSTEM_ALERT:
        return 'red';
      case NotificationType.NEW_FILE:
        return 'orange';
      case NotificationType.RESPONSE_RECEIVED:
        return 'cyan';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (date: Date) => {
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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const userNotifications = getUserNotifications();
  const unreadCount = userNotifications.filter(n => !n.read).length;
  const unreadNotifications = userNotifications.filter(n => !n.read);
  const readNotifications = userNotifications.filter(n => n.read);

  const renderNotificationItem = (notification: Notification) => (
    <List.Item
      key={notification.id}
      className={`${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} hover:bg-gray-50`}
      actions={[
        <Space key="actions">
          {!notification.read && (
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
          <Badge dot={!notification.read}>
            {getNotificationIcon(notification.type)}
          </Badge>
        }
        title={
          <div className="flex items-center justify-between">
            <span className={!notification.read ? 'font-semibold' : ''}>{notification.title}</span>
            <div className="flex items-center gap-2">
              <Tag color={getNotificationTypeColor(notification.type)}>
                {notification.type.replace('_', ' ')}
              </Tag>
              <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
            </div>
          </div>
        }
        description={notification.message}
      />
    </List.Item>
  );

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
                Stay updated with important platform activities
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} icon={<CheckOutlined />}>
                {t("notifications.markAllAsRead")} ({unreadCount})
              </Button>
            )}
          </div>
        </div>

        {userNotifications.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("notifications.noNotifications")}
          />
        ) : (
          <Tabs defaultActiveKey="all">
            <TabPane tab={`All (${userNotifications.length})`} key="all">
              <List
                dataSource={userNotifications}
                renderItem={renderNotificationItem}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>

            <TabPane tab={`Unread (${unreadCount})`} key="unread">
              <List
                dataSource={unreadNotifications}
                renderItem={renderNotificationItem}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>

            <TabPane tab={`Read (${readNotifications.length})`} key="read">
              <List
                dataSource={readNotifications}
                renderItem={renderNotificationItem}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        )}
      </Card>
    </div>
  );
}
