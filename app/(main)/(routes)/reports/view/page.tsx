"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Table, Tag, Button, Modal, Form, Input, message, Select, Space, Tabs, Spin } from "antd";
import { EyeOutlined, MessageOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";
import { reportService, GeneralReport } from "@/lib/services/reportService";

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ViewReportsPage() {
  const [reports, setReports] = useState<GeneralReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<GeneralReport | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  // Load reports function
  const loadReports = useCallback(async (
    status?: string,
    type?: string,
    page = 1,
    pageSize = 10
  ) => {
    setLoading(true);
    try {
      const result = await reportService.getGeneralReports({
        status: status || undefined,
        type: type || undefined,
        page,
        limit: pageSize,
      });

      if (result.success && result.reports) {
        setReports(result.reports);
        setTotalReports(result.total || 0);
      } else {
        message.error(result.error || t("reports.failedToLoadReports"));
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      message.error(t("reports.failedToLoadReports"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load reports on component mount and when filters change
  useEffect(() => {
    loadReports(filterStatus, filterType, currentPage, pageSize);
  }, [loadReports, filterStatus, filterType, currentPage, pageSize]);

  // Early return if user is not available
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <div className="ml-3">{t("reports.loadingUserData")}</div>
      </div>
    );
  }

  const handleViewReport = (report: GeneralReport) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const handleRespond = (report: GeneralReport) => {
    setSelectedReport(report);
    setIsResponseModalVisible(true);
  };

  const handleSubmitResponse = async (values: { response: string }) => {
    if (!selectedReport) return;
    
    setLoading(true);
    try {
      const result = await reportService.respondToGeneralReport(selectedReport.id, values.response);
      
      if (result.success) {
        message.success(t("reports.reportResponseSubmitted"));
        setIsResponseModalVisible(false);
        form.resetFields();
        // Reload reports to get updated data
        loadReports(filterStatus, filterType, currentPage, pageSize);
      } else {
        message.error(result.error || t("reports.failedToRespond"));
      }
    } catch (error) {
      console.error('Submit response error:', error);
      message.error(t("reports.failedToRespond"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'RESPONDED': return 'green';
      case 'ARCHIVED': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return t("reports.pending");
      case 'RESPONDED': return t("reports.responded");
      case 'ARCHIVED': return t("reports.archived");
      default: return status;
    }
  };

  // Report types with translation keys
  const reportTypeKeys = [
    { key: 'Monthly Progress Report', translationKey: "reports.monthlyProgressReport" },
    { key: 'Issue Report', translationKey: "reports.issueReport" },
    { key: 'Project Update', translationKey: "reports.projectUpdate" },
    { key: 'Expense Report', translationKey: "reports.expenseReport" },
    { key: 'Performance Review', translationKey: "reports.performanceReview" },
    { key: 'Incident Report', translationKey: "reports.incidentReport" },
    { key: 'Other', translationKey: "reports.other" },
  ];

  const getReportTypes = () => reportTypeKeys.map(type => ({
    key: type.key,
    label: t(type.translationKey)
  }));

  const columns = [
    {
      title: t("reports.title"),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t("reports.reportType"),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t("reports.submittedBy"),
      key: 'submittedBy',
      render: (record: GeneralReport) => (
        <div>
          <div>{record.submittedBy?.name}</div>
          <div className="text-xs text-gray-500">
            {record.submittedBy?.department?.name || 'No Department'}
          </div>
        </div>
      ),
    },
    {
      title: t("reports.status"),
      key: 'status',
      render: (record: GeneralReport) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: t("reports.submittedAt"),
      key: 'submittedAt',
      render: (record: GeneralReport) => new Date(record.submittedAt).toLocaleDateString(),
    },
    {
      title: t("reports.actions"),
      key: 'actions',
      render: (record: GeneralReport) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
            size="small"
          >
            {t("reports.viewReport")}
          </Button>
          {record.status === 'PENDING' && (
            hasRole(UserRole.SUPERVISOR) || 
            hasRole(UserRole.ADMIN) || 
            hasRole(UserRole.SUPER_ADMIN)
          ) && (
            <Button
              icon={<MessageOutlined />}
              onClick={() => handleRespond(record)}
              size="small"
              type="primary"
            >
              {t("reports.respond")}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Filter reports for tabs
  const pendingReports = reports.filter(r => r.status === 'PENDING');
  const respondedReports = reports.filter(r => r.status === 'RESPONDED');
  const archivedReports = reports.filter(r => r.status === 'ARCHIVED');

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FilterOutlined />
            {t("reports.viewReports")}
          </h2>
          <p className="text-gray-600 mt-2">
            {t("navigation.viewReports")}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <Space>
            <Select
              placeholder={t("reports.status")}
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="PENDING">{t("reports.pending")}</Select.Option>
              <Select.Option value="RESPONDED">{t("reports.responded")}</Select.Option>
              <Select.Option value="ARCHIVED">{t("reports.archived")}</Select.Option>
            </Select>
            <Select
              placeholder={t("reports.reportType")}
              value={filterType}
              onChange={setFilterType}
              style={{ width: 200 }}
              allowClear
            >
              {getReportTypes().map(type => (
                <Select.Option key={type.key} value={type.key}>{type.label}</Select.Option>
              ))}
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadReports(filterStatus, filterType, currentPage, pageSize)}
              loading={loading}
            >
              {t("common.reload")}
            </Button>
          </Space>
        </div>

        <Tabs>
          <TabPane tab={`${t("reports.allReportsTab")} (${reports.length})`} key="all">
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalReports,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || 10);
                },
              }}
            />
          </TabPane>
          <TabPane tab={`${t("reports.pendingTab")} (${pendingReports.length})`} key="pending">
            <Table
              columns={columns}
              dataSource={pendingReports}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
          <TabPane tab={`${t("reports.respondedTab")} (${respondedReports.length})`} key="responded">
            <Table
              columns={columns}
              dataSource={respondedReports}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
          <TabPane tab={`${t("reports.archivedTab")} (${archivedReports.length})`} key="archived">
            <Table
              columns={columns}
              dataSource={archivedReports}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* View Report Modal */}
      <Modal
        title={t("reports.reportDetails")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedReport && (
          <div>
            <div className="mb-4">
              <strong>{t("reports.title")}:</strong> {selectedReport.title}
            </div>
            <div className="mb-4">
              <strong>{t("reports.reportType")}:</strong> {selectedReport.type}
            </div>
            <div className="mb-4">
              <strong>{t("reports.submittedBy")}:</strong> {selectedReport.submittedBy?.name || 'Unknown User'} ({selectedReport.submittedBy?.department?.name || 'No Department'})
            </div>
            <div className="mb-4">
              <strong>{t("reports.submittedAt")}:</strong> {new Date(selectedReport.submittedAt).toLocaleString()}
            </div>
            <div className="mb-4">
              <strong>{t("reports.status")}:</strong> <Tag color={getStatusColor(selectedReport.status)}>{getStatusText(selectedReport.status)}</Tag>
            </div>
            <div className="mb-4">
              <strong>{t("reports.description")}:</strong>
              <div className="mt-2 p-3 bg-gray-50 rounded">{selectedReport.description}</div>
            </div>
            {selectedReport.response && (
              <div className="mb-4">
                <strong>{t("reports.response")}:</strong>
                <div className="mt-2 p-3 bg-blue-50 rounded">{selectedReport.response}</div>
              </div>
            )}
            {selectedReport.attachments && selectedReport.attachments.length > 0 && (
              <div>
                <strong>{t("reports.attachFiles")}:</strong>
                <div className="mt-2">
                  {selectedReport.attachments.map((attachment) => (
                    <div key={attachment.id} className="p-2 border rounded mb-2">
                      {attachment.file.originalName || attachment.file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        title={t("reports.responseModalTitle")}
        open={isResponseModalVisible}
        onCancel={() => setIsResponseModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmitResponse} layout="vertical">
          <Form.Item
            label={t("reports.writeResponse")}
            name="response"
            rules={[{ required: true, message: t("reports.writeResponse") }]}
          >
            <TextArea rows={6} placeholder={t("reports.writeResponse")} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("reports.submitResponse")}
              </Button>
              <Button onClick={() => setIsResponseModalVisible(false)}>
                {t("common.cancel")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
