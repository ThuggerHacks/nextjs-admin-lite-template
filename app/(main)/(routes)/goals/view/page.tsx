'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Progress,
  Descriptions,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  Input,
  Select,
  DatePicker,
  Tooltip,
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
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { 
  validateGoalCompletion, 
  getCompletionStatusText, 
  getCompletionStatusColor,
  calculateCompletionStats,
  getGoalWarnings 
} from '@/lib/goalUtils';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Mock goals data
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Q4 Sales Target Achievement',
    description: 'Achieve 150% of quarterly sales target for Q4 2024',
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.HIGH,
    progress: 78,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    assignedTo: [{
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@empresa.com',
      role: UserRole.USER,
      department: 'Sales',
      status: 'active' as any,
      createdAt: new Date(),
    }, {
      id: '4',
      name: 'Ana Silva',
      email: 'ana@empresa.com',
      role: UserRole.USER,
      department: 'Sales',
      status: 'active' as any,
      createdAt: new Date(),
    }],
    createdBy: {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: UserRole.ADMIN,
      department: 'Sales',
      status: 'active' as any,
      createdAt: new Date(),
    },
    department: 'Sales',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-15'),
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
  {
    id: '2',
    title: 'Employee Training Completion',
    description: 'Complete annual compliance training for all HR department staff',
    status: GoalStatus.COMPLETED,
    priority: GoalPriority.MEDIUM,
    progress: 100,
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-11-30'),
    assignedTo: [{
      id: '2',
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: UserRole.ADMIN,
      department: 'HR',
      status: 'active' as any,
      createdAt: new Date(),
    }],
    createdBy: {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date(),
    },
    department: 'HR',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-11-30'),
    reports: [],
    isCompleted: true,
    requiresReportOnCompletion: true,
    completionReportSubmitted: true,
  },
  {
    id: '3',
    title: 'System Documentation Update',
    description: 'Update all system documentation and user manuals',
    status: GoalStatus.OVERDUE,
    priority: GoalPriority.HIGH,
    progress: 45,
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-10-31'),
    assignedTo: [{
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date(),
    }, {
      id: '6',
      name: 'Lucas Oliveira',
      email: 'lucas@empresa.com',
      role: UserRole.USER,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date(),
    }],
    createdBy: {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date(),
    },
    department: 'IT',
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-10-15'),
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
  {
    id: '4',
    title: 'Customer Support Response Time',
    description: 'Reduce average customer support response time to under 2 hours',
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.MEDIUM,
    progress: 65,
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-31'),
    assignedTo: [{
      id: '5',
      name: 'Carlos Silva',
      email: 'carlos@empresa.com',
      role: UserRole.USER,
      department: 'Support',
      status: 'active' as any,
      createdAt: new Date(),
    }],
    createdBy: {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: UserRole.ADMIN,
      department: 'Support',
      status: 'active' as any,
      createdAt: new Date(),
    },
    department: 'Support',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15'),
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
  {
    id: '5',
    title: 'Test Goal - Ready for Completion Report',
    description: 'This is a test goal at 100% progress that requires a completion report before it can be marked as complete',
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.HIGH,
    progress: 100,
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-15'),
    assignedTo: [{
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date(),
    }],
    createdBy: {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: UserRole.SUPER_ADMIN,
      department: 'IT',
      status: 'active' as any,
      createdAt: new Date(),
    },
    department: 'IT',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-08'),
    reports: [],
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
  },
];

export default function ViewGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  
  const { user, hasRole } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  // Calculate statistics using the utility function
  const completionStats = calculateCompletionStats(goals);
  const stats = {
    total: completionStats.total,
    active: goals.filter(g => g.status === GoalStatus.ACTIVE).length,
    completed: completionStats.completed,
    overdue: goals.filter(g => g.status === GoalStatus.OVERDUE).length,
    pendingReports: completionStats.pendingReports,
    avgProgress: Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length),
  };

  // Filter goals based on search and filters
  const getFilteredGoals = () => {
    let filtered = goals;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchText.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (goal.assignedTo && goal.assignedTo.some(user => 
          user.name.toLowerCase().includes(searchText.toLowerCase())
        ))
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(goal => goal.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter) {
      filtered = filtered.filter(goal => goal.priority === priorityFilter);
    }

    // Filter by tab
    switch (activeTab) {
      case 'my-goals':
        filtered = filtered.filter(goal => 
          goal.assignedTo && goal.assignedTo.some(assignedUser => assignedUser.id === user?.id)
        );
        break;
      case 'created-by-me':
        filtered = filtered.filter(goal => goal.createdBy.id === user?.id);
        break;
      case 'department':
        filtered = filtered.filter(goal => goal.department === user?.department?.name);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredGoals = getFilteredGoals();

  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailsModalVisible(true);
  };

  const handleEditGoal = (goalId: string) => {
    router.push(`/goals/edit?id=${goalId}`);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.PENDING:
        return <ClockCircleOutlined />;
      case GoalStatus.ACTIVE:
        return <AimOutlined />;
      case GoalStatus.COMPLETED:
        return <CheckCircleOutlined />;
      case GoalStatus.OVERDUE:
        return <ExclamationCircleOutlined />;
      case GoalStatus.ON_HOLD:
        return <ClockCircleOutlined />;
      case GoalStatus.CANCELLED:
        return <ExclamationCircleOutlined />;
      default:
        return <AimOutlined />;
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    const colors = {
      [GoalStatus.PENDING]: 'default',
      [GoalStatus.ACTIVE]: 'processing',
      [GoalStatus.COMPLETED]: 'success',
      [GoalStatus.OVERDUE]: 'error',
      [GoalStatus.ON_HOLD]: 'warning',
      [GoalStatus.CANCELLED]: 'error',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: GoalPriority) => {
    const colors = {
      [GoalPriority.LOW]: 'blue',
      [GoalPriority.MEDIUM]: 'orange',
      [GoalPriority.HIGH]: 'red',
    };
    return colors[priority];
  };

  const columns = [
    {
      title: 'Goal',
      key: 'goal',
      render: (record: Goal) => (
        <div>
          <div className="font-medium text-lg">{record.title}</div>
          <div className="text-gray-500 text-sm">{record.description}</div>
          <div className="mt-2">
            <Tag color={getPriorityColor(record.priority)} className="mr-2">
              {record.priority.toUpperCase()}
            </Tag>
            <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
              {record.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 200,
      render: (record: Goal) => {
        const warnings = getGoalWarnings(record);
        const validation = validateGoalCompletion(record);
        
        return (
          <div>
            <Progress 
              percent={record.progress} 
              strokeColor={getCompletionStatusColor(record)}
              size="small"
            />
            <div className="text-sm mt-1">
              <span className={validation.canComplete ? "text-gray-600" : "text-orange-600"}>
                {getCompletionStatusText(record)}
              </span>
            </div>
            {warnings.length > 0 && (
              <div className="mt-1">
                {warnings.map((warning, index) => (
                  <Tag key={index} color="orange">
                    <ExclamationCircleOutlined /> {warning}
                  </Tag>
                ))}
              </div>
            )}
            {record.requiresReportOnCompletion && record.progress === 100 && !record.completionReportSubmitted && (
              <div className="mt-1">
                <Tag color="red">
                  <ExclamationCircleOutlined /> Report Required
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (record: Goal) => (
        <div>
          {record.assignedTo && record.assignedTo.length > 0 ? (
            <div>
              <div className="font-medium">
                {record.assignedTo.length === 1 
                  ? record.assignedTo[0].name
                  : `${record.assignedTo.length} users assigned`
                }
              </div>
              <div className="text-gray-500 text-sm">
                {record.assignedTo.length === 1 
                  ? record.assignedTo[0].department
                  : record.assignedTo.map(user => user.name).join(', ')
                }
              </div>
              {record.assignedTo.length > 1 && (
                <div className="mt-1">
                  {record.assignedTo.map(user => (
                    <Tag key={user.id} className="mr-1 mb-1">
                      {user.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">Not assigned</div>
          )}
        </div>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (record: Goal) => {
        const daysRemaining = Math.ceil((record.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className="text-sm">
              {record.startDate.toLocaleDateString()} - {record.endDate.toLocaleDateString()}
            </div>
            <div className={`text-sm ${daysRemaining < 0 ? 'text-red-500' : daysRemaining < 7 ? 'text-orange-500' : 'text-gray-500'}`}>
              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: Goal) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {((record.assignedTo && record.assignedTo.some(assignedUser => assignedUser.id === user?.id)) || record.createdBy.id === user?.id || hasRole(UserRole.ADMIN)) && (
            <Tooltip title="Edit Goal">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditGoal(record.id)}
              />
            </Tooltip>
          )}
          {(record.createdBy.id === user?.id || hasRole(UserRole.ADMIN)) && (
            <Tooltip title="Delete Goal">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => handleDeleteGoal(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'All Goals',
      children: null,
    },
    {
      key: 'my-goals',
      label: 'My Goals',
      children: null,
    },
    {
      key: 'created-by-me',
      label: 'Created by Me',
      children: null,
    },
    {
      key: 'department',
      label: `${user?.department || 'Department'} Goals`,
      children: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-2">
              🎯 {t("navigation.viewGoals")}
            </Title>
            <p className="text-gray-600">
              Track and manage your goals and objectives
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/goals/create')}
          >
            Create Goal
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Goals"
              value={stats.total}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Goals"
              value={stats.active}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Reports"
              value={stats.pendingReports}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      
      {stats.pendingReports > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>
              <div className="flex items-center gap-2 text-orange-600">
                <ExclamationCircleOutlined />
                <Text strong>
                  {stats.pendingReports} goal(s) need completion reports before they can be marked as finished.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <Search
            placeholder="Search goals..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 200 }}
          >
            <Select.Option value={GoalStatus.PENDING}>Pending</Select.Option>
            <Select.Option value={GoalStatus.ACTIVE}>Active</Select.Option>
            <Select.Option value={GoalStatus.COMPLETED}>Completed</Select.Option>
            <Select.Option value={GoalStatus.OVERDUE}>Overdue</Select.Option>
            <Select.Option value={GoalStatus.ON_HOLD}>On Hold</Select.Option>
            <Select.Option value={GoalStatus.CANCELLED}>Cancelled</Select.Option>
          </Select>
          <Select
            placeholder="Filter by Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            allowClear
            style={{ width: 200 }}
          >
            <Select.Option value={GoalPriority.HIGH}>High Priority</Select.Option>
            <Select.Option value={GoalPriority.MEDIUM}>Medium Priority</Select.Option>
            <Select.Option value={GoalPriority.LOW}>Low Priority</Select.Option>
          </Select>
        </div>

        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
      </Card>

      {/* Goals Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredGoals}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} goals`,
          }}
        />
      </Card>

      {/* Goal Details Modal */}
      <Modal
        title="Goal Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          selectedGoal && ((selectedGoal.assignedTo && selectedGoal.assignedTo.some(assignedUser => assignedUser.id === user?.id)) || selectedGoal.createdBy.id === user?.id || hasRole(UserRole.ADMIN)) && (
            <Button key="edit" type="primary" onClick={() => {
              setDetailsModalVisible(false);
              handleEditGoal(selectedGoal.id);
            }}>
              Edit Goal
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedGoal && (
          <div>
            <div className="mb-6 text-center">
              <Progress 
                type="circle" 
                percent={selectedGoal.progress} 
                strokeColor={{
                  '0%': selectedGoal.status === GoalStatus.OVERDUE ? '#ff4d4f' : '#108ee9',
                  '100%': selectedGoal.status === GoalStatus.OVERDUE ? '#ff7875' : '#87d068',
                }}
                format={() => `${selectedGoal.progress}%`}
                size={120}
              />
              <div className="mt-4">
                <h3 className="text-xl font-semibold">{selectedGoal.title}</h3>
                <p className="text-gray-600">{selectedGoal.description}</p>
              </div>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedGoal.status)} icon={getStatusIcon(selectedGoal.status)}>
                  {selectedGoal.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={getPriorityColor(selectedGoal.priority)}>
                  {selectedGoal.priority.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Progress">
                {selectedGoal.progress}%
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedGoal.department}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {selectedGoal.startDate.toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {selectedGoal.endDate.toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {selectedGoal.assignedTo && selectedGoal.assignedTo.length > 0 ? (
                  <div>
                    {selectedGoal.assignedTo.map((user, index) => (
                      <div key={user.id}>
                        {user.name} ({user.email})
                        {index < selectedGoal.assignedTo!.length - 1 && <br />}
                      </div>
                    ))}
                  </div>
                ) : (
                  'Not assigned'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedGoal.createdBy.name} ({selectedGoal.createdBy.email})
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedGoal.createdAt.toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {selectedGoal.updatedAt.toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
