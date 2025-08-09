'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Dropdown,
  Tree,
  Table,
  List,
  Tooltip,
  Breadcrumb,
  Select,
  Popconfirm,
  Typography,
  Tag,
  Progress,
  Divider,
  Switch,
  Radio,
  Avatar,
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ScissorOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  EyeOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  MenuOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  PartitionOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { FileItem, FolderItem, FileManagerState } from '@/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface EnhancedFileManagerProps {
  libraryId?: string;
  libraryName?: string;
  canWrite?: boolean;
  canDelete?: boolean;
  mode?: 'library' | 'documents' | 'user-files';
  userId?: string;
  rootPath?: string;
  title?: string;
}

interface UploadProgressItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  speed?: string;
  timeRemaining?: string;
}

type ViewMode = 'list' | 'grid' | 'tree';
type SortBy = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

// Mock enhanced file system data with deeper folder structure
const createMockFileSystem = (mode: string): (FileItem | FolderItem)[] => {
  const baseFiles: (FileItem | FolderItem)[] = [
    {
      id: 'folder-1',
      name: 'Documents',
      parentId: undefined,
      path: '/Documents',
      libraryId: 'lib-1',
      createdBy: { id: '1', name: 'System' } as any,
      createdAt: new Date('2024-01-15'),
      children: [
        {
          id: 'folder-2',
          name: 'Reports',
          parentId: 'folder-1',
          path: '/Documents/Reports',
          libraryId: 'lib-1',
          createdBy: { id: '1', name: 'System' } as any,
          createdAt: new Date('2024-02-01'),
          children: [
            {
              id: 'folder-3',
              name: '2024',
              parentId: 'folder-2',
              path: '/Documents/Reports/2024',
              libraryId: 'lib-1',
              createdBy: { id: '1', name: 'System' } as any,
              createdAt: new Date('2024-02-01'),
              children: [
                {
                  id: 'folder-4',
                  name: 'Q1',
                  parentId: 'folder-3',
                  path: '/Documents/Reports/2024/Q1',
                  libraryId: 'lib-1',
                  createdBy: { id: '1', name: 'System' } as any,
                  createdAt: new Date('2024-02-01'),
                  children: [
                    {
                      id: 'file-1',
                      name: 'January Report.pdf',
                      description: 'Monthly financial report for January',
                      size: 2048576,
                      type: 'application/pdf',
                      url: '/files/january-report.pdf',
                      libraryId: 'lib-1',
                      uploadedBy: { id: '2', name: 'Finance Team' } as any,
                      uploadedAt: new Date('2024-02-01'),
                      path: '/Documents/Reports/2024/Q1/January Report.pdf',
                      isFolder: false,
                    },
                    {
                      id: 'file-2',
                      name: 'February Report.pdf',
                      description: 'Monthly financial report for February',
                      size: 1875456,
                      type: 'application/pdf',
                      url: '/files/february-report.pdf',
                      libraryId: 'lib-1',
                      uploadedBy: { id: '2', name: 'Finance Team' } as any,
                      uploadedAt: new Date('2024-03-01'),
                      path: '/Documents/Reports/2024/Q1/February Report.pdf',
                      isFolder: false,
                    },
                  ]
                },
                {
                  id: 'folder-5',
                  name: 'Q2',
                  parentId: 'folder-3',
                  path: '/Documents/Reports/2024/Q2',
                  libraryId: 'lib-1',
                  createdBy: { id: '1', name: 'System' } as any,
                  createdAt: new Date('2024-04-01'),
                  children: [
                    {
                      id: 'file-3',
                      name: 'Q2 Summary.xlsx',
                      description: 'Quarterly summary spreadsheet',
                      size: 512000,
                      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      url: '/files/q2-summary.xlsx',
                      libraryId: 'lib-1',
                      uploadedBy: { id: '3', name: 'Analytics Team' } as any,
                      uploadedAt: new Date('2024-07-01'),
                      path: '/Documents/Reports/2024/Q2/Q2 Summary.xlsx',
                      isFolder: false,
                    },
                  ]
                },
              ]
            },
          ]
        },
        {
          id: 'folder-6',
          name: 'Policies',
          parentId: 'folder-1',
          path: '/Documents/Policies',
          libraryId: 'lib-1',
          createdBy: { id: '1', name: 'HR Team' } as any,
          createdAt: new Date('2024-01-20'),
          children: [
            {
              id: 'file-4',
              name: 'Employee Handbook.pdf',
              description: 'Complete employee handbook',
              size: 3145728,
              type: 'application/pdf',
              url: '/files/employee-handbook.pdf',
              libraryId: 'lib-1',
              uploadedBy: { id: '4', name: 'HR Manager' } as any,
              uploadedAt: new Date('2024-01-20'),
              path: '/Documents/Policies/Employee Handbook.pdf',
              isFolder: false,
            },
            {
              id: 'file-5',
              name: 'Safety Guidelines.docx',
              description: 'Workplace safety guidelines',
              size: 1024000,
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              url: '/files/safety-guidelines.docx',
              libraryId: 'lib-1',
              uploadedBy: { id: '4', name: 'Safety Officer' } as any,
              uploadedAt: new Date('2024-03-15'),
              path: '/Documents/Policies/Safety Guidelines.docx',
              isFolder: false,
            },
          ]
        },
      ]
    },
    {
      id: 'folder-7',
      name: 'Projects',
      parentId: undefined,
      path: '/Projects',
      libraryId: 'lib-1',
      createdBy: { id: '1', name: 'System' } as any,
      createdAt: new Date('2024-03-01'),
      children: [
        {
          id: 'folder-8',
          name: 'Web Development',
          parentId: 'folder-7',
          path: '/Projects/Web Development',
          libraryId: 'lib-1',
          createdBy: { id: '5', name: 'Dev Team' } as any,
          createdAt: new Date('2024-03-01'),
          children: [
            {
              id: 'file-6',
              name: 'Project Specs.pdf',
              description: 'Technical specifications document',
              size: 2560000,
              type: 'application/pdf',
              url: '/files/project-specs.pdf',
              libraryId: 'lib-1',
              uploadedBy: { id: '5', name: 'Lead Developer' } as any,
              uploadedAt: new Date('2024-03-05'),
              path: '/Projects/Web Development/Project Specs.pdf',
              isFolder: false,
            },
          ]
        },
      ]
    },
  ];

  if (mode === 'documents') {
    return [
      ...baseFiles,
      {
        id: 'folder-public',
        name: 'Public Documents',
        parentId: undefined,
        path: '/Public Documents',
        libraryId: 'public',
        createdBy: { id: '1', name: 'System' } as any,
        createdAt: new Date('2024-01-01'),
        children: [
          {
            id: 'file-public-1',
            name: 'Company Guidelines.pdf',
            description: 'Public company guidelines',
            size: 1500000,
            type: 'application/pdf',
            url: '/files/company-guidelines.pdf',
            libraryId: 'public',
            uploadedBy: { id: '1', name: 'Admin' } as any,
            uploadedAt: new Date('2024-01-01'),
            path: '/Public Documents/Company Guidelines.pdf',
            isFolder: false,
          },
        ]
      }
    ];
  }

  return baseFiles;
};

const EnhancedFileManager: React.FC<EnhancedFileManagerProps> = ({
  libraryId = 'lib-1',
  libraryName = 'Default Library',
  canWrite = true,
  canDelete = true,
  mode = 'library',
  userId,
  rootPath = '/',
  title,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPath, setCurrentPath] = useState(rootPath);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState(createMockFileSystem(mode));
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['folder-1', 'folder-2']);
  
  // Modals
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);
  
  // Forms
  const [createFolderForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  
  const { user } = useUser();
  const { t } = useTranslation();

  // Helper functions
  const findItemByPath = (path: string, items: (FileItem | FolderItem)[] = fileSystem): FileItem | FolderItem | null => {
    for (const item of items) {
      if (item.path === path) return item;
      if ('children' in item && item.children) {
        const found = findItemByPath(path, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const getCurrentFolderContents = (): (FileItem | FolderItem)[] => {
    if (currentPath === '/') return fileSystem;
    
    const currentFolder = findItemByPath(currentPath);
    if (currentFolder && 'children' in currentFolder) {
      return currentFolder.children || [];
    }
    return [];
  };

  const getBreadcrumbItems = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const items = [
      {
        title: <HomeOutlined />,
        onClick: () => setCurrentPath('/'),
      },
    ];

    let accumulatedPath = '';
    pathParts.forEach((part, index) => {
      accumulatedPath += `/${part}`;
      items.push({
        title: <span>{part}</span>,
        onClick: () => setCurrentPath(accumulatedPath),
      });
    });

    return items;
  };

  const sortItems = (items: (FileItem | FolderItem)[]): (FileItem | FolderItem)[] => {
    const sorted = [...items].sort((a, b) => {
      // Folders first
      const aIsFolder = 'children' in a;
      const bIsFolder = 'children' in b;
      
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          const aDate = 'uploadedAt' in a ? a.uploadedAt : a.createdAt;
          const bDate = 'uploadedAt' in b ? b.uploadedAt : b.createdAt;
          comparison = new Date(aDate).getTime() - new Date(bDate).getTime();
          break;
        case 'size':
          const aSize = 'size' in a ? a.size : 0;
          const bSize = 'size' in b ? b.size : 0;
          comparison = aSize - bSize;
          break;
        case 'type':
          const aType = 'type' in a ? a.type : 'folder';
          const bType = 'type' in b ? b.type : 'folder';
          comparison = aType.localeCompare(bType);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (item: FileItem | FolderItem) => {
    if ('children' in item) {
      return <FolderOutlined style={{ color: '#1890ff', fontSize: '16px' }} />;
    }

    const fileItem = item as FileItem;
    if (fileItem.type.includes('pdf')) {
      return <FileOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />;
    } else if (fileItem.type.includes('image')) {
      return <FileOutlined style={{ color: '#52c41a', fontSize: '16px' }} />;
    } else if (fileItem.type.includes('spreadsheet') || fileItem.type.includes('excel')) {
      return <FileOutlined style={{ color: '#389e0d', fontSize: '16px' }} />;
    } else if (fileItem.type.includes('document') || fileItem.type.includes('word')) {
      return <FileOutlined style={{ color: '#1890ff', fontSize: '16px' }} />;
    } else {
      return <FileOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />;
    }
  };

  // Tree view data preparation
  const prepareTreeData = (items: (FileItem | FolderItem)[]): any[] => {
    return items.map(item => {
      const node: any = {
        key: item.id,
        title: item.name,
        icon: getFileIcon(item),
        item: item,
      };

      if ('children' in item && item.children) {
        node.children = prepareTreeData(item.children);
      }

      return node;
    });
  };

  // Event handlers
  const handleFolderDoubleClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleCreateFolder = async (values: any) => {
    try {
      // Simulate folder creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success('Folder created successfully');
      setCreateFolderModalVisible(false);
      createFolderForm.resetFields();
    } catch (error) {
      message.error('Failed to create folder');
    }
  };

  const handleFileUpload = async (fileList: any[]) => {
    const uploadItems: UploadProgressItem[] = fileList.map(file => ({
      id: file.uid,
      name: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadProgress(uploadItems);

    // Simulate upload progress
    for (const item of uploadItems) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => 
          prev.map(p => p.id === item.id ? { ...p, progress } : p)
        );
      }
      
      setUploadProgress(prev => 
        prev.map(p => p.id === item.id ? { ...p, status: 'success' } : p)
      );
    }

    setTimeout(() => {
      setUploadProgress([]);
      setUploadModalVisible(false);
      message.success('Files uploaded successfully');
    }, 1000);
  };

  // View mode components
  const renderListView = () => {
    const items = sortItems(getCurrentFolderContents());
    
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: FileItem | FolderItem) => (
          <Space>
            {getFileIcon(record)}
            <span
              style={{ cursor: 'pointer' }}
              onDoubleClick={() => {
                if ('children' in record) {
                  handleFolderDoubleClick(record.path);
                }
              }}
            >
              {text}
            </span>
          </Space>
        ),
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        render: (size: number, record: FileItem | FolderItem) => 
          'size' in record ? formatFileSize(size) : '—',
      },
      {
        title: 'Modified',
        dataIndex: 'uploadedAt',
        key: 'modified',
        render: (date: Date, record: FileItem | FolderItem) => {
          const modDate = 'uploadedAt' in record ? record.uploadedAt : record.createdAt;
          return new Date(modDate).toLocaleDateString();
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (record: FileItem | FolderItem) => (
          <Space>
            <Tooltip title="View">
              <Button type="text" size="small" icon={<EyeOutlined />} />
            </Tooltip>
            <Tooltip title="Download">
              <Button type="text" size="small" icon={<DownloadOutlined />} />
            </Tooltip>
            {canWrite && (
              <Tooltip title="Rename">
                <Button type="text" size="small" icon={<EditOutlined />} />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        pagination={false}
        size="small"
        rowSelection={{
          selectedRowKeys: selectedItems,
          onChange: (selectedRowKeys: React.Key[]) => setSelectedItems(selectedRowKeys.map(key => String(key))),
        }}
      />
    );
  };

  const renderGridView = () => {
    const items = sortItems(getCurrentFolderContents());

    return (
      <Row gutter={[16, 16]}>
        {items.map(item => (
          <Col key={item.id} xs={12} sm={8} md={6} lg={4}>
            <Card
              hoverable
              size="small"
              style={{ textAlign: 'center' }}
              bodyStyle={{ padding: '12px' }}
              onDoubleClick={() => {
                if ('children' in item) {
                  handleFolderDoubleClick(item.path);
                }
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {getFileIcon(item)}
              </div>
              <Text ellipsis title={item.name}>
                {item.name}
              </Text>
              {'size' in item && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatFileSize(item.size)}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderTreeView = () => {
    const treeData = prepareTreeData(fileSystem);

    return (
      <Tree
        showIcon
        expandedKeys={expandedKeys}
        onExpand={(expandedKeys: React.Key[]) => setExpandedKeys(expandedKeys.map(key => String(key)))}
        treeData={treeData}
        onSelect={(selectedKeys, { node }) => {
          if (selectedKeys.length > 0 && node.item && 'children' in node.item) {
            setCurrentPath(node.item.path);
          }
        }}
      />
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'tree':
        return renderTreeView();
      case 'grid':
        return renderGridView();
      default:
        return renderListView();
    }
  };

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {title || `${mode === 'documents' ? 'Documents' : mode === 'user-files' ? 'User Files' : libraryName}`}
            </Title>
          </Col>
          <Col>
            <Space>
              {/* View Mode Selector */}
              <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <Radio.Button value="list">
                  <UnorderedListOutlined /> List
                </Radio.Button>
                <Radio.Button value="grid">
                  <AppstoreOutlined /> Grid
                </Radio.Button>
                <Radio.Button value="tree">
                  <PartitionOutlined /> Tree
                </Radio.Button>
              </Radio.Group>

              {/* Sort Controls */}
              <Select value={sortBy} onChange={setSortBy} style={{ width: 100 }}>
                <Select.Option value="name">Name</Select.Option>
                <Select.Option value="date">Date</Select.Option>
                <Select.Option value="size">Size</Select.Option>
                <Select.Option value="type">Type</Select.Option>
              </Select>

              <Button
                icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              />

              {canWrite && (
                <>
                  <Button
                    type="primary"
                    icon={<FolderAddOutlined />}
                    onClick={() => setCreateFolderModalVisible(true)}
                  >
                    New Folder
                  </Button>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => setUploadModalVisible(true)}
                  >
                    Upload
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Breadcrumb for list and grid views */}
        {viewMode !== 'tree' && (
          <Breadcrumb items={getBreadcrumbItems()} style={{ marginBottom: 16 }} />
        )}

        {/* Main Content */}
        {renderContent()}

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <Card title="Upload Progress" style={{ marginTop: 16 }}>
            {uploadProgress.map(item => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>{item.name}</Text>
                  <Text type="secondary">{item.progress}%</Text>
                </div>
                <Progress
                  percent={item.progress}
                  status={item.status === 'error' ? 'exception' : item.status === 'success' ? 'success' : 'active'}
                  size="small"
                />
              </div>
            ))}
          </Card>
        )}
      </Card>

      {/* Create Folder Modal */}
      <Modal
        title="Create New Folder"
        open={createFolderModalVisible}
        onCancel={() => setCreateFolderModalVisible(false)}
        footer={null}
      >
        <Form form={createFolderForm} onFinish={handleCreateFolder} layout="vertical">
          <Form.Item
            name="name"
            label="Folder Name"
            rules={[{ required: true, message: 'Please enter folder name' }]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Folder
              </Button>
              <Button onClick={() => setCreateFolderModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Upload Files"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Upload.Dragger
          multiple
          beforeUpload={() => false}
          onChange={({ fileList }) => {
            if (fileList.length > 0) {
              handleFileUpload(fileList);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">
            Support for single or bulk upload. Strictly prohibited from uploading company data or other banned files.
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default EnhancedFileManager;
