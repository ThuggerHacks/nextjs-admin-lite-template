'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
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
  Upload,
  message,
  Form,
  UploadFile,
  List,
  Avatar,
  Divider,
  Badge,
  Alert,
  Spin,
  Progress,
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
  UploadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined as ViewFileOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { 
  validateGoalCompletion, 
  getCompletionStatusText, 
  getCompletionStatusColor,
  calculateCompletionStats,
  getGoalWarnings 
} from '@/lib/goalUtils';
import { goalService, CreateGoalRequest, UpdateGoalRequest } from '@/lib/services/goalService';
import { userService } from '@/lib/services/userService';
import { departmentService } from '@/lib/services/departmentService';
import { apiService as api, baseUrl } from '@/lib/axios';

const { Title, Text } = Typography;

// Helper functions for status and priority colors/icons
const getStatusIcon = (status: GoalStatus) => {
  switch (status) {
    case GoalStatus.PENDING:
      return <ClockCircleOutlined />;
    case GoalStatus.IN_PROGRESS:
      return <AimOutlined />;
    case GoalStatus.ON_HOLD:
      return <ClockCircleOutlined />;
    case GoalStatus.AWAITING:
      return <ExclamationCircleOutlined />;
    case GoalStatus.DONE:
      return <CheckCircleOutlined />;
    case GoalStatus.COMPLETED:
      return <CheckCircleOutlined />;
    default:
      return <AimOutlined />;
  }
};

const getStatusColor = (status: GoalStatus) => {
  const colors = {
    [GoalStatus.PENDING]: 'default',
    [GoalStatus.IN_PROGRESS]: 'processing',
    [GoalStatus.ON_HOLD]: 'warning',
    [GoalStatus.AWAITING]: 'orange',
    [GoalStatus.DONE]: 'success',
    [GoalStatus.COMPLETED]: 'success',
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
const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface GoalWithAssignments {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress?: number;
  assignedTo: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: string;
    createdAt: Date;
  }>;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: string;
    createdAt: Date;
  };
  department: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  reports: GoalReport[];
  isCompleted: boolean;
  requiresReportOnCompletion: boolean;
  completionReportSubmitted: boolean;
}

interface GoalReport {
  id: string;
  goalId: string;
  submittedById: string;
  title: string;
  description: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  isCompletion: boolean;
  createdAt: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  files?: Array<{
    file: {
      id: string;
      name: string;
      originalName?: string;
      url: string;
      size: number;
      type: string;
    };
  }>;
}

export default function ViewGoalsPage() {
  const [goals, setGoals] = useState<GoalWithAssignments[]>([]);
  const [originalGoals, setOriginalGoals] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithAssignments | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [statusUpdateModalVisible, setStatusUpdateModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('my-goals');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  
  const { user, hasRole } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  // Helper functions to map backend values to frontend enums
  const mapBackendStatusToFrontend = (status: string): GoalStatus => {
    switch (status?.toUpperCase()) {
      case 'DRAFT': return GoalStatus.PENDING;
      case 'PUBLISHED': return GoalStatus.IN_PROGRESS;
      case 'IN_PROGRESS': return GoalStatus.IN_PROGRESS;
      case 'COMPLETED': return GoalStatus.COMPLETED;
      case 'DONE': return GoalStatus.DONE;
      case 'ON_HOLD': return GoalStatus.ON_HOLD;
      case 'AWAITING': return GoalStatus.AWAITING;
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

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load departments for filtering
      const deps = await departmentService.getAll();
      setDepartments(deps);

      // Load goals from backend using service
      const goalsResponse = await goalService.getAll();
      
      // Store original goals data for edit functionality
      const originalGoalsMap = new Map();
      goalsResponse.goals.forEach((goal: any) => {
        originalGoalsMap.set(goal.id, goal);
      });
      setOriginalGoals(originalGoalsMap);
      
      const goalsWithAssignments = goalsResponse.goals.map((goal: any) => ({
        id: goal.id,
        title: goal.name, // Backend uses 'name', frontend expects 'title'
        description: goal.description || '',
        assignedTo: goal.assignments?.map((assignment: any) => ({
          id: assignment.user.id,
          name: assignment.user.name,
          email: assignment.user.email,
          role: assignment.user.role as UserRole || UserRole.USER,
          department: goal.department?.name || '',
          status: assignment.user.status || 'active',
          createdAt: new Date(assignment.user.createdAt || Date.now())
        })) || [],
        createdBy: {
          id: goal.createdBy?.id || '',
          name: goal.createdBy?.name || '',
          email: goal.createdBy?.email || '',
          role: goal.createdBy?.role as UserRole || UserRole.USER,
          department: goal.department?.name || '',
          status: goal.createdBy?.status || 'active',
          createdAt: new Date(goal.createdBy?.createdAt || Date.now())
        },
        department: goal.department?.name || '',
        startDate: new Date(goal.startDate || goal.createdAt || Date.now()),
        endDate: new Date(goal.endDate || goal.createdAt || Date.now()),
        createdAt: new Date(goal.createdAt || Date.now()),
        updatedAt: new Date(goal.updatedAt || goal.createdAt || Date.now()),
        reports: goal.reports?.map((report: any) => ({
          id: report.id,
          goalId: report.goalId,
          submittedById: report.submittedById,
          title: report.title,
          description: report.description,
          fileId: report.fileId,
          fileName: report.fileName,
          fileSize: report.fileSize,
          fileUrl: report.fileUrl,
          isCompletion: report.isCompletion || false,
          createdAt: report.createdAt,
          submittedBy: {
            id: report.submittedBy?.id || '',
            name: report.submittedBy?.name || '',
            email: report.submittedBy?.email || ''
          },
          files: report.files || []
        })) || [],
        isCompleted: goal.isCompleted || false,
        requiresReportOnCompletion: goal.requiresReportOnCompletion || false,
        completionReportSubmitted: goal.completionReportSubmitted || false,
        status: mapBackendStatusToFrontend(goal.status),
        priority: mapBackendPriorityToFrontend(goal.priority)
      }));

      setGoals(goalsWithAssignments);
    } catch (error) {
      console.error('Error loading goals:', error);
      message.error(t('goals.failedToLoadGoals'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (goal: GoalWithAssignments) => {
    setSelectedGoal(goal);
    setDetailsModalVisible(true);
  };

  const handleUploadReport = (goal: GoalWithAssignments) => {
    setSelectedGoal(goal);
    setUploadModalVisible(true);
  };

  const handleUpdateStatus = (goal: GoalWithAssignments) => {
    setSelectedGoal(goal);
    setStatusUpdateModalVisible(true);
  };

  const handleViewReports = (goal: GoalWithAssignments) => {
    setSelectedGoal(goal);
    setReportsModalVisible(true);
  };

  const handleEditGoal = (goalId: string) => {
    // Get the original goal data from backend
    const originalGoal = originalGoals.get(goalId);
    if (originalGoal) {
      console.log('Storing original goal for edit:', originalGoal);
      sessionStorage.setItem(`goal_${goalId}`, JSON.stringify(originalGoal));
    } else {
      console.warn('Original goal data not found, trying fallback...');
      // Fallback: try to reconstruct from transformed data
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const department = departments.find(d => d.name === goal.department);
        const departmentId = department?.id || goal.department;
        
        const transformedGoal = {
          id: goal.id,
          name: goal.title,
          description: goal.description,
          departmentId: departmentId,
          startDate: goal.startDate,
          endDate: goal.endDate,
          priority: goal.priority,
          status: goal.status,
          progress: goal.progress,
          assignments: goal.assignedTo.map(user => ({
            userId: user.id,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          })),
          createdBy: goal.createdBy,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt
        };
        
        sessionStorage.setItem(`goal_${goalId}`, JSON.stringify(transformedGoal));
      }
    }
    router.push(`/goals/create?edit=${goalId}`);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalService.delete(goalId);
      message.success(t('goals.goalDeletedSuccessfully'));
      loadInitialData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      message.error(t('goals.failedToDeleteGoal'));
    }
  };

  const handleDownloadFile = async (reportId: string, fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/goals/reports/${reportId}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error(t('goals.failedToDownloadFile'));
    }
  };

  // Filter goals based on search and filters
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchText.toLowerCase());
    
    // Fix status filter - compare enum values properly
    const matchesStatus = !statusFilter || goal.status === statusFilter;
    
    // Fix priority filter - compare enum values properly  
    const matchesPriority = !priorityFilter || goal.priority === priorityFilter;
    
    // Fix department filter
    const matchesDepartment = !departmentFilter || goal.department === departmentFilter;
    
    // Fix date filter - ensure proper date comparison
    let matchesDate = true;
    if (dateRangeFilter && dateRangeFilter[0] && dateRangeFilter[1]) {
      const filterStartDate = dateRangeFilter[0].toDate();
      const filterEndDate = dateRangeFilter[1].toDate();
      const goalStartDate = new Date(goal.startDate);
      const goalEndDate = new Date(goal.endDate);
      
      // Check if goal dates overlap with filter range
      matchesDate = goalStartDate <= filterEndDate && goalEndDate >= filterStartDate;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesDate;
  });

  // Get goals based on active tab
  const getGoalsForTab = () => {
    switch (activeTab) {
      case 'my-goals':
        return filteredGoals.filter(goal => 
          goal.assignedTo.some(assignedUser => assignedUser.id === user?.id) ||
          goal.createdBy.id === user?.id
        );
      case 'department-goals':
        return filteredGoals.filter(goal => goal.department === user?.department?.name);
      case 'all-goals':
        return filteredGoals;
      default:
        return filteredGoals;
    }
  };



  // Table columns
  const columns = [
    {
      title: t('goals.goal'),
      key: 'goal',
      render: (record: GoalWithAssignments) => (
        <div>
          <div className="font-medium text-lg">{record.title}</div>
          <div className="text-gray-500 text-sm">{record.description}</div>
          <div className="mt-2">
            <Tag color={getPriorityColor(record.priority as GoalPriority)} className="mr-2">
              {record.priority === GoalPriority.HIGH ? t('goals.highPriority') :
               record.priority === GoalPriority.MEDIUM ? t('goals.mediumPriority') :
               record.priority === GoalPriority.LOW ? t('goals.lowPriority') :
               record.priority}
            </Tag>
            <Tag color={getStatusColor(record.status as GoalStatus)} icon={getStatusIcon(record.status as GoalStatus)}>
              {record.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },

    {
      title: t('goals.assignedTo'),
      key: 'assignedTo',
      render: (record: GoalWithAssignments) => (
        <div>
          {record.assignedTo && record.assignedTo.length > 0 ? (
            <div>
              <div className="font-medium">
                {record.assignedTo.length === 1 
                  ? record.assignedTo[0].name
                  : `${record.assignedTo.length} ${t('goals.usersAssigned')}`
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
            <div className="text-gray-400">{t('goals.notAssigned')}</div>
          )}
        </div>
      ),
    },
    {
      title: t('goals.timeline'),
      key: 'timeline',
      render: (record: GoalWithAssignments) => {
        const daysRemaining = Math.ceil((record.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className="text-sm">
              {record.startDate.toLocaleDateString()} - {record.endDate.toLocaleDateString()}
            </div>
            <div className={`text-sm ${daysRemaining < 0 ? 'text-red-500' : daysRemaining < 7 ? 'text-orange-500' : 'text-gray-500'}`}>
              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} ${t('goals.daysOverdue')}` : `${daysRemaining} ${t('goals.daysRemaining')}`}
            </div>
          </div>
        );
      },
    },
    {
      title: t('goals.reports'),
      key: 'reports',
      width: 120,
      render: (record: GoalWithAssignments) => (
        <div>
          <Badge count={record.reports.length} showZero>
            <Button
              icon={<FileTextOutlined />}
              size="small"
              onClick={() => handleViewReports(record)}
            >
              {t('goals.viewReports')}
            </Button>
          </Badge>
        </div>
      ),
    },
    {
      title: t('goals.actions'),
      key: 'actions',
      width: 200,
      render: (record: GoalWithAssignments) => {
        const canEdit = record.createdBy.id === user?.id || hasRole(UserRole.ADMIN);
        const canDelete = record.createdBy.id === user?.id || hasRole(UserRole.ADMIN);
        const isAssigned = record.assignedTo && record.assignedTo.some(assignedUser => assignedUser.id === user?.id);
        
        return (
          <Space>
            <Tooltip title={t('goals.viewDetails')}>
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>
            
            {isAssigned && (
              <>
                <Tooltip title={t('goals.uploadReport')}>
                  <Button
                    icon={<UploadOutlined />}
                    size="small"
                    onClick={() => handleUploadReport(record)}
                  />
                </Tooltip>
                <Tooltip title={t('goals.updateStatus')}>
                  <Button
                    icon={<CheckCircleOutlined />}
                    size="small"
                    onClick={() => handleUpdateStatus(record)}
                  />
                </Tooltip>
              </>
            )}
            
            {canEdit && (
              <Tooltip title={t('goals.editGoal')}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditGoal(record.id)}
                />
              </Tooltip>
            )}
            
            {canDelete && (
              <Tooltip title={t('goals.deleteGoal')}>
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDeleteGoal(record.id)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Tab items based on user role
  const getTabItems = () => {
    const tabs = [
      {
        key: 'my-goals',
        label: t('goals.myGoals'),
        children: null,
      },
      {
        key: 'department-goals',
        label: t('goals.departmentGoals'),
        children: null,
      }
    ];

    if (hasRole(UserRole.ADMIN)) {
      tabs.push({
        key: 'all-goals',
        label: t('goals.allGoals'),
        children: null,
      });
    }

    return tabs;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: goals.length,
    inProgress: goals.filter(g => g.status === GoalStatus.IN_PROGRESS).length,
    completed: goals.filter(g => g.status === GoalStatus.COMPLETED || g.status === GoalStatus.DONE).length,
    pending: goals.filter(g => g.status === GoalStatus.PENDING).length,
    onHold: goals.filter(g => g.status === GoalStatus.ON_HOLD || g.status === GoalStatus.AWAITING).length,
    avgProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-2">
              🎯 {t('goals.goals')}
            </Title>
            <Text type="secondary" className="text-gray-600">
              {t('goals.manageAndTrackGoals')}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/goals/create')}
          >
            {t('goals.createGoal')}
          </Button>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('goals.totalGoals')}
              value={stats.total}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('goals.inProgress')}
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('goals.completed')}
              value={stats.completed}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('goals.onHold')}
              value={stats.onHold}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder={t('goals.searchGoals')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder={t('goals.status')}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="pending">{t('goals.pending')}</Select.Option>
              <Select.Option value="in_progress">{t('goals.inProgress')}</Select.Option>
              <Select.Option value="on_hold">{t('goals.onHold')}</Select.Option>
              <Select.Option value="awaiting">{t('goals.awaiting')}</Select.Option>
              <Select.Option value="done">{t('goals.done')}</Select.Option>
              <Select.Option value="completed">{t('goals.completed')}</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder={t('goals.priority')}
              value={priorityFilter}
              onChange={setPriorityFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="low">{t('goals.lowPriority')}</Select.Option>
              <Select.Option value="medium">{t('goals.mediumPriority')}</Select.Option>
              <Select.Option value="high">{t('goals.highPriority')}</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder={t('common.department')}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.name}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={dateRangeFilter}
              onChange={(dates) => setDateRangeFilter(dates)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Goals Table */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={getTabItems()}
        />
        
        <Table
          dataSource={getGoalsForTab()}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Goal Details Modal */}
      <Modal
        title={t('goals.goalDetails')}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            {t('common.close')}
          </Button>,
          selectedGoal && ((selectedGoal.assignedTo && selectedGoal.assignedTo.some(assignedUser => assignedUser.id === user?.id)) || selectedGoal.createdBy.id === user?.id || hasRole(UserRole.ADMIN)) && (
            <Button key="edit" type="primary" onClick={() => {
              setDetailsModalVisible(false);
              handleEditGoal(selectedGoal.id);
            }}>
              {t('goals.editGoal')}
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedGoal && (
          <div>
            <div className="mb-6 text-center">
              <div className="mt-4">
                <h3 className="text-xl font-semibold">{selectedGoal.title}</h3>
                <p className="text-gray-600">{selectedGoal.description}</p>
              </div>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label={t('goals.status')}>
                <Tag color={getStatusColor(selectedGoal.status as GoalStatus)} icon={getStatusIcon(selectedGoal.status as GoalStatus)}>
                  {selectedGoal.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.priority')}>
                <Tag color={getPriorityColor(selectedGoal.priority as GoalPriority)}>
                  {selectedGoal.priority === GoalPriority.HIGH ? t('goals.highPriority') :
                   selectedGoal.priority === GoalPriority.MEDIUM ? t('goals.mediumPriority') :
                   selectedGoal.priority === GoalPriority.LOW ? t('goals.lowPriority') :
                   selectedGoal.priority}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={t('common.department')}>
                {selectedGoal.department}
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.startDate')}>
                {selectedGoal.startDate.toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.endDate')}>
                {selectedGoal.endDate.toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.assignedTo')}>
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
                  t('goals.notAssigned')
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.createdBy')}>
                {selectedGoal.createdBy.name} ({selectedGoal.createdBy.email})
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.createdAt')}>
                {selectedGoal.createdAt.toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label={t('goals.lastUpdated')}>
                {selectedGoal.updatedAt.toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Upload Report Modal */}
      <Modal
        title={t('goals.uploadReport')}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedGoal && (
          <UploadReportForm
            goal={selectedGoal}
            onSuccess={() => {
              setUploadModalVisible(false);
              loadInitialData(); // Reload goals to show new report
            }}
            onCancel={() => setUploadModalVisible(false)}
          />
        )}
      </Modal>

      {/* Reports Modal */}
      <Modal
        title={`${t('goals.reports')} - ${selectedGoal?.title || ''}`}
        open={reportsModalVisible}
        onCancel={() => setReportsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReportsModalVisible(false)}>
            {t('common.close')}
          </Button>
        ]}
        width={800}
      >
        {selectedGoal && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <span className="text-lg font-medium">{t('goals.reports')}</span>
              <Button 
                type="primary" 
                size="small"
                icon={<UploadOutlined />}
                onClick={() => {
                  setReportsModalVisible(false);
                  handleUploadReport(selectedGoal);
                }}
              >
                {t('goals.uploadNewReport')}
              </Button>
            </div>
            
            {selectedGoal.reports && selectedGoal.reports.length > 0 ? (
              <Table
                dataSource={selectedGoal.reports}
                columns={[
                  {
                    title: t('goals.reportTitle'),
                    dataIndex: 'title',
                    key: 'title',
                    render: (title: string, record: any) => (
                      <div>
                        <div className="font-medium">{title}</div>
                        {record.isCompletion && (
                          <Tag color="blue">{t('goals.completionReport')}</Tag>
                        )}
                      </div>
                    )
                  },
                  {
                    title: t('goals.description'),
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true
                  },
                  {
                    title: t('goals.submittedBy'),
                    dataIndex: 'submittedBy',
                    key: 'submittedBy',
                    render: (submittedBy: any) => submittedBy?.name || '-'
                  },
                  {
                    title: t('goals.submittedAt'),
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date: string) => new Date(date).toLocaleDateString()
                  },
                  {
                    title: t('goals.actions'),
                    key: 'actions',
                    render: (_, record: any) => (
                      <Space>
                        <Button
                          icon={<EyeOutlined />}
                          size="small"
                          onClick={() => {
                            Modal.info({
                              title: record.title,
                              width: 600,
                              content: (
                                <div>
                                  <p><strong>{t('goals.description')}:</strong> {record.description}</p>
                                  <p><strong>{t('goals.submittedBy')}:</strong> {record.submittedBy?.name}</p>
                                  <p><strong>{t('goals.submittedAt')}:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
                                  {record.isCompletion && (
                                    <p><strong>{t('goals.type')}:</strong> <Tag color="blue">{t('goals.completionReport')}</Tag></p>
                                  )}
                                  {record.files && record.files.length > 0 && (
                                    <div className="mt-3">
                                      <p><strong>{t('goals.attachedFiles')}:</strong></p>
                                      <div className="flex flex-col gap-2 mt-2">
                                        {record.files.map((file: any, index: number) => (
                                          <div key={index} className="flex items-center gap-2">
                                            <Tag color="blue">
                                              <FileTextOutlined /> {file.file?.originalName || file.file?.name || `File ${index + 1}`}
                                            </Tag>
                                            <Space>
                                              <Button
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={() => handleDownloadFile(record.id, file.file.id, file.file.originalName || file.file.name)}
                                              >
                                                {t('goals.download')}
                                              </Button>
                                            </Space>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ),
                            });
                          }}
                        >
                          {t('goals.viewDetails')}
                        </Button>
                      </Space>
                    )
                  }
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileTextOutlined className="text-4xl mb-2" />
                <p>{t('goals.noReportsYet')}</p>
                <p className="text-sm">{t('goals.uploadFirstReport')}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={`${t('goals.updateStatus')} - ${selectedGoal?.title || ''}`}
        open={statusUpdateModalVisible}
        onCancel={() => setStatusUpdateModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedGoal && (
          <StatusUpdateForm
            goal={selectedGoal}
            onSuccess={() => {
              setStatusUpdateModalVisible(false);
              loadInitialData(); // Reload goals to show updated status
            }}
            onCancel={() => setStatusUpdateModalVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
}

// Status Update Form Component
function StatusUpdateForm({ goal, onSuccess, onCancel }: { 
  goal: GoalWithAssignments; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    if (!values.status || values.status === goal.status) {
      message.warning(t('goals.noStatusChange'));
      return;
    }

    setUpdating(true);
    try {
      // Update goal status using the goal service
      await goalService.updateProgress(goal.id, {
        progress: goal.progress || 0, // Keep current progress
        status: values.status
      });
      
      message.success(t('goals.statusUpdatedSuccessfully'));
      onSuccess();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(t('goals.failedToUpdateStatus'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label={t('goals.currentStatus')}
      >
        <Tag color={getStatusColor(goal.status as GoalStatus)} icon={getStatusIcon(goal.status as GoalStatus)}>
          {goal.status.replace('_', ' ').toUpperCase()}
        </Tag>
      </Form.Item>

      <Form.Item
        label={t('goals.newStatus')}
        name="status"
        rules={[{ required: true, message: t('goals.statusRequired') }]}
      >
        <Select placeholder={t('goals.selectNewStatus')}                  >
                    <Select.Option value="pending">{t('goals.pending')}</Select.Option>
                    <Select.Option value="in_progress">{t('goals.inProgress')}</Select.Option>
                    <Select.Option value="on_hold">{t('goals.onHold')}</Select.Option>
                    <Select.Option value="awaiting">{t('goals.awaiting')}</Select.Option>
                    <Select.Option value="done">{t('goals.done')}</Select.Option>
                    <Select.Option value="completed">{t('goals.completed')}</Select.Option>
                  </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={updating}>
            {updating ? t('goals.updating') : t('goals.updateStatus')}
          </Button>
          <Button onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

// Upload Report Form Component
function UploadReportForm({ goal, onSuccess, onCancel }: { 
  goal: GoalWithAssignments; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error(t('goals.pleaseSelectFile'));
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // Use the goal service to upload report with progress tracking
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('goalId', goal.id);
      formData.append('isCompletion', String(values.isCompletion || false));
      
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      // Use the goal service to upload report with progress tracking
      const xhr = new XMLHttpRequest();
      
      await new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', `${baseUrl}/goals/${goal.id}/reports/upload`);
        
        // Add authorization header
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });
      
      // Update status if provided and different
      if (values.status && values.status !== goal.status) {
        await goalService.updateProgress(goal.id, {
          progress: 0, // Keep current progress
          status: values.status
        });
      }
      
      message.success(t('goals.reportUploadedSuccessfully'));
      onSuccess();
    } catch (error) {
      message.error(t('goals.failedToUploadReport'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label={t('goals.reportTitle')}
        name="title"
        rules={[{ required: true, message: t('goals.reportTitleRequired') }]}
      >
        <Input placeholder={t('goals.enterReportTitle')} />
      </Form.Item>

      <Form.Item
        label={t('goals.reportDescription')}
        name="description"
        rules={[{ required: true, message: t('goals.reportDescriptionRequired') }]}
      >
        <TextArea rows={4} placeholder={t('goals.enterReportDescription')} />
      </Form.Item>

      <Form.Item
        label={t('goals.uploadFiles')}
        name="files"
        rules={[{ required: true, message: t('goals.filesRequired') }]}
      >
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
          itemRender={(originNode, file, fileList, actions) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                  </div>
                </div>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={<DeleteOutlined />} 
                onClick={() => actions.remove()}
                danger
              />
            </div>
          )}
        >
          <Button icon={<UploadOutlined />}>{t('goals.selectFiles')}</Button>
        </Upload>
        
        {/* Progress indicator */}
        {uploading && (
          <div style={{ marginTop: 16 }}>
            {/* File summary */}
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                {t('goals.uploadingFiles')} ({fileList.length} {t('goals.files')})
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {fileList.map(file => file.name).join(', ')}
              </div>
            </div>
            
            <Progress 
              percent={uploadProgress} 
              status={uploadProgress === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
              {uploadProgress < 100 ? t('goals.uploading') : t('goals.uploadComplete')}
            </div>
          </div>
        )}
      </Form.Item>

      <Divider>{t('goals.updateStatus')}</Divider>

      <Form.Item
        label={t('goals.status')}
        name="status"
        initialValue={goal.status}
      >
        <Select placeholder={t('goals.selectStatus')}>
          <Select.Option value="pending">{t('goals.pending')}</Select.Option>
          <Select.Option value="completed">{t('goals.completed')}</Select.Option>
          <Select.Option value="blocked">{t('goals.blocked')}</Select.Option>
          <Select.Option value="on_hold">{t('goals.onHold')}</Select.Option>
          <Select.Option value="cancelled">{t('goals.cancelled')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={uploading}>
            {uploading ? t('goals.uploading') : t('goals.uploadReport')}
          </Button>
          <Button onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
