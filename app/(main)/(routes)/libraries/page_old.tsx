"use client";

import { useState } from "react";
import { 
  Card, 
  Button, 
  List, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload, 
  Table, 
  Space, 
  Tag, 
  message,
  Tabs,
  Row,
  Col,
  Statistic,
  Checkbox,
  Divider,
  Typography
} from "antd";
import {
  FolderOutlined,
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  CloudUploadOutlined,
  FolderAddOutlined,
  UserOutlined,
  TeamOutlined
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Library, FileItem, LibraryPermission, UserRole, LibraryMemberSelection } from "@/types";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Paragraph } = Typography;

// Mock data
const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', department: 'Administração Geral' },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', department: 'Recursos Humanos' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', department: 'Vendas' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@empresa.com', department: 'Marketing' },
  { id: '5', name: 'Carlos Silva', email: 'carlos@empresa.com', department: 'TI' },
  { id: '6', name: 'Lucia Ferreira', email: 'lucia@empresa.com', department: 'Financeiro' },
];

const mockDepartments = [
  'Administração Geral',
  'Recursos Humanos', 
  'Vendas',
  'Marketing',
  'TI',
  'Financeiro',
  'Operações',
  'Jurídico'
];

const mockLibraries: Library[] = [
  {
    id: '1',
    name: 'Personal Documents',
    description: 'Personal files and documents',
    createdBy: { id: '3', name: 'Pedro Costa' } as any,
    createdAt: new Date('2024-01-15'),
    permissions: [],
    fileCount: 12,
  },
  {
    id: '2',
    name: 'HR Documents',
    description: 'Human Resources documentation',
    createdBy: { id: '2', name: 'Maria Santos' } as any,
    createdAt: new Date('2024-02-01'),
    permissions: [],
    fileCount: 25,
  },
  {
    id: '3',
    name: 'General Communications',
    description: 'Company-wide communications and announcements',
    createdBy: { id: '1', name: 'João Silva' } as any,
    createdAt: new Date('2024-01-01'),
    permissions: [],
    fileCount: 8,
  },
];

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Monthly Report March 2024.pdf',
    description: 'Sales performance report for March',
    size: 2048576, // 2MB
    type: 'application/pdf',
    url: '/files/monthly-report-march.pdf',
    libraryId: '1',
    uploadedBy: { id: '3', name: 'Pedro Costa' } as any,
    uploadedAt: new Date('2024-03-20'),
  },
  {
    id: '2',
    name: 'Employee Handbook.docx',
    description: 'Updated employee handbook 2024',
    size: 1024000, // 1MB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/files/employee-handbook.docx',
    libraryId: '2',
    uploadedBy: { id: '2', name: 'Maria Santos' } as any,
    uploadedAt: new Date('2024-02-15'),
  },
  {
    id: '3',
    name: 'Company Policy Update.pdf',
    description: 'Latest company policy changes',
    size: 512000, // 512KB
    type: 'application/pdf',
    url: '/files/policy-update.pdf',
    libraryId: '3',
    uploadedBy: { id: '1', name: 'João Silva' } as any,
    uploadedAt: new Date('2024-03-10'),
  },
];

export default function LibrariesPage() {
  const [libraries, setLibraries] = useState<Library[]>(mockLibraries);
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [isLibraryModalVisible, setIsLibraryModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [libraryForm] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Member selection state
  const [memberSelection, setMemberSelection] = useState<LibraryMemberSelection>({
    includeCreator: true,
    selectedUsers: [],
    selectedDepartments: [],
  });
  
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMemberCount = (library: Library): string => {
    const userCount = library.permissions.filter(p => p.type === 'user').length;
    const deptCount = library.permissions.filter(p => p.type === 'department').length;
    
    if (userCount === 0 && deptCount === 0) {
      return t('files.noMembers');
    }
    
    const parts: string[] = [];
    if (userCount > 0) {
      parts.push(`${userCount} ${userCount === 1 ? 'user' : 'users'}`);
    }
    if (deptCount > 0) {
      parts.push(`${deptCount} ${deptCount === 1 ? 'department' : 'departments'}`);
    }
    
    return parts.join(', ');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📁';
  };

  const handleCreateLibrary = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Build permissions array based on member selection
      const permissions: LibraryPermission[] = [];
      
      // Add creator permission if included
      if (memberSelection.includeCreator && user) {
        permissions.push({
          id: `${Date.now()}-creator`,
          targetId: user.id,
          type: 'user',
          canRead: true,
          canWrite: true,
          canDelete: true,
        });
      }
      
      // Add selected users permissions
      memberSelection.selectedUsers.forEach((userId, index) => {
        const selectedUser = mockUsers.find(u => u.id === userId);
        if (selectedUser) {
          permissions.push({
            id: `${Date.now()}-user-${index}`,
            targetId: selectedUser.id,
            type: 'user',
            canRead: true,
            canWrite: false,
            canDelete: false,
          });
        }
      });
      
      // Add selected departments permissions
      memberSelection.selectedDepartments.forEach((deptName, index) => {
        permissions.push({
          id: `${Date.now()}-dept-${index}`,
          targetId: deptName,
          type: 'department',
          canRead: true,
          canWrite: false,
          canDelete: false,
        });
      });
      
      const newLibrary: Library = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        createdBy: user!,
        createdAt: new Date(),
        permissions,
        fileCount: 0,
      };
      
      setLibraries(prev => [...prev, newLibrary]);
      setIsLibraryModalVisible(false);
      libraryForm.resetFields();
      
      // Reset member selection
      setMemberSelection({
        includeCreator: true,
        selectedUsers: [],
        selectedDepartments: [],
      });
      
      message.success(t('common.success') + '!');
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async (values: any) => {
    if (fileList.length === 0) {
      message.warning('Please select files to upload');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFiles = fileList.map((file, index) => ({
        id: (Date.now() + index).toString(),
        name: file.name,
        description: values.description || '',
        size: file.size,
        type: file.type,
        url: `/files/${file.name}`,
        libraryId: values.libraryId,
        uploadedBy: user!,
        uploadedAt: new Date(),
      }));

      setFiles(prev => [...prev, ...newFiles]);
      
      // Update library file count
      setLibraries(prev => prev.map(lib => 
        lib.id === values.libraryId 
          ? { ...lib, fileCount: lib.fileCount + newFiles.length }
          : lib
      ));

      setIsUploadModalVisible(false);
      uploadForm.resetFields();
      setFileList([]);
      message.success(`${newFiles.length} file(s) uploaded successfully!`);
    } catch (error) {
      message.error('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (file: FileItem) => {
    // In a real app, this would trigger actual file download
    message.success(`Downloading ${file.name}...`);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    message.success('File deleted successfully');
  };

  const getLibraryFiles = (libraryId: string) => {
    return files.filter(file => file.libraryId === libraryId);
  };

  const canAccessLibrary = (library: Library) => {
    // Super admin can access all libraries
    if (hasRole(UserRole.SUPER_ADMIN)) return true;
    
    // Library creator can access their own library
    if (library.createdBy.id === user?.id) return true;
    
    // Check specific permissions (would be implemented based on library.permissions)
    return true; // For demo, allow access to all
  };

  const canEditLibrary = (library: Library) => {
    if (hasRole(UserRole.SUPER_ADMIN)) return true;
    if (library.createdBy.id === user?.id) return true;
    return false;
  };

  const fileColumns = [
    {
      title: 'File',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{getFileIcon(record.type)}</span>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      render: (user: any) => user.name,
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FileItem) => (
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownloadFile(record)}
            size="small"
          >
            Download
          </Button>
          {(hasRole(UserRole.ADMIN) || record.uploadedBy.id === user?.id) && (
            <Button 
              danger
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteFile(record.id)}
              size="small"
            />
          )}
        </Space>
      ),
    },
  ];

  const selectedLibraryData = selectedLibrary ? libraries.find(l => l.id === selectedLibrary) : null;
  const selectedLibraryFiles = selectedLibrary ? getLibraryFiles(selectedLibrary) : [];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FolderOutlined />
                {t("files.libraries")}
              </h2>
              <p className="text-gray-600 mt-2">
                Manage your document libraries and files
              </p>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => setIsUploadModalVisible(true)}
                disabled={libraries.length === 0}
              >
                {t("files.uploadFiles")}
              </Button>
              {hasRole(UserRole.ADMIN) && (
                <Button
                  type="primary"
                  icon={<FolderAddOutlined />}
                  onClick={() => setIsLibraryModalVisible(true)}
                >
                  {t("files.createLibrary")}
                </Button>
              )}
            </Space>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {/* Libraries List */}
          <Col xs={24} lg={8}>
            <Card title="Libraries" size="small">
              <List
                dataSource={libraries.filter(canAccessLibrary)}
                renderItem={(library) => (
                  <List.Item
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedLibrary === library.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedLibrary(library.id)}
                  >
                    <List.Item.Meta
                      avatar={<FolderOutlined className="text-xl text-blue-500" />}
                      title={library.name}
                      description={
                        <div>
                          <div className="text-gray-600">{library.description}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {library.fileCount} files • Created by {library.createdBy.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            👥 {getMemberCount(library)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Files Content */}
          <Col xs={24} lg={16}>
            {selectedLibraryData ? (
              <Card 
                title={
                  <div className="flex justify-between items-center">
                    <span>{selectedLibraryData.name}</span>
                    <Space>
                      <Tag color="blue">{selectedLibraryFiles.length} files</Tag>
                      {canEditLibrary(selectedLibraryData) && (
                        <Button icon={<SettingOutlined />} size="small">
                          Manage
                        </Button>
                      )}
                    </Space>
                  </div>
                }
                size="small"
              >
                <div className="mb-4">
                  <p className="text-gray-600">{selectedLibraryData.description}</p>
                </div>

                <Table
                  columns={fileColumns}
                  dataSource={selectedLibraryFiles}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            ) : (
              <Card size="small">
                <div className="text-center py-12">
                  <FolderOutlined className="text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a library to view its files</p>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      {/* Create Library Modal */}
      <Modal
        title={t("files.createLibrary")}
        open={isLibraryModalVisible}
        onCancel={() => setIsLibraryModalVisible(false)}
        footer={null}
      >
        <Form
          form={libraryForm}
          onFinish={handleCreateLibrary}
          layout="vertical"
        >
          <Form.Item
            label={t("files.libraryName")}
            name="name"
            rules={[{ required: true, message: 'Please enter library name' }]}
          >
            <Input placeholder="Enter library name" />
          </Form.Item>

          <Form.Item
            label={t("files.libraryDescription")}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Enter library description (optional)"
            />
          </Form.Item>

          <Divider />
          
          <Typography.Title level={5}>{t("files.libraryMembers")}</Typography.Title>
          
          <Form.Item>
            <Checkbox
              checked={memberSelection.includeCreator}
              onChange={(e) => 
                setMemberSelection(prev => ({ 
                  ...prev, 
                  includeCreator: e.target.checked 
                }))
              }
            >
              {t("files.includeMyself")}
            </Checkbox>
          </Form.Item>

          <Form.Item label={t("files.selectUsers")}>
            <Select
              mode="multiple"
              placeholder={t("files.selectUsers")}
              value={memberSelection.selectedUsers}
              onChange={(value) => 
                setMemberSelection(prev => ({ 
                  ...prev, 
                  selectedUsers: value 
                }))
              }
              style={{ width: '100%' }}
            >
              {mockUsers.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t("files.selectDepartments")}>
            <Select
              mode="multiple"
              placeholder={t("files.selectDepartments")}
              value={memberSelection.selectedDepartments}
              onChange={(value) => 
                setMemberSelection(prev => ({ 
                  ...prev, 
                  selectedDepartments: value 
                }))
              }
              style={{ width: '100%' }}
            >
              {mockDepartments.map(dept => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("common.create")}
              </Button>
              <Button onClick={() => setIsLibraryModalVisible(false)}>
                {t("common.cancel")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Files Modal */}
      <Modal
        title={t("files.uploadFiles")}
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={uploadForm}
          onFinish={handleUploadFiles}
          layout="vertical"
        >
          <Form.Item
            label={t("files.selectLibrary")}
            name="libraryId"
            rules={[{ required: true, message: 'Please select a library' }]}
          >
            <Select placeholder="Select library">
              {libraries.filter(canAccessLibrary).map(library => (
                <Option key={library.id} value={library.id}>
                  {library.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Files"
            name="files"
          >
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-2">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB each)
            </p>
          </Form.Item>

          <Form.Item
            label={t("files.fileDescription")}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Enter description for uploaded files (optional)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("common.upload")}
              </Button>
              <Button onClick={() => setIsUploadModalVisible(false)}>
                {t("common.cancel")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
