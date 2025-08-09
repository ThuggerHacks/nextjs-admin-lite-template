"use client";

import { useState } from "react";
import { Card, Form, Input, Select, Upload, Button, message, Row, Col, Progress, Typography } from "antd";
import { UploadOutlined, FileTextOutlined, SendOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Mock supervisors data
const mockSupervisors = [
  { id: '1', name: 'João Silva', role: UserRole.SUPER_ADMIN, department: 'Administração Geral' },
  { id: '2', name: 'Maria Santos', role: UserRole.ADMIN, department: 'Recursos Humanos' },
];

const reportTypes = [
  'Monthly Progress Report',
  'Issue Report',
  'Project Update',
  'Expense Report',
  'Performance Review',
  'Incident Report',
  'Other',
];

export default function SubmitReportPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useUser();
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setIsUploading(true);
    
    try {
      // Simulate file upload progress if files are attached
      if (fileList.length > 0) {
        const progressInit = fileList.reduce((acc, file, index) => {
          acc[`file-${index}`] = 0;
          return acc;
        }, {} as { [key: string]: number });
        setUploadProgress(progressInit);

        // Simulate upload progress for each file
        const uploadPromises = fileList.map(async (file, index) => {
          const fileKey = `file-${index}`;
          
          for (let progress = 0; progress <= 100; progress += Math.random() * 10 + 5) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            
            setUploadProgress(prev => ({
              ...prev,
              [fileKey]: Math.min(progress, 100)
            }));
            
            if (progress >= 100) break;
          }
        });
        
        await Promise.all(uploadPromises);
      }
      
      // Simulate report submission API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success(t("reports.reportSubmitted"));
      form.resetFields();
      setFileList([]);
      setUploadProgress({});
    } catch (error) {
      message.error("Failed to submit report");
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    onChange: ({ fileList: newFileList }: any) => {
      setFileList(newFileList);
    },
    fileList,
  };

  // Filter supervisors based on user role and department
  const getAvailableSupervisors = () => {
    if (!user) return mockSupervisors;
    
    if (user.role === UserRole.USER) {
      // Users submit to their department admin or super admin
      return mockSupervisors.filter(s => 
        s.role === UserRole.ADMIN && s.department === user.department ||
        s.role === UserRole.SUPER_ADMIN
      );
    } else if (user.role === UserRole.ADMIN) {
      // Admins submit to super admin
      return mockSupervisors.filter(s => s.role === UserRole.SUPER_ADMIN);
    }
    
    return [];
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileTextOutlined />
            {t("reports.submitReport")}
          </h2>
          <p className="text-gray-600 mt-2">
            Submit your report to your supervisor for review and feedback.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("reports.reportType")}
                name="type"
                rules={[{ required: true, message: "Please select a report type" }]}
              >
                <Select placeholder="Select report type">
                  {reportTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t("reports.selectSupervisor")}
                name="supervisorId"
                rules={[{ required: true, message: "Please select a supervisor" }]}
              >
                <Select placeholder="Select supervisor">
                  {getAvailableSupervisors().map(supervisor => (
                    <Option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} - {supervisor.department}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("reports.title")}
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter report title" />
          </Form.Item>

          <Form.Item
            label={t("reports.description")}
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea
              rows={6}
              placeholder="Describe your report in detail..."
            />
          </Form.Item>

          <Form.Item
            label={t("reports.attachFiles")}
            name="attachments"
          >
            <Upload
              {...uploadProps}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            >
              <Button icon={<UploadOutlined />}>
                Click to Upload Files
              </Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-2">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB each)
            </p>

            {/* Upload Progress */}
            {isUploading && Object.keys(uploadProgress).length > 0 && (
              <Card title="Upload Progress" style={{ marginTop: 16 }} size="small">
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Object.entries(uploadProgress).map(([fileKey, progress], index) => {
                    const file = fileList[parseInt(fileKey.split('-')[1])];
                    return (
                      <div key={fileKey} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text ellipsis style={{ maxWidth: '70%' }}>
                            {file?.name || `File ${index + 1}`}
                          </Text>
                          <Text type="secondary">{Math.round(progress)}%</Text>
                        </div>
                        <Progress
                          percent={Math.round(progress)}
                          size="small"
                          status={progress === 100 ? 'success' : 'active'}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
            >
              {t("common.submit")} {t("reports.submitReport")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
