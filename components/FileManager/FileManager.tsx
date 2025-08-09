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
  Tooltip,
  Breadcrumb,
  Select,
  Popconfirm,
  Typography,
  Tag,
  Progress,
  Divider,
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
  SortAscendingOutlined,
  SortDescendingOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { FileItem, FolderItem } from '@/types';

const { TextArea } = Input;
const { Title } = Typography;

interface FileManagerProps {
  libraryId: string;
  libraryName: string;
  canWrite: boolean;
  canDelete: boolean;
}

interface UploadProgressItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  speed?: string;
  timeRemaining?: string;
}

// Mock file system data
const mockFileSystem: (FileItem | FolderItem)[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    parentId: undefined,
    path: '/Documents',
    libraryId: 'lib-1',
    createdBy: { id: '1', name: 'System' } as any,
    createdAt: new Date(),
    children: [
      {
        id: 'folder-2',
        name: 'Reports',
        parentId: 'folder-1',
        path: '/Documents/Reports',
        libraryId: 'lib-1',
        createdBy: { id: '1', name: 'System' } as any,
        createdAt: new Date(),
        children: [
          {
            id: 'file-1',
            name: 'Monthly Report.pdf',
            description: 'Monthly financial report',
            size: 2048576,
            type: 'application/pdf',
            url: '/files/monthly-report.pdf',
            libraryId: 'lib-1',
            uploadedBy: { id: '2', name: 'Finance Team' } as any,
            uploadedAt: new Date('2024-03-01'),
            parentFolderId: 'folder-2',
            path: '/Documents/Reports/Monthly Report.pdf',
            isFolder: false,
          },
        ] as FileItem[],
      },
      {
        id: 'file-2',
        name: 'Company Policy.docx',
        description: 'Updated company policies',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '/files/policy.docx',
        libraryId: 'lib-1',
        uploadedBy: { id: '1', name: 'HR Department' } as any,
        uploadedAt: new Date('2024-02-15'),
        parentFolderId: 'folder-1',
        path: '/Documents/Company Policy.docx',
        isFolder: false,
      },
    ] as (FileItem | FolderItem)[],
  },
  {
    id: 'folder-3',
    name: 'Images',
    parentId: undefined,
    path: '/Images',
    libraryId: 'lib-1',
    createdBy: { id: '1', name: 'System' } as any,
    createdAt: new Date(),
    children: [] as (FileItem | FolderItem)[],
  },
];

export default function FileManager({ libraryId, libraryName, canWrite, canDelete }: FileManagerProps) {
  const [fileSystem, setFileSystem] = useState<(FileItem | FolderItem)[]>(mockFileSystem);
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');
  const [loading, setLoading] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [folderForm] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ items: string[]; operation: 'copy' | 'cut' | null }>({
    items: [],
    operation: null,
  });
  const [renamingItem, setRenamingItem] = useState<FileItem | FolderItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Upload progress tracking
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useUser();
  const { t } = useTranslation();

  // Utility function to check if an item is a folder
  const isFolder = (item: FileItem | FolderItem): item is FolderItem => {
    return 'children' in item;
  };

  // Utility function to check if an item is a file
  const isFile = (item: FileItem | FolderItem): item is FileItem => {
    return 'isFolder' in item && item.isFolder === false;
  };

  // Simulate file upload with progress
  const simulateFileUpload = (file: any): Promise<void> => {
    return new Promise((resolve) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      const progressItem: UploadProgressItem = {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading',
        speed: '0 MB/s',
        timeRemaining: 'Calculating...',
      };

      setUploadProgress(prev => [...prev, progressItem]);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const updated = prev.map(item => {
            if (item.id === uploadId) {
              const newProgress = Math.min(item.progress + Math.random() * 15 + 5, 100);
              const speed = (Math.random() * 5 + 1).toFixed(1);
              const remaining = newProgress >= 100 ? 'Complete' : `${Math.round((100 - newProgress) / 10)}s`;
              
              if (newProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setUploadProgress(prev => prev.filter(p => p.id !== uploadId));
                }, 2000);
                resolve();
                return {
                  ...item,
                  progress: 100,
                  status: 'success' as const,
                  speed: `${speed} MB/s`,
                  timeRemaining: 'Complete',
                };
              }
              
              return {
                ...item,
                progress: newProgress,
                speed: `${speed} MB/s`,
                timeRemaining: remaining,
              };
            }
            return item;
          });
          return updated;
        });
      }, 200 + Math.random() * 300);
    });
  };

  const handleCreateFolder = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name: values.name,
        parentId: getCurrentFolderId(),
        path: currentPath === '/' ? `/${values.name}` : `${currentPath}/${values.name}`,
        libraryId,
        createdBy: user!,
        createdAt: new Date(),
        children: [],
      };
      
      updateFileSystem(newFolder, 'create');
      setIsFolderModalVisible(false);
      folderForm.resetFields();
      message.success('Folder created successfully!');
    } catch (error) {
      message.error('Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setIsUploadModalVisible(false);
    
    try {
      // Start upload for all files
      const uploadPromises = fileList.map(file => simulateFileUpload(file));
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // Create file entries in the system
      const newFiles = fileList.map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        description: values.description,
        size: file.size,
        type: file.type,
        url: `/files/${file.name}`,
        libraryId,
        uploadedBy: user!,
        uploadedAt: new Date(),
        parentFolderId: getCurrentFolderId(),
        path: currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`,
        isFolder: false,
      }));
      
      newFiles.forEach(file => updateFileSystem(file, 'create'));
      
      uploadForm.resetFields();
      setFileList([]);
      message.success(`${fileList.length} file(s) uploaded successfully!`);
    } catch (error) {
      message.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const getCurrentFolderId = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    let currentFolder: any = { children: fileSystem };
    
    for (const part of pathParts) {
      const found = currentFolder.children?.find((item: any) => item.name === part);
      if (found && 'children' in found) {
        currentFolder = found;
      }
    }
    
    return currentFolder.id;
  };

  const updateFileSystem = (item: FileItem | FolderItem, operation: 'create' | 'update' | 'delete') => {
    // Implementation for updating file system
    setFileSystem(prev => [...prev]);
  };

  const getCurrentFolderContents = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    let currentFolder: any = { children: fileSystem };
    
    for (const part of pathParts) {
      const found = currentFolder.children?.find((item: any) => item.name === part);
      if (found && 'children' in found) {
        currentFolder = found;
      }
    }
    
    return currentFolder.children || [];
  };

  const handleCopy = () => {
    setClipboard({ items: selectedItems, operation: 'copy' });
    message.success(`${selectedItems.length} item(s) copied`);
  };

  const handleCut = () => {
    setClipboard({ items: selectedItems, operation: 'cut' });
    message.success(`${selectedItems.length} item(s) cut`);
  };

  const handlePaste = () => {
    if (clipboard.items.length === 0) return;
    message.success(`${clipboard.items.length} item(s) pasted`);
    setClipboard({ items: [], operation: null });
  };

  const handleDelete = () => {
    selectedItems.forEach(id => updateFileSystem({ id } as any, 'delete'));
    setSelectedItems([]);
    message.success(`${selectedItems.length} item(s) deleted`);
  };

  const handleRename = (item: FileItem | FolderItem) => {
    setRenamingItem(item);
    renameForm.setFieldsValue({ name: item.name });
    setIsRenameModalVisible(true);
  };

  const handleRenameSubmit = async (values: any) => {
    if (!renamingItem) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedItem = { ...renamingItem, name: values.name };
      updateFileSystem(updatedItem, 'update');
      
      setIsRenameModalVisible(false);
      setRenamingItem(null);
      renameForm.resetFields();
      message.success('Item renamed successfully!');
    } catch (error) {
      message.error('Failed to rename item');
    } finally {
      setLoading(false);
    }
  };

  const currentContents = getCurrentFolderContents();

  const uploadProps = {
    fileList,
    onChange: ({ fileList }: any) => setFileList(fileList),
    beforeUpload: () => false,
    multiple: true,
    showUploadList: false, // We'll create our own upload list with progress
  };

  const actionMenuItems = [
    {
      key: 'copy',
      label: 'Copy',
      icon: <CopyOutlined />,
      disabled: selectedItems.length === 0,
      onClick: handleCopy,
    },
    {
      key: 'cut',
      label: 'Cut',
      icon: <ScissorOutlined />,
      disabled: selectedItems.length === 0 || !canWrite,
      onClick: handleCut,
    },
    {
      key: 'paste',
      label: 'Paste',
      icon: <FileAddOutlined />,
      disabled: clipboard.items.length === 0 || !canWrite,
      onClick: handlePaste,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      disabled: selectedItems.length === 0 || !canDelete,
      onClick: handleDelete,
      danger: true,
    },
  ];

  const breadcrumbItems = currentPath.split('/').filter(Boolean).map((part, index, array) => ({
    title: part,
    onClick: () => {
      const newPath = '/' + array.slice(0, index + 1).join('/');
      setCurrentPath(newPath);
    },
  }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FileItem | FolderItem) => (
        <Space>
          {isFolder(record) ? <FolderOutlined /> : <FileOutlined />}
          <span 
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              if (isFolder(record)) {
                setCurrentPath(record.path);
              }
            }}
          >
            {name}
          </span>
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number, record: FileItem | FolderItem) => 
        isFolder(record) ? '-' : `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: 'Modified',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: Date, record: FileItem | FolderItem) => 
        isFolder(record) ? '-' : date?.toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: FileItem | FolderItem) => (
        <Space>
          <Tooltip title="Rename">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleRename(record)}
              disabled={!canWrite}
            />
          </Tooltip>
          {isFile(record) && (
            <Tooltip title="Download">
              <Button icon={<DownloadOutlined />} size="small" />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete()}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger 
                disabled={!canDelete}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Title level={4} className="mb-2">
              📁 {libraryName}
            </Title>
            <Breadcrumb>
              <Breadcrumb.Item
                onClick={() => setCurrentPath('/')}
                className="cursor-pointer"
              >
                Root
              </Breadcrumb.Item>
              {breadcrumbItems.map((item, index) => (
                <Breadcrumb.Item
                  key={index}
                  onClick={item.onClick}
                  className="cursor-pointer"
                >
                  {item.title}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
          
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
            >
              <Select.Option value="list">
                <UnorderedListOutlined /> List
              </Select.Option>
              <Select.Option value="grid">
                <AppstoreOutlined /> Grid
              </Select.Option>
              <Select.Option value="tree">
                <FolderOutlined /> Tree
              </Select.Option>
            </Select>
            
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MenuOutlined />}>
                Actions
              </Button>
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* Upload Progress Indicator */}
      {uploadProgress.length > 0 && (
        <Card title="Upload Progress" size="small">
          <div className="space-y-3">
            {uploadProgress.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {item.status === 'success' ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <FileOutlined className="text-blue-500" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.speed} • {item.timeRemaining}
                  </div>
                </div>
                <Progress
                  percent={Math.round(item.progress)}
                  status={item.status === 'error' ? 'exception' : item.status === 'success' ? 'success' : 'active'}
                  strokeColor={
                    item.status === 'success' 
                      ? '#52c41a' 
                      : item.status === 'error' 
                      ? '#ff4d4f' 
                      : '#1890ff'
                  }
                  showInfo={true}
                  format={(percent) => `${percent}%`}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            {canWrite && (
              <>
                <Button
                  type="primary"
                  icon={<FolderAddOutlined />}
                  onClick={() => setIsFolderModalVisible(true)}
                >
                  New Folder
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setIsUploadModalVisible(true)}
                  loading={isUploading}
                >
                  Upload Files
                </Button>
              </>
            )}
          </Space>
          
          <Space>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 100 }}
            >
              <Select.Option value="name">Name</Select.Option>
              <Select.Option value="size">Size</Select.Option>
              <Select.Option value="date">Date</Select.Option>
            </Select>
            <Button
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={currentContents}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedItems,
            onChange: (selectedRowKeys) => setSelectedItems(selectedRowKeys.map(key => String(key))),
          }}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload Files"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
      >
        <Form
          form={uploadForm}
          onFinish={handleUploadFiles}
          layout="vertical"
        >
          <Form.Item
            label="Select Files"
            required
          >
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to this area to upload</p>
              <p className="ant-upload-hint">
                Support for single or bulk upload. Select multiple files to upload them all at once.
              </p>
            </Upload.Dragger>
          </Form.Item>

          {fileList.length > 0 && (
            <Form.Item label="Selected Files">
              <div className="space-y-2">
                {fileList.map((file, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileOutlined />
                      <span>{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        const newFileList = fileList.filter((_, i) => i !== index);
                        setFileList(newFileList);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Description (Optional)"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter file description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Upload {fileList.length > 0 && `(${fileList.length} files)`}
              </Button>
              <Button onClick={() => setIsUploadModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        title="Create New Folder"
        open={isFolderModalVisible}
        onCancel={() => setIsFolderModalVisible(false)}
        footer={null}
      >
        <Form
          form={folderForm}
          onFinish={handleCreateFolder}
          layout="vertical"
        >
          <Form.Item
            label="Folder Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter folder name' },
              { pattern: /^[^<>:"/\\|?*]+$/, message: 'Invalid characters in folder name' }
            ]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Folder
              </Button>
              <Button onClick={() => setIsFolderModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rename Modal */}
      <Modal
        title="Rename Item"
        open={isRenameModalVisible}
        onCancel={() => setIsRenameModalVisible(false)}
        footer={null}
      >
        <Form
          form={renameForm}
          onFinish={handleRenameSubmit}
          layout="vertical"
        >
          <Form.Item
            label="New Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter new name' },
              { pattern: /^[^<>:"/\\|?*]+$/, message: 'Invalid characters in name' }
            ]}
          >
            <Input placeholder="Enter new name" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Rename
              </Button>
              <Button onClick={() => setIsRenameModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
