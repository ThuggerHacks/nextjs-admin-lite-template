'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ShareAltOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { FileItem, FolderItem } from '@/types';
import { libraryFileService, LibraryFolder, LibraryFile } from '@/lib/services/libraryFileService';
import CrossSucursalShare from './CrossSucursalShare';

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
  const [completeFileSystem, setCompleteFileSystem] = useState<(FileItem | FolderItem)[]>([]); // Store complete tree
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modals
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [crossSucursalShareModalVisible, setCrossSucursalShareModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);
  const [selectedFileToShare, setSelectedFileToShare] = useState<LibraryFile | null>(null);
  const [sharesModalVisible, setSharesModalVisible] = useState(false);
     const [selectedFileShares, setSelectedFileShares] = useState<any[]>([]);
   const [sharesLoading, setSharesLoading] = useState(false);
   const [selectedFileForShares, setSelectedFileForShares] = useState<LibraryFile | null>(null);
  
  // Forms
  const [createFolderForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const uploadRef = useRef<any>(null);
  
  const { user } = useUser();
  const { t } = useTranslation();

  // Helper function to convert backend data to frontend format
  const convertToFileSystem = (folders: LibraryFolder[], files: LibraryFile[]): (FileItem | FolderItem)[] => {
    console.log('Converting backend data:', { folders, files, currentFolderId });
    console.log('Current path:', currentPath);
    
    // Always build complete folder hierarchy for navigation
    console.log('Building complete tree for navigation');
    
    // Create maps for quick lookup
    const folderMap = new Map<string, LibraryFolder>();
    const fileMap = new Map<string, LibraryFile[]>();
    
    folders.forEach(folder => folderMap.set(folder.id, folder));
    
    // Group files by folderId for efficient lookup
    files.forEach(file => {
      const folderId = file.folderId || 'root';
      if (!fileMap.has(folderId)) {
        fileMap.set(folderId, []);
      }
      fileMap.get(folderId)!.push(file);
    });
    
    const buildFolderTree = (parentId: string | null): (FileItem | FolderItem)[] => {
      const children: (FileItem | FolderItem)[] = [];
      
      // Find all folders with this parentId
      const childFolders = folders.filter(folder => folder.parentId === parentId);
      console.log(`Building tree for parentId ${parentId}:`, { childFolders });
      
      childFolders.forEach(folder => {
        // Recursively build children for this folder
        const folderChildren = buildFolderTree(folder.id);
        
        const folderItem: FolderItem = {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          parentId: folder.parentId,
          libraryId: libraryId,
          createdBy: folder.user || { id: folder.userId, name: folder.user?.name || 'Unknown', email: folder.user?.email || 'unknown@example.com', role: 'USER' as any, status: 'ACTIVE' as any, createdAt: new Date() },
          createdAt: new Date(folder.createdAt),
          path: '', // Will be set later
          children: folderChildren, // Use the recursively built children
          permissions: [],
        };
        children.push(folderItem);
      });
      
      // Find all files with this parentId
      const childFiles = fileMap.get(parentId || 'root') || [];
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
          uploadedBy: file.user || { id: file.userId, name: file.user?.name || 'Unknown', email: file.user?.email || 'unknown@example.com', role: 'USER' as any, status: 'ACTIVE' as any, createdAt: new Date() },
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
      
      console.log('=== LOAD DATA ===');
      console.log('Loading data for library:', libraryId, 'currentFolderId:', currentFolderId, 'currentPath:', currentPath);
      
      // Always load the complete tree for navigation purposes
      const completeLibraryData = await libraryFileService.getLibraryContent(libraryId, undefined);
      const completeFolders = completeLibraryData.folders || [];
      const completeFiles = completeLibraryData.files || [];
      
      console.log('Complete library data:', { folders: completeFolders.length, files: completeFiles.length });
      
      // Convert to complete tree structure
      const completeTree = convertToFileSystem(completeFolders, completeFiles);
      console.log('Complete tree built:', completeTree);
      setCompleteFileSystem(completeTree);
      
      // If we're in a specific folder, show only its direct contents
      if (currentFolderId) {
        console.log('Loading folder contents for folderId:', currentFolderId);
        
        // Get the folder contents directly from the API for the current folder
        const folderData = await libraryFileService.getLibraryContent(libraryId, currentFolderId);
        const folders = folderData.folders || [];
        const files = folderData.files || [];
        
        console.log('Folder contents:', { folders: folders.length, files: files.length });
        
        // Convert to file system format for the current folder
        const items: (FileItem | FolderItem)[] = [];
        
                 // Add folders in this folder
         folders.forEach(folder => {
           const folderItem: FolderItem = {
             id: folder.id,
             name: folder.name,
             description: folder.description,
             parentId: folder.parentId,
             libraryId: libraryId,
             createdBy: folder.user || { id: folder.userId, name: folder.user?.name || 'Unknown', email: folder.user?.email || 'unknown@example.com', role: 'USER' as any, status: 'ACTIVE' as any, createdAt: new Date() },
             createdAt: new Date(folder.createdAt),
             path: currentPath + `/${folder.name}`,
             children: [], // Empty children for display items
             permissions: [],
           };
           items.push(folderItem);
         });
         
         // Add files in this folder
         files.forEach(file => {
           const fileItem: FileItem = {
             id: file.id,
             name: file.name,
             description: file.description,
             size: file.size,
             type: file.mimeType || file.type || 'application/octet-stream',
             url: file.url,
             libraryId: libraryId,
             uploadedBy: file.user || { id: file.userId, name: file.user?.name || 'Unknown', email: file.user?.email || 'unknown@example.com', role: 'USER' as any, status: 'ACTIVE' as any, createdAt: new Date() },
             uploadedAt: new Date(file.updatedAt),
             parentFolderId: file.folderId,
             path: currentPath + `/${file.name}`,
             isFolder: false,
             permissions: [],
           };
           items.push(fileItem);
         });
        
        console.log('Setting fileSystem to folder items:', items);
        setFileSystem(items);
      } else {
        console.log('At root, setting fileSystem to complete tree');
        // At root, use the complete tree
        setFileSystem(completeTree);
      }
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
  }, [libraryId, currentFolderId]);

  // Reset folder context when library changes
  useEffect(() => {
    setCurrentPath('/');
    setCurrentFolderId(undefined);
  }, [libraryId]);

  // Helper functions
  const findItemByPath = (path: string, items: (FileItem | FolderItem)[] = completeFileSystem): FileItem | FolderItem | null => {
    console.log('=== findItemByPath ===');
    console.log('Searching for path:', path);
    console.log('Available items:', items);
    
    // Handle root path
    if (path === '/' || path === '') {
      console.log('Root path requested, returning null');
      return null;
    }
    
    const pathParts = path.split('/').filter(Boolean);
    console.log('Path parts:', pathParts);
    
    // Navigate through the path parts to find the target item
    let currentItems = items;
    let targetItem: FileItem | FolderItem | null = null;
    
    for (let i = 0; i < pathParts.length; i++) {
      const partName = pathParts[i];
      console.log(`Looking for part ${i}: "${partName}" in currentItems:`, currentItems.map(item => item.name));
      
      targetItem = currentItems.find(item => item.name === partName) || null;
      console.log(`Found item for "${partName}":`, targetItem);
      
      if (!targetItem) {
        console.log(`Item not found for "${partName}"`);
        return null;
      }
      
      if (i < pathParts.length - 1) {
        // Not the last part, so we need to go deeper
        if ('children' in targetItem && targetItem.children) {
          console.log(`Going deeper into children of "${partName}":`, targetItem.children);
          currentItems = targetItem.children;
        } else {
          console.log(`Cannot go deeper, "${partName}" has no children`);
          return null;
        }
      }
    }
    
    console.log('Final target item:', targetItem);
    return targetItem;
  };

  // Find item by ID in the complete file system
  const findItemById = (id: string, items: (FileItem | FolderItem)[] = completeFileSystem): FileItem | FolderItem | null => {
    console.log('=== findItemById ===');
    console.log('Searching for ID:', id);
    console.log('Searching in items count:', items.length);
    
    for (const item of items) {
      if (item.id === id) {
        console.log('Found item by ID:', item);
        return item;
      }
      if ('children' in item && item.children && item.children.length > 0) {
        console.log(`Searching in children of "${item.name}" (${item.children.length} children)`);
        const found = findItemById(id, item.children);
        if (found) return found;
      }
    }
    console.log('Item not found by ID:', id);
    return null;
  };

  const getCurrentFolderContents = (): (FileItem | FolderItem)[] => {
    console.log('=== getCurrentFolderContents called ===');
    console.log('currentPath:', currentPath);
    console.log('currentFolderId:', currentFolderId);
    console.log('fileSystem length:', fileSystem.length);
    console.log('fileSystem content:', fileSystem);
    
    // Always return the fileSystem - it's already filtered to show current folder contents
    return fileSystem;
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
          console.log('Navigating to root');
          setCurrentPath('/');
          setCurrentFolderId(undefined);
          // loadData will be called automatically by useEffect when currentFolderId changes
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
          console.log('Breadcrumb navigation to:', accumulatedPath);
          setCurrentPath(accumulatedPath);
          
          // Find the folder ID for this path using the complete file system
          const targetFolder = findItemByPath(accumulatedPath, completeFileSystem);
          if (targetFolder && 'children' in targetFolder) {
            console.log('Setting currentFolderId to:', targetFolder.id);
            setCurrentFolderId(targetFolder.id);
          } else {
            console.log('Setting currentFolderId to undefined (root)');
            setCurrentFolderId(undefined);
          }
          // loadData will be called automatically by useEffect when currentFolderId changes
        },
      });
    });

    return items;
  };

  const sortItems = (items: (FileItem | FolderItem)[]): (FileItem | FolderItem)[] => {
    // First filter by search term
    let filteredItems = items;
    if (searchTerm.trim()) {
      filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Then sort the filtered results
    const sorted = [...filteredItems].sort((a, b) => {
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
    console.log('=== FOLDER DOUBLE CLICK ===');
    console.log('Double-clicking folder:', folderPath);
    console.log('Current completeFileSystem:', completeFileSystem);
    console.log('Current currentFolderId:', currentFolderId);
    console.log('Current currentPath:', currentPath);
    
    // First try to find the folder by path
    let folder = findItemByPath(folderPath, completeFileSystem);
    
    // If path-based search fails, try to extract the folder name and search in current items
    if (!folder) {
      console.log('Path-based search failed, trying alternative approach...');
      const pathParts = folderPath.split('/').filter(Boolean);
      const folderName = pathParts[pathParts.length - 1]; // Get the last part (folder name)
      
      console.log('Looking for folder by name:', folderName);
      
      // Search in current fileSystem items by name
      const currentItem = fileSystem.find(item => item.name === folderName && 'children' in item);
      if (currentItem) {
        console.log('Found folder in current items by name:', currentItem);
        folder = currentItem;
      } else {
        console.log('Folder not found in current items, searching in completeFileSystem by name...');
        // Search recursively in completeFileSystem by name
        const searchByName = (items: (FileItem | FolderItem)[]): FileItem | FolderItem | null => {
          for (const item of items) {
            if (item.name === folderName && 'children' in item) {
              return item;
            }
            if ('children' in item && item.children && item.children.length > 0) {
              const found = searchByName(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        folder = searchByName(completeFileSystem);
        if (folder) {
          console.log('Found folder in completeFileSystem by name:', folder);
        }
      }
    }
    
    console.log('Final found folder:', folder);
    
    if (folder) {
      console.log('Folder has children:', 'children' in folder && folder.children);
      console.log('Folder children count:', 'children' in folder ? folder.children.length : 'N/A');
      
      if ('children' in folder) {
        console.log('Setting currentFolderId to:', folder.id);
        console.log('Setting currentPath to:', folderPath);
        setCurrentFolderId(folder.id);
        setCurrentPath(folderPath);
        // loadData will be called automatically by useEffect when currentFolderId changes
      } else {
        console.error('Item found but is not a folder:', folder);
      }
    } else {
      console.error('Folder not found for path:', folderPath);
      console.log('Available paths in completeFileSystem:', completeFileSystem.map(item => item.path));
      console.log('Current fileSystem items:', fileSystem.map(item => ({ name: item.name, path: item.path, isFolder: 'children' in item })));
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
        
        // Get parent folder ID if we're in a specific folder
        let folderId: string | undefined;
        if (currentFolderId) {
          folderId = currentFolderId;
          console.log('Uploading to folder ID:', folderId);
        } else {
          console.log('Uploading to root of library');
        }
        
        // Upload file to library with progress tracking
        console.log('Uploading file to library:', { libraryId, folderId, fileName: file.name, currentFolderId });
        
        const response = await libraryFileService.uploadLargeFile(
          libraryId, 
          { file, folderId, description: '' },
          (progress) => {
            // Update progress for this file
            setUploadProgress(prev => 
              prev.map(p => p.id === fileItem.uid ? { ...p, progress: Math.round(progress) } : p)
            );
          }
        );
        
        console.log('Upload response:', response);
        
        // Update progress to complete
        setUploadProgress(prev => 
          prev.map(p => p.id === fileItem.uid ? { ...p, progress: 100, status: 'success' } : p)
        );
      }

      // Show success message but keep modal open for user to see progress
      message.success('Files uploaded successfully');
      
      // Don't automatically close modal - let user click "Done" when ready
      // The modal will show the progress and "Done" button
      
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
      
      // First try to find the item in the current fileSystem (display items)
      let item = fileSystem.find(item => item.id === itemId);
      
      // If not found in current display, search in the complete file system recursively
      if (!item) {
        console.log('Item not found in current fileSystem, searching in completeFileSystem...');
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
        
        item = findItemRecursively(completeFileSystem, itemId);
      }
      
      if (!item) {
        console.error('Item not found anywhere for ID:', itemId);
        console.log('Current fileSystem items:', fileSystem.map(item => ({ id: item.id, name: item.name })));
        console.log('Complete file system count:', completeFileSystem.length);
        message.error('Item not found');
        return;
      }
      
      console.log('Found item to delete:', item);
      
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
      
      // First try to find the item in the current fileSystem (display items)
      let item = fileSystem.find(item => item.id === itemId);
      
      // If not found in current display, search in the complete file system recursively
      if (!item) {
        console.log('Item not found in current fileSystem, searching in completeFileSystem...');
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
        
        item = findItemRecursively(completeFileSystem, itemId);
      }
      
      if (!item) {
        console.error('Item not found anywhere for ID:', itemId);
        console.log('Current fileSystem items:', fileSystem.map(item => ({ id: item.id, name: item.name })));
        console.log('Complete file system count:', completeFileSystem.length);
        message.error('Item not found');
        return;
      }
      
      console.log('Found item to rename:', item);
      
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

     const handleViewShares = async (file: LibraryFile) => {
     try {
       setSharesLoading(true);
       setSelectedFileShares([]);
       setSelectedFileForShares(file);
       setSharesModalVisible(true);

       const result = await libraryFileService.getFileShares(libraryId, file.id);
       if (result.success && result.shares) {
         setSelectedFileShares(result.shares);
       } else {
         message.error(result.error || 'Failed to load file shares');
       }
     } catch (error) {
       console.error('Error loading file shares:', error);
       message.error('Failed to load file shares');
     } finally {
       setSharesLoading(false);
     }
   };

  // View mode components
  const renderListView = () => {
    const items = sortItems(getCurrentFolderContents());
    
    const columns = [
      {
        title: t('files.name'),
        dataIndex: 'name',
        key: 'name',
        responsive: ['md'],
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
        responsive: ['lg'],
        render: (size: number, record: FileItem | FolderItem) => 
          'size' in record ? formatFileSize(size) : '—',
      },
      {
        title: t('files.modified'),
        dataIndex: 'uploadedAt',
        key: 'modified',
        responsive: ['md'],
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
            {(user && ('createdBy' in record ? record.createdBy?.id === user.id : record.uploadedBy?.id === user.id)) && (
              <Tooltip title={t('files.rename')}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => showRenameModal(record)}
                />
              </Tooltip>
            )}
            {!('children' in record) && (
              <Tooltip title="Share File">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<ShareAltOutlined />} 
                  onClick={() => {
                    setSelectedFileToShare(record as LibraryFile);
                    setCrossSucursalShareModalVisible(true);
                  }}
                />
              </Tooltip>
            )}
                         {!('children' in record) && (
               <Tooltip title="View Shares">
                 <Button 
                   type="text" 
                   size="small" 
                   icon={<EyeOutlined />} 
                   onClick={() => {
                     handleViewShares(record as LibraryFile);
                   }}
                 />
               </Tooltip>
             )}
            {canDelete && (user && ('createdBy' in record ? record.createdBy?.id === user.id : record.uploadedBy?.id === user.id)) && (
              <Tooltip title={t('files.delete')}>
                <Popconfirm
                  title={t('files.deleteConfirm')}
                  description={t('files.deleteWarning')}
                  onConfirm={() => handleDeleteItem(record)}
                  okText={t('common.yes')}
                  cancelText={t('common.no')}
                >
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    icon={<DeleteOutlined />} 
                  />
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
      <>
        {/* Desktop view - Table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            size="small"
            loading={loading}
            rowSelection={{
              selectedRowKeys: selectedItems,
              onChange: (selectedRowKeys: React.Key[]) => setSelectedItems(selectedRowKeys.map(key => String(key))),
            }}
          />
        </div>

        {/* Mobile view - Cards */}
        <div className="md:hidden">
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} size="small" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        if ('children' in item) {
                          handleFolderDoubleClick(item.path);
                        }
                      }}
                    >
                      {getFileIcon(item)}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {'size' in item ? formatFileSize(item.size) : '—'} • {
                            new Date('uploadedAt' in item ? item.uploadedAt : item.createdAt).toLocaleDateString()
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                                     <div className="flex flex-row gap-2 ml-2">
                    {!('children' in item) && (
                      <Tooltip title={t('files.download')}>
                        <a
                          href={(item as FileItem).url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open((item as FileItem).url, '_blank');
                          }}
                          style={{ 
                            fontSize: '16px', 
                            color: '#52c41a',
                            cursor: 'pointer'
                          }}
                        >
                          <DownloadOutlined />
                        </a>
                      </Tooltip>
                    )}
                    {(user && ('createdBy' in item ? item.createdBy?.id === user.id : item.uploadedBy?.id === user.id)) && (
                      <Tooltip title={t('files.rename')}>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EditOutlined />} 
                          onClick={() => showRenameModal(item)}
                        />
                      </Tooltip>
                    )}
                    {!('children' in item) && (
                      <Tooltip title="Share File">
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<ShareAltOutlined />} 
                          onClick={() => {
                            setSelectedFileToShare(item as LibraryFile);
                            setCrossSucursalShareModalVisible(true);
                          }}
                        />
                      </Tooltip>
                    )}
                    {!('children' in item) && (
                      <Tooltip title="View Shares">
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EyeOutlined />} 
                          onClick={() => {
                            handleViewShares(item as LibraryFile);
                          }}
                        />
                      </Tooltip>
                    )}
                    {canDelete && (user && ('createdBy' in item ? item.createdBy?.id === user.id : item.uploadedBy?.id === user.id)) && (
                      <Tooltip title={t('files.delete')}>
                        <Popconfirm
                          title={t('files.deleteConfirm')}
                          description={t('files.deleteWarning')}
                          onConfirm={() => handleDeleteItem(item)}
                          okText={t('common.yes')}
                          cancelText={t('common.no')}
                        >
                          <Button 
                            type="text" 
                            size="small" 
                            danger
                            icon={<DeleteOutlined />} 
                          />
                        </Popconfirm>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </>
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
                (user && ('createdBy' in item ? item.createdBy?.id === user.id : item.uploadedBy?.id === user.id)) && (
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
                (canDelete || (user && ('createdBy' in item ? item.createdBy?.id === user.id : item.uploadedBy?.id === user.id))) && (
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
        <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Title level={4} style={{ margin: 0 }}>
              {libraryName}
            </Title>
          </Col>
                     <Col xs={24} md={16}>
             <div className="flex flex-col gap-3 items-end">
               {/* View Mode Selector */}
               <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} size="small">
                 <Radio.Button value="list">
                   <UnorderedListOutlined /> {t('files.list')}
                 </Radio.Button>
                 <Radio.Button value="grid">
                   <AppstoreOutlined /> {t('files.grid')}
                 </Radio.Button>
               </Radio.Group>

               {/* Search and Sort Controls */}
               <div className="flex flex-wrap gap-2 items-center justify-end">
                 <Input
                   placeholder={t('files.searchFiles')}
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   prefix={<SearchOutlined />}
                   allowClear
                   style={{ width: 200 }}
                   size="small"
                 />
                 
                 <Select value={sortBy} onChange={setSortBy} style={{ width: 120 }} size="small">
                   <Select.Option value="name">{t('files.sortByName')}</Select.Option>
                   <Select.Option value="date">{t('files.sortByDate')}</Select.Option>
                   <Select.Option value="size">{t('files.sortBySize')}</Select.Option>
                   <Select.Option value="type">{t('files.sortByType')}</Select.Option>
                 </Select>

                 <Button
                   icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                   onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                   size="small"
                 />

                 {canWrite && (
                   <>
                     <Button
                       type="primary"
                       icon={<FolderAddOutlined />}
                       onClick={() => setCreateFolderModalVisible(true)}
                       size="small"
                     >
                       {t('files.newFolder')}
                     </Button>
                     <Button
                       icon={<UploadOutlined />}
                       onClick={() => setUploadModalVisible(true)}
                       size="small"
                     >
                       {t('files.upload')}
                     </Button>
                   </>
                 )}
               </div>
             </div>
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
        onCancel={() => {
          setUploadModalVisible(false);
          setUploadProgress([]);
          // Reset the file input when modal is closed
          if (uploadRef.current) {
            uploadRef.current.fileList = [];
          }
        }}
        footer={null}
        width={600}
      >
        {uploadProgress.length === 0 ? (
          <Upload.Dragger
            ref={uploadRef}
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
        ) : (
          <div className="space-y-4">
            {/* Upload Progress List */}
            <div className="max-h-64 overflow-y-auto">
              {uploadProgress.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileOutlined className="text-blue-500" />
                      <span className="font-medium text-sm truncate max-w-48">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      )}
                      {item.status === 'success' && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-red-500 text-sm">✗</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <Progress
                    percent={item.progress}
                    size="small"
                    status={
                      item.status === 'error' ? 'exception' : 
                      item.status === 'success' ? 'success' : 'active'
                    }
                    strokeColor={
                      item.status === 'error' ? '#ff4d4f' : 
                      item.status === 'success' ? '#52c41a' : '#1890ff'
                    }
                  />
                  
                  {/* Status Text */}
                  <div className="text-xs text-gray-500 mt-1">
                    {item.status === 'uploading' && 'Uploading...'}
                    {item.status === 'success' && 'Upload completed'}
                    {item.status === 'error' && (
                      <span className="text-red-500">
                        Error: Upload failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                {uploadProgress.filter(item => item.status === 'success').length} of {uploadProgress.length} completed
              </div>
              <Space>
                {uploadProgress.some(item => item.status === 'error') && (
                  <Button 
                    onClick={() => setUploadProgress([])}
                    size="small"
                  >
                    Clear
                  </Button>
                )}
                {uploadProgress.every(item => item.status === 'success') && (
                  <Button 
                    type="primary"
                    onClick={() => {
                      setUploadModalVisible(false);
                      setUploadProgress([]);
                      loadData();
                    }}
                    size="small"
                  >
                    Done
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
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

             {/* Cross-Sucursal Share File Modal */}
       <Modal
         title={`${t('files.shareFileWithExternalSucursal')} - ${selectedFileToShare?.name || ''}`}
         open={crossSucursalShareModalVisible}
         onCancel={() => setCrossSucursalShareModalVisible(false)}
         footer={null}
         width={800}
       >
        {selectedFileToShare && (
          <CrossSucursalShare
            type="file"
            itemId={selectedFileToShare.id}
            itemName={selectedFileToShare.name}
            localShareableUsers={[]} // TODO: Get local users for file sharing
            fileData={selectedFileToShare}
            onSuccess={() => {
              setCrossSucursalShareModalVisible(false);
              setSelectedFileToShare(null);
              message.success(t('files.fileSharedSuccessfully'));
            }}
            onCancel={() => {
              setCrossSucursalShareModalVisible(false);
              setSelectedFileToShare(null);
            }}
          />
        )}
      </Modal>

             {/* File Shares Modal */}
       <Modal
         title={`${t('files.fileShares')} - ${selectedFileForShares?.name || 'Unknown File'}`}
        open={sharesModalVisible}
        onCancel={() => setSharesModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSharesModalVisible(false)}>
            {t('common.close')}
          </Button>
        ]}
        width="90%"
        style={{ maxWidth: 600 }}
        centered
      >
        {sharesLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            {t('files.loadingShares')}
          </div>
        ) : selectedFileShares.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            <EyeOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>{t('files.noSharesFound')}</div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>{t('files.fileSharedWith')} {selectedFileShares.length} {selectedFileShares.length === 1 ? 'user' : 'users'}:</Text>
            </div>
            {selectedFileShares.map((share, index) => (
              <Card 
                key={share.id} 
                size="small" 
                style={{ marginBottom: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                     <div>
                     <div><strong>{t('files.fileSharedWith')}:</strong> {share.sharedWith?.name} ({share.sharedWith?.email})</div>
                     <div><strong>{t('files.fileSharedBy')}:</strong> {share.sharedBy?.name} ({share.sharedBy?.email})</div>
                     <div><strong>{t('files.sucursal')}:</strong> {share.sharedBy?.sucursal?.name || user?.sucursal?.name || 'Current Sucursal'}</div>
                    {share.message && (
                      <div><strong>{t('files.message')}:</strong> {share.message}</div>
                    )}
                    <div><strong>{t('files.sharedAt')}:</strong> {new Date(share.sharedAt).toLocaleString()}</div>
                    {share.isRemoteShare && (
                      <div><strong>{t('files.remoteShare')}:</strong> {t('common.yes')}</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LibraryFileManager;
