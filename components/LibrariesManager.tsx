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
  Checkbox,
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
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { documentsService, DocumentItem, DocumentFilters } from '@/lib/services/documentsService';
import { useDocumentsSync } from '@/hooks/use-documents-sync';
import RichTextEditor from './RichTextEditor';
import { UserRole } from '@/types';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Search } = AntInput;

interface LibrariesManagerProps {
  mode: 'public' | 'department' | 'personal' | 'all';
  departmentId?: string;
  canWrite?: boolean;
  canDelete?: boolean;
  title?: string;
  onDocumentsChange?: () => void;
}

interface LibraryMemberSelection {
  includeCreator: boolean;
  selectedUsers: string[];
  selectedDepartments: string[];
}

// Mock data for library members
const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', department: 'IT' },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', department: 'HR' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', department: 'Finance' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@empresa.com', department: 'Marketing' },
  { id: '5', name: 'Carlos Silva', email: 'carlos@empresa.com', department: 'Operations' },
  { id: '6', name: 'Lucia Fernandes', email: 'lucia@empresa.com', department: 'Legal' },
];

const mockDepartments = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Operations',
  'Legal',
  'Sales',
  'Support',
];

const LibrariesManager: React.FC<LibrariesManagerProps> = ({
  mode,
  departmentId,
  canWrite = true,
  canDelete = true,
  title,
  onDocumentsChange,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPath, setCurrentPath] = useState('/');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DocumentFilters>({
    type: mode,
    departmentId,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 50,
  });

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
  const [selectedItem, setSelectedItem] = useState<DocumentItem | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<any[]>([]);
  const [clipboard, setClipboard] = useState<{ action: 'copy' | 'cut'; item: DocumentItem; bulkItems?: DocumentItem[] } | null>(null);

  // Library member selection state
  const [memberSelection, setMemberSelection] = useState<LibraryMemberSelection>({
    includeCreator: true,
    selectedUsers: [],
    selectedDepartments: [],
  });

  // Forms
  const [createFolderForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const [copyForm] = Form.useForm();
  const [moveForm] = Form.useForm();

  const { user } = useUser();
  const { t } = useTranslation();

  const { createItem, updateItem, deleteItem, renameItem } = useDocumentsSync();

  // Load documents from backend - OPTIMIZED
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentsService.getAllDocuments({
        ...filters,
        parentId: currentFolderId
      });
      
      // Show ALL items (files and folders) regardless of ownership
      // Only filter by folder hierarchy, not by user permissions
      const filteredItems = response.items.filter(item => {
        if (currentFolderId) {
          // If we're in a folder, only show items that belong to this folder
          return item.parentId === currentFolderId;
        } else {
          // If we're at root, only show items that have no parent
          return !item.parentId;
        }
      });
      
      console.log('All items from API:', response.items);
      console.log('Filtered items by folder:', filteredItems);
      console.log('Current folder ID:', currentFolderId);
      
      setDocuments(filteredItems);
    } catch (error) {
      console.error('Error loading documents:', error);
      message.error(t('files.failedToLoadDocuments'));
    } finally {
      setLoading(false);
    }
  }, [filters, currentFolderId, t]);

  // Sort documents - OPTIMIZED
  const sortDocuments = useCallback((items: DocumentItem[]) => {
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

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return sortDocuments(filtered);
  }, [documents, searchQuery, sortDocuments]);

  // Navigation functions
  const navigateToFolder = useCallback((folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setCurrentPath(prev => prev + '/' + folderName);
    
    // Add to history
    setFolderHistory(prev => [...prev, folderId]);
    setCurrentHistoryIndex(prev => prev + 1);
  }, []);

  const navigateBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const targetFolderId = folderHistory[newIndex];
      
      setCurrentHistoryIndex(newIndex);
      setCurrentFolderId(targetFolderId);
      
      // Update path
      const pathParts = currentPath.split('/');
      pathParts.pop();
      setCurrentPath(pathParts.join('/') || '/');
    }
  }, [currentHistoryIndex, folderHistory, currentPath]);

  const navigateForward = useCallback(() => {
    if (currentHistoryIndex < folderHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const targetFolderId = folderHistory[newIndex];
      
      setCurrentHistoryIndex(newIndex);
      setCurrentFolderId(targetFolderId);
      
      // Update path
      const pathParts = currentPath.split('/');
      const targetPath = folderHistory.slice(0, newIndex + 1).map(id => {
        const item = documents.find(d => d.id === id);
        return item?.name || id;
      }).join('/');
      setCurrentPath('/' + targetPath);
    }
  }, [currentHistoryIndex, folderHistory, currentPath, documents]);

  const navigateToRoot = useCallback(() => {
    setCurrentFolderId(undefined);
    setCurrentPath('/');
    setFolderHistory([]);
    setCurrentHistoryIndex(-1);
  }, []);

  // Create folder function with library member management
  const handleCreateFolder = async (values: any) => {
    try {
      // Check if we're at root level (creating a library)
      const isCreatingLibrary = !currentFolderId;
      
      if (isCreatingLibrary) {
        // Show library member selection modal
        setCreateFolderModalVisible(false);
        // Here you would show the library member selection modal
        // For now, we'll create the folder/library directly
        message.info('Creating library with default permissions');
      }

      const newFolder = await createItem({
        name: values.name,
        description: values.description,
        type: 'folder',
        parentId: currentFolderId,
      });

      if (newFolder && typeof newFolder === 'object') {
        message.success(t('files.folderCreatedSuccess'));
        loadDocuments();
        createFolderForm.resetFields();
        setCreateFolderModalVisible(false);
        
        if (onDocumentsChange) {
          onDocumentsChange();
        }
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      message.error(t('files.failedToCreateFolder'));
    }
  };

  // Upload files function
  const handleUpload = async (fileList: any[]) => {
    try {
      setUploadProgress(fileList.map(file => ({ file, progress: 0 })));
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => 
            prev.map((item, index) => 
              index === i ? { ...item, progress } : item
            )
          );
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Create document item
        await createItem({
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          parentId: currentFolderId,
        });
      }
      
      message.success(t('files.filesUploadedSuccess'));
      loadDocuments();
      setUploadModalVisible(false);
      setUploadProgress([]);
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error(t('files.failedToUploadFiles'));
    }
  };

  // Rename function
  const handleRename = async (values: any) => {
    if (!selectedItem) return;
    
    try {
      await renameItem(selectedItem.id, values.newName);
      message.success(t('files.itemRenamedSuccess'));
      loadDocuments();
      setRenameModalVisible(false);
      setSelectedItem(null);
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error renaming item:', error);
      message.error(t('files.failedToRenameItem'));
    }
  };

  // Delete function
  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      message.success(t('files.itemDeletedSuccess'));
      loadDocuments();
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error(t('files.failedToDeleteItem'));
    }
  };

  // Copy function
  const handleCopy = async (values: any) => {
    if (!clipboard?.item) return;
    
    try {
      // Implementation would depend on your backend service
      message.success(t('files.itemCopiedSuccess'));
      setCopyModalVisible(false);
      setClipboard(null);
      loadDocuments();
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error copying item:', error);
      message.error(t('files.failedToCopyItem'));
    }
  };

  // Move function
  const handleMove = async (values: any) => {
    if (!clipboard?.item) return;
    
    try {
      // Implementation would depend on your backend service
      message.success(t('files.itemMovedSuccess'));
      setMoveModalVisible(false);
      setClipboard(null);
      loadDocuments();
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error moving item:', error);
      message.error(t('files.failedToMoveItem'));
    }
  };

  // Bulk operations
  const handleBulkCopy = async (values: any) => {
    if (!clipboard?.bulkItems) return;
    
    try {
      // Implementation would depend on your backend service
      message.success(t('files.bulkCopySuccess'));
      setBulkCopyModalVisible(false);
      setClipboard(null);
      setSelectedItems([]);
      loadDocuments();
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error bulk copying items:', error);
      message.error(t('files.failedBulkCopy'));
    }
  };

  const handleBulkMove = async (values: any) => {
    if (!clipboard?.bulkItems) return;
    
    try {
      // Implementation would depend on your backend service
      message.success(t('files.bulkMoveSuccess'));
      setBulkMoveModalVisible(false);
      setClipboard(null);
      setSelectedItems([]);
      loadDocuments();
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error bulk moving items:', error);
      message.error(t('files.failedToDeleteItem'));
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const itemId of selectedItems) {
        await deleteItem(itemId);
      }
      
      message.success(t('files.bulkDeleteSuccess'));
      setSelectedItems([]);
      loadDocuments();
      
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error bulk deleting items:', error);
      message.error(t('files.failedToDeleteItem'));
    }
  };

  // Clipboard operations
  const copyToClipboard = (item: DocumentItem) => {
    setClipboard({ action: 'copy', item });
    message.info(t('files.itemCopiedToClipboard', { name: item.name }));
  };

  const cutToClipboard = (item: DocumentItem) => {
    setClipboard({ action: 'cut', item });
    message.info(t('files.itemCutToClipboard', { name: item.name }));
  };

  const copyBulkToClipboard = () => {
    if (selectedItems.length === 0) return;
    
    const bulkItems = documents.filter(item => selectedItems.includes(item.id));
    setClipboard({ action: 'copy', item: bulkItems[0], bulkItems });
    message.info(t('files.itemsCopiedToClipboard', { count: selectedItems.length }));
  };

  const cutBulkToClipboard = () => {
    if (selectedItems.length === 0) return;
    
    const bulkItems = documents.filter(item => selectedItems.includes(item.id));
    setClipboard({ action: 'cut', item: bulkItems[0], bulkItems });
    message.info(t('files.itemsCutToClipboard', { count: selectedItems.length }));
  };

  // Load documents on mount and when dependencies change
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        title: (
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={navigateToRoot}
            className="p-0 h-auto"
          >
            {t('files.home')}
          </Button>
        ),
      },
    ];

    if (currentPath !== '/') {
      const pathParts = currentPath.split('/').filter(Boolean);
      let currentPathBuilder = '';
      
      pathParts.forEach((part, index) => {
        currentPathBuilder += '/' + part;
        const folderId = folderHistory[index];
        
        items.push({
          title: (
            <Button 
              type="text" 
              onClick={() => {
                setCurrentFolderId(folderId);
                setCurrentPath(currentPathBuilder);
                setCurrentHistoryIndex(index);
              }}
              className="p-0 h-auto"
            >
              {part}
            </Button>
          ),
        });
      });
    }

    return items;
  }, [currentPath, folderHistory, currentHistoryIndex, navigateToRoot, t]);

  // Render functions
  const renderFileIcon = (item: DocumentItem) => {
    if (item.type === 'folder') {
      return <FolderOutlined className="text-blue-500" />;
    }
    
    switch (item.mimeType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <FileOutlined className="text-green-500" />;
      case 'application/pdf':
        return <FileOutlined className="text-red-500" />;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileTextOutlined className="text-blue-500" />;
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileTextOutlined className="text-green-500" />;
      default:
        return <FileOutlined className="text-gray-500" />;
    }
  };

  const renderFileSize = (size?: number) => {
    if (!size) return t('files.unknown');
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderFileType = (item: DocumentItem) => {
    if (item.type === 'folder') {
      return t('files.folder');
    }
    
    if (!item.mimeType) {
      return t('files.unknown');
    }
    
    const type = item.mimeType.split('/')[1];
    return type ? type.toUpperCase() : item.mimeType;
  };

  const renderActions = (item: DocumentItem) => {
    const isOwner = item.userId === user?.id;
    const canEdit = canWrite && (isOwner || user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN);
    const canDeleteItem = canDelete && (isOwner || user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN);

    return (
      <Space size="small">
        {item.type === 'file' && (
          <Tooltip title={t('files.download')}>
            <Button 
              size="small" 
              icon={<DownloadOutlined />} 
              onClick={() => window.open(item.url, '_blank')}
            />
          </Tooltip>
        )}
        
        {item.type === 'file' && item.mimeType?.includes('text') && (
          <Tooltip title={t('files.editDocument')}>
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingDocument(item);
                setEditDocumentModalVisible(true);
              }}
            />
          </Tooltip>
        )}
        
        {canEdit && (
          <Tooltip title={t('files.rename')}>
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => {
                setSelectedItem(item);
                renameForm.setFieldsValue({ newName: item.name });
                setRenameModalVisible(true);
              }}
            />
          </Tooltip>
        )}
        
        <Tooltip title={t('files.copy')}>
          <Button 
            size="small" 
            icon={<CopyOutlined />} 
            onClick={() => copyToClipboard(item)}
          />
        </Tooltip>
        
        {canEdit && (
          <Tooltip title={t('files.cut')}>
            <Button 
              size="small" 
              icon={<ScissorOutlined />} 
              onClick={() => cutToClipboard(item)}
            />
          </Tooltip>
        )}
        
        {canDelete && (
          <Popconfirm
            title={t('files.areYouSureDelete')}
            onConfirm={() => handleDelete(item.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Tooltip title={t('files.delete')}>
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        )}
      </Space>
    );
  };

  // Table columns
  const columns = [
    {
      title: t('files.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DocumentItem) => (
        <Space>
          {renderFileIcon(record)}
          <span 
            className={`cursor-pointer ${record.type === 'folder' ? 'text-blue-600' : ''}`}
            onClick={() => {
              if (record.type === 'folder') {
                navigateToFolder(record.id, record.name);
              }
            }}
          >
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: t('files.size'),
      dataIndex: 'size',
      key: 'size',
      render: (size: number, record: DocumentItem) => 
        record.type === 'folder' ? '-' : renderFileSize(size),
    },
    {
      title: t('files.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: DocumentItem) => renderFileType(record),
    },
    {
      title: t('files.owner'),
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: t('files.lastModified'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('files.actions'),
      key: 'actions',
      render: (_: any, record: DocumentItem) => renderActions(record),
    },
  ];

  // Grid view render
  const renderGridItem = (item: DocumentItem) => (
    <div 
      key={item.id}
      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
        selectedItems.includes(item.id) ? 'bg-blue-50 border-blue-500' : ''
      }`}
      onClick={() => {
        if (item.type === 'folder') {
          navigateToFolder(item.id, item.name);
        }
      }}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">
          {renderFileIcon(item)}
        </div>
        <div className="font-medium text-sm mb-1 truncate" title={item.name}>
          {item.name}
        </div>
        <div className="text-xs text-gray-500 mb-2">
          {renderFileType(item)}
        </div>
        <div className="text-xs text-gray-400">
          {item.size ? renderFileSize(item.size) : '-'}
        </div>
      </div>
      
      <div className="mt-3 flex justify-center">
        {renderActions(item)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with breadcrumb and actions */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-2 flex items-center gap-2">
              <Button 
                icon={<ArrowLeftOutlined />} 
                disabled={currentHistoryIndex <= 0}
                onClick={navigateBack}
                size="small"
              />
              <Button 
                icon={<ArrowRightOutlined />} 
                disabled={currentHistoryIndex >= folderHistory.length - 1}
                onClick={navigateForward}
                size="small"
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadDocuments}
                loading={loading}
                size="small"
              >
                {t('files.refresh')}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
              size="small"
            />
            <Button
              icon={<UnorderedListOutlined />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
              size="small"
            />
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <Search
              placeholder={t('files.searchByName')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 120 }}
              size="small"
            >
              <Select.Option value="name">{t('files.sortByName')}</Select.Option>
              <Select.Option value="date">{t('files.sortByDate')}</Select.Option>
              <Select.Option value="size">{t('files.sortBySize')}</Select.Option>
              <Select.Option value="type">{t('files.sortByType')}</Select.Option>
            </Select>
            
            <Button
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              size="small"
            />
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {canWrite && (
            <>
              <Button
                type="primary"
                icon={<FolderAddOutlined />}
                onClick={() => setCreateFolderModalVisible(true)}
              >
                {t('files.createNewFolder')}
              </Button>
              
              <Button
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
              >
                {t('files.upload')}
              </Button>
            </>
          )}
          
          {selectedItems.length > 0 && (
            <>
              <Button
                icon={<CopyOutlined />}
                onClick={copyBulkToClipboard}
              >
                {t('files.copySelected')}
              </Button>
              
              <Button
                icon={<ScissorOutlined />}
                onClick={cutBulkToClipboard}
              >
                {t('files.cutSelected')}
              </Button>
              
              {canDelete && (
                <Popconfirm
                  title={t('files.areYouSureDelete')}
                  onConfirm={handleBulkDelete}
                  okText={t('common.yes')}
                  cancelText={t('common.no')}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  >
                    {t('files.deleteSelected')}
                  </Button>
                </Popconfirm>
              )}
              
              <Button
                size="small"
                onClick={() => setSelectedItems([])}
              >
                {t('files.clearSelection')}
              </Button>
            </>
          )}
          
          {clipboard && (
            <>
              <Button
                icon={<CopyOutlined />}
                onClick={() => setCopyModalVisible(true)}
              >
                {t('files.paste')}
              </Button>
              
              <Button
                size="small"
                onClick={() => setClipboard(null)}
              >
                {t('files.clearClipboard')}
              </Button>
            </>
          )}
        </div>
        
        {selectedItems.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {t('files.selected')} {selectedItems.length} {t('files.items')}
          </div>
        )}
      </Card>

      {/* Content */}
      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">{t('files.loading')}</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchQuery 
                ? t('files.noDocumentsFound')
                : t('files.noFiles')
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredDocuments.map(renderGridItem)}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedItems,
              onChange: (selectedRowKeys) => setSelectedItems(selectedRowKeys as string[]),
            }}
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* Create Folder Modal */}
      <Modal
        title={t('files.createNewFolder')}
        open={createFolderModalVisible}
        onCancel={() => setCreateFolderModalVisible(false)}
        footer={null}
      >
        <Form
          form={createFolderForm}
          onFinish={handleCreateFolder}
          layout="vertical"
        >
          <Form.Item
            label={t('files.folderName')}
            name="name"
            rules={[{ required: true, message: t('files.enterFolderName') }]}
          >
            <Input placeholder={t('files.enterFolderName')} />
          </Form.Item>
          
          <Form.Item
            label={t('files.description')}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder={t('files.optionalDescription')}
            />
          </Form.Item>
          
          {/* Show library member selection only when creating at root */}
          {!currentFolderId && (
            <>
              <Divider>{t('libraries.libraryMembers')}</Divider>
              
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
                  {t('files.includeMyself')}
                </Checkbox>
              </Form.Item>

              <Form.Item label={t('files.selectUsers')}>
                <Select
                  mode="multiple"
                  placeholder={t('files.selectUsers')}
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

              <Form.Item label={t('files.selectDepartments')}>
                <Select
                  mode="multiple"
                  placeholder={t('files.selectDepartments')}
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
            </>
          )}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.create')}
              </Button>
              <Button onClick={() => setCreateFolderModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Modal */}
      <Modal
        title={t('files.uploadFiles')}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Upload
          multiple
          beforeUpload={() => false}
          onChange={({ fileList }) => {
            if (fileList.length > 0) {
              handleUpload(fileList);
            }
          }}
        >
          <Button icon={<UploadOutlined />}>{t('files.selectFiles')}</Button>
        </Upload>
        
        {uploadProgress.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadProgress.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm truncate flex-1">{item.file.name}</span>
                <Progress percent={item.progress} size="small" />
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Rename Modal */}
      <Modal
        title={t('files.renameItem')}
        open={renameModalVisible}
        onCancel={() => setRenameModalVisible(false)}
        footer={null}
      >
        <Form
          form={renameForm}
          onFinish={handleRename}
          layout="vertical"
        >
          <Form.Item
            label={t('files.newName')}
            name="newName"
            rules={[{ required: true, message: t('files.enterNewName') }]}
          >
            <Input placeholder={t('files.enterNewName')} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
              <Button onClick={() => setRenameModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Copy Modal */}
      <Modal
        title={t('files.copyItem')}
        open={copyModalVisible}
        onCancel={() => setCopyModalVisible(false)}
        footer={null}
      >
        <Form
          form={copyForm}
          onFinish={handleCopy}
          layout="vertical"
        >
          <Form.Item
            label={t('files.targetFolder')}
            name="targetFolder"
            rules={[{ required: true, message: t('files.pleaseSelectTargetFolder') }]}
          >
            <Select placeholder={t('files.pleaseSelectTargetFolder')}>
              <Select.Option value="root">{t('files.root')}</Select.Option>
              {/* Add folder options here */}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('files.copy')}
              </Button>
              <Button onClick={() => setCopyModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Move Modal */}
      <Modal
        title={t('files.moveItem')}
        open={moveModalVisible}
        onCancel={() => setMoveModalVisible(false)}
        footer={null}
      >
        <Form
          form={moveForm}
          onFinish={handleMove}
          layout="vertical"
        >
          <Form.Item
            label={t('files.targetFolder')}
            name="targetFolder"
            rules={[{ required: true, message: t('files.pleaseSelectTargetFolder') }]}
          >
            <Select placeholder={t('files.pleaseSelectTargetFolder')}>
              <Select.Option value="root">{t('files.root')}</Select.Option>
              {/* Add folder options here */}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('files.move')}
              </Button>
              <Button onClick={() => setMoveModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Copy Modal */}
      <Modal
        title={t('files.bulkCopyItems')}
        open={bulkCopyModalVisible}
        onCancel={() => setBulkCopyModalVisible(false)}
        footer={null}
      >
        <Form
          form={copyForm}
          onFinish={handleBulkCopy}
          layout="vertical"
        >
          <Form.Item
            label={t('files.targetFolder')}
            name="targetFolder"
            rules={[{ required: true, message: t('files.pleaseSelectTargetFolder') }]}
          >
            <Select placeholder={t('files.pleaseSelectTargetFolder')}>
              <Select.Option value="root">{t('files.root')}</Select.Option>
              {/* Add folder options here */}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('files.copy')}
              </Button>
              <Button onClick={() => setBulkCopyModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Move Modal */}
      <Modal
        title={t('files.bulkMoveItems')}
        open={bulkMoveModalVisible}
        onCancel={() => setBulkMoveModalVisible(false)}
        footer={null}
      >
        <Form
          form={moveForm}
          onFinish={handleBulkMove}
          layout="vertical"
        >
          <Form.Item
            label={t('files.targetFolder')}
            name="targetFolder"
            rules={[{ required: true, message: t('files.pleaseSelectTargetFolder') }]}
          >
            <Select placeholder={t('files.pleaseSelectTargetFolder')}>
              <Select.Option value="root">{t('files.root')}</Select.Option>
              {/* Add folder options here */}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('files.move')}
              </Button>
              <Button onClick={() => setBulkMoveModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rich Text Editor Modal */}
      <Modal
        title={t('files.editDocument')}
        open={richTextModalVisible}
        onCancel={() => setRichTextModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '1200px' }}
      >
        <RichTextEditor
          value={editingDocument?.content || ''}
          onChange={(content) => {
            // Handle change
          }}
          onSave={() => {
            // Handle save
            setRichTextModalVisible(false);
          }}
        />
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        title={t('files.editDocument')}
        open={editDocumentModalVisible}
        onCancel={() => setEditDocumentModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '1200px' }}
      >
        <RichTextEditor
          value={editingDocument?.content || ''}
          onChange={(content) => {
            // Handle change
          }}
          onSave={() => {
            // Handle save
            setEditDocumentModalVisible(false);
          }}
        />
      </Modal>

      {/* Properties Modal */}
      <Modal
        title={t('files.itemProperties')}
        open={propertiesModalVisible}
        onCancel={() => setPropertiesModalVisible(false)}
        footer={null}
      >
        {selectedItem && (
          <Descriptions column={1}>
            <Descriptions.Item label={t('files.name')}>{selectedItem.name}</Descriptions.Item>
            <Descriptions.Item label={t('files.type')}>{renderFileType(selectedItem)}</Descriptions.Item>
            <Descriptions.Item label={t('files.size')}>{renderFileSize(selectedItem.size)}</Descriptions.Item>
            <Descriptions.Item label={t('files.owner')}>{selectedItem.userName}</Descriptions.Item>
            <Descriptions.Item label={t('files.created')}>
              {new Date(selectedItem.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label={t('files.lastModified')}>
              {new Date(selectedItem.updatedAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default LibrariesManager;
