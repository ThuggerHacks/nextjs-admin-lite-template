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
import dayjs from 'dayjs';
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
import { CreateGoalRequest } from '@/lib/services/goalService';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

         // Load departments and users on component mount
       useEffect(() => {
         if (user) {
           loadInitialData();
         }
       }, [user]);

  // Check if we're in edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditingGoalId(editId);
      loadGoalForEdit(editId);
    }
  }, [form]); // Add form dependency

  // Initialize form with default values
  useEffect(() => {
    if (!isEditMode && !editingGoalId) {
      // Set default date range for new goals (1 month from now)
      form.setFieldsValue({
        dateRange: [dayjs(), dayjs().add(1, 'month')],
        priority: GoalPriority.MEDIUM
      });
    }
  }, [isEditMode, editingGoalId, form]);

     // Filter users when department changes
   useEffect(() => {
     if (selectedDepartment && users.length > 0) {
       filterUsersByDepartment();
     } else if (selectedDepartment && users.length === 0) {
       // If we have a department selected but no users, try filtering again after a delay
       setTimeout(() => {
         if (selectedDepartment && users.length > 0) {
           filterUsersByDepartment();
         }
       }, 500);
     }
   }, [selectedDepartment, users]);

     // Ensure form is updated when department is auto-selected for supervisors
   useEffect(() => {
     if (user?.role === UserRole.SUPERVISOR && user.departmentId && selectedDepartment === user.departmentId) {
       form.setFieldsValue({ department: user.departmentId });
       
       // Also trigger filtering if users are loaded
       if (users.length > 0) {
         filterUsersByDepartment();
       }
     }
   }, [user, selectedDepartment, form, users]);

     // Force filtering when both users and department are available for supervisors
   useEffect(() => {
     if (user?.role === UserRole.SUPERVISOR && 
         user.departmentId && 
         selectedDepartment === user.departmentId && 
         users.length > 0 && 
         filteredUsers.length === 0) {
       setTimeout(() => {
         filterUsersByDepartment();
       }, 100);
     }
   }, [user, selectedDepartment, users, filteredUsers]);

  // Re-evaluate goal type and user selection when users are loaded (for edit mode)
  useEffect(() => {
    if (isEditMode && editingGoalId && users.length > 0 && selectedDepartment) {
      const storedGoal = sessionStorage.getItem(`goal_${editingGoalId}`);
      if (storedGoal) {
        try {
          const goal = JSON.parse(storedGoal);
          const departmentUsers = users.filter(u => u.departmentId === goal.departmentId);
          const assignedUserIds = goal.assignments?.map((a: any) => a.userId) || [];

          if (departmentUsers.length > 0 && assignedUserIds.length === departmentUsers.length) {
            setGoalType('department');
          } else if (assignedUserIds.length > 0) {
            setGoalType('individual');
          }

          filterUsersByDepartment(); // Re-filter users now that they're loaded
        } catch (error) {
          console.error('Failed to re-evaluate goal type:', error);
        }
      }
    }
  }, [users, isEditMode, editingGoalId, selectedDepartment]);

  // Re-evaluate goal type when users are loaded (for edit mode)
  useEffect(() => {
    if (isEditMode && editingGoalId && users.length > 0 && selectedDepartment) {
      const storedGoal = sessionStorage.getItem(`goal_${editingGoalId}`);
      if (storedGoal) {
        try {
          const goal = JSON.parse(storedGoal);
          const departmentUsers = users.filter(u => u.departmentId === goal.departmentId);
          const assignedUserIds = goal.assignments?.map((a: any) => a.userId) || [];
          
          if (departmentUsers.length > 0 && assignedUserIds.length === departmentUsers.length) {
            setGoalType('department');
          } else if (assignedUserIds.length > 0) {
            setGoalType('individual');
          }
          
          // Re-filter users now that they're loaded
          filterUsersByDepartment();
        } catch (error) {
          console.error('Failed to re-evaluate goal type:', error);
        }
      }
    }
  }, [users, isEditMode, editingGoalId, selectedDepartment]);

  const loadGoalForEdit = async (goalId: string) => {
    try {
      setLoadingData(true);
      
      // Try to get goal from sessionStorage first
      const storedGoal = sessionStorage.getItem(`goal_${goalId}`);
      let goal;
      
      if (storedGoal) {
        goal = JSON.parse(storedGoal);
        console.log('Loaded goal from sessionStorage:', goal);
      } else {
        // Fetch from backend
        goal = await goalService.getById(goalId);
        // Store in sessionStorage for future use
        sessionStorage.setItem(`goal_${goalId}`, JSON.stringify(goal));
      }
      
      // Validate and create dayjs objects for dates
      let startDate, endDate;
      try {
        startDate = goal.startDate ? dayjs(goal.startDate) : dayjs();
        endDate = goal.endDate ? dayjs(goal.endDate) : dayjs().add(1, 'month');
        
        // Validate that dates are valid
        if (!startDate.isValid() || !endDate.isValid()) {
          console.warn('Invalid dates received from backend, using fallback dates');
          startDate = dayjs();
          endDate = dayjs().add(1, 'month');
        }
      } catch (dateError) {
        console.warn('Error parsing dates, using fallback dates:', dateError);
        startDate = dayjs();
        endDate = dayjs().add(1, 'month');
      }
      
      // Pre-fill the form with goal data
      const formData = {
        title: goal.name, // Backend uses 'name', frontend expects 'title'
        description: goal.description,
        department: goal.departmentId,
        dateRange: [startDate, endDate],
        assignedTo: goal.assignments?.map((a: any) => a.userId) || [],
        priority: goal.priority?.toLowerCase() || GoalPriority.MEDIUM // Convert to lowercase
      };
      
      console.log('Setting form data:', formData);
      form.setFieldsValue(formData);
      
      setSelectedDepartment(goal.departmentId);
      setSelectedUsers(goal.assignments?.map((a: any) => a.userId) || []);
      
      // Set goal type based on assignments
      // If all users in the department are assigned, it's likely a department goal
      const departmentUsers = users.filter(u => u.departmentId === goal.departmentId);
      const assignedUserIds = goal.assignments?.map((a: any) => a.userId) || [];
      
      if (departmentUsers.length > 0 && assignedUserIds.length === departmentUsers.length) {
        // All department users are assigned - likely a department goal
        setGoalType('department');
      } else if (assignedUserIds.length > 0) {
        // Some specific users are assigned - individual goal
        setGoalType('individual');
      } else {
        // No assignments - default to individual
        setGoalType('individual');
      }
      
          // Ensure filtered users are populated for the selected department
      // Wait for users to be loaded before filtering
      if (users.length > 0) {
        filterUsersByDepartment();
      } else {
        // If users aren't loaded yet, wait and try again
        setTimeout(() => {
          filterUsersByDepartment();
        }, 500);
      }
      
      // Store goal data in sessionStorage for fallback
      sessionStorage.setItem(`goal_${goalId}`, JSON.stringify(goal));
      
    } catch (error) {
      console.error('Failed to load goal for edit:', error);
      message.error(t('goals.failedToLoadGoal'));
      
      // Try to load from sessionStorage as fallback
      const storedGoal = sessionStorage.getItem(`goal_${goalId}`);
      if (storedGoal) {
        try {
          const goal = JSON.parse(storedGoal);
          console.log('Loading from sessionStorage fallback:', goal);
          
          // Set basic form data
          form.setFieldsValue({
            title: goal.name,
            description: goal.description,
            department: goal.departmentId,
            priority: goal.priority || GoalPriority.MEDIUM
          });
          
          setSelectedDepartment(goal.departmentId);
        } catch (storageError) {
          console.error('Failed to parse stored goal:', storageError);
        }
      }
    } finally {
      setLoadingData(false);
    }
  };

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
           try {
             const deptUsers = await userService.getByDepartment(user.departmentId);
             
             // Check if the response has the expected structure
             if (Array.isArray(deptUsers)) {
               allUsers = deptUsers;
             } else if (deptUsers && typeof deptUsers === 'object' && 'users' in deptUsers) {
               allUsers = (deptUsers as any).users || [];
             } else {
               console.warn('Unexpected API response structure:', deptUsers);
               allUsers = [];
             }
             
             // Auto-select supervisor's department
             setSelectedDepartment(user.departmentId);
             form.setFieldsValue({ department: user.departmentId });
             
             // Also filter users immediately for this department
             setTimeout(() => {
               filterUsersByDepartment();
             }, 100);
           } catch (error) {
             message.error('Failed to load users for your department');
             // Try to load all users as fallback
             try {
               const usersResponse = await userService.getAll();
               allUsers = usersResponse.users || [];
             } catch (fallbackError) {
               // Fallback failed, continue with empty users
             }
           }
         } else {
           message.error('Supervisor must be assigned to a department to create goals');
         }
       }
      
             setUsers(allUsers);
       
       // Force filtering for supervisors after users are loaded
       if (user?.role === UserRole.SUPERVISOR && user.departmentId && allUsers.length > 0) {
         setTimeout(() => {
           filterUsersByDepartment();
         }, 200);
       }
     } catch (error) {
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
      
      // If no users found for supervisor, show all users as fallback
      if (filtered.length === 0 && users.length > 0) {
        filtered = users;
      }
    }

    setFilteredUsers(filtered);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Validate dateRange
      if (!values.dateRange || !values.dateRange[0] || !values.dateRange[1]) {
        message.error(t('goals.timelineRequired'));
        setLoading(false);
        return;
      }

      // Ensure we have valid dayjs objects
      let startDate, endDate;
      try {
        startDate = dayjs.isDayjs(values.dateRange[0]) ? values.dateRange[0] : dayjs(values.dateRange[0]);
        endDate = dayjs.isDayjs(values.dateRange[1]) ? values.dateRange[1] : dayjs(values.dateRange[1]);
        
        // Validate that dates are valid
        if (!startDate.isValid() || !endDate.isValid()) {
          message.error(t('goals.invalidDates'));
          setLoading(false);
          return;
        }
      } catch (dateError) {
        console.error('Error parsing dates:', dateError);
        message.error(t('goals.invalidDates'));
        setLoading(false);
        return;
      }

      // Transform data to match backend API expectations
      const goalData: CreateGoalRequest = {
        name: values.title, // Backend expects 'name' not 'title'
        description: values.description,
        departmentId: values.department,
        startDate: startDate.toISOString(), // Backend expects 'startDate'
        endDate: endDate.toISOString(), // Backend expects 'endDate'
        timeline: endDate.toISOString(), // Backend also accepts 'timeline' as endDate
        priority: values.priority?.toUpperCase() || 'MEDIUM', // Backend expects uppercase
        userIds: goalType === 'individual' ? values.assignedTo : [], // Backend expects 'userIds' not 'assignedUserIds'
        isDepartmentGoal: goalType === 'department' // Add flag to indicate department goal
      };

      console.log('Sending goal data to backend:', goalData);

      // If it's a department goal, get all users from that department
      if (goalType === 'department') {
        const deptUsers = users.filter(u => u.departmentId === values.department);
        goalData.userIds = deptUsers.map(u => u.id);
      }

      let response;
      if (isEditMode && editingGoalId) {
        // Update existing goal
        response = await goalService.update(editingGoalId, goalData);
      } else {
        // Create new goal
        response = await goalService.create(goalData);
      }
      
      message.success(isEditMode ? t('goals.goalUpdatedSuccessfully') : t('goals.goalCreatedSuccessfully'));
      router.push('/goals/view');
    } catch (error) {
      console.error('Failed to save goal:', error);
      message.error(isEditMode ? t('goals.goalUpdateFailed') : t('goals.goalCreationFailed'));
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
          🎯 {isEditMode ? t("goals.editGoal") : t("navigation.createGoals")}
        </Title>
        <p className="text-gray-600">
          {isEditMode ? t('goals.editGoalDescription') : t('goals.createGoalDescription')}
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
                 if (e.target.value === 'department' && user?.role === UserRole.SUPERVISOR && user.departmentId) {
                   // Auto-select supervisor's department for department goals
                   form.setFieldsValue({ assignedTo: [], department: user.departmentId });
                   setSelectedDepartment(user.departmentId);
                 } else {
                   form.setFieldsValue({ assignedTo: [], department: undefined });
                   setSelectedUsers([]);
                 }
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
                    disabled={user?.role === UserRole.SUPERVISOR} // Disable for supervisors
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
              <Select 
                size="large" 
                placeholder={t('goals.selectDepartmentForGoal')}
                disabled={user?.role === UserRole.SUPERVISOR} // Disable for supervisors
              >
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
                {isEditMode ? t('goals.updateGoal') : t('goals.createGoal')}
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

