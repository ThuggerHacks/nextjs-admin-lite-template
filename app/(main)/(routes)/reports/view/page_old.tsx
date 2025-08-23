"use client";

import { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Modal, Form, Input, message, Select, Space, Tabs } from "antd";
import { EyeOutlined, MessageOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Report, ReportStatus, UserRole } from "@/types";
import { reportService, GeneralReport } from "@/lib/services/reportService";

const { TextArea } = Input;
const { TabPane } = Tabs;

// Mock reports data
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Monthly Sales Report - March 2024',
    description: 'Comprehensive sales analysis for March including targets vs achievements.',
    type: 'Monthly Progress Report',
    status: ReportStatus.PENDING,
    submittedBy: { 
      id: '3', 
      name: 'Pedro Costa', 
      email: 'pedro@empresa.com', 
      role: UserRole.USER, 
      department: 'Vendas',
      status: 'active' as any,
      createdAt: new Date()
    } as any,
    submittedAt: new Date('2024-03-25'),
    attachments: [],
  },
  {
    id: '2',
    title: 'System Performance Issues',
    description: 'Report on recent system slowdowns and proposed solutions.',
    type: 'Issue Report',
    status: ReportStatus.RESPONDED,
    submittedBy: { 
      id: '4', 
      name: 'Ana Silva', 
      email: 'ana@empresa.com', 
      role: UserRole.USER, 
      department: 'TI',
      status: 'active' as any,
      createdAt: new Date()
    } as any,
    submittedAt: new Date('2024-03-20'),
    respondedAt: new Date('2024-03-22'),
    response: 'Issues have been identified and fixes are being implemented.',
    attachments: [],
  },
  {
    id: '3',
    title: 'Q1 Training Progress',
    description: 'Update on employee training programs completed in Q1.',
    type: 'Project Update',
    status: ReportStatus.ARCHIVED,
    submittedBy: { 
      id: '5', 
      name: 'Carlos Oliveira', 
      email: 'carlos@empresa.com', 
      role: UserRole.USER, 
      department: 'Recursos Humanos',
      status: 'active' as any,
      createdAt: new Date()
    } as any,
    submittedAt: new Date('2024-03-15'),
    respondedAt: new Date('2024-03-18'),
    response: 'Training program completed successfully. All objectives met.',
    attachments: [],
  },
];

export default function ViewReportsPage() {
  const [reports, setReports] = useState<GeneralReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<GeneralReport | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  // Load reports on component mount and when filters change
  useEffect(() => {
    loadReports();
  }, [filterStatus, filterType, pagination.current, pagination.pageSize]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const result = await reportService.getGeneralReports({
        status: filterStatus || undefined,
        type: filterType || undefined,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      if (result.success && result.reports) {
        setReports(result.reports);
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
        }));
      } else {
        message.error(result.error || 'Failed to load reports');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Early return if user is not available
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading user data...</div>
      </div>
    );
  }

  // Filter reports based on user role
  const getFilteredReports = () => {
    if (!user) return [];
    
    try {
      if (hasRole(UserRole.SUPER_ADMIN)) {
        return reports; // Super admin sees all reports
      } else if (hasRole(UserRole.ADMIN)) {
        // Admin sees reports from their department and reports submitted to them
        return reports.filter(report => 
          report.submittedBy?.department === user.department?.name ||
          report.submittedTo?.id === user.id
        );
      } else {
        // Users see only their own reports
        return reports.filter(report => report.submittedBy?.id === user.id);
      }
    } catch (error) {
      console.error('Error filtering reports:', error);
      return [];
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const handleRespond = (report: Report) => {
    setSelectedReport(report);
    setIsResponseModalVisible(true);
  };

  const handleSubmitResponse = async (values: { response: string }) => {
    if (!selectedReport) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update report status and response
      const updatedReports = reports.map(report => 
        report.id === selectedReport.id 
          ? { 
              ...report, 
              status: ReportStatus.RESPONDED,
              response: values.response,
              respondedAt: new Date()
            }
          : report
      );
      
      setReports(updatedReports);
      setIsResponseModalVisible(false);
      form.resetFields();
      message.success("Response submitted successfully");
    } catch (error) {
      message.error("Failed to submit response");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'orange';
      case ReportStatus.RESPONDED:
        return 'green';
      case ReportStatus.ARCHIVED:
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: t("reports.title"),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Report) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.type}</div>
        </div>
      ),
    },
    {
      title: t("reports.submittedBy"),
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      render: (submittedBy: any) => (
        <div>
          <div>{submittedBy?.name || 'Unknown User'}</div>
          <div className="text-sm text-gray-500">{submittedBy?.department || 'No Department'}</div>
        </div>
      ),
    },
    {
      title: t("reports.submittedAt"),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: t("reports.status"),
      dataIndex: 'status',
      key: 'status',
      render: (status: ReportStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Report) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewReport(record)}
          >
            {t("common.view")}
          </Button>
          {hasRole(UserRole.ADMIN) && record.status === ReportStatus.PENDING && (
            <Button 
              type="primary"
              icon={<MessageOutlined />} 
              onClick={() => handleRespond(record)}
            >
              {t("reports.respond")}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredReports = getFilteredReports();

  const pendingReports = filteredReports.filter(r => r.status === ReportStatus.PENDING);
  const respondedReports = filteredReports.filter(r => r.status === ReportStatus.RESPONDED);
  const archivedReports = filteredReports.filter(r => r.status === ReportStatus.ARCHIVED);

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FilterOutlined />
            {t("reports.viewReports")}
          </h2>
        </div>

        <Tabs defaultActiveKey="all">
          <TabPane tab={`All Reports (${filteredReports.length})`} key="all">
            <Table 
              columns={columns} 
              dataSource={filteredReports}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          {hasRole(UserRole.ADMIN) && (
            <>
              <TabPane tab={`Pending (${pendingReports.length})`} key="pending">
                <Table 
                  columns={columns} 
                  dataSource={pendingReports}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab={`Responded (${respondedReports.length})`} key="responded">
                <Table 
                  columns={columns} 
                  dataSource={respondedReports}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
            </>
          )}
          
          <TabPane tab={`Archived (${archivedReports.length})`} key="archived">
            <Table 
              columns={columns} 
              dataSource={archivedReports}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Report Details Modal */}
      <Modal
        title={t("reports.reportDetails")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedReport && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{selectedReport.title}</h3>
              <p className="text-gray-600">{selectedReport.type}</p>
            </div>
            
            <div className="mb-4">
              <strong>Description:</strong>
              <p className="mt-2">{selectedReport.description}</p>
            </div>
            
            <div className="mb-4">
              <strong>Submitted by:</strong> {selectedReport.submittedBy?.name || 'Unknown User'} ({selectedReport.submittedBy?.department || 'No Department'})
            </div>
            
            <div className="mb-4">
              <strong>Submitted at:</strong> {selectedReport.submittedAt ? selectedReport.submittedAt.toLocaleString() : 'Unknown Date'}
            </div>
            
            <div className="mb-4">
              <strong>Status:</strong> <Tag color={getStatusColor(selectedReport.status)}>{selectedReport.status}</Tag>
            </div>
            
            {selectedReport.response && (
              <div className="mb-4">
                <strong>Response:</strong>
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  {selectedReport.response}
                </div>
                {selectedReport.respondedAt && (
                  <p className="text-sm text-gray-500 mt-2">
                    Responded at: {selectedReport.respondedAt.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        title={t("reports.respond")}
        open={isResponseModalVisible}
        onCancel={() => setIsResponseModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmitResponse}
          layout="vertical"
        >
          <Form.Item
            label={t("reports.response")}
            name="response"
            rules={[{ required: true, message: "Please enter your response" }]}
          >
            <TextArea
              rows={6}
              placeholder="Enter your response to this report..."
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("common.submit")} {t("reports.response")}
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
