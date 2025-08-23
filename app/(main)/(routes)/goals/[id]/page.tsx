'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Progress,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Modal,
  Upload,
  List,
  Avatar,
  Tooltip,
  Timeline,
  Badge,
  Select,
  Dropdown,
  Menu,
  Alert,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Goal, GoalStatus, GoalPriority, GoalReport, UserRole } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import ReportSubmissionModal from '@/components/ReportSubmissionModal';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function GoalDetailPage() {
  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportFiles, setReportFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [reportType, setReportType] = useState<'progress' | 'completion' | 'update'>('progress');
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  
  // Mock goal data with reports
  const [goal, setGoal] = useState<Goal>({
    id: '1',
    title: 'Improve Customer Satisfaction',
    description: 'Increase customer satisfaction ratings through better service delivery and response times',
    assignedTo: [
      { id: '1', name: 'João Silva', email: 'joao@empresa.com', role: UserRole.USER, department: 'Customer Service', status: 'active' as any, createdAt: new Date() },
      { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: UserRole.USER, department: 'Customer Service', status: 'active' as any, createdAt: new Date() }
    ],
    createdBy: { id: '3', name: 'Carlos Admin', email: 'carlos@empresa.com', role: UserRole.ADMIN, department: 'Customer Service', status: 'active' as any, createdAt: new Date() },
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    progress: 75,
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.HIGH,
    department: 'Customer Service',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    isCompleted: false,
    requiresReportOnCompletion: true,
    completionReportSubmitted: false,
    reports: [
      {
        id: '1',
        goalId: '1',
        title: 'Q1 Progress Report',
        description: 'Customer satisfaction improved to 75% through implementation of new response protocols',
        submittedBy: { id: '1', name: 'João Silva', email: 'joao@empresa.com', role: UserRole.USER, department: 'Customer Service', status: 'active' as any, createdAt: new Date() },
        submittedAt: new Date('2024-03-31'),
        version: 1,
        attachments: [],
        status: 'submitted',
        approvedBy: { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: UserRole.ADMIN, department: 'Customer Service', status: 'active' as any, createdAt: new Date() },
        approvedAt: new Date('2024-04-02'),
        isCompletionReport: false,
        reportType: 'progress',
      },
      {
        id: '2',
        goalId: '1',
        title: 'Q2 Update Report',
        description: 'Additional improvements made to customer response system and training protocols updated',
        submittedBy: { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: UserRole.USER, department: 'Customer Service', status: 'active' as any, createdAt: new Date() },
        submittedAt: new Date('2024-06-30'),
        version: 2,
        attachments: [],
        status: 'approved',
        approvedBy: { id: '3', name: 'Carlos Admin', email: 'carlos@empresa.com', role: UserRole.ADMIN, department: 'Customer Service', status: 'active' as any, createdAt: new Date() },
        approvedAt: new Date('2024-07-02'),
        isCompletionReport: false,
        reportType: 'update',
      },
    ],
  });

  const canEditGoal = () => {
    if (!user) return false;
    
    // Goal creator or super admin can edit
    if (user.role === UserRole.SUPER_ADMIN || goal.createdBy.id === user.id) {
      return true;
    }
    
    // Assigned users can edit their own goal
    if (goal.assignedTo && goal.assignedTo.some(assignedUser => assignedUser.id === user.id)) {
      return true;
    }
    
    // Department admin can edit department goals
    if (user.role === UserRole.ADMIN && user.department?.name === goal.department) {
      return true;
    }
    
    return false;
  };

  const canAddReport = () => {
    if (!user) return false;
    
    // Assigned users can add reports
    if (goal.assignedTo && goal.assignedTo.some(assignedUser => assignedUser.id === user.id)) {
      return true;
    }
    
    // Department members can add reports to department-wide goals
    if (!goal.assignedTo && user.department?.name === goal.department) {
      return true;
    }
    
    // Supervisors can add reports
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    return false;
  };

  const handleSaveGoal = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if goal is being marked as completed
      const isBeingCompleted = values.progress === 100 && !goal.isCompleted;
      
      if (isBeingCompleted && goal.requiresReportOnCompletion && !goal.completionReportSubmitted) {
        // Show completion report modal
        setLoading(false);
        setCompletionModalVisible(true);
        return;
      }
      
      setGoal(prev => ({
        ...prev,
        title: values.title,
        description: values.description,
        progress: values.progress,
        status: values.progress === 100 ? GoalStatus.COMPLETED : values.status,
        isCompleted: values.progress === 100,
        updatedAt: new Date(),
      }));
      
      setIsEditing(false);
      message.success('Goal updated successfully!');
    } catch (error) {
      message.error('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionWithReport = (report: Partial<GoalReport>) => {
    // Add the completion report
    const completionReport: GoalReport = {
      ...report,
      id: String(Date.now()),
      goalId: goal.id,
      submittedBy: user!,
      submittedAt: new Date(),
      version: goal.reports.length + 1,
      status: 'submitted',
      isCompletionReport: true,
      reportType: 'completion',
    } as GoalReport;

    // Update goal with completion and report
    setGoal(prev => ({
      ...prev,
      progress: 100,
      status: GoalStatus.COMPLETED,
      isCompleted: true,
      completionReportSubmitted: true,
      reports: [...prev.reports, completionReport],
      updatedAt: new Date(),
    }));

    setCompletionModalVisible(false);
    setIsEditing(false);
    message.success('Goal completed and report submitted successfully!');
  };

  const handleReportSubmission = (report: Partial<GoalReport>) => {
    const newReport: GoalReport = {
      ...report,
      id: String(Date.now()),
      goalId: goal.id,
      submittedBy: user!,
      submittedAt: new Date(),
      version: goal.reports.length + 1,
      status: 'submitted',
    } as GoalReport;

    setGoal(prev => ({
      ...prev,
      reports: [...prev.reports, newReport],
      updatedAt: new Date(),
    }));

    setReportModalVisible(false);
    message.success('Report submitted successfully!');
  };

  const handleAddReport = async (values: any) => {
    setLoading(true);
    setIsUploading(true);
    
    try {
      // Simulate file upload progress if files are attached
      if (reportFiles.length > 0) {
        const progressInit = reportFiles.reduce((acc, file, index) => {
          acc[`file-${index}`] = 0;
          return acc;
        }, {} as { [key: string]: number });
        setUploadProgress(progressInit);

        // Simulate upload progress for each file
        const uploadPromises = reportFiles.map(async (file, index) => {
          const fileKey = `file-${index}`;
          
          for (let progress = 0; progress <= 100; progress += Math.random() * 15 + 5) {
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
            
            setUploadProgress(prev => ({
              ...prev,
              [fileKey]: Math.min(progress, 100)
            }));
            
            if (progress >= 100) break;
          }
        });
        
        await Promise.all(uploadPromises);
      }
      
      const newReport: GoalReport = {
        id: Date.now().toString(),
        goalId: goal.id,
        title: values.title,
        description: values.description,
        submittedBy: user!,
        submittedAt: new Date(),
        version: goal.reports.length + 1,
        attachments: [],
        status: 'submitted',
        isCompletionReport: false,
        reportType: 'progress',
      };
      
      setGoal(prev => ({
        ...prev,
        reports: [...prev.reports, newReport],
        updatedAt: new Date(),
      }));
      
      setReportModalVisible(false);
      reportForm.resetFields();
      setReportFiles([]);
      setUploadProgress({});
      message.success('Report submitted successfully!');
    } catch (error) {
      message.error('Failed to submit report');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case GoalStatus.ACTIVE:
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case GoalStatus.OVERDUE:
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED: return 'success';
      case GoalStatus.ACTIVE: return 'processing';
      case GoalStatus.OVERDUE: return 'error';
      case GoalStatus.ON_HOLD: return 'warning';
      case GoalStatus.CANCELLED: return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.HIGH: return 'red';
      case GoalPriority.MEDIUM: return 'orange';
      case GoalPriority.LOW: return 'blue';
      default: return 'default';
    }
  };

  const uploadProps = {
    multiple: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
    beforeUpload: () => false,
    onChange: ({ fileList }: any) => {
      setReportFiles(fileList);
    },
    fileList: reportFiles,
  };

  const reportStatusMenu = (report: GoalReport) => (
    <Menu>
      <Menu.Item key="approve" onClick={() => message.success('Report approved')}>
        Approve Report
      </Menu.Item>
      <Menu.Item key="request-changes" onClick={() => message.info('Feedback requested')}>
        Request Changes
      </Menu.Item>
      <Menu.Item key="reject" onClick={() => message.error('Report rejected')}>
        Reject Report
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Title level={3} className="mb-0">
                {goal.assignedTo && goal.assignedTo.length > 1 ? <TeamOutlined /> : 
                 goal.assignedTo && goal.assignedTo.length === 1 ? <UserOutlined /> : 
                 <TeamOutlined />} {goal.title}
              </Title>
              <Tag color={getStatusColor(goal.status)} icon={getStatusIcon(goal.status)}>
                {goal.status.toUpperCase()}
              </Tag>
              <Tag color={getPriorityColor(goal.priority)}>
                {goal.priority.toUpperCase()} PRIORITY
              </Tag>
            </div>
            <Text type="secondary" className="block mb-2">
              {goal.description}
            </Text>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                {goal.assignedTo && goal.assignedTo.length > 0 
                  ? `Assigned to: ${goal.assignedTo.map(u => u.name).join(', ')}` 
                  : `Department: ${goal.department}`}
              </span>
              <span>Created by: {goal.createdBy.name}</span>
              <span>Due: {goal.endDate.toLocaleDateString()}</span>
            </div>
            
            {/* Assigned Users Display */}
            {goal.assignedTo && goal.assignedTo.length > 0 && (
              <div className="mt-3">
                <Text type="secondary" className="block mb-2">Assigned Users:</Text>
                <Space wrap>
                  {goal.assignedTo.map(assignedUser => (
                    <Tag key={assignedUser.id} color="blue" icon={<UserOutlined />}>
                      {assignedUser.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
          {canEditGoal() && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit Goal
            </Button>
          )}
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Goal Progress */}
        <Col xs={24} lg={16}>
          <Card title="Goal Progress" className="mb-6">
            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveGoal}
                initialValues={{
                  title: goal.title,
                  description: goal.description,
                  progress: goal.progress,
                  status: goal.status,
                }}
              >
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: 'Please enter goal title' }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea rows={3} />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Current Value (%)"
                      name="currentValue"
                      rules={[{ required: true, message: 'Please enter current value' }]}
                    >
                      <Input type="number" min={0} max={100} size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Status"
                      name="status"
                      rules={[{ required: true, message: 'Please select status' }]}
                    >
                      <Select size="large">
                        {Object.values(GoalStatus).map(status => (
                          <Select.Option key={status} value={status}>
                            {status.toUpperCase()}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div>
                <div className="mb-4">
                  <Progress
                    percent={goal.progress}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                <Row gutter={16}>
                  <Col xs={12} md={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{goal.progress}%</div>
                      <div className="text-gray-500">Current Progress</div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{goal.reports.length}</div>
                      <div className="text-gray-500">Reports Submitted</div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.ceil((goal.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-gray-500">Days Remaining</div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {goal.priority.toUpperCase()}
                      </div>
                      <div className="text-gray-500">Priority</div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card>

          {/* Reports Section */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <span>Progress Reports</span>
                {goal.requiresReportOnCompletion && !goal.completionReportSubmitted && goal.progress >= 90 && (
                  <Tooltip title="Completion report will be required when goal reaches 100%">
                    <WarningOutlined style={{ color: '#faad14' }} />
                  </Tooltip>
                )}
              </div>
            }
            extra={
              canAddReport() && (
                <Space>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'progress',
                          label: 'Progress Report',
                          icon: <ClockCircleOutlined />,
                          onClick: () => {
                            setReportType('progress');
                            setReportModalVisible(true);
                          }
                        },
                        {
                          key: 'update',
                          label: 'Update Report',
                          icon: <FileTextOutlined />,
                          onClick: () => {
                            setReportType('update');
                            setReportModalVisible(true);
                          }
                        },
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button type="primary" icon={<PlusOutlined />}>
                      Add Report
                    </Button>
                  </Dropdown>
                </Space>
              )
            }
          >
            {/* Completion Report Alert */}
            {goal.requiresReportOnCompletion && !goal.completionReportSubmitted && (
              <Alert
                message="Completion Report Required"
                description="This goal requires a completion report when marked as 100% complete. The completion report will be mandatory before the goal can be finished."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {goal.reports.length === 0 ? (
              <div className="text-center py-8">
                <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
                <Text type="secondary">No reports submitted yet</Text>
                {canAddReport() && (
                  <div className="mt-4">
                    <Button 
                      type="link" 
                      onClick={() => {
                        setReportType('progress');
                        setReportModalVisible(true);
                      }}
                    >
                      Submit your first report
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <List
                dataSource={goal.reports}
                renderItem={(report) => (
                  <List.Item
                    actions={[
                      <Tooltip key="view" title="View Report">
                        <Button icon={<EyeOutlined />} size="small" />
                      </Tooltip>,
                      ...(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN ? [
                        <Dropdown overlay={reportStatusMenu(report)} key="more">
                          <Button icon={<MoreOutlined />} size="small" />
                        </Dropdown>
                      ] : [])
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={report.version} size="small">
                          <Avatar 
                            icon={<FileTextOutlined />} 
                            style={{ 
                              backgroundColor: report.isCompletionReport ? '#52c41a' : '#1890ff' 
                            }}
                          />
                        </Badge>
                      }
                      title={
                        <div className="flex items-center gap-2">
                          <span>{report.title}</span>
                          <Tag color={report.status === 'approved' ? 'green' : 'blue'}>
                            {report.status.toUpperCase()}
                          </Tag>
                          {report.isCompletionReport && (
                            <Tag color="gold" icon={<CheckCircleOutlined />}>
                              COMPLETION
                            </Tag>
                          )}
                          <Tag color="purple">
                            {report.reportType.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text ellipsis style={{ width: '100%', display: 'block' }}>
                            {report.description}
                          </Text>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>By: {report.submittedBy.name}</span>
                            <span>Submitted: {report.submittedAt.toLocaleDateString()}</span>
                            <span>Version: {report.version}</span>
                            {report.attachments.length > 0 && (
                              <span>{report.attachments.length} attachment(s)</span>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Timeline */}
        <Col xs={24} lg={8}>
          <Card title="Timeline">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="font-medium">Goal Created</div>
                      <div className="text-sm text-gray-500">
                        {goal.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ),
                },
                ...goal.reports.map((report, index) => ({
                  color: report.status === 'approved' ? 'green' : 'blue',
                  children: (
                    <div>
                      <div className="font-medium">Report v{report.version} Submitted</div>
                      <div className="text-sm text-gray-500">
                        {report.submittedAt.toLocaleDateString()} by {report.submittedBy.name}
                      </div>
                    </div>
                  ),
                })),
                {
                  color: 'gray',
                  children: (
                    <div>
                      <div className="font-medium">Goal Deadline</div>
                      <div className="text-sm text-gray-500">
                        {goal.endDate.toLocaleDateString()}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Report Submission Modals */}
      <ReportSubmissionModal
        open={reportModalVisible}
        goal={goal}
        user={user!}
        reportType={reportType}
        onSubmit={handleReportSubmission}
        onCancel={() => setReportModalVisible(false)}
      />

      <ReportSubmissionModal
        open={completionModalVisible}
        goal={goal}
        user={user!}
        reportType="completion"
        onSubmit={handleCompletionWithReport}
        onCancel={() => {
          setCompletionModalVisible(false);
          // Reset form back to previous values if user cancels completion
          form.setFieldsValue({
            progress: goal.progress
          });
        }}
        isCompletionRequired={true}
      />
    </div>
  );
}
