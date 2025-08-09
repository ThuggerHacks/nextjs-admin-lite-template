'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  Progress,
  Space,
  Typography,
  message,
  Select,
  Alert
} from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Goal, GoalReport, User, FileItem } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface ReportSubmissionModalProps {
  open: boolean;
  goal: Goal;
  user: User;
  reportType: 'progress' | 'completion' | 'update';
  onSubmit: (report: Partial<GoalReport>) => void;
  onCancel: () => void;
  isCompletionRequired?: boolean;
}

const ReportSubmissionModal: React.FC<ReportSubmissionModalProps> = ({
  open,
  goal,
  user,
  reportType,
  onSubmit,
  onCancel,
  isCompletionRequired = false
}) => {
  const [form] = Form.useForm();
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const getReportTitle = () => {
    switch (reportType) {
      case 'completion':
        return 'Goal Completion Report';
      case 'progress':
        return 'Progress Report';
      case 'update':
        return 'Goal Update Report';
      default:
        return 'Goal Report';
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case 'completion':
        return 'This report is required upon goal completion. Please provide details about the achievement and outcomes.';
      case 'progress':
        return 'Submit a progress update for this goal.';
      case 'update':
        return 'Submit an update or additional information for this goal.';
      default:
        return 'Submit a report for this goal.';
    }
  };

  const getNextVersion = () => {
    const existingReports = goal.reports || [];
    const maxVersion = existingReports.reduce((max: number, report: GoalReport) => 
      Math.max(max, report.version || 0), 0
    );
    return maxVersion + 1;
  };

  const handleFileUpload = (info: any) => {
    const { file, fileList } = info;
    
    if (file.status === 'uploading') {
      setUploading(true);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({
          ...prev,
          [file.uid]: progress
        }));
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Create FileItem for uploaded file
          const newFile: FileItem = {
            id: file.uid,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file.originFileObj),
            libraryId: 'reports',
            uploadedBy: user,
            uploadedAt: new Date(),
            path: `/reports/${goal.id}/${file.name}`,
            isFolder: false
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
          message.success(`${file.name} uploaded successfully`);
        }
      }, 100);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const newReport: Partial<GoalReport> = {
        id: String(Date.now()),
        goalId: goal.id,
        title: values.title,
        description: values.description,
        submittedBy: user,
        submittedAt: new Date(),
        version: getNextVersion(),
        attachments: uploadedFiles,
        status: 'submitted',
        isCompletionReport: reportType === 'completion',
        reportType: reportType
      };

      onSubmit(newReport);
      
      // Reset form and state
      form.resetFields();
      setUploadedFiles([]);
      setUploadProgress({});
      
      message.success('Report submitted successfully!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUploadedFiles([]);
    setUploadProgress({});
    onCancel();
  };

  return (
    <Modal
      title={getReportTitle()}
      open={open}
      width={700}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Submit Report"
      cancelText={isCompletionRequired ? undefined : "Cancel"}
      closable={!isCompletionRequired}
      maskClosable={!isCompletionRequired}
      keyboard={!isCompletionRequired}
      okButtonProps={{
        loading: uploading,
        disabled: uploading
      }}
    >
      {isCompletionRequired && (
        <Alert
          message="Report Required"
          description="This report is mandatory for goal completion. You cannot mark the goal as complete without submitting this report."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Typography.Paragraph type="secondary">
        {getReportDescription()}
      </Typography.Paragraph>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          title: reportType === 'completion' 
            ? `Completion Report - ${goal.title}` 
            : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${goal.title}`
        }}
      >
        <Form.Item
          name="title"
          label="Report Title"
          rules={[
            { required: true, message: 'Please enter a report title!' },
            { min: 5, message: 'Title must be at least 5 characters!' }
          ]}
        >
          <Input placeholder="Enter report title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Report Description"
          rules={[
            { required: true, message: 'Please enter report description!' },
            { min: 20, message: 'Description must be at least 20 characters!' }
          ]}
        >
          <TextArea
            rows={6}
            placeholder={
              reportType === 'completion'
                ? "Describe what was accomplished, any challenges faced, outcomes achieved, and lessons learned..."
                : "Provide detailed information about the progress, updates, or changes..."
            }
          />
        </Form.Item>

        <Form.Item label="Attachments">
          <Upload
            multiple
            beforeUpload={() => false} // Prevent automatic upload
            onChange={handleFileUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload Files
            </Button>
          </Upload>
          
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Uploaded Files:</Text>
              <div style={{ marginTop: 8 }}>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <Space>
                      <FileOutlined />
                      <span>{file.name}</span>
                      <Text type="secondary">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Text>
                      {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                        <Progress
                          percent={uploadProgress[file.id]}
                          size="small"
                          style={{ width: '100px' }}
                        />
                      )}
                      {uploadProgress[file.id] === 100 && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                    </Space>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFile(file.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Form.Item>

        <Form.Item>
          <Space>
            <Text type="secondary">Goal:</Text>
            <Text strong>{goal.title}</Text>
          </Space>
          <br />
          <Space>
            <Text type="secondary">Version:</Text>
            <Text strong>v{getNextVersion()}</Text>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportSubmissionModal;
