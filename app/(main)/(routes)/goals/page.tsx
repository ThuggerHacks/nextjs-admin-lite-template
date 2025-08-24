'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Progress,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  DatePicker,
  Tooltip,
  Dropdown,
  message,
  Spin,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  AimOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  FilterOutlined,
  ReloadOutlined,
  TeamOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, UserRole, UserStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { goalService } from '@/lib/services/goalService';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Goals data is now loaded from backend via goalService

const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, hasRole } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load goals from backend
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await goalService.getAll();
      
      // Transform backend data to frontend format
      const transformedGoals: Goal[] = response.goals.map((goal: any) => ({
        id: goal.id,
        title: goal.name, // Backend uses 'name', frontend expects 'title'
        description: goal.description || '',
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
        status: mapBackendStatusToFrontend(goal.status),
        priority: mapBackendPriorityToFrontend(goal.priority),
        department: goal.department?.name || '',
        assignedTo: goal.assignments?.map((assignment: any) => ({
          id: assignment.user.id,
          name: assignment.user.name,
          email: assignment.user.email,
          role: assignment.user.role as UserRole,
          department: goal.department?.name || '',
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
        })) || [],
        createdBy: {
          id: goal.createdBy.id,
          name: goal.createdBy.name,
          email: goal.createdBy.email,
          role: goal.createdBy.role as UserRole,
          department: goal.department?.name || '',
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
        },
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        progress: goal.progress || 0,
        reports: goal.reports || [],
        isCompleted: goal.status === 'COMPLETED',
        requiresReportOnCompletion: true,
        completionReportSubmitted: goal.reports?.some((r: any) => r.isCompletion) || false,
      }));
      
      setGoals(transformedGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
      message.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to map backend values to frontend enums
  const mapBackendStatusToFrontend = (status: string): GoalStatus => {
    switch (status?.toUpperCase()) {
      case 'DRAFT': return GoalStatus.PENDING;
      case 'PUBLISHED': return GoalStatus.ACTIVE;
      case 'IN_PROGRESS': return GoalStatus.ACTIVE;
      case 'COMPLETED': return GoalStatus.COMPLETED;
      case 'CANCELLED': return GoalStatus.CANCELLED;
      default: return GoalStatus.PENDING;
    }
  };

  const mapBackendPriorityToFrontend = (priority: string): GoalPriority => {
    switch (priority?.toLowerCase()) {
      case 'high': return GoalPriority.HIGH;
      case 'medium': return GoalPriority.MEDIUM;
      case 'low': return GoalPriority.LOW;
      default: return GoalPriority.MEDIUM;
    }
  };

  // Filter goals based on active tab and other filters
  useEffect(() => {
    let filtered = goals;

    // Apply tab filter first
    switch (activeTab) {
      case 'my':
        filtered = goals.filter(goal => 
          goal.assignedTo.some(user => user.id === user?.id) ||
          goal.createdBy.id === user?.id
        );
        break;
      case 'team':
        filtered = goals.filter(goal => 
          goal.department === user?.department
        );
        break;
      case 'department':
        filtered = goals.filter(goal => 
          goal.department === user?.department
        );
        break;
      case 'all':
      default:
        // Show all goals for admins/supervisors, or filtered by user's access
        if (hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN)) {
          filtered = goals;
        } else {
          filtered = goals.filter(goal => 
            goal.assignedTo.some(user => user.id === user?.id) ||
            goal.createdBy.id === user?.id ||
            goal.department === user?.department
          );
        }
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(goal => goal.priority === priorityFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(goal => goal.department === departmentFilter);
    }

    setFilteredGoals(filtered);
  }, [goals, activeTab, searchTerm, statusFilter, priorityFilter, departmentFilter, user]);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return 'success';
      case GoalStatus.ACTIVE:
        return 'processing';
      case GoalStatus.PENDING:
        return 'warning';
      case GoalStatus.ON_HOLD:
        return 'default';
      case GoalStatus.OVERDUE:
        return 'error';
      case GoalStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.HIGH:
        return 'red';
      case GoalPriority.MEDIUM:
        return 'orange';
      case GoalPriority.LOW:
        return 'green';
      default:
        return 'default';
    }
  };

  const handleView = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalVisible(true);
  };

  const handleEdit = (goal: Goal) => {
    router.push(`/goals/edit?id=${goal.id}`);
  };

  const handleDelete = (goal: Goal) => {
    Modal.confirm({
      title: 'Delete Goal',
      content: `Are you sure you want to delete "${goal.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await goalService.delete(goal.id);
          setGoals(prev => prev.filter(g => g.id !== goal.id));
          message.success('Goal deleted successfully');
        } catch (error) {
          console.error('Failed to delete goal:', error);
          message.error('Failed to delete goal');
        }
      },
    });
  };

  const canManageGoals = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN) || hasRole(UserRole.SUPERVISOR);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Reset other filters when changing tabs
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
  };

  const columns = [
    {
      title: 'Goal Name',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Goal) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-xs">
            {record.department}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: GoalStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: GoalPriority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Timeline',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: Date) => (
        <Space>
          <CalendarOutlined />
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Space>
      ),
    },
    {
      title: 'Assigned Users',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (users: any[]) => (
        <Space wrap>
          {users?.slice(0, 2).map((user, index) => (
            <Tag key={index} icon={<UserOutlined />}>
              {user.name}
            </Tag>
          ))}
          {users && users.length > 2 && <Text type="secondary">+{users.length - 2} more</Text>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Goal) => {
        const items = [
          {
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => handleView(record),
          },
          ...(canManageGoals ? [
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined />,
              onClick: () => handleEdit(record),
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => handleDelete(record),
            },
          ] : []),
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // Calculate statistics
  const stats = {
    total: filteredGoals.length,
    completed: filteredGoals.filter(g => g.status === GoalStatus.COMPLETED).length,
    active: filteredGoals.filter(g => g.status === GoalStatus.ACTIVE).length,
    overdue: filteredGoals.filter(g => new Date(g.endDate) < new Date() && g.status !== GoalStatus.COMPLETED).length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <AimOutlined className="mr-2" />
              {t?.('goals.title') || 'Goals Management'}
            </Title>
            <Text type="secondary">
              {t?.('goals.subtitle') || 'Track and manage organizational goals and objectives'}
            </Text>
          </Col>
          <Col>
            {canManageGoals && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => router.push('/goals/create')}
              >
                {t?.('goals.createNew') || 'Create New Goal'}
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Goals"
              value={stats.total}
              prefix={<AimOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="mb-4">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'all',
              label: (
                <Space>
                  <AimOutlined />
                  {t?.('goals.allGoals') || 'All Goals'}
                </Space>
              ),
            },
            {
              key: 'my',
              label: (
                <Space>
                  <UserOutlined />
                  {t?.('goals.myGoals') || 'My Goals'}
                </Space>
              ),
            },
            {
              key: 'team',
              label: (
                <Space>
                  <TeamOutlined />
                  {t?.('goals.teamGoals') || 'Team Goals'}
                </Space>
              ),
            },
            ...(hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN) ? [
              {
                key: 'department',
                label: (
                  <Space>
                    <TeamOutlined />
                    {t?.('goals.departmentGoals') || 'Department Goals'}
                  </Space>
                ),
              },
            ] : []),
          ]}
        />
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value={GoalStatus.ACTIVE}>Active</Select.Option>
              <Select.Option value={GoalStatus.COMPLETED}>Completed</Select.Option>
              <Select.Option value={GoalStatus.PENDING}>Pending</Select.Option>
              <Select.Option value={GoalStatus.ON_HOLD}>On Hold</Select.Option>
              <Select.Option value={GoalStatus.OVERDUE}>Overdue</Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
            >
              <Select.Option value="all">All Priority</Select.Option>
              <Select.Option value={GoalPriority.HIGH}>High</Select.Option>
              <Select.Option value={GoalPriority.MEDIUM}>Medium</Select.Option>
              <Select.Option value={GoalPriority.LOW}>Low</Select.Option>
            </Select>
          </Col>
          {hasRole(UserRole.ADMIN) && (
            <Col xs={12} sm={4} md={3}>
              <Select
                placeholder="Department"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                style={{ width: '100%' }}
              >
                <Select.Option value="all">All Departments</Select.Option>
                <Select.Option value="IT">IT</Select.Option>
                <Select.Option value="HR">HR</Select.Option>
                <Select.Option value="Finance">Finance</Select.Option>
                <Select.Option value="Marketing">Marketing</Select.Option>
                <Select.Option value="Customer Service">Customer Service</Select.Option>
              </Select>
            </Col>
          )}
          <Col xs={12} sm={4} md={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setDepartmentFilter('all');
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Goals Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredGoals}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} goals`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Goal Detail Modal */}
      <Modal
        title={
          <Space>
            <AimOutlined />
            Goal Details
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          ...(canManageGoals && selectedGoal ? [
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setModalVisible(false);
                handleEdit(selectedGoal);
              }}
            >
              Edit Goal
            </Button>
          ] : []),
        ]}
        width={800}
      >
        {selectedGoal && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Progress"
                    value={selectedGoal.progress}
                    suffix="%"
                    prefix={<PercentageOutlined />}
                  />
                  <Progress percent={selectedGoal.progress} className="mt-2" />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Space direction="vertical">
                    <Text strong>Status</Text>
                    <Tag color={getStatusColor(selectedGoal.status)}>
                      {selectedGoal.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                    <Text strong>Priority</Text>
                    <Tag color={getPriorityColor(selectedGoal.priority)}>
                      {selectedGoal.priority.toUpperCase()}
                    </Tag>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card size="small" className="mb-4">
              <Title level={4}>{selectedGoal.title}</Title>
              <Text>{selectedGoal.description}</Text>
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Timeline">
                  <Space>
                    <CalendarOutlined />
                    <Text>Due: {new Date(selectedGoal.endDate).toLocaleDateString()}</Text>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Department">
                  <Space>
                    <TeamOutlined />
                    <Text>{selectedGoal.department}</Text>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card size="small" title="Assigned Users" className="mt-4">
              <Space wrap>
                {selectedGoal.assignedTo?.map((user, index) => (
                  <Tag key={index} icon={<UserOutlined />}>
                    {user.name}
                  </Tag>
                ))}
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GoalsPage;