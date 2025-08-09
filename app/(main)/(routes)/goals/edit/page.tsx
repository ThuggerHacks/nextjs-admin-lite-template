'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Select,
  InputNumber,
  Progress,
  message,
  Typography,
  Row,
  Col,
  Tag,
  Slider,
} from 'antd';
import {
  SaveOutlined,
  AimOutlined,
  CalendarOutlined,
  PercentageOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, User, UserRole } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;

// Mock users data for selection
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: UserRole.SUPER_ADMIN,
    department: 'IT',
    status: 'active' as any,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: UserRole.ADMIN,
    department: 'HR',
    status: 'active' as any,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: UserRole.USER,
    department: 'IT',
    status: 'active' as any,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Ana Silva',
    email: 'ana@empresa.com',
    role: UserRole.USER,
    department: 'Sales',
    status: 'active' as any,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Carlos Silva',
    email: 'carlos@empresa.com',
    role: UserRole.USER,
    department: 'Support',
    status: 'active' as any,
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Lucas Oliveira',
    email: 'lucas@empresa.com',
    role: UserRole.USER,
    department: 'IT',
    status: 'active' as any,
    createdAt: new Date(),
  },
];

// Mock goal data
const mockGoal: Goal = {
  id: '1',
  title: 'Complete Q4 Project Documentation',
  description: 'Finalize all project documentation for Q4 deliverables including technical specs, user guides, and deployment procedures.',
  status: GoalStatus.ACTIVE,
  priority: GoalPriority.HIGH,
  progress: 65,
  startDate: new Date('2024-10-01'),
  endDate: new Date('2024-12-31'),
  assignedTo: [{
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'admin' as any,
    department: 'IT',
    status: 'active' as any,
    createdAt: new Date(),
  }, {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: 'user' as any,
    department: 'IT',
    status: 'active' as any,
    createdAt: new Date(),
  }],
  createdBy: {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'admin' as any,
    department: 'IT',
    status: 'active' as any,
    createdAt: new Date(),
  },
  department: 'IT',
  createdAt: new Date('2024-10-01'),
  updatedAt: new Date(),
  reports: [],
  isCompleted: false,
};

export default function EditGoalPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<Goal>(mockGoal);
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get('id');

  // Initialize form with goal data
  React.useEffect(() => {
    form.setFieldsValue({
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      status: goal.status,
      dateRange: [dayjs(goal.startDate), dayjs(goal.endDate)],
      progress: goal.progress,
      assignedTo: goal.assignedTo?.map(user => user.id) || [],
    });
  }, [goal, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle status update - if completed, create a report
      const statusChanged = goal.status !== values.status;
      const isNowCompleted = values.status === GoalStatus.COMPLETED;
      
      const updatedGoal: Goal = {
        ...goal,
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        progress: values.progress,
        assignedTo: values.assignedTo?.map((userId: string) => 
          mockUsers.find(user => user.id === userId)!
        ) || [],
        isCompleted: isNowCompleted,
        updatedAt: new Date(),
      };
      
      // If goal is marked as completed, create a completion report
      if (statusChanged && isNowCompleted) {
        await handleGoalCompletion(updatedGoal);
      }
      
      setGoal(updatedGoal);
      
      message.success('Goal updated successfully!');
    } catch (error) {
      message.error('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCompletion = async (completedGoal: Goal) => {
    try {
      // Create a completion report automatically
      const newReport = {
        id: `report_${Date.now()}`,
        goalId: completedGoal.id,
        title: `Goal Completion Report: ${completedGoal.title}`,
        description: `This goal has been marked as completed on ${new Date().toLocaleDateString()}. All objectives have been successfully achieved.`,
        submittedBy: user!,
        submittedAt: new Date(),
        version: completedGoal.reports.length + 1,
        attachments: [],
        status: 'submitted' as const,
      };
      
      // Add the report to the goal
      completedGoal.reports.push(newReport);
      
      message.success('Goal completed and completion report generated!');
    } catch (error) {
      message.error('Failed to create completion report');
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    const colors = {
      [GoalPriority.LOW]: 'blue',
      [GoalPriority.MEDIUM]: 'orange',
      [GoalPriority.HIGH]: 'red',
    };
    return colors[priority];
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

  const currentProgress = goal.progress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <Title level={3} className="mb-2">
              ✏️ {t("navigation.editGoals")}
            </Title>
            <p className="text-gray-600">
              Update goal progress and details
            </p>
          </div>
          <div className="text-right">
            <Tag color={getStatusColor(goal.status)} className="mb-2">
              {goal.status.toUpperCase()}
            </Tag>
            <br />
            <Tag color={getPriorityColor(goal.priority)}>
              {goal.priority.toUpperCase()} PRIORITY
            </Tag>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Goal Form */}
        <Col xs={24} lg={16}>
          <Card title="Goal Details">
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                label="Goal Title"
                name="title"
                rules={[
                  { required: true, message: 'Please enter goal title' },
                  { min: 3, message: 'Title must be at least 3 characters' }
                ]}
              >
                <Input
                  prefix={<AimOutlined />}
                  placeholder="Enter a clear and specific goal title"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: 'Please enter goal description' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe your goal in detail"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Priority"
                    name="priority"
                    rules={[{ required: true, message: 'Please select priority' }]}
                  >
                    <Select size="large">
                      <Select.Option value={GoalPriority.LOW}>
                        <Tag color={getPriorityColor(GoalPriority.LOW)}>Low Priority</Tag>
                      </Select.Option>
                      <Select.Option value={GoalPriority.MEDIUM}>
                        <Tag color={getPriorityColor(GoalPriority.MEDIUM)}>Medium Priority</Tag>
                      </Select.Option>
                      <Select.Option value={GoalPriority.HIGH}>
                        <Tag color={getPriorityColor(GoalPriority.HIGH)}>High Priority</Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select size="large">
                      <Select.Option value={GoalStatus.PENDING}>Pending</Select.Option>
                      <Select.Option value={GoalStatus.ACTIVE}>Active</Select.Option>
                      <Select.Option value={GoalStatus.COMPLETED}>Completed</Select.Option>
                      <Select.Option value={GoalStatus.ON_HOLD}>On Hold</Select.Option>
                      <Select.Option value={GoalStatus.OVERDUE}>Overdue</Select.Option>
                      <Select.Option value={GoalStatus.CANCELLED}>Cancelled</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Timeline"
                name="dateRange"
                rules={[{ required: true, message: 'Please select timeline' }]}
              >
                <RangePicker
                  size="large"
                  style={{ width: '100%' }}
                  prefix={<CalendarOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Progress (%)"
                name="progress"
                rules={[
                  { required: true, message: 'Please enter progress percentage' },
                  { type: 'number', min: 0, max: 100, message: 'Progress must be between 0 and 100' }
                ]}
              >
                <Slider
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  marks={{
                    0: '0%',
                    25: '25%',
                    50: '50%',
                    75: '75%',
                    100: '100%'
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Assigned Users"
                name="assignedTo"
                rules={[{ required: true, message: 'Please select at least one user' }]}
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Select users to assign this goal"
                  showSearch
                  filterOption={(input, option) => {
                    if (!option?.value) return false;
                    const user = mockUsers.find(u => u.id === option.value);
                    if (!user) return false;
                    return user.name.toLowerCase().includes(input.toLowerCase()) || 
                           user.department.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {mockUsers.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.name} ({user.department})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    Update Goal
                  </Button>
                  <Button 
                    size="large"
                    onClick={() => router.push('/goals/view')}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Progress Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Progress Overview" className="mb-6">
            <div className="text-center">
              <Progress 
                type="circle" 
                percent={currentProgress} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={() => `${currentProgress}%`}
                size={120}
              />
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  Progress: {goal.progress}%
                </h3>
                <p className="text-gray-600">
                  Goal completion status
                </p>
              </div>
            </div>
          </Card>

          <Card title="Goal Timeline" size="small">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">
                    {goal.startDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">
                    {goal.endDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className="font-medium">
                    {Math.max(0, Math.ceil((goal.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Goal Info" size="small" className="mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Created by:</span>
                <span className="font-medium">{goal.createdBy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assigned to:</span>
                <div className="text-right">
                  {goal.assignedTo && goal.assignedTo.length > 0 ? (
                    goal.assignedTo.length === 1 ? (
                      <span className="font-medium">{goal.assignedTo[0].name}</span>
                    ) : (
                      <div>
                        <span className="font-medium">{goal.assignedTo.length} users</span>
                        <br />
                        <div className="text-sm text-gray-500">
                          {goal.assignedTo.map(user => user.name).join(', ')}
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="font-medium text-gray-400">Not assigned</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{goal.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{goal.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
