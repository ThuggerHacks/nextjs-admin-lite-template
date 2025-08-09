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
  Divider,
  Row,
  Col,
  Tag,
  Radio,
  Spin,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  AimOutlined,
  CalendarOutlined,
  PercentageOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

const { TextArea } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock users data for department selection
const mockUsers: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', role: UserRole.USER, department: 'IT', status: 'active' as any, createdAt: new Date() },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: UserRole.USER, department: 'IT', status: 'active' as any, createdAt: new Date() },
  { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', role: UserRole.USER, department: 'HR', status: 'active' as any, createdAt: new Date() },
  { id: '4', name: 'Ana Oliveira', email: 'ana@empresa.com', role: UserRole.USER, department: 'HR', status: 'active' as any, createdAt: new Date() },
  { id: '5', name: 'Carlos Silva', email: 'carlos@empresa.com', role: UserRole.USER, department: 'Finance', status: 'active' as any, createdAt: new Date() },
];

export default function CreateGoalPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [goalType, setGoalType] = useState<'individual' | 'department'>('individual');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description,
        status: GoalStatus.PENDING,
        priority: values.priority,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        progress: 0,
        assignedTo: goalType === 'individual' && values.assignedTo 
          ? mockUsers.filter(u => values.assignedTo.includes(u.id))
          : undefined,
        assignedDepartment: goalType === 'department' ? values.department || user?.department : undefined,
        createdBy: user!,
        department: values.department || user?.department || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        reports: [],
        isCompleted: false,
        requiresReportOnCompletion: values.requiresReportOnCompletion ?? true,
        completionReportSubmitted: false,
      };
      
      // In a real app, you would save this to your backend
      console.log('Creating goal:', newGoal);
      
      message.success('Goal created successfully!');
      router.push('/goals/view');
    } catch (error) {
      message.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentUsers = () => {
    if (!selectedDepartment) return [];
    return mockUsers.filter(u => u.department === selectedDepartment);
  };

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];

  const getPriorityColor = (priority: GoalPriority) => {
    const colors = {
      [GoalPriority.LOW]: 'blue',
      [GoalPriority.MEDIUM]: 'orange',
      [GoalPriority.HIGH]: 'red',
    };
    return colors[priority];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Title level={3} className="mb-2">
          🎯 {t("navigation.createGoals")}
        </Title>
        <p className="text-gray-600">
          Create a new goal and track your progress
        </p>
      </Card>

      {/* Goal Form */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
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
                  placeholder="Describe your goal in detail, including what success looks like"
                />
              </Form.Item>

              <Form.Item label="Goal Assignment">
                <Radio.Group
                  value={goalType}
                  onChange={(e) => {
                    setGoalType(e.target.value);
                    form.setFieldsValue({ assignedTo: [], department: undefined });
                    setSelectedUsers([]);
                  }}
                  style={{ width: '100%' }}
                >
                  <Radio value="individual">
                    <UserOutlined /> Individual Goal (assigned to specific users)
                  </Radio>
                  <Radio value="department">
                    <TeamOutlined /> Department Goal (visible to all department members)
                  </Radio>
                </Radio.Group>
              </Form.Item>

              {goalType === 'individual' && (
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Department"
                      name="department"
                      rules={[{ required: true, message: 'Please select department' }]}
                    >
                      <Select
                        size="large"
                        placeholder="Select department first"
                        onChange={(value) => {
                          setSelectedDepartment(value);
                          form.setFieldsValue({ assignedTo: [] });
                          setSelectedUsers([]);
                        }}
                      >
                        {departments.map(dept => (
                          <Option key={dept} value={dept}>{dept}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Assign To Users"
                      name="assignedTo"
                      rules={[{ required: true, message: 'Please select at least one user' }]}
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select users from department"
                        disabled={!selectedDepartment}
                        loading={!selectedDepartment}
                        onChange={setSelectedUsers}
                        value={selectedUsers}
                      >
                        {getDepartmentUsers().map(user => (
                          <Option key={user.id} value={user.id}>
                            <Space>
                              <UserOutlined />
                              {user.name}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {goalType === 'department' && (
                <Form.Item
                  label="Department"
                  name="department"
                  rules={[{ required: true, message: 'Please select department' }]}
                >
                  <Select size="large" placeholder="Select department for this goal">
                    {departments.map(dept => (
                      <Option key={dept} value={dept}>
                        <TeamOutlined /> {dept}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Priority"
                    name="priority"
                    rules={[{ required: true, message: 'Please select priority' }]}
                    initialValue={GoalPriority.MEDIUM}
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
                </Col>
              </Row>

              <Divider />

              <Form.Item
                label="Completion Report Requirement"
                name="requiresReportOnCompletion"
                valuePropName="checked"
                initialValue={true}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      defaultChecked
                      onChange={(e) => {
                        form.setFieldValue('requiresReportOnCompletion', e.target.checked);
                      }}
                    />
                    <span>Require completion report when goal is finished</span>
                    <Tooltip title="When enabled, assigned users must submit a completion report before the goal can be marked as 100% complete">
                      <FileTextOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    This ensures proper documentation of goal outcomes and achievements
                  </Typography.Text>
                </div>
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
                    Create Goal
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

        <Col xs={24} lg={8}>
          <Card title="Goal Tips" className="mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">🎯 Be Specific</h4>
                <p className="text-sm text-gray-600">
                  Clear goals are easier to achieve and measure
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">📊 Track Progress</h4>
                <p className="text-sm text-gray-600">
                  Use reports to document progress and updates
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">� Team Goals</h4>
                <p className="text-sm text-gray-600">
                  Department goals allow team collaboration
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">📝 Reports</h4>
                <p className="text-sm text-gray-600">
                  Submit detailed reports when goals are completed
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
