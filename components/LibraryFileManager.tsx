'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Popconfirm,
  Typography,
  Progress,
  Radio,
  Select,
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  FolderAddOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { FileItem, FolderItem } from '@/types';
import { libraryFileService, LibraryFolder, LibraryFile } from '@/lib/services/libraryFileService';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface LibraryFileManagerProps {
  libraryId: string;
  libraryName: string;
  canWrite?: boolean;
  canDelete?: boolean;
}

interface UploadProgressItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

type ViewMode = 'list' | 'grid';
type SortBy = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

const LibraryFileManager: React.FC<LibraryFileManagerProps> = ({
  libraryId,
  libraryName,
  canWrite = true,
  canDelete = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPath, setCurrentPath] = useState('/');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<(FileItem | FolderItem)[]>([]);
  const [loading, setLoading] = useState(false);
  
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

  // Helper function to convert backend data to frontend format
  const convertToFileSystem = (folders: LibraryFolder[], files: LibraryFile[]): (FileItem | FolderItem)[] => {
    console.log('Converting backend data:', { folders, files, currentFolderId });
    console.log('Current path:', currentPath);
    
    // If we're in a specific folder, just return the direct contents
    if (currentFolderId) {
      console.log('In folder mode, returning direct contents');
      
      const items: (FileItem | FolderItem)[] = [];
      
      // Add folders in this folder
      const childFolders = folders.filter(folder => folder.parentId === currentFolderId);
      console.log(`Folders in current folder ${currentFolderId}:`, childFolders);
      
      childFolders.forEach(folder => {
        const folderItem: FolderItem = {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          parentId: folder.parentId,
          libraryId: libraryId,
          createdBy: user as any,
          createdAt: new Date(folder.createdAt),
          path: currentPath + `/${folder.name}`,
          children: [],
          permissions: [],
        };
        items.push(folderItem);
      });
      
      // Add files in this folder
      const childFiles = files.filter(file => file.folderId === currentFolderId);
      console.log(`Files in current folder ${currentFolderId}:`, childFiles);
      console.log(`Filtering files where file.folderId (${childFiles.map(f => f.folderId)}) === currentFolderId (${currentFolderId})`);
      
      childFiles.forEach(file => {
        const fileItem: FileItem = {
          id: file.id,
          name: file.name,
          description: file.description,
          size: file.size,
          type: file.mimeType || file.type || 'application/octet-stream',
          url: file.url,
          libraryId: libraryId,
          uploadedBy: user as any,
          uploadedAt: new Date(file.updatedAt),
          parentFolderId: file.folderId,
          path: currentPath + `/${file.name}`,
          isFolder: false,
          permissions: [],
        };
        items.push(fileItem);
      });
      
      console.log('Final folder contents:', items);
      return items;
    }
    
    // If we're at root, build complete folder hierarchy
    console.log('In root mode, building complete tree');
    
    const buildFolderTree = (parentId: string | null): (FileItem | FolderItem)[] => {
      const children: (FileItem | FolderItem)[] = [];
      
      // Find all folders with this parentId
      const childFolders = folders.filter(folder => folder.parentId === parentId);
      console.log(`Building tree for parentId ${parentId}:`, { childFolders });
      
      childFolders.forEach(folder => {
        const folderItem: FolderItem = {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          parentId: folder.parentId,
          libraryId: libraryId,
          createdBy: user as any,
          createdAt: new Date(folder.createdAt),
          path: '', // Will be set later
          children: buildFolderTree(folder.id),
          permissions: [],
        };
        children.push(folderItem);
      });
      
      // Find all files with this parentId
      const childFiles = files.filter(file => file.folderId === parentId);
      console.log(`Files for parentId ${parentId}:`, { childFiles });
      
      childFiles.forEach(file => {
        const fileItem: FileItem = {
          id: file.id,
          name: file.name,
          description: file.description,
          size: file.size,
          type: file.mimeType || file.type || 'application/octet-stream',
          url: file.url,
          libraryId: libraryId,
          uploadedBy: user as any,
          uploadedAt: new Date(file.updatedAt),
          parentFolderId: file.folderId,
          path: '', // Will be set later
          isFolder: false,
          permissions: [],
        };
        children.push(fileItem);
      });
      
      return children;
    };
    
    // Build the complete tree starting from root (parentId: null)
    const rootItems = buildFolderTree(null);
    console.log('Root items before path update:', rootItems);
    
    // Update paths to be full paths
    const updatePaths = (items: (FileItem | FolderItem)[], parentPath: string = '') => {
      items.forEach(item => {
        item.path = parentPath + `/${item.name}`;
        if ('children' in item && item.children) {
          updatePaths(item.children, item.path);
        }
      });
    };
    
    updatePaths(rootItems);
    console.log('Final converted data:', rootItems);
    
    return rootItems;
  };

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Loading data for library:', libraryId, 'currentFolderId:', currentFolderId);
      
      // Get library-specific data for the current folder context
      const libraryData = await libraryFileService.getLibraryContent(libraryId, currentFolderId);
      
      console.log('Received library data:', libraryData);
      
      // Convert the response to our expected format
      const folders = libraryData.folders || [];
      const files = libraryData.files || [];
      
      console.log('Processing folders:', folders);
      console.log('Processing files:', files);
      
      const convertedData = convertToFileSystem(folders, files);
      console.log('Converted file system data:', convertedData);
      
      setFileSystem(convertedData);
    } catch (error) {
      console.error('Error loading library file data:', error);
      message.error('Failed to load library files and folders');
    } finally {
      setLoading(false);
    }
  }, [libraryId, currentFolderId]);

  // Load data on component mount and when key dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset folder context when library changes
  useEffect(() => {
    setCurrentPath('/');
    setCurrentFolderId(undefined);
  }, [libraryId]);

  // Helper functions
  const findItemByPath = (path: string, items: (FileItem | FolderItem)[] = fileSystem): FileItem | FolderItem | null => {
    // Handle root path
    if (path === '/' || path === '') {
      return null;
    }
    
    const pathParts = path.split('/').filter(Boolean);
    
    // Navigate through the path parts to find the target item
    let currentItems = items;
    let targetItem: FileItem | FolderItem | null = null;
    
    for (let i = 0; i < pathParts.length; i++) {
      const partName = pathParts[i];
      targetItem = currentItems.find(item => item.name === partName) || null;
      
      if (!targetItem) {
        return null;
      }
      
      if (i < pathParts.length - 1) {
        // Not the last part, so we need to go deeper
        if ('children' in targetItem && targetItem.children) {
          currentItems = targetItem.children;
        } else {
          return null;
        }
      }
    }
    
    return targetItem;
  };

  const getCurrentFolderContents = (): (FileItem | FolderItem)[] => {
    console.log('=== getCurrentFolderContents called ===');
    console.log('currentPath:', currentPath);
    console.log('currentFolderId:', currentFolderId);
    console.log('fileSystem length:', fileSystem.length);
    console.log('fileSystem content:', fileSystem);
    
    // If we're in a specific folder, return the fileSystem directly
    if (currentFolderId) {
      console.log('In folder mode, returning fileSystem directly:', fileSystem);
      return fileSystem;
    }
    
    // If we're at root, return the fileSystem
    if (currentPath === '/') {
      console.log('At root, returning fileSystem:', fileSystem);
      return fileSystem;
    }
    
    // This case should not happen with the current logic, but keeping it for safety
    const currentFolder = findItemByPath(currentPath);
    console.log('Current folder found:', currentFolder);
    
    if (currentFolder && 'children' in currentFolder) {
      console.log('Returning folder children:', currentFolder.children);
      return currentFolder.children || [];
    }
    
    console.log('No folder found or no children, returning empty array');
    return [];
  };

  const getBreadcrumbItems = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const items = [
      {
        title: (
          <HomeOutlined 
            style={{ 
              cursor: 'pointer', 
              color: '#1890ff', 
              fontSize: '16px',
              transition: 'all 0.2s ease',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff';
              e.currentTarget.style.color = '#096dd9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1890ff';
            }}
          />
        ),
        onClick: () => {
          setCurrentPath('/');
          setCurrentFolderId(undefined);
        },
      },
    ];

    let accumulatedPath = '';
    pathParts.forEach((part) => {
      accumulatedPath += `/${part}`;
      
      items.push({
        title: (
          <span 
            style={{ 
              cursor: 'pointer', 
              color: '#1890ff',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff';
              e.currentTarget.style.color = '#096dd9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1890ff';
            }}
          >
            {part}
          </span>
        ),
        onClick: () => {
          setCurrentPath(accumulatedPath);
          
          // Find the folder ID for this path
          const targetFolder = findItemByPath(accumulatedPath);
          if (targetFolder && 'children' in targetFolder) {
            setCurrentFolderId(targetFolder.id);
          } else {
            setCurrentFolderId(undefined);
          }
        },
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

  const getFileIconLarge = (item: FileItem | FolderItem) => {
    if ('children' in item) {
      return <FolderOutlined style={{ color: '#1890ff' }} />;
    }

    const fileItem = item as FileItem;
    if (fileItem.type.includes('pdf')) {
      return <FileOutlined style={{ color: '#ff4d4f' }} />;
    } else if (fileItem.type.includes('image')) {
      return <FileOutlined style={{ color: '#52c41a' }} />;
    } else if (fileItem.type.includes('spreadsheet') || fileItem.type.includes('excel')) {
      return <FileOutlined style={{ color: '#389e0d' }} />;
    } else if (fileItem.type.includes('document') || fileItem.type.includes('word')) {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    } else {
      return <FileOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  // Event handlers
  const handleFolderDoubleClick = (folderPath: string) => {
    setCurrentPath(folderPath);
    // Find the folder by path to get its ID
    const folder = findItemByPath(folderPath);
    if (folder && 'children' in folder) {
      setCurrentFolderId(folder.id);
    }
  };

  const handleCreateFolder = async (values: any) => {
    try {
      setLoading(true);
      
      const folderData: any = {
        name: values.name,
        description: values.description,
      };
      
      // Add parentId based on current folder context
      if (currentFolderId) {
        folderData.parentId = currentFolderId;
      }
      
      // Create folder in library
      const response = await libraryFileService.createFolder(libraryId, folderData);
      
      message.success('Folder created successfully');
      setCreateFolderModalVisible(false);
      createFolderForm.resetFields();
      
      // Reload data to show new folder
      await loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
      message.error('Failed to create folder');
    } finally {
      setLoading(false);
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

    try {
      // Upload files one by one with progress
      for (const fileItem of fileList) {
        const file = fileItem.originFileObj || fileItem;
        
        if (!file || !(file instanceof File)) {
          console.error('Invalid file object:', file);
          continue;
        }
        
        // Update progress to show uploading
        setUploadProgress(prev => 
          prev.map(p => p.id === fileItem.uid ? { ...p, progress: 50 } : p)
        );
        
        // Get parent folder ID if we're in a specific folder
        let folderId: string | undefined;
        if (currentFolderId) {
          folderId = currentFolderId;
        }
        
        // Upload file to library
        console.log('Uploading file to library:', { libraryId, folderId, fileName: file.name });
        const response = await libraryFileService.uploadFile(libraryId, { file, folderId, description: '' });
        console.log('Upload response:', response);
        
        // Update progress to complete
        setUploadProgress(prev => 
          prev.map(p => p.id === fileItem.uid ? { ...p, progress: 100, status: 'success' } : p)
        );
      }

      // Clear progress and close modal after short delay
      setTimeout(async () => {
        setUploadProgress([]);
        setUploadModalVisible(false);
        message.success('Files uploaded successfully');
        
        console.log('Reloading data after upload...');
        // Reload data to show new files
        await loadData();
        console.log('Data reloaded after upload');
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Failed to upload files');
      
      // Mark all as failed
      setUploadProgress(prev => 
        prev.map(p => ({ ...p, status: 'error' as const }))
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setLoading(true);
      
      // Find the item in current folder contents or globally
      let item = getCurrentFolderContents().find(item => item.id === itemId);
      if (!item) {
        // If not found in current folder, search globally
        item = fileSystem.find(item => item.id === itemId);
      }
      
      if (!item) {
        message.error('Item not found');
        return;
      }
      
      if ('children' in item) {
        // Delete folder from library
        await libraryFileService.deleteFolder(libraryId, itemId);
      } else {
        // Delete file from library
        await libraryFileService.deleteFile(libraryId, itemId);
      }
      
      message.success('Item deleted successfully');
      
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameItem = async (values: any) => {
    try {
      setLoading(true);
      
      const itemId = renameForm.getFieldValue('itemId');
      const newName = values.name;
      
      // Search for the item in the entire fileSystem recursively
      const findItemRecursively = (items: (FileItem | FolderItem)[], targetId: string): FileItem | FolderItem | null => {
        for (const item of items) {
          if (item.id === targetId) {
            return item;
          }
          if ('children' in item && item.children) {
            const found = findItemRecursively(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      
      const item = findItemRecursively(fileSystem, itemId);
      
      if (!item) {
        message.error('Item not found');
        return;
      }
      
      if ('children' in item) {
        // Rename folder in library
        await libraryFileService.renameFolder(libraryId, itemId, { name: newName });
      } else {
        // Rename file in library
        await libraryFileService.renameFile(libraryId, itemId, { name: newName });
      }
      
      message.success('Item renamed successfully');
      setRenameModalVisible(false);
      renameForm.resetFields();
      
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error renaming item:', error);
      message.error('Failed to rename item');
    } finally {
      setLoading(false);
    }
  };

  const showRenameModal = (item: FileItem | FolderItem) => {
    renameForm.setFieldsValue({
      itemId: item.id,
      name: item.name
    });
    setRenameModalVisible(true);
  };

  // View mode components
  const renderListView = () => {
    const items = sortItems(getCurrentFolderContents());
    
    const columns = [
      {
        title: t('files.name'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: FileItem | FolderItem) => (
          <Space>
            {getFileIcon(record)}
            <span
              style={{ cursor: 'children' in record ? 'pointer' : 'default' }}
              onClick={() => {
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
        title: t('files.size'),
        dataIndex: 'size',
        key: 'size',
        render: (size: number, record: FileItem | FolderItem) => 
          'size' in record ? formatFileSize(size) : '—',
      },
      {
        title: t('files.modified'),
        dataIndex: 'uploadedAt',
        key: 'modified',
        render: (date: Date, record: FileItem | FolderItem) => {
          const modDate = 'uploadedAt' in record ? record.uploadedAt : record.createdAt;
          return new Date(modDate).toLocaleDateString();
        },
      },
      {
        title: t('files.actions'),
        key: 'actions',
        render: (record: FileItem | FolderItem) => (
          <Space>
            {!('children' in record) && (
              <Tooltip title={t('files.download')}>
                <a
                  href={(record as FileItem).url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open((record as FileItem).url, '_blank');
                  }}
                  style={{ 
                    fontSize: '16px', 
                    color: '#52c41a',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <DownloadOutlined />
                </a>
              </Tooltip>
            )}
            {canWrite && (
              <Tooltip title={t('files.rename')}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => showRenameModal(record)}
                />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title={t('files.delete')}>
                <Popconfirm
                  title={t('files.deleteConfirm')}
                  onConfirm={() => handleDeleteItem(record.id)}
                  okText={t('common.yes')}
                  cancelText={t('common.no')}
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    if (items.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <FolderOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <div>{t('files.noFilesFound')}</div>

          {canWrite && (
            <div style={{ marginTop: '16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateFolderModalVisible(true)}>
                {t('files.createFolder')}
              </Button>
            </div>
          )}
        </div>
      );
    }

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
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              size="default"
              style={{ 
                textAlign: 'center', 
                minHeight: '160px',
                transition: 'all 0.3s ease',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              bodyStyle={{ 
                padding: '20px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                if ('children' in item) {
                  handleFolderDoubleClick(item.path);
                }
              }}
              actions={[
                // File actions for files only
                !('children' in item) && (
                  <Tooltip title={t('files.download')}>
                    <a
                      href={(item as FileItem).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open((item as FileItem).url, '_blank');
                      }}
                      style={{ 
                        fontSize: '18px', 
                        color: '#52c41a',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <DownloadOutlined />
                    </a>
                  </Tooltip>
                ),
                canWrite && (
                  <Tooltip title={t('files.rename')}>
                    <EditOutlined 
                      style={{ 
                        fontSize: '18px', 
                        color: '#1890ff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showRenameModal(item);
                      }}
                    />
                  </Tooltip>
                ),
                canDelete && (
                  <Tooltip title={t('files.delete')}>
                    <Popconfirm
                      title={t('files.deleteConfirm')}
                      onConfirm={() => handleDeleteItem(item.id)}
                      okText={t('common.yes')}
                      cancelText={t('common.no')}
                    >
                      <DeleteOutlined 
                        style={{ 
                          fontSize: '18px',
                          color: '#ff4d4f',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </Tooltip>
                )
              ].filter(Boolean)}
            >
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {getFileIconLarge(item)}
              </div>
              <Text ellipsis title={item.name} style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {item.name}
              </Text>
              {'size' in item && (
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
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

  const renderContent = () => {
    switch (viewMode) {
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
              {libraryName}
            </Title>
          </Col>
          <Col>
            <Space>
              {/* View Mode Selector */}
              <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <Radio.Button value="list">
                  <UnorderedListOutlined /> {t('files.list')}
                </Radio.Button>
                <Radio.Button value="grid">
                  <AppstoreOutlined /> {t('files.grid')}
                </Radio.Button>
              </Radio.Group>

              {/* Sort Controls */}
              <Select value={sortBy} onChange={setSortBy} style={{ width: 100 }}>
                <Select.Option value="name">{t('files.sortByName')}</Select.Option>
                <Select.Option value="date">{t('files.sortByDate')}</Select.Option>
                <Select.Option value="size">{t('files.sortBySize')}</Select.Option>
                <Select.Option value="type">{t('files.sortByType')}</Select.Option>
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
                    {t('files.newFolder')}
                  </Button>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => setUploadModalVisible(true)}
                  >
                    {t('files.upload')}
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Breadcrumb for navigation */}
        <Breadcrumb 
          items={getBreadcrumbItems()} 
          style={{ 
            marginBottom: 16,
            padding: '12px 16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #f0f0f0'
          }} 
        />

        {/* Main Content */}
        {renderContent()}

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <Card title={t('files.uploadProgress')} style={{ marginTop: 16 }}>
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
        title={currentPath !== '/' ? `${t('files.createFolderIn')} ${currentPath.split('/').pop()}` : t('files.createNewFolder')}
        open={createFolderModalVisible}
        onCancel={() => setCreateFolderModalVisible(false)}
        footer={null}
      >
        <Form form={createFolderForm} onFinish={handleCreateFolder} layout="vertical">
          <Form.Item
            name="name"
            label={t('files.folderName')}
            rules={[{ required: true, message: t('files.enterFolderName') }]}
          >
            <Input placeholder={t('files.enterFolderName')} />
          </Form.Item>
          <Form.Item name="description" label={t('files.description')}>
            <TextArea rows={3} placeholder={t('files.optionalDescription')} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('files.createFolder')}
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
          <p className="ant-upload-text">{t('files.uploadDragText')}</p>
          <p className="ant-upload-hint">
            {t('files.uploadHint')}
          </p>
        </Upload.Dragger>
      </Modal>

      {/* Rename Modal */}
      <Modal
        title={t('files.renameItem')}
        open={renameModalVisible}
        onCancel={() => setRenameModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={renameForm}
          layout="vertical"
          onFinish={handleRenameItem}
        >
          <Form.Item name="itemId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('files.newName')}
            rules={[{ required: true, message: t('files.enterName') }]}
          >
            <Input placeholder={t('files.enterNewName')} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('files.rename')}
              </Button>
              <Button onClick={() => setRenameModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LibraryFileManager;
