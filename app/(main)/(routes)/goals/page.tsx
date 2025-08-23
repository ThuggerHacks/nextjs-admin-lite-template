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

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Mock data for goals
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Implement User Authentication System',
    description: 'Develop a comprehensive user authentication system with role-based access control.',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.HIGH,
    department: 'IT',
    assignedTo: [
      { id: '1', name: 'João Silva', email: 'joao@tonelizer.com', role: UserRole.USER, department: 'IT', status: UserStatus.ACTIVE, createdAt: new Date() },
      { id: '2', name: 'Maria Santos', email: 'maria@tonelizer.com', role: UserRole.USER, department: 'IT', status: UserStatus.ACTIVE, createdAt: new Date() }
    ],
    createdBy: { id: 'admin', name: 'Admin User', email: 'admin@tonelizer.com', role: UserRole.ADMIN, department: 'IT', status: UserStatus.ACTIVE, createdAt: new Date() },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    progress: 65,
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
  {
    id: '2',
    title: 'Improve Customer Service Response Time',
    description: 'Reduce average customer service response time to under 2 hours.',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.MEDIUM,
    department: 'Customer Service',
    assignedTo: [
      { id: '3', name: 'Pedro Costa', email: 'pedro@tonelizer.com', role: UserRole.USER, department: 'Customer Service', status: UserStatus.ACTIVE, createdAt: new Date() },
      { id: '4', name: 'Ana Oliveira', email: 'ana@tonelizer.com', role: UserRole.USER, department: 'Customer Service', status: UserStatus.ACTIVE, createdAt: new Date() }
    ],
    createdBy: { id: 'manager', name: 'Manager User', email: 'manager@tonelizer.com', role: UserRole.SUPERVISOR, department: 'Customer Service', status: UserStatus.ACTIVE, createdAt: new Date() },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    progress: 40,
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
  {
    id: '3',
    title: 'Complete Q4 Financial Audit',
    description: 'Conduct comprehensive financial audit for Q4 2024.',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-15'),
    status: GoalStatus.COMPLETED,
    priority: GoalPriority.HIGH,
    department: 'Finance',
    assignedTo: [
      { id: '5', name: 'Carlos Silva', email: 'carlos@tonelizer.com', role: UserRole.USER, department: 'Finance', status: UserStatus.ACTIVE, createdAt: new Date() }
    ],
    createdBy: { id: 'finance', name: 'Finance Director', email: 'finance@tonelizer.com', role: UserRole.ADMIN, department: 'Finance', status: UserStatus.ACTIVE, createdAt: new Date() },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    progress: 100,
    reports: [],
    isCompleted: true,
    requiresReportOnCompletion: true,
    completionReportSubmitted: true,
  },
  {
    id: '4',
    title: 'Launch Marketing Campaign',
    description: 'Execute Q1 2025 marketing campaign across all channels.',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2025-03-31'),
    status: GoalStatus.PENDING,
    priority: GoalPriority.MEDIUM,
    department: 'Marketing',
    assignedTo: [
      { id: '6', name: 'Marketing Team Lead', email: 'marketing@tonelizer.com', role: UserRole.SUPERVISOR, department: 'Marketing', status: UserStatus.ACTIVE, createdAt: new Date() }
    ],
    createdBy: { id: 'marketing', name: 'Marketing Director', email: 'marketing.director@tonelizer.com', role: UserRole.ADMIN, department: 'Marketing', status: UserStatus.ACTIVE, createdAt: new Date() },
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    progress: 15,
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
  {
    id: '5',
    title: 'Upgrade Server Infrastructure',
    description: 'Migrate to new server infrastructure with improved performance and security.',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-10-31'),
    status: GoalStatus.ON_HOLD,
    priority: GoalPriority.HIGH,
    department: 'IT',
    assignedTo: [
      { id: '7', name: 'Tech Team Lead', email: 'tech@tonelizer.com', role: UserRole.SUPERVISOR, department: 'IT', status: UserStatus.ACTIVE, createdAt: new Date() }
    ],
    createdBy: { id: 'cto', name: 'CTO', email: 'cto@tonelizer.com', role: UserRole.ADMIN, department: 'IT', status: UserStatus.ACTIVE, createdAt: new Date() },
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
    progress: 25,
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
];

const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, hasRole } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Filter goals based on user role and department
  useEffect(() => {
    let filtered = goals;

    // Role-based filtering
    if (!hasRole(UserRole.ADMIN) && !hasRole(UserRole.SUPER_ADMIN)) {
      if (user?.department) {
        filtered = filtered.filter(goal => goal.department === user.department?.name);
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(goal => goal.priority === priorityFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(goal => goal.department === departmentFilter);
    }

    setFilteredGoals(filtered);
  }, [goals, searchTerm, statusFilter, priorityFilter, departmentFilter, user, hasRole]);

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
      onOk() {
        setGoals(prev => prev.filter(g => g.id !== goal.id));
        message.success('Goal deleted successfully');
      },
    });
  };

  const canManageGoals = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN) || hasRole(UserRole.SUPERVISOR);

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