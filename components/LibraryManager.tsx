'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Table,
  Tooltip,
  Breadcrumb,
  Select,
  Popconfirm,
  Typography,
  Tag,
  Progress,
  Radio,
  Avatar,
  Input as AntInput,
  Empty,
  Descriptions,
  Divider,
  Tree,
  Badge,
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  DownloadOutlined,
  FolderAddOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  HomeOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CopyOutlined,
  ScissorOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { libraryService, Library, LibraryFile } from '@/lib/services/libraryService';
import RichTextEditor from './RichTextEditor';
import { UserRole } from '@/types';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Search } = AntInput;

interface LibraryManagerProps {
  libraryId: string;
  libraryName: string;
  canWrite?: boolean;
  canDelete?: boolean;
  title?: string;
  onLibraryChange?: () => void;
}

interface LibraryDocumentItem {
  id: string;
  name: string;
  description?: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  url?: string;
  content?: string;
  isPublic: boolean;
  userId: string;
  userName: string;
  userDepartment?: string;
  folderId?: string;
  parentId?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  children?: LibraryDocumentItem[];
  _count?: {
    children: number;
    files: number;
  };
  // Library-specific fields
  libraryId: string;
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
}

const LibraryManager: React.FC<LibraryManagerProps> = ({
  libraryId,
  libraryName,
  canWrite = true,
  canDelete = true,
  title,
  onLibraryChange,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPath, setCurrentPath] = useState('/');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [documents, setDocuments] = useState<LibraryDocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [library, setLibrary] = useState<Library | null>(null);

  // Navigation state
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Modals
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [richTextModalVisible, setRichTextModalVisible] = useState(false);
  const [editDocumentModalVisible, setEditDocumentModalVisible] = useState(false);
  const [propertiesModalVisible, setPropertiesModalVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [bulkCopyModalVisible, setBulkCopyModalVisible] = useState(false);
  const [bulkMoveModalVisible, setBulkMoveModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryDocumentItem | null>(null);
  const [editingDocument, setEditingDocument] = useState<LibraryDocumentItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<any[]>([]);
  const [clipboard, setClipboard] = useState<{ action: 'copy' | 'cut'; item: LibraryDocumentItem; bulkItems?: LibraryDocumentItem[] } | null>(null);

  // Forms
  const [createFolderForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const [copyForm] = Form.useForm();
  const [moveForm] = Form.useForm();

  const { user } = useUser();
  const { t } = useTranslation();

  // Load library data
  const loadLibrary = useCallback(async () => {
    try {
      const libraryData = await libraryService.getById(libraryId);
      setLibrary(libraryData);
    } catch (error) {
      console.error('Error loading library:', error);
      message.error('Failed to load library');
    }
  }, [libraryId]);

  // Load documents from library
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await libraryService.getFiles(libraryId);
      
      // Convert LibraryFile to LibraryDocumentItem format
      const convertedItems: LibraryDocumentItem[] = response.map(file => ({
        id: file.id,
        name: file.name,
        description: '',
        type: 'file' as const,
        size: file.size,
        mimeType: file.mimeType,
        url: file.path,
        isPublic: false,
        userId: file.owner.id,
        userName: file.owner.name,
        userDepartment: '',
        parentId: undefined,
        path: `/${file.name}`,
        createdAt: file.createdAt,
        updatedAt: file.createdAt,
        libraryId: file.libraryId || libraryId,
        canEdit: canWrite && (file.owner.id === user?.id || hasAdminAccess()),
        canDelete: canDelete && (file.owner.id === user?.id || hasAdminAccess()),
        canDownload: true, // All library members can download
      }));

      // Filter by current folder
      const filteredItems = convertedItems.filter(item => {
        if (currentFolderId) {
          return item.parentId === currentFolderId;
        } else {
          return !item.parentId;
        }
      });

      setDocuments(filteredItems);
    } catch (error) {
      console.error('Error loading documents:', error);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [libraryId, currentFolderId, canWrite, canDelete, user?.id]);

  // Sort documents
  const sortDocuments = useCallback((items: LibraryDocumentItem[]) => {
    return [...items].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [sortBy, sortOrder]);

  // Get sorted documents
  const sortedDocuments = useMemo(() => {
    return sortDocuments(documents);
  }, [documents, sortDocuments]);

  // Handle multiple selection
  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedDocuments.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [sortedDocuments]);

  // Check if all items are selected
  const allSelected = useMemo(() => {
    return sortedDocuments.length > 0 && selectedItems.length === sortedDocuments.length;
  }, [sortedDocuments.length, selectedItems.length]);

  const someSelected = useMemo(() => {
    return selectedItems.length > 0 && selectedItems.length < sortedDocuments.length;
  }, [selectedItems.length, sortedDocuments.length]);

  // Check if user has admin access
  const hasAdminAccess = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  };

  // Check if user can edit item
  const canEditItem = (item: LibraryDocumentItem) => {
    if (!canWrite) return false;
    return item.canEdit || hasAdminAccess();
  };

  // Check if user can delete item
  const canDeleteItem = (item: LibraryDocumentItem) => {
    if (!canDelete) return false;
    return item.canDelete || hasAdminAccess();
  };

  // Check if user can rename item
  const canRenameItem = (item: LibraryDocumentItem) => {
    if (!canWrite) return false;
    return item.canEdit || hasAdminAccess();
  };

  // Check if user can move/copy item
  const canMoveCopyItem = (item: LibraryDocumentItem) => {
    if (!canWrite) return false;
    return item.canEdit || hasAdminAccess();
  };

  // Helper functions
  const getFileIcon = useCallback((item: LibraryDocumentItem) => {
    if (item.type === 'folder') {
      return <FolderOutlined style={{ fontSize: '16px', color: '#1890ff' }} />;
    }
    
    const fileType = item.mimeType || '';
    if (fileType.includes('image/')) {
      return <FileOutlined style={{ fontSize: '16px', color: '#52c41a' }} />;
    } else if (fileType.includes('pdf')) {
      return <FileOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileTextOutlined style={{ fontSize: '16px', color: '#1890ff' }} />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileOutlined style={{ fontSize: '16px', color: '#52c41a' }} />;
    } else {
      return <FileOutlined style={{ fontSize: '16px', color: '#666' }} />;
    }
  }, []);

  const getFileType = useCallback((item: LibraryDocumentItem) => {
    if (item.type === 'folder') {
      return t('files.folder');
    }
    
    const fileType = item.mimeType || '';
    if (fileType.includes('image/')) {
      return t('files.image');
    } else if (fileType.includes('pdf')) {
      return t('files.pdf');
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return t('files.document');
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return t('files.spreadsheet');
    } else if (fileType.includes('text/')) {
      return t('files.text');
    } else {
      return t('files.file');
    }
  }, [t]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadLibrary();
    loadDocuments();
  }, [libraryId]);

  // Navigation functions
  const navigateToFolder = useCallback((folderId: string | null, folderName?: string) => {
    if (folderId === currentFolderId) return;

    const newPath = folderId ? `${currentPath}${folderName}/` : '/';
    
    const newHistory = [...folderHistory.slice(0, currentHistoryIndex + 1), currentFolderId || 'root'];
    setFolderHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length);
    
    setCurrentFolderId(folderId || undefined);
    setCurrentPath(newPath);
    setSelectedItems([]);
  }, [currentFolderId, currentPath, folderHistory, currentHistoryIndex]);

  const goBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousFolderId = folderHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setCurrentFolderId(previousFolderId === 'root' ? undefined : previousFolderId);
      
      const newHistory = folderHistory.slice(0, newIndex);
      const newPath = newHistory.length === 0 ? '/' : `/${newHistory.map(id => {
        const item = documents.find(d => d.id === id);
        return item?.name || '';
      }).filter(Boolean).join('/')}/`;
      setCurrentPath(newPath);
    }
  }, [currentHistoryIndex, folderHistory, documents]);

  const goForward = useCallback(() => {
    if (currentHistoryIndex < folderHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextFolderId = folderHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setCurrentFolderId(nextFolderId === 'root' ? undefined : nextFolderId);
      
      const newHistory = folderHistory.slice(0, newIndex + 1);
      const newPath = newHistory.length === 0 ? '/' : `/${newHistory.map(id => {
        const item = documents.find(d => d.id === id);
        return item?.name || '';
      }).filter(Boolean).join('/')}/`;
      setCurrentPath(newPath);
    }
  }, [currentHistoryIndex, folderHistory, documents]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      await libraryService.uploadFile(libraryId, file);
      message.success('File uploaded successfully');
      loadDocuments();
      onLibraryChange?.();
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    try {
      setLoading(true);
      await libraryService.removeFile(libraryId, fileId);
      message.success('File deleted successfully');
      loadDocuments();
      onLibraryChange?.();
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      setLoading(true);
      for (const itemId of selectedItems) {
        await libraryService.removeFile(libraryId, itemId);
      }
      setSelectedItems([]);
      message.success(`Successfully deleted ${selectedItems.length} items`);
      loadDocuments();
      onLibraryChange?.();
    } catch (error) {
      console.error('Error deleting items:', error);
      message.error('Failed to delete some items');
    } finally {
      setLoading(false);
    }
  };

  // Handle file download
  const handleDownload = (item: LibraryDocumentItem) => {
    if (item.url) {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render file list
  const renderFileList = () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: LibraryDocumentItem) => (
          <Space>
            {getFileIcon(record)}
            <span className="cursor-pointer hover:text-blue-600" onClick={() => {
              if (record.type === 'folder') {
                navigateToFolder(record.id, record.name);
              }
            }}>
              {text}
            </span>
            {record.userId === user?.id && (
              <Tag color="blue" size="small">Owner</Tag>
            )}
          </Space>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (text: string, record: LibraryDocumentItem) => getFileType(record),
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        render: (size: number) => size ? formatFileSize(size) : '-',
      },
      {
        title: 'Owner',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: 'Modified',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (text: string, record: LibraryDocumentItem) => (
          <Space size="small">
            {record.canDownload && (
              <Tooltip title="Download">
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record)}
                />
              </Tooltip>
            )}
            {canEditItem(record) && (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedItem(record);
                    setEditDocumentModalVisible(true);
                  }}
                />
              </Tooltip>
            )}
            {canDeleteItem(record) && (
              <Tooltip title="Delete">
                <Popconfirm
                  title="Are you sure you want to delete this file?"
                  onConfirm={() => handleDeleteFile(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Table
        dataSource={sortedDocuments}
        columns={columns}
        rowKey="id"
        loading={loading}
        rowSelection={{
          selectedRowKeys: selectedItems,
          onChange: (selectedRowKeys) => setSelectedItems(selectedRowKeys as string[]),
          onSelect: (record, selected) => handleSelectItem(record.id, selected),
          onSelectAll: (selected, selectedRows, changeRows) => handleSelectAll(selected),
        }}
        pagination={false}
        size="small"
      />
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <Row gutter={[16, 16]}>
        {sortedDocuments.map((item) => (
          <Col xs={12} sm={8} md={6} lg={4} key={item.id}>
            <Card
              hoverable
              size="small"
              className="text-center cursor-pointer"
              onClick={() => {
                if (item.type === 'folder') {
                  navigateToFolder(item.id, item.name);
                }
              }}
            >
              <div className="mb-2">
                {getFileIcon(item)}
              </div>
              <div className="text-sm font-medium truncate" title={item.name}>
                {item.name}
              </div>
              <div className="text-xs text-gray-500">
                {item.type === 'folder' ? 'Folder' : formatFileSize(item.size || 0)}
              </div>
              {item.userId === user?.id && (
                <Tag color="blue" size="small" className="mt-1">Owner</Tag>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {title || `${libraryName} Library`}
            </Title>
            <Text type="secondary">
              {library?.description || 'Manage files and folders in this library'}
            </Text>
          </Col>
          <Col>
            <Space>
                      <Button
          icon={<ReloadOutlined />}
          onClick={loadDocuments}
          loading={loading}
        >
          {t('libraries.refresh')}
        </Button>
                      <Button
          icon={<AppstoreOutlined />}
          type={viewMode === 'grid' ? 'primary' : 'default'}
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? t('libraries.listView') : t('libraries.gridView')}
        </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Navigation Breadcrumb */}
      <Card size="small">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => navigateToFolder(null)}
            >
              {libraryName}
            </Button>
          </Breadcrumb.Item>
          {currentPath !== '/' && (
            <>
              <Breadcrumb.Item>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={goBack}
                  disabled={currentHistoryIndex <= 0}
                >
                  Back
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Text>{currentPath}</Text>
              </Breadcrumb.Item>
            </>
          )}
        </Breadcrumb>
      </Card>

      {/* Toolbar */}
      <Card size="small">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
                      <Search
          placeholder={t('libraries.searchFiles')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />
                      <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: 120 }}
        >
          <Select.Option value="name">{t('libraries.sortBy')}</Select.Option>
          <Select.Option value="date">Date</Select.Option>
          <Select.Option value="size">Size</Select.Option>
          <Select.Option value="type">Type</Select.Option>
        </Select>
              <Button
                icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              {canWrite && (
                <>
                  <Button
                    icon={<FolderAddOutlined />}
                    onClick={() => setCreateFolderModalVisible(true)}
                  >
                    New Folder
                  </Button>
                  <Upload
                    beforeUpload={() => false}
                    onChange={({ fileList }) => {
                      if (fileList.length > 0) {
                        handleFileUpload(fileList[0].originFileObj as File);
                      }
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>
                      Upload File
                    </Button>
                  </Upload>
                </>
              )}
              {selectedItems.length > 0 && (
                <>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => setBulkCopyModalVisible(true)}
                  >
                    Copy ({selectedItems.length})
                  </Button>
                  <Button
                    icon={<ScissorOutlined />}
                    onClick={() => setBulkMoveModalVisible(true)}
                  >
                    Move ({selectedItems.length})
                  </Button>
                  <Popconfirm
                    title={`Delete ${selectedItems.length} selected items?`}
                    onConfirm={handleBulkDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                    >
                      Delete ({selectedItems.length})
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content */}
      <Card>
        {sortedDocuments.length === 0 ? (
                  <Empty
          description={t('libraries.noFiles')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        ) : viewMode === 'grid' ? (
          renderGridView()
        ) : (
          renderFileList()
        )}
      </Card>

      {/* Modals */}
      {/* Create Folder Modal */}
      <Modal
        title={t('libraries.createFolder')}
        open={createFolderModalVisible}
        onCancel={() => setCreateFolderModalVisible(false)}
        footer={null}
      >
        <Form
          form={createFolderForm}
          onFinish={(values) => {
            // TODO: Implement folder creation
            message.info('Folder creation not yet implemented');
            setCreateFolderModalVisible(false);
          }}
          layout="vertical"
        >
          <Form.Item
            label={t('libraries.createFolder')}
            name="name"
            rules={[{ required: true, message: 'Please enter folder name' }]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter folder description (optional)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setCreateFolderModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        title="Edit Document"
        open={editDocumentModalVisible}
        onCancel={() => setEditDocumentModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedItem && (
          <div>
            <p>Editing: {selectedItem.name}</p>
            <p>This feature is not yet implemented for library files.</p>
          </div>
        )}
      </Modal>

      {/* Bulk Copy Modal */}
      <Modal
        title="Copy Items"
        open={bulkCopyModalVisible}
        onCancel={() => setBulkCopyModalVisible(false)}
        footer={null}
      >
        <p>Copy {selectedItems.length} items to another location</p>
        <p>This feature is not yet implemented.</p>
      </Modal>

      {/* Bulk Move Modal */}
      <Modal
        title="Move Items"
        open={bulkMoveModalVisible}
        onCancel={() => setBulkMoveModalVisible(false)}
        footer={null}
      >
        <p>Move {selectedItems.length} items to another location</p>
        <p>This feature is not yet implemented.</p>
      </Modal>
    </div>
  );
};

export default LibraryManager;
