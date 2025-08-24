'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Select,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Radio,
  Spin,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  AimOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, UserRole } from '@/types';
import type { User } from '@/lib/services/userService';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/services/userService';
import { departmentService } from '@/lib/services/departmentService';
import { goalService } from '@/lib/services/goalService';

const { TextArea } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function CreateGoalPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [goalType, setGoalType] = useState<'individual' | 'department'>('individual');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  // Load departments and users on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter users when department changes
  useEffect(() => {
    if (selectedDepartment) {
      filterUsersByDepartment();
    }
  }, [selectedDepartment, users]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Load departments
      const deps = await departmentService.getAll();
      setDepartments(deps);

      // Load users based on role
      let allUsers: User[] = [];
      
      if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.DEVELOPER) {
        // Admin can see all users from all departments
        const usersResponse = await userService.getAll();
        allUsers = usersResponse.users || [];
      } else if (user?.role === UserRole.SUPERVISOR) {
        // Supervisor can only see users from their department
        if (user.departmentId) {
          const deptUsers = await userService.getByDepartment(user.departmentId);
          allUsers = deptUsers;
          // Auto-select supervisor's department
          setSelectedDepartment(user.departmentId);
          form.setFieldsValue({ department: user.departmentId });
        }
      }
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      message.error(t('common.error'));
    } finally {
      setLoadingData(false);
    }
  };

  const filterUsersByDepartment = () => {
    if (!selectedDepartment) {
      setFilteredUsers([]);
      return;
    }

    let filtered: User[] = [];
    
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.DEVELOPER) {
      // Admin can assign to any user in the selected department
      filtered = users.filter(u => u.departmentId === selectedDepartment);
    } else if (user?.role === UserRole.SUPERVISOR) {
      // Supervisor can only assign to users in their department
      filtered = users.filter(u => u.departmentId === selectedDepartment);
    }

    setFilteredUsers(filtered);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Transform data to match backend API expectations
      const goalData = {
        name: values.title, // Backend expects 'name' not 'title'
        description: values.description,
        departmentId: values.department,
        timeline: values.dateRange[1].toISOString(), // Backend expects 'timeline' as end date
        priority: values.priority,
        userIds: goalType === 'individual' ? values.assignedTo : [] // Backend expects 'userIds' not 'assignedUserIds'
      };

      console.log('Sending goal data to backend:', goalData);

      // If it's a department goal, get all users from that department
      if (goalType === 'department') {
        const deptUsers = users.filter(u => u.departmentId === values.department);
        goalData.userIds = deptUsers.map(u => u.id);
      }

      // Send to backend with transformed field names
      const response = await fetch('/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create goal');
      }
      
      message.success(t('goals.goalCreatedSuccessfully'));
      router.push('/goals/view');
    } catch (error) {
      console.error('Failed to create goal:', error);
      message.error(t('goals.goalCreationFailed'));
    } finally {
      setLoading(false);
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

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Title level={3} className="mb-2">
          🎯 {t("navigation.createGoals")}
        </Title>
        <p className="text-gray-600">
          {t('goals.createGoalDescription')}
        </p>
      </Card>

      {/* Goal Form */}
      <Card title={t('goals.goalDetails')}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label={t('goals.goalTitle')}
            name="title"
            rules={[
              { required: true, message: t('goals.titleRequired') },
              { min: 3, message: t('goals.titleMinLength') }
            ]}
          >
            <Input
              prefix={<AimOutlined />}
              placeholder={t('goals.titlePlaceholder')}
              size="large"
            />
          </Form.Item>

                        <Form.Item
                label={t('goals.goalDescriptionText')}
                name="description"
                rules={[
                  { required: true, message: t('goals.descriptionRequired') }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder={t('goals.descriptionPlaceholder')}
                />
              </Form.Item>

          <Form.Item label={t('goals.goalAssignment')}>
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
                <UserOutlined /> {t('goals.individualGoal')}
              </Radio>
              <Radio value="department">
                <TeamOutlined /> {t('goals.departmentGoal')}
              </Radio>
            </Radio.Group>
          </Form.Item>

          {goalType === 'individual' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t('common.department')}
                  name="department"
                  rules={[{ required: true, message: t('goals.departmentRequired') }]}
                >
                  <Select
                    size="large"
                    placeholder={t('goals.selectDepartment')}
                    onChange={(value) => {
                      setSelectedDepartment(value);
                      form.setFieldsValue({ assignedTo: [] });
                      setSelectedUsers([]);
                    }}
                  >
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t('goals.assignToUsers')}
                  name="assignedTo"
                  rules={[{ required: true, message: t('goals.usersRequired') }]}
                >
                  <Select
                    mode="multiple"
                    size="large"
                    placeholder={t('goals.selectUsers')}
                    disabled={!selectedDepartment}
                    loading={!selectedDepartment}
                    onChange={setSelectedUsers}
                    value={selectedUsers}
                  >
                                            {filteredUsers.map(user => (
                          <Option key={user.id} value={user.id}>
                            <Space>
                              <UserOutlined />
                              {user.name}
                              <Tag color="blue">{user.role}</Tag>
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
              label={t('common.department')}
              name="department"
              rules={[{ required: true, message: t('goals.departmentRequired') }]}
            >
              <Select size="large" placeholder={t('goals.selectDepartmentForGoal')}>
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>
                    <TeamOutlined /> {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {goalType === 'department' && (
            <Alert
              message={t('goals.departmentGoalInfo')}
              description={t('goals.departmentGoalDescription')}
              type="info"
              showIcon
              className="mb-4"
            />
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('goals.priority')}
                name="priority"
                rules={[{ required: true, message: t('goals.priorityRequired') }]}
                initialValue={GoalPriority.MEDIUM}
              >
                <Select size="large">
                  <Select.Option value={GoalPriority.LOW}>
                    <Tag color={getPriorityColor(GoalPriority.LOW)}>{t('goals.lowPriority')}</Tag>
                  </Select.Option>
                  <Select.Option value={GoalPriority.MEDIUM}>
                    <Tag color={getPriorityColor(GoalPriority.MEDIUM)}>{t('goals.mediumPriority')}</Tag>
                  </Select.Option>
                  <Select.Option value={GoalPriority.HIGH}>
                    <Tag color={getPriorityColor(GoalPriority.HIGH)}>{t('goals.highPriority')}</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t('goals.timeline')}
                name="dateRange"
                rules={[{ required: true, message: t('goals.timelineRequired') }]}
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

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                {t('goals.createGoal')}
              </Button>
              <Button 
                size="large"
                onClick={() => router.push('/goals/view')}
              >
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
