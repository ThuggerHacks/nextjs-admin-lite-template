"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Form, Input, Select, Upload, Button, message, Row, Col, Progress, Typography } from "antd";
import { UploadOutlined, FileTextOutlined, SendOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";
import { reportService, Supervisor } from "@/lib/services/reportService";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Static report types - translations will be applied when rendering
const REPORT_TYPE_KEYS = [
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
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  
  const { user } = useUser();
  const { t } = useTranslation();

  // Get report types with translations
  const getReportTypes = () => [
    { key: 'Monthly Progress Report', label: t("reports.monthlyProgressReport") },
    { key: 'Issue Report', label: t("reports.issueReport") },
    { key: 'Project Update', label: t("reports.projectUpdate") },
    { key: 'Expense Report', label: t("reports.expenseReport") },
    { key: 'Performance Review', label: t("reports.performanceReview") },
    { key: 'Incident Report', label: t("reports.incidentReport") },
    { key: 'Other', label: t("reports.other") },
  ];

  const loadSupervisors = useCallback(async () => {
    setLoadingSupervisors(true);
    try {
      const result = await reportService.getSupervisors();
      if (result.success && result.supervisors) {
        setSupervisors(result.supervisors);
        console.log('Loaded supervisors:', result.supervisors);
      } else {
        console.error('Failed to load supervisors:', result.error);
        message.error(result.error || t("reports.failedToLoadSupervisors"));
        setSupervisors([]); // Clear supervisors array
      }
    } catch (error) {
      console.error('Error loading supervisors:', error);
      message.error(t("reports.failedToLoadSupervisors"));
      setSupervisors([]); // Clear supervisors array
    } finally {
      setLoadingSupervisors(false);
    }
  }, [t]);

  // Load supervisors on component mount
  useEffect(() => {
    loadSupervisors();
  }, [loadSupervisors]);

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
      
      // Convert file list to actual File objects
      const files = fileList.map(file => file.originFileObj).filter(Boolean);

      // Submit the report using the new service
      const result = await reportService.submitGeneralReport({
        title: values.title,
        description: values.description,
        type: values.type,
        submittedToId: values.supervisorId,
        files: files
      });

      if (result.success) {
        message.success(t("reports.reportSubmitted"));
        form.resetFields();
        setFileList([]);
        setUploadProgress({});
      } else {
        message.error(result.error || t("reports.failedToSubmitReport"));
      }
    } catch (error) {
      message.error(t("reports.failedToSubmitReport"));
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
    if (!user) return supervisors;
    
    // The backend already filters supervisors based on user role,
    // so we can return all supervisors from the API
    return supervisors;
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
            {t("reports.submitReportDescription")}
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
                rules={[{ required: true, message: t("reports.pleaseSelectReportType") }]}
              >
                <Select placeholder={t("reports.selectReportType")}>
                  {getReportTypes().map(type => (
                    <Option key={type.key} value={type.key}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t("reports.selectSupervisor")}
                name="supervisorId"
                rules={[{ required: true, message: t("reports.pleaseSelectSupervisor") }]}
              >
                <Select placeholder={t("reports.selectSupervisorPlaceholder")} loading={loadingSupervisors}>
                  {getAvailableSupervisors().map(supervisor => (
                    <Option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} - {supervisor.department?.name || supervisor.role}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("reports.title")}
            name="title"
            rules={[{ required: true, message: t("reports.pleaseEnterTitle") }]}
          >
            <Input placeholder={t("reports.reportTitlePlaceholder")} />
          </Form.Item>

          <Form.Item
            label={t("reports.description")}
            name="description"
            rules={[{ required: true, message: t("reports.pleaseEnterDescription") }]}
          >
            <TextArea
              rows={6}
              placeholder={t("reports.describeReportDetail")}
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
                {t("reports.clickToUploadFiles")}
              </Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-2">
              {t("reports.supportedFormats")}
            </p>

            {/* Upload Progress */}
            {isUploading && Object.keys(uploadProgress).length > 0 && (
              <Card title={t("reports.uploadProgress")} style={{ marginTop: 16 }} size="small">
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
