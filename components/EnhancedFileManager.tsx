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
import { fileService, Folder, File as FileType } from '@/lib/services/fileService';
import { userService } from '@/lib/services/userService';

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
  totalChunks?: number;
  uploadedChunks?: number;
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
     const [currentPath, setCurrentPath] = useState('/');
   const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
   const [selectedItems, setSelectedItems] = useState<string[]>([]);
   const [fileSystem, setFileSystem] = useState<(FileItem | FolderItem)[]>([]);
   const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
   const [loading, setLoading] = useState(false);
  
  // Modals
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);
  
  // Forms
  const [createFolderForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const uploadRef = useRef<any>(null);
  
  const { user } = useUser();
  const { t } = useTranslation();

    // Helper function to convert backend data to frontend format
  const convertToFileSystem = (folders: Folder[], files: FileType[]): (FileItem | FolderItem)[] => {
    const result: (FileItem | FolderItem)[] = [];
    
    // Build complete folder hierarchy
    const buildFolderTree = (parentId: string | null): (FileItem | FolderItem)[] => {
      const children: (FileItem | FolderItem)[] = [];
      
      // Find all folders with this parentId
      const childFolders = folders.filter(folder => folder.parentId === parentId);
      
      childFolders.forEach(folder => {
        const folderItem: FolderItem = {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          parentId: folder.parentId,
          libraryId: libraryId || 'default',
          createdBy: user as any,
          createdAt: new Date(folder.createdAt),
          path: parentId ? `/${folder.name}` : `/${folder.name}`, // Will be updated with full path
          children: buildFolderTree(folder.id), // Recursively build children
          permissions: [],
        };
        children.push(folderItem);
      });
      
      // Find all files with this parentId
      const childFiles = files.filter(file => file.folderId === parentId);
      
      childFiles.forEach(file => {
        const fileItem: FileItem = {
          id: file.id,
          name: file.name,
          description: file.description,
          size: file.size,
          type: file.mimeType || file.type || 'application/octet-stream',
          url: file.url,
          libraryId: libraryId || 'default',
          uploadedBy: user as any,
          uploadedAt: new Date(file.updatedAt),
          parentFolderId: file.folderId,
          path: `/${file.name}`, // Will be updated with full path
          isFolder: false,
          permissions: [],
        };
        children.push(fileItem);
      });
      
      return children;
    };
    
    // Build the complete tree starting from root (parentId: null)
    const rootItems = buildFolderTree(null);
    
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
    
    return rootItems;
  };

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // For user files mode, get user-specific data
      if (mode === 'user-files' && userId) {
        // Get user's folders and files from dedicated endpoint
        const userFilesData = await userService.getUserFiles(userId);
        
        // Convert the response to our expected format
        const userFolders = userFilesData?.folders || [];
        const userFiles = userFilesData?.files || [];
        
        const convertedData = convertToFileSystem(userFolders, userFiles);
        setFileSystem(convertedData);
      } else {
        // For other modes, get all public or library data
        const foldersResponse = await fileService.getAllFolders();
        const filesResponse = await fileService.getAllFiles();
        
        // Handle different response formats
        const folders = Array.isArray(foldersResponse) ? foldersResponse : foldersResponse.folders || [];
        const files = Array.isArray(filesResponse) ? filesResponse : filesResponse.files || [];
        
        const convertedData = convertToFileSystem(folders, files);
        setFileSystem(convertedData);
      }
    } catch (error) {
      console.error('Error loading file data:', error);
      message.error('Failed to load files and folders');
    } finally {
      setLoading(false);
    }
  }, [mode, userId]);

           // Load data on component mount and when key dependencies change
    useEffect(() => {
      loadData();
      // Reset folder context when mode or user changes
      setCurrentPath('/');
      setCurrentFolderId(undefined);
    }, [mode, userId, libraryId, loadData]); // Include loadData back since it's wrapped in useCallback

    // Monitor path changes for debugging
    useEffect(() => {
      console.log('🔍 Path changed to:', currentPath);
      console.log('🔍 Current folder ID:', currentFolderId);
    }, [currentPath, currentFolderId]);

  // Helper functions
  const findItemByPath = (path: string, items: (FileItem | FolderItem)[] = fileSystem): FileItem | FolderItem | null => {
    // Handle root path
    if (path === '/' || path === '') {
      return null; // Root doesn't have a specific item
    }
    
    const pathParts = path.split('/').filter(Boolean);
    
    // Navigate through the path parts to find the target item
    let currentItems = items;
    let targetItem: FileItem | FolderItem | null = null;
    
    for (let i = 0; i < pathParts.length; i++) {
      const partName = pathParts[i];
      targetItem = currentItems.find(item => item.name === partName) || null;
      
      if (!targetItem) {
        console.log('🔍 findItemByPath: Could not find part:', partName, 'in current items');
        return null;
      }
      
      if (i < pathParts.length - 1) {
        // Not the last part, so we need to go deeper
        if ('children' in targetItem && targetItem.children) {
          currentItems = targetItem.children;
        } else {
          console.log('🔍 findItemByPath: Part is not a folder:', partName);
          return null;
        }
      }
    }
    
    console.log('🔍 findItemByPath: Found item for path:', path, 'Item:', targetItem?.name);
    return targetItem;
  };

     const getCurrentFolderContents = (): (FileItem | FolderItem)[] => {
     if (currentPath === '/') {
       console.log('🔍 getCurrentFolderContents: Root path, returning fileSystem:', fileSystem.length, 'items');
       return fileSystem;
     }
     
     const currentFolder = findItemByPath(currentPath);
     console.log('🔍 getCurrentFolderContents: Current path:', currentPath, 'Found folder:', currentFolder ? currentFolder.name : 'Not found');
     
     if (currentFolder && 'children' in currentFolder) {
       const children = currentFolder.children || [];
       console.log('🔍 getCurrentFolderContents: Returning', children.length, 'children from folder:', currentFolder.name);
       return children;
     }
     
     console.log('🔍 getCurrentFolderContents: No children found, returning empty array');
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
             console.log('🔍 Breadcrumb: Going to root');
             setCurrentPath('/');
             setCurrentFolderId(undefined);
           },
         },
       ];

       let accumulatedPath = '';
       pathParts.forEach((part, index) => {
         accumulatedPath += `/${part}`;
         
         // Simplified folder finding - just navigate to the path
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
             console.log('🔍 Breadcrumb clicked:', accumulatedPath);
             console.log('🔍 Current path before change:', currentPath);
             console.log('🔍 Setting new path to:', accumulatedPath);
             
             // Update the current path and folder ID
             setCurrentPath(accumulatedPath);
             
             // Find the folder ID for this path
             const targetFolder = findItemByPath(accumulatedPath);
             if (targetFolder && 'children' in targetFolder) {
               setCurrentFolderId(targetFolder.id);
               console.log('🔍 Found folder ID:', targetFolder.id);
             } else {
               setCurrentFolderId(undefined);
               console.log('🔍 No folder ID found, setting to undefined');
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
     console.log('📁 Double-clicked folder path:', folderPath);
     console.log('📁 Current path before change:', currentPath);
     setCurrentPath(folderPath);
     // Find the folder by path to get its ID
     const folder = findItemByPath(folderPath);
     if (folder && 'children' in folder) {
       setCurrentFolderId(folder.id);
       console.log('📁 Entered folder:', folder.name, 'ID:', folder.id);
     } else {
       console.log('📁 Folder not found or not a folder:', folder);
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
         console.log('📁 Creating folder inside folder ID:', currentFolderId);
       }
      
      let response;
      if (mode === 'user-files' && userId) {
        // Create folder for specific user
        response = await userService.createFolderForUser(userId, folderData);
      } else {
        // Create folder for current user
        response = await fileService.createFolder(folderData);
      }
      
      message.success(response.message || 'Folder created successfully');
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
      totalChunks: file.originFileObj?.size > 5 * 1024 * 1024 ? Math.ceil(file.originFileObj.size / (5 * 1024 * 1024)) : undefined,
      uploadedChunks: 0,
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
        console.log('🔍 Current path:', currentPath);
        console.log('🔍 Current folder ID:', currentFolderId);
        if (currentFolderId) {
          folderId = currentFolderId;
          console.log('📁 Uploading to folder ID:', folderId);
        } else {
          console.log('📁 Uploading to root folder');
        }
        
        let response;
        if (mode === 'user-files' && userId) {
          // Upload file for specific user using chunked upload for large files
          console.log('🚀 Frontend: Uploading file for user:', userId, 'with folderId:', folderId);
          
          // Use chunked upload for files larger than 5MB
          if (file.size > 5 * 1024 * 1024) {
            const totalChunks = Math.ceil(file.size / (5 * 1024 * 1024));
            response = await userService.uploadLargeFileForUser(userId, file, folderId, (progress) => {
              // Update progress for this file
              setUploadProgress(prev => 
                prev.map(p => p.id === fileItem.uid ? { 
                  ...p, 
                  progress: Math.round(progress),
                  uploadedChunks: Math.round((progress / 100) * totalChunks)
                } : p)
              );
            });
          } else {
            // Use standard upload for small files
            response = await userService.uploadFileForUser(userId, file, folderId, (progress) => {
              // Update progress for this file
              setUploadProgress(prev => 
                prev.map(p => p.id === fileItem.uid ? { 
                  ...p, 
                  progress: Math.round(progress),
                  uploadedChunks: 1 // Single chunk for small files
                } : p)
              );
            });
          }
        } else {
          // Upload to backend with folder context and progress tracking
          console.log('🚀 Frontend: Uploading file with folderId:', folderId);
          const totalChunks = file.size > 5 * 1024 * 1024 ? Math.ceil(file.size / (5 * 1024 * 1024)) : 1;
          response = await fileService.uploadLargeFile(
            file, 
            folderId,
            (progress) => {
              // Update progress for this file
              setUploadProgress(prev => 
                prev.map(p => p.id === fileItem.uid ? { 
                  ...p, 
                  progress: Math.round(progress),
                  uploadedChunks: Math.round((progress / 100) * totalChunks)
                } : p)
              );
            }
          );
        }
        console.log('🚀 Frontend: Upload response:', response);
        
        // Update progress to complete
        setUploadProgress(prev => 
          prev.map(p => p.id === fileItem.uid ? { ...p, progress: 100, status: 'success' } : p)
        );
      }

      // Clear progress and close modal after short delay
      setTimeout(async () => {
        setUploadProgress([]);
        setUploadModalVisible(false);
        // Reset the file input
        if (uploadRef.current) {
          uploadRef.current.fileList = [];
        }
        
        // Reload data to show new files
        await loadData();
      }, 1000);
      
      message.success(`${fileList.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Failed to upload files');
      
      // Update progress to error for failed uploads
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
         await fileService.deleteFolder(itemId);
       } else {
         await fileService.deleteFile(itemId);
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
        
        console.log('🔍 Rename: Looking for item ID:', itemId);
        console.log('🔍 Rename: Current path:', currentPath);
        console.log('🔍 Rename: Current folder ID:', currentFolderId);
        
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
          console.log('🔍 Rename: Item not found anywhere in fileSystem');
          message.error('Item not found');
          return;
        }
        
        console.log('🔍 Rename: Found item:', { id: item.id, name: item.name, isFolder: 'children' in item });
        
        if ('children' in item) {
          await fileService.renameFolder(itemId, { name: newName });
        } else {
          await fileService.renameFile(itemId, { name: newName });
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
    console.log('🔍 ShowRenameModal: Item to rename:', { id: item.id, name: item.name, isFolder: 'children' in item });
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
            {/* <Tooltip title="View">
              <Button type="text" size="small" icon={<EyeOutlined />} />
            </Tooltip> */}
                                                                                                       {!('children' in record) && (
                 <>
                   {/* <Tooltip title="View">
                     <a
                       href={(record as FileItem).url}
                       target="_blank"
                       rel="noopener noreferrer"
                       onClick={(e) => {
                         e.preventDefault();
                         // Open in new tab for viewing
                         window.open((record as FileItem).url, '_blank');
                       }}
                       style={{ 
                         fontSize: '16px', 
                         color: '#1890ff',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease'
                       }}
                     >
                       <EyeOutlined />
                     </a>
                   </Tooltip> */}
                                       <Tooltip title={t('files.download')}>
                      <a
                        href={(record as FileItem).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Open in new tab for downloading
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
                 </>
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
                     <>
                                               {/* <Tooltip title={t('files.view')}>
                          <a
                            href={(item as FileItem).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              // Open in new tab for viewing
                              window.open((item as FileItem).url, '_blank');
                            }}
                            style={{ 
                              fontSize: '18px', 
                              color: '#1890ff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EyeOutlined />
                          </a>
                        </Tooltip> */}
                                               <Tooltip title={t('files.download')}>
                          <a
                            href={(item as FileItem).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              // Open in new tab for downloading
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
                     </>
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

  const renderTreeView = () => {
    const treeData = prepareTreeData(fileSystem);

    return (
      <Tree
        showIcon
        expandedKeys={expandedKeys}
        onExpand={(expandedKeys: React.Key[]) => setExpandedKeys(expandedKeys.map(key => String(key)))}
        treeData={treeData}
        onSelect={(selectedKeys, { node }) => {
          if (selectedKeys.length > 0 && node.item) {
            if ('children' in node.item) {
              // It's a folder - navigate to it
              setCurrentPath(node.item.path);
            } else {
              // It's a file - could show preview or download
              console.log('File selected:', node.item.name);
            }
          }
        }}
        titleRender={(node) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>{node.title}</span>
            {node.item && (
              <Space size="small">
                {/* File actions for files only */}
                {!('children' in node.item) && (
                  <>
                                         {/* <Tooltip title={t('files.view')}>
                       <a
                         href={(node.item as FileItem).url}
                         target="_blank"
                         rel="noopener noreferrer"
                         onClick={(e) => {
                           e.stopPropagation();
                           e.preventDefault();
                           // Open in new tab for viewing
                           window.open((node.item as FileItem).url, '_blank');
                         }}
                         style={{ 
                           fontSize: '14px', 
                           color: '#1890ff',
                           cursor: 'pointer',
                           transition: 'all 0.2s ease'
                         }}
                       >
                         <EyeOutlined />
                       </a>
                     </Tooltip> */}
                     <Tooltip title={t('files.download')}>
                       <a
                         href={(node.item as FileItem).url}
                         target="_blank"
                         rel="noopener noreferrer"
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           // Open in new tab for downloading
                           window.open((node.item as FileItem).url, '_blank');
                         }}
                         style={{ 
                           fontSize: '14px', 
                           color: '#52c41a',
                           cursor: 'pointer',
                           transition: 'all 0.2s ease'
                         }}
                       >
                         <DownloadOutlined />
                       </a>
                     </Tooltip>
                  </>
                )}
                                 {canWrite && (
                   <Tooltip title={t('files.rename')}>
                     <Button 
                       type="text" 
                       size="small" 
                       icon={<EditOutlined />} 
                       onClick={(e) => {
                         e.stopPropagation();
                         showRenameModal(node.item);
                       }}
                     />
                   </Tooltip>
                 )}
                 {canDelete && (
                                     <Popconfirm
                     title={t('files.deleteConfirm')}
                     onConfirm={(e) => {
                       e?.stopPropagation();
                       handleDeleteItem(node.item.id);
                     }}
                     okText={t('common.yes')}
                     cancelText={t('common.no')}
                   >
                    <Button 
                      type="text" 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                )}
              </Space>
            )}
          </div>
        )}
      />
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView();
      case 'tree':
        return renderTreeView();
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
               {title || `${mode === 'documents' ? t('files.documents') : mode === 'user-files' ? t('files.userFiles') : libraryName}`}
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
                  {/* <Radio.Button value="tree">
                    <PartitionOutlined /> Tree
                  </Radio.Button> */}
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
                   {/* Show chunk information for large files */}
                   {item.totalChunks && item.totalChunks > 1 && (
                     <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                       Chunk {item.uploadedChunks || 0} of {item.totalChunks} 
                       ({Math.round(((item.uploadedChunks || 0) / item.totalChunks) * 100)}%)
                     </div>
                   )}
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
           {currentPath !== '/' && (
             <Form.Item name="parentId" hidden>
               <Input value={currentPath} />
             </Form.Item>
           )}
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
           // Reset the file input when modal is closed
           if (uploadRef.current) {
             uploadRef.current.fileList = [];
           }
         }}
         footer={null}
         width={600}
       >
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
           <p className="ant-upload-hint" style={{ fontSize: '12px', color: '#666' }}>
             Large files (>5MB) will be uploaded in chunks for reliability
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

export default EnhancedFileManager;
