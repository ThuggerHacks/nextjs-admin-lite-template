'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Moda  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ items: string[]; operation: 'copy' | 'cut' | null }>({
    items: [],
    operation: null,
  });
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false); Form,
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
  HomeOutlined,
  RightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { FileItem, FolderItem, FileManagerState, UserRole } from '@/types';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { DirectoryTree } = Tree;

interface FileManagerProps {
  libraryId: string;
  libraryName: string;
  canWrite?: boolean;
  canDelete?: boolean;
}

// Mock file system data
const mockFileSystem: (FolderItem | FileItem)[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    description: 'Main documents folder',
    libraryId: 'lib-1',
    createdBy: { id: '1', name: 'Admin' } as any,
    createdAt: new Date('2024-01-15'),
    path: '/Documents',
    children: [
      {
        id: 'folder-1-1',
        name: 'Reports',
        description: 'Annual reports',
        parentId: 'folder-1',
        libraryId: 'lib-1',
        createdBy: { id: '1', name: 'Admin' } as any,
        createdAt: new Date('2024-01-16'),
        path: '/Documents/Reports',
        children: [
          {
            id: 'file-1-1-1',
            name: 'Q1-2024-Report.pdf',
            description: 'Q1 financial report',
            size: 2048000,
            type: 'application/pdf',
            url: '/files/q1-report.pdf',
            libraryId: 'lib-1',
            uploadedBy: { id: '2', name: 'Finance Team' } as any,
            uploadedAt: new Date('2024-03-01'),
            parentFolderId: 'folder-1-1',
            path: '/Documents/Reports/Q1-2024-Report.pdf',
            isFolder: false,
          } as FileItem,
        ],
      } as FolderItem,
      {
        id: 'file-1-2',
        name: 'Company-Policy.docx',
        description: 'Company policy document',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '/files/policy.docx',
        libraryId: 'lib-1',
        uploadedBy: { id: '1', name: 'HR Department' } as any,
        uploadedAt: new Date('2024-02-15'),
        parentFolderId: 'folder-1',
        path: '/Documents/Company-Policy.docx',
        isFolder: false,
      } as FileItem,
    ],
  } as FolderItem,
  {
    id: 'folder-2',
    name: 'Images',
    description: 'Image files',
    libraryId: 'lib-1',
    createdBy: { id: '1', name: 'Admin' } as any,
    createdAt: new Date('2024-01-20'),
    path: '/Images',
    children: [],
  } as FolderItem,
];

export default function FileManager({ libraryId, libraryName, canWrite = false, canDelete = false }: FileManagerProps) {
  const [fileSystem, setFileSystem] = useState<(FolderItem | FileItem)[]>(mockFileSystem);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ items: any[]; operation: 'cut' | 'copy' | null }>({
    items: [],
    operation: null,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renamingItem, setRenamingItem] = useState<FileItem | FolderItem | null>(null);
  
  // Forms
  const [createFolderForm] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user, canAccess } = useUser();
  const { t } = useTranslation();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (item: FileItem | FolderItem) => {
    if ('isFolder' in item && !item.isFolder) {
      const type = (item as FileItem).type;
      if (type.includes('pdf')) return '📄';
      if (type.includes('word')) return '📝';
      if (type.includes('sheet') || type.includes('excel')) return '📊';
      if (type.includes('presentation')) return '📋';
      if (type.includes('image')) return '🖼️';
      return '📁';
    }
    return '📁';
  };

  const getCurrentFolderContents = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    let currentFolder: any = { children: fileSystem };
    
    for (const part of pathParts) {
      const found = currentFolder.children?.find((item: any) => item.name === part);
      if (found && 'children' in found) {
        currentFolder = found;
      } else {
        return [];
      }
    }
    
    return currentFolder.children || [];
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedItems([]);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop();
      const newPath = '/' + pathParts.join('/');
      navigateToPath(newPath === '/' ? '/' : newPath);
    }
  };

  const handleItemDoubleClick = (item: FileItem | FolderItem) => {
    if ('children' in item) {
      // It's a folder, navigate into it
      navigateToPath(item.path);
    } else {
      // It's a file, preview or download
      handlePreviewFile(item as FileItem);
    }
  };

  const handleCreateFolder = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name: values.name,
        description: values.description,
        libraryId,
        createdBy: user!,
        createdAt: new Date(),
        path: currentPath === '/' ? `/${values.name}` : `${currentPath}/${values.name}`,
        children: [],
      };
      
      // Add to current folder
      updateFileSystem(newFolder, 'create');
      
      setIsCreateFolderModalVisible(false);
      createFolderForm.resetFields();
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

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      
      setIsUploadModalVisible(false);
      uploadForm.resetFields();
      setFileList([]);
      message.success('Files uploaded successfully!');
    } catch (error) {
      message.error('Failed to upload files');
    } finally {
      setLoading(false);
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
    // This would be more complex in a real app - updating nested structures
    if (operation === 'create') {
      setFileSystem(prev => [...prev, item]);
    }
    // Add update and delete logic here
  };

  const handleRename = async (values: any) => {
    if (!renamingItem) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the item name
      updateFileSystem({ ...renamingItem, name: values.name }, 'update');
      
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

  const handleDelete = async (itemIds: string[]) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      itemIds.forEach(id => {
        // Find and remove item
        updateFileSystem({ id } as any, 'delete');
      });
      
      setSelectedItems([]);
      message.success('Items deleted successfully!');
    } catch (error) {
      message.error('Failed to delete items');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const items = getCurrentFolderContents().filter((item: any) => selectedItems.includes(item.id));
    setClipboard({ items, operation: 'copy' });
    message.success(`Copied ${items.length} item(s)`);
  };

  const handleCut = () => {
    const items = getCurrentFolderContents().filter((item: any) => selectedItems.includes(item.id));
    setClipboard({ items, operation: 'cut' });
    message.success(`Cut ${items.length} item(s)`);
  };

  const handlePaste = async () => {
    if (clipboard.items.length === 0) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clipboard.items.forEach(item => {
        const newItem = {
          ...item,
          id: `${item.id}-copy-${Date.now()}`,
          path: currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`,
        };
        updateFileSystem(newItem, 'create');
      });
      
      if (clipboard.operation === 'cut') {
        setClipboard({ items: [], operation: null });
      }
      
      message.success(`Pasted ${clipboard.items.length} item(s)`);
    } catch (error) {
      message.error('Failed to paste items');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: FileItem) => {
    message.success(`Downloading ${item.name}`);
    // Implement actual download logic
  };

  const handlePreviewFile = (item: FileItem) => {
    message.info(`Preview ${item.name} (Feature coming soon)`);
    // Implement file preview modal
  };

  const handleShare = (item: FileItem | FolderItem) => {
    const shareUrl = `${window.location.origin}/shared/${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('Share link copied to clipboard!');
  };

  const getBreadcrumbItems = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const items = [
      {
        title: (
          <span className="cursor-pointer" onClick={() => navigateToPath('/')}>
            <HomeOutlined /> Root
          </span>
        ),
      },
    ];
    
    let currentPathBuild = '';
    pathParts.forEach((part, index) => {
      currentPathBuild += '/' + part;
      const path = currentPathBuild;
      items.push({
        title: (
          <span
            className="cursor-pointer"
            onClick={() => navigateToPath(path)}
          >
            {part}
          </span>
        ),
      });
    });
    
    return items;
  };

  const currentContents = getCurrentFolderContents();

  const uploadProps = {
    fileList,
    onChange: ({ fileList }: any) => setFileList(fileList),
    beforeUpload: () => false,
    multiple: true,
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
      icon: <FileOutlined />,
      disabled: clipboard.items.length === 0 || !canWrite,
      onClick: handlePaste,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      disabled: selectedItems.length === 0 || !canDelete,
      danger: true,
      onClick: () => handleDelete(selectedItems),
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FileItem | FolderItem) => (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
          onDoubleClick={() => handleItemDoubleClick(record)}
        >
          <span className="text-xl">{getFileIcon(record)}</span>
          <span>{text}</span>
          {'children' in record && <Tag color="blue">Folder</Tag>}
        </div>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number, record: FileItem | FolderItem) => (
        'children' in record ? '-' : formatFileSize(size)
      ),
    },
    {
      title: 'Modified',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: Date, record: FileItem | FolderItem) => {
        const modifiedDate = 'uploadedAt' in record ? record.uploadedAt : record.createdAt;
        return modifiedDate.toLocaleDateString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FileItem | FolderItem) => (
        <Space>
          {'isFolder' in record && !record.isFolder && (
            <>
              <Tooltip title="Preview">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreviewFile(record as FileItem)}
                />
              </Tooltip>
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record as FileItem)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Share">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Tooltip>
          {canWrite && (
            <Tooltip title="Rename">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setRenamingItem(record);
                  renameForm.setFieldsValue({ name: record.name });
                  setIsRenameModalVisible(true);
                }}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete([record.id])}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Title level={4} className="mb-0">
              📁 {libraryName} File Manager
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  message.success('Refreshed');
                }}
              >
                Refresh
              </Button>
              <Button
                icon={<RightOutlined style={{ transform: 'rotate(180deg)' }} />}
                onClick={navigateUp}
                disabled={currentPath === '/'}
              >
                Up
              </Button>
            </Space>
          </div>
          
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 100 }}
            >
              <Select.Option value="list">
                <UnorderedListOutlined /> List
              </Select.Option>
              <Select.Option value="grid">
                <AppstoreOutlined /> Grid
              </Select.Option>
              <Select.Option value="tree">
                <MenuOutlined /> Tree
              </Select.Option>
            </Select>
            
            {canWrite && (
              <Space>
                <Button
                  type="primary"
                  icon={<FolderAddOutlined />}
                  onClick={() => setIsCreateFolderModalVisible(true)}
                >
                  New Folder
                </Button>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => setIsUploadModalVisible(true)}
                >
                  Upload Files
                </Button>
              </Space>
            )}
            
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MenuOutlined />}>
                Actions
              </Button>
            </Dropdown>
          </Space>
        </div>
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={getBreadcrumbItems()} />
      </Card>

      {/* File List */}
      <Card className="flex-1">
        <Table
          columns={columns}
          dataSource={currentContents}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectedItems,
            onChange: (selectedRowKeys) => setSelectedItems(selectedRowKeys.map(key => String(key))),
          }}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Create Folder Modal */}
      <Modal
        title="Create New Folder"
        open={isCreateFolderModalVisible}
        onCancel={() => setIsCreateFolderModalVisible(false)}
        footer={null}
      >
        <Form
          form={createFolderForm}
          onFinish={handleCreateFolder}
          layout="vertical"
        >
          <Form.Item
            label="Folder Name"
            name="name"
            rules={[{ required: true, message: 'Please enter folder name' }]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter description (optional)" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Folder
              </Button>
              <Button onClick={() => setIsCreateFolderModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Files Modal */}
      <Modal
        title="Upload Files"
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
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter description (optional)" />
          </Form.Item>
          
          <Form.Item label="Files" required>
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to this area to upload</p>
              <p className="ant-upload-hint">Support for single or bulk upload</p>
            </Upload.Dragger>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Upload Files
              </Button>
              <Button onClick={() => setIsUploadModalVisible(false)}>
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
          onFinish={handleRename}
          layout="vertical"
        >
          <Form.Item
            label="New Name"
            name="name"
            rules={[{ required: true, message: 'Please enter new name' }]}
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
