"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Form, Input, Select, Upload, Button, message, Row, Col, Progress, Typography, AutoComplete } from "antd";
import { UploadOutlined, FileTextOutlined, SendOutlined, PlusOutlined } from "@ant-design/icons";

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileProgresses, setFileProgresses] = useState<{ [key: number]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [reportType, setReportType] = useState<string>('');
  
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
    // Validate report type
    if (!reportType.trim()) {
      message.error(t("reports.pleaseEnterReportType"));
      return;
    }

    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setFileProgresses({});
    
    try {
      // Convert file list to actual File objects
      const files = fileList.map(file => file.originFileObj).filter(Boolean);

      // Submit the report using the new service with real upload progress
      const result = await reportService.submitGeneralReport({
        title: values.title,
        description: values.description,
        type: reportType,
        submittedToIds: values.supervisorIds,
        files: files,
        onUploadProgress: (progress: number) => {
          setUploadProgress(progress);
        }
      });

      if (result.success) {
        message.success(t("reports.reportSubmitted"));
        form.resetFields();
        setFileList([]);
        setUploadProgress(0);
        setFileProgresses({});
        setReportType('');
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
                rules={[{ 
                  required: true, 
                  message: t("reports.pleaseEnterReportType") 
                }]}
              >
                <AutoComplete
                  value={reportType}
                  onChange={(value) => setReportType(value)}
                  placeholder={t("reports.enterReportType")}
                  options={getReportTypes().map(type => ({
                    value: type.label,
                    label: type.label
                  }))}
                  filterOption={(inputValue, option) =>
                    option?.label?.toLowerCase().includes(inputValue.toLowerCase()) || false
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t("reports.selectSupervisors")}
                name="supervisorIds"
                rules={[{ required: true, message: t("reports.pleaseSelectSupervisor") }]}
              >
                <Select 
                  mode="multiple"
                  placeholder={t("reports.selectSupervisorsPlaceholder")} 
                  loading={loadingSupervisors}
                  showSearch
                  filterOption={(input, option) => {
                    const children = option?.children;
                    if (typeof children === 'string') {
                      return children?.toLowerCase()?.includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
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
            {isUploading && fileList.length > 0 && (
              <Card title={t("reports.uploadProgress")} style={{ marginTop: 16 }} size="small">
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>
                      {t("reports.uploadingFiles")} ({fileList.length} {fileList.length === 1 ? 'file' : 'files'})
                    </Text>
                    <Text type="secondary">{uploadProgress}%</Text>
                  </div>
                  <Progress
                    percent={uploadProgress}
                    status={uploadProgress === 100 ? 'success' : 'active'}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  {uploadProgress === 100 && (
                    <Text type="success" style={{ marginTop: 8, display: 'block' }}>
                      {t("reports.uploadComplete")}
                    </Text>
                  )}
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
