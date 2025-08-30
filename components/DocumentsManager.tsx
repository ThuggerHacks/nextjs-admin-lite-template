'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { documentsService, DocumentItem, DocumentFilters } from '@/lib/services/documentsService';
import { useDocumentsSync } from '@/hooks/use-documents-sync';
import RichTextEditor from './RichTextEditor';
import { UserRole } from '@/types';
import { fileService, Folder, File as FileType } from '@/lib/services/fileService';
import { userService } from '@/lib/services/userService';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Search } = AntInput;

interface DocumentsManagerProps {
  mode: 'public' | 'department' | 'personal' | 'all';
  departmentId?: string;
  canWrite?: boolean;
  canDelete?: boolean;
  title?: string;
  onDocumentsChange?: () => void;
}

const DocumentsManager: React.FC<DocumentsManagerProps> = ({
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
  const uploadRef = useRef<any>(null);

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

  // Get sorted documents - OPTIMIZED
  const sortedDocuments = useMemo(() => {
    return sortDocuments(documents);
  }, [documents, sortDocuments]);

  // Handle multiple selection - OPTIMIZED
  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);

  // Handle select all - OPTIMIZED
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedDocuments.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [sortedDocuments]);

  // Check if all items are selected - OPTIMIZED
  const allSelected = useMemo(() => {
    return sortedDocuments.length > 0 && selectedItems.length === sortedDocuments.length;
  }, [sortedDocuments.length, selectedItems.length]);

  const someSelected = useMemo(() => {
    return selectedItems.length > 0 && selectedItems.length < sortedDocuments.length;
  }, [selectedItems.length, sortedDocuments.length]);

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      setLoading(true);
      for (const itemId of selectedItems) {
        await documentsService.deleteItem(itemId);
        // Find the item to determine its type
        const item = sortedDocuments.find(doc => doc.id === itemId);
        if (item) {
          deleteItem(itemId, item.type);
        }
      }
      setSelectedItems([]);
      message.success(`Successfully deleted ${selectedItems.length} items`);
    } catch (error) {
      console.error('Error deleting items:', error);
      message.error('Failed to delete some items');
    } finally {
      setLoading(false);
    }
  };

  // Bulk copy - IMPLEMENTED
  const handleBulkCopy = () => {
    if (selectedItems.length === 0) return;
    
    const items = sortedDocuments.filter(item => selectedItems.includes(item.id));
    
    // Store all selected items in clipboard for bulk copy operation
    console.log('Setting clipboard for bulk copy:', { action: 'copy', itemCount: items.length, firstItem: items[0]?.name });
    setClipboard({ action: 'copy', item: items[0], bulkItems: items });
    message.success(`${items.length} items copied to clipboard`);
    setSelectedItems([]);
  };





  // Handle bulk move to clipboard (like cut)
  const handleBulkMove = () => {
    if (selectedItems.length === 0) return;
    
    const items = sortedDocuments.filter(item => selectedItems.includes(item.id));
    
    // Store all selected items in clipboard for bulk move operation
    setClipboard({ action: 'cut', item: items[0], bulkItems: items });
    message.success(`${items.length} items cut to clipboard`);
    setSelectedItems([]);
  };

  // Check if user can edit item (owner check + Quill document check) - FIXED
  const canEditItem = (item: DocumentItem) => {
    // Only show edit button for Quill (RichTextEditor) HTML documents
    if (item.type === 'file') {
      const isQuillDocument = item.mimeType === 'text/html' && item.name.toLowerCase().endsWith('.html');
      if (!isQuillDocument) return false;
    } else {
      // Never show edit for folders or non-files
      return false;
    }

    // Always allow admins to edit Quill docs
    if (hasAdminAccess()) return true;
    // If user owns the Quill doc, allow edit
    if (item.userId === user?.id) return true;
    // Otherwise, only allow if canWrite is true
    if (!canWrite) return false;
    return true;
  };

  // Check if user can delete item (owner check) - FIXED
  const canDeleteItem = (item: DocumentItem) => {
    // Debug logging to see what's happening
    console.log('Delete permission check:', {
      itemId: item.id,
      itemName: item.name,
      itemUserId: item.userId,
      currentUserId: user?.id,
      hasAdminAccess: hasAdminAccess(),
      canDelete: canDelete,
      isOwner: item.userId === user?.id,
      mode: mode
    });
    
    // Always allow admins to delete
    if (hasAdminAccess()) {
      return true;
    }
    
    // If user owns the item, they can delete it (regardless of canDelete prop)
    if (item.userId === user?.id) {
      return true;
    }
    
    // For other cases, only allow if canDelete is true AND user has ownership
    // This ensures users can't delete items they don't own, even if canDelete is true
    return false;
  };

  // Check if user can rename item (owner check) - FIXED
  const canRenameItem = (item: DocumentItem) => {
    // Always allow admins to rename
    if (hasAdminAccess()) {
      return true;
    }
    
    // If user owns the item, they can rename it (regardless of canWrite prop)
    if (item.userId === user?.id) {
      return true;
    }
    
    // For other cases, respect the canWrite prop
    return canWrite;
  };

  // Check if user can move/copy item (owner check) - FIXED
  const canMoveCopyItem = (item: DocumentItem) => {
    // Only allow moving/copying if user owns the item OR has admin access
    if (!canWrite) return false;
    return item.userId === user?.id || hasAdminAccess();
  };

  // Check if user can view item (visibility check)
  const canViewItem = (item: DocumentItem) => {
    // Users can view all items, but some operations are restricted
    return true;
  };

  // Check if user has admin access
  const hasAdminAccess = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  };

  // Helper functions - OPTIMIZED
  const getFileIcon = useCallback((item: DocumentItem) => {
    if (item.type === 'folder') {
      return <FolderOutlined style={{ fontSize: '16px', color: '#1890ff' }} />;
    }
    
    // Determine icon based on file type
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

  const getFileType = useCallback((item: DocumentItem) => {
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

  // Load documents on component mount and when filters change - OPTIMIZED
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadDocuments();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [filters, currentFolderId]);

  // Update filters when external props change - OPTIMIZED
  useEffect(() => {
    setFilters(prev => {
      const newFilters = {
        type: mode,
        departmentId: departmentId,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };
      
      // Only update if filters actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      
      return prev;
    });
  }, [mode, departmentId, sortBy, sortOrder]);

  // Navigation functions - OPTIMIZED
  const navigateToFolder = useCallback((folderId: string | null, folderName?: string) => {
    if (folderId === currentFolderId) return;

    const newPath = folderId ? `${currentPath}${folderName}/` : '/';
    
    // Add to history
    const newHistory = [...folderHistory.slice(0, currentHistoryIndex + 1), currentFolderId || 'root'];
    setFolderHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length);
    
    setCurrentFolderId(folderId || undefined);
    setCurrentPath(newPath);
    
    // Clear selection when navigating
    setSelectedItems([]);
  }, [currentFolderId, currentPath, folderHistory, currentHistoryIndex]);

  const goBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousFolderId = folderHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setCurrentFolderId(previousFolderId === 'root' ? undefined : previousFolderId);
      
      // Recalculate path
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
      
      // Recalculate path
      const newHistory = folderHistory.slice(0, newIndex + 1);
      const newPath = newHistory.length === 0 ? '/' : `/${newHistory.map(id => {
        const item = documents.find(d => d.id === id);
        return item?.name || '';
      }).filter(Boolean).join('/')}/`;
      setCurrentPath(newPath);
    }
  }, [currentHistoryIndex, folderHistory, documents]);

  const handleCreateFolder = async (values: any) => {
    try {
      setLoading(true);
      const folderData: any = {
        name: values.name,
        description: values.description,
      };

      if (currentFolderId) {
        folderData.parentId = currentFolderId;
      }

      const result = await documentsService.createFolder(folderData);
      message.success(t('Folder created successfully'));
      
      // Send notification to everyone about new folder creation
      try {
        // This would typically call a notification service
        // For now, we'll use the sync system to notify other users
        createItem(result.id, 'folder');
        
        // Show a more prominent notification
        message.success({
          content: t('Folder "{{name}}" created successfully! All users have been notified.', { name: values.name }),
          duration: 5,
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
      }
      
      setCreateFolderModalVisible(false);
      createFolderForm.resetFields();

      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error creating folder:', error);
      message.error(t('Failed to create folder'));
    } finally {
      setLoading(false);
    }
  };

  // Handle edit document
  const handleEditDocument = async (document: DocumentItem) => {
    try {
      setLoading(true);
      
      // Get the document content for editing
      const documentContent = await documentsService.getDocumentContent(document.id);
      
      // Create a document object with the retrieved content
      const documentWithContent: DocumentItem = {
        ...document,
        content: documentContent.content,
        name: documentContent.name,
        description: documentContent.description
      };
      
      console.log('Editing document with content:', documentWithContent);
      setEditingDocument(documentWithContent);
      setEditDocumentModalVisible(true);
    } catch (error) {
      console.error('Error loading document content:', error);
      message.error(t('files.failedToLoadDocumentContent'));
    } finally {
      setLoading(false);
    }
  };

  // Handle update document
  const handleUpdateDocument = async (content: string, title: string) => {
    if (!editingDocument) return;
    
    try {
      setLoading(true);
      
      // Update the document content and title
      await documentsService.updateDocument(editingDocument.id, {
        name: title,
        content: content
      });
      
      message.success(t('Document updated successfully'));
      setEditDocumentModalVisible(false);
      setEditingDocument(null);
      
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error updating document:', error);
      message.error(t('Failed to update document'));
    } finally {
      setLoading(false);
    }
  };

  // Handle create document
  const handleCreateDocument = async (content: string, title: string) => {
    try {
      setLoading(true);
      
      // Create an HTML file from the rich text content
      const blob = new Blob([content], { type: 'text/html' });
      const file = new File([blob], `${title}.html`, { type: 'text/html' });
      
      // Upload the file first
      const result = await documentsService.uploadFile(file, currentFolderId);
      
      // Then update the document to include the content as description
      await documentsService.updateDocument(result.id, {
        name: title,
        content: content,
        description: content // Save content as description for Quill documents
      });
      
      // Notify sync system
      createItem(result.id, 'file');
      
      message.success(t('Document created successfully'));
      setRichTextModalVisible(false);
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error creating document:', error);
      message.error(t('Failed to create document'));
    } finally {
      setLoading(false);
    }
  };

  // Chunk size for large file uploads (5MB chunks)
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  
  const handleFileUpload = async (fileList: any[]) => {
    try {
      // Initialize upload progress for each file
      const initialProgress = fileList.map(fileItem => ({
        file: fileItem.originFileObj || fileItem,
        progress: 0,
        status: 'uploading' as 'uploading' | 'completed' | 'error',
        error: null as string | null,
        uploadedChunks: 0,
        totalChunks: 0
      }));
      setUploadProgress(initialProgress);

      for (let i = 0; i < fileList.length; i++) {
        const fileItem = fileList[i];
        const file = fileItem.originFileObj || fileItem;
        if (!file || !(file instanceof globalThis.File)) continue;

        try {
          // Calculate total chunks for this file
          const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
          
          // Update progress to show current file is being processed
          setUploadProgress(prev => prev.map((item, index) => 
            index === i ? { 
              ...item, 
              progress: 0, 
              status: 'uploading',
              totalChunks,
              uploadedChunks: 0
            } : item
          ));

          // Handle large file upload with chunking
          if (file.size > CHUNK_SIZE) {
            await uploadLargeFile(file, i, totalChunks);
          } else {
            // Small file upload (original method)
            await uploadSmallFile(file, i);
          }

          // Set to completed
          setUploadProgress(prev => prev.map((item, index) => 
            index === i ? { ...item, progress: 100, status: 'completed' } : item
          ));

        } catch (error: any) {
          console.error(`Error uploading file ${file.name}:`, error);
          setUploadProgress(prev => prev.map((item, index) => 
            index === i ? { ...item, status: 'error', error: error.message || 'Upload failed' } : item
          ));
        }
      }

      // Check if all uploads completed successfully
      const allCompleted = uploadProgress.every(item => item.status === 'completed');
      if (allCompleted) {
        message.success(t('files.filesUploadedSuccess') || 'Files uploaded successfully');
        setUploadModalVisible(false);
        setUploadProgress([]);
        // Reset the file input
        if (uploadRef.current) {
          uploadRef.current.fileList = [];
        }
        await loadDocuments();
        onDocumentsChange?.();
      } else {
        // Show warning if some files failed
        const failedCount = uploadProgress.filter(item => item.status === 'error').length;
        if (failedCount > 0) {
          message.warning(`${fileList.length - failedCount} files uploaded successfully, ${failedCount} failed`);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error(t('files.failedToUploadFiles') || 'Failed to upload files');
      setUploadProgress([]);
    }
  };

  // Upload large files using the new fileService with progress tracking
  const uploadLargeFile = async (file: File, fileIndex: number, totalChunks: number) => {
    try {
      // Use the new fileService.uploadLargeFile method with progress tracking
      const result = await fileService.uploadLargeFile(
        file, 
        currentFolderId, 
        (progress) => {
          // Update progress for this file
          setUploadProgress(prev => prev.map((item, index) => 
            index === fileIndex ? { 
              ...item, 
              progress: Math.round(progress),
              uploadedChunks: Math.round((progress / 100) * totalChunks)
            } : item
          ));
        }
      );
      
      // Notify sync system
      createItem(result.file.id, 'file');

    } catch (error) {
      console.error(`Error uploading large file ${file.name}:`, error);
      throw error;
    }
  };

  // Upload small files (original method)
  const uploadSmallFile = async (file: File, fileIndex: number) => {
    // Simulate upload progress for small files
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev.map((item, index) => 
        index === fileIndex ? { ...item, progress: Math.min(item.progress + 20, 90) } : item
      ));
    }, 200);

    const result = await documentsService.uploadFile(file, currentFolderId);
    
    // Clear interval
    clearInterval(progressInterval);
    
    // Notify sync system
    createItem(result.id, 'file');
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setLoading(true);
      const item = documents.find(d => d.id === itemId);
      if (!item) {
        message.error(t('Item not found'));
        return;
      }

      await documentsService.deleteItem(itemId, item.type === 'folder');
      
      // Notify sync system
      deleteItem(itemId, item.type);

      message.success(t('Item deleted successfully'));

      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error(t('Failed to delete item'));
    } finally {
      setLoading(false);
    }
  };

  const handleRenameItem = async (values: any) => {
    try {
      setLoading(true);
      const itemId = renameForm.getFieldValue('itemId');
      const newName = values.name;

      const item = documents.find(d => d.id === itemId);
      if (!item) {
        message.error(t('Item not found'));
        return;
      }

      await documentsService.renameItem(itemId, newName, item.type === 'folder');
      
      // Notify sync system
      renameItem(itemId, item.type);

      message.success(t('Item renamed successfully'));
      setRenameModalVisible(false);
      renameForm.resetFields();

      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error renaming item:', error);
      message.error(t('Failed to rename item'));
    } finally {
      setLoading(false);
    }
  };

  const openCopyModal = (item: DocumentItem) => {
    // For single items, work directly like bulk operations
    setClipboard({ action: 'copy', item, bulkItems: [item] });
    message.success(`${item.name} copied to clipboard`);
  };

  const openMoveModal = (item: DocumentItem) => {
    // For single items, work directly like bulk operations
    setClipboard({ action: 'cut', item, bulkItems: [item] });
    message.success(`${item.name} cut to clipboard`);
  };

  const handleCopyItem = async (values: any) => {
    try {
      setLoading(true);
      const itemId = copyForm.getFieldValue('itemId');
      const targetFolderId = values.targetFolderId;

      const item = documents.find(d => d.id === itemId);
      if (!item) {
        message.error(t('Item not found'));
        return;
      }

      console.log('Copying item:', { itemName: item.name, itemId, targetFolderId });

      let copiedItem;
      if (item.type === 'folder') {
        copiedItem = await documentsService.copyFolder(itemId, targetFolderId || null);
      } else {
        copiedItem = await documentsService.copyFile(itemId, targetFolderId || null);
      }
      
      // Notify sync system for copy (create new items)
      if (copiedItem) {
        createItem(copiedItem.id, copiedItem.type);
      }

      message.success(t('files.itemCopiedSuccess', { name: item.name }));
      setCopyModalVisible(false);
      copyForm.resetFields();

      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error copying item:', error);
      message.error(t('Failed to copy item'));
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItem = async (values: any) => {
    try {
      setLoading(true);
      const itemId = moveForm.getFieldValue('itemId');
      const targetFolderId = values.targetFolderId;

      const item = documents.find(d => d.id === itemId);
      if (!item) {
        message.error(t('Item not found'));
        return;
      }

      if (item.type === 'folder') {
        await documentsService.moveItem(itemId, targetFolderId || null, true);
      } else {
        await documentsService.moveItem(itemId, targetFolderId || null, false);
      }
      
      // Notify sync system
      updateItem(itemId, item.type);

      message.success(t('Item moved successfully'));
      setMoveModalVisible(false);
      moveForm.resetFields();

      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error moving item:', error);
      message.error(t('Failed to move item'));
    } finally {
      setLoading(false);
    }
  };

  const handleCutItem = (item: DocumentItem) => {
    setClipboard({ action: 'cut', item });
    message.success(t('files.itemCutToClipboard', { name: item.name }));
  };



    const handlePasteItem = async () => {
    if (!clipboard || !currentFolderId) return;

    try {
      setLoading(true);
      const { action, item, bulkItems } = clipboard;
      
      console.log('Paste operation:', { action, itemName: item.name, bulkCount: bulkItems?.length, currentFolderId });

      if (action === 'copy') {
        console.log('Starting copy operation...');
        if (bulkItems && bulkItems.length > 1) {
          // Handle bulk copy
          console.log(`Copying ${bulkItems.length} items...`);
          for (const bulkItem of bulkItems) {
            let copiedItem;
            if (bulkItem.type === 'folder') {
              copiedItem = await documentsService.copyFolder(bulkItem.id, currentFolderId);
            } else {
              copiedItem = await documentsService.copyFile(bulkItem.id, currentFolderId);
            }
            console.log('Copied item:', copiedItem);
            // Notify sync system for copy (create new items)
            if (copiedItem) {
              createItem(copiedItem.id, copiedItem.type);
            }
          }
          message.success(t('files.itemsPastedSuccess', { count: bulkItems.length }));
        } else {
          // Handle single copy
          console.log('Copying single item...');
          let copiedItem;
          if (item.type === 'folder') {
            copiedItem = await documentsService.copyFolder(item.id, currentFolderId);
          } else {
            copiedItem = await documentsService.copyFile(item.id, currentFolderId);
          }
          console.log('Copied item:', copiedItem);
          // Notify sync system for copy (create new items)
          if (copiedItem) {
            createItem(copiedItem.id, copiedItem.type);
          }
          message.success(t('files.itemPastedSuccess', { name: item.name }));
        }
        // Clear clipboard after copy operation
        console.log('Clearing clipboard after copy operation');
        setClipboard(null);
      } else if (action === 'cut') {
        if (bulkItems && bulkItems.length > 1) {
          // Handle bulk move
          for (const bulkItem of bulkItems) {
            if (bulkItem.type === 'folder') {
              await documentsService.moveItem(bulkItem.id, currentFolderId || null, true);
            } else {
              await documentsService.moveItem(bulkItem.id, currentFolderId || null, false);
            }
            // Notify sync system
            updateItem(bulkItem.id, bulkItem.type);
          }
          message.success(t('files.itemsPastedSuccess', { count: bulkItems.length }));
        } else {
          // Handle single move
          if (item.type === 'folder') {
            await documentsService.moveItem(item.id, currentFolderId || null, true);
          } else {
            await documentsService.moveItem(item.id, currentFolderId || null, false);
          }
          message.success(t('files.itemPastedSuccess', { name: item.name }));
        }
        // Clear clipboard after cut operation
        console.log('Clearing clipboard after cut operation');
        setClipboard(null);
      }

      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error pasting item:', error);
      message.error(t('Failed to paste item'));
    } finally {
      setLoading(false);
    }
  };

  const showRenameModal = (item: DocumentItem) => {
    renameForm.setFieldsValue({
      itemId: item.id,
      name: item.name
    });
    setRenameModalVisible(true);
  };

  const showPropertiesModal = (item: DocumentItem) => {
    setSelectedItem(item);
    setPropertiesModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      documentsService.searchDocuments(value, filters).then(setDocuments);
    } else {
      loadDocuments();
    }
  };

  const renderBreadcrumbs = () => {
    const breadcrumbItems = [
      {
        title: (
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={() => navigateToFolder(null)}
            style={{ padding: 0 }}
            size="small"
          >
            {t('files.home')}
          </Button>
        ),
      }
    ];

    if (currentPath !== '/') {
      const pathParts = currentPath.split('/').filter(Boolean);
      let currentPathBuilder = '';
      
      pathParts.forEach((part, index) => {
        currentPathBuilder += `/${part}`;
        breadcrumbItems.push({
          title: (
            <Button 
              type="text" 
              onClick={() => {
                // Navigate to this specific folder level
                const targetPath = currentPathBuilder;
                // This is a simplified navigation - in a real app you'd need to track folder IDs
                setCurrentPath(targetPath);
              }}
              style={{ padding: 0 }}
              size="small"
            >
              {part}
            </Button>
          ),
        });
      });
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Breadcrumb items={breadcrumbItems} />
        {clipboard && (
          <Button
            icon={<CopyOutlined />}
            onClick={handlePasteItem}
            disabled={!currentFolderId}
            size="small"
            type="primary"
          >
            Paste {clipboard.action === 'copy' ? 'Copy' : 'Cut'} Here
          </Button>
        )}
      </div>
    );
  };

  // Build folder tree for copy/move operations
  const buildFolderTree = () => {
    const buildTree = (items: DocumentItem[], parentId: string | null = null): any[] => {
      return items
        .filter(item => item.type === 'folder' && item.parentId === parentId)
        .map(folder => ({
          key: folder.id,
          title: (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '500'
            }}>
              <FolderOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
              {folder.name}
            </span>
          ),
          children: buildTree(items, folder.id),
        }));
    };

    // Add root option
    const treeData = [
      {
        key: 'root',
        title: (
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: '600',
            color: '#52c41a'
          }}>
            <HomeOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
            {t('files.root')}
          </span>
        ),
        children: buildTree(documents),
      },
    ];

    return treeData;
  };

  const renderListView = () => {
    const items = sortedDocuments;

    if (items.length === 0) {
      return (
        <Empty
          description={t('files.noDocumentsFound')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {canWrite && (
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateFolderModalVisible(true)}>
                {t('files.createNewFolder')}
              </Button>
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                {t('files.sendDocument')}
              </Button>
            </Space>
          )}
        </Empty>
      );
    }

    const columns = [
      {
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            {t('files.name')}
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record: DocumentItem) => (
          <Space>
            <input
              type="checkbox"
              checked={selectedItems.includes(record.id)}
              onChange={(e) => handleSelectItem(record.id, e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            {getFileIcon(record)}
            <span 
              style={{ 
                cursor: record.type === 'folder' ? 'pointer' : 'default',
                color: record.type === 'folder' ? '#1890ff' : 'inherit'
              }}
              onClick={() => {
                if (record.type === 'folder') {
                  navigateToFolder(record.id, record.name);
                }
              }}
            >
              {name}
            </span>
          </Space>
        ),
      },
             {
         title: t('files.type'),
         dataIndex: 'type',
         key: 'type',
         render: (type: string, record: DocumentItem) => (
           <Tag color={type === 'folder' ? 'blue' : 'green'}>
             {getFileType(record)}
           </Tag>
         ),
       },
       {
         title: t('files.size'),
         dataIndex: 'size',
         key: 'size',
         render: (size: number, record: DocumentItem) =>
           record.type === 'folder' ? '—' : formatFileSize(size),
       },
       {
         title: t('files.owner'),
         dataIndex: 'userName',
         key: 'userName',
         render: (userName: string, record: DocumentItem) => (
           <Space>
             <Avatar size="small">{userName.charAt(0)}</Avatar>
             <span>{userName}</span>
           </Space>
         ),
       },
       {
         title: t('files.modified'),
         dataIndex: 'updatedAt',
         key: 'modified',
         render: (date: string) => new Date(date).toLocaleDateString(),
       },
       {
         title: t('files.actions'),
         key: 'actions',
        render: (record: DocumentItem) => (
          <Space>
            <Tooltip title={t('Properties')}>
              <Button
                type="text"
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => showPropertiesModal(record)}
              />
            </Tooltip>
            
            {record.type === 'file' && (
              <Tooltip title={t('Download')}>
                <a
                  href={record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#52c41a' }}
                >
                  <DownloadOutlined />
                </a>
              </Tooltip>
            )}
            
                         {canEditItem(record) && record.type === 'file' && (
               <Tooltip title={t('files.editDocument')}>
                 <Button
                   type="text"
                   size="small"
                   icon={<FormOutlined />}
                   onClick={() => handleEditDocument(record)}
                 />
               </Tooltip>
             )}
             
             {canRenameItem(record) && (
               <Tooltip title={t('files.renameItem')}>
                 <Button
                   type="text"
                   size="small"
                   icon={<EditOutlined />}
                   onClick={() => showRenameModal(record)}
                 />
               </Tooltip>
             )}
             
             {canMoveCopyItem(record) && (
               <>
                                   <Tooltip title={t('files.copyItem')}>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => openCopyModal(record)}
                    />
                  </Tooltip>
                 <Tooltip title={t('files.moveItem')}>
                   <Button
                     type="text"
                     size="small"
                     icon={<ScissorOutlined />}
                     onClick={() => openMoveModal(record)}
                   />
                 </Tooltip>
               </>
             )}
            
            {canDeleteItem(record) && (
              <Tooltip title={t('Delete')}>
                <Popconfirm
                  title={t('Are you sure you want to delete this item?')}
                  onConfirm={() => handleDeleteItem(record.id)}
                  okText={t('Yes')}
                  cancelText={t('No')}
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

    return (
      <>
        {/* Bulk Operations Toolbar */}
        {selectedItems.length > 0 && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: '#f0f8ff', 
            border: '1px solid #d6e4ff',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontWeight: '500' }}>
                {t('Selected')}: {selectedItems.length} {t('item(s)')}
              </span>
              <Button
                onClick={() => setSelectedItems([])}
                size="small"
              >
                {t('Clear Selection')}
              </Button>
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              justifyContent: 'center'
            }}>
                             <Button
                 icon={<CopyOutlined />}
                 onClick={handleBulkCopy}
                 size="small"
               >
                 {t('files.copyText')} {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
               </Button>
               <Button
                 icon={<ScissorOutlined />}
                 onClick={handleBulkMove}
                 size="small"
               >
                 {t('files.moveText')} {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
               </Button>
               <Button
                 danger
                 icon={<DeleteOutlined />}
                 onClick={handleBulkDelete}
                 size="small"
               >
                 {t('files.deleteSelectedText')} ({selectedItems.length})
               </Button>
            </div>
          </div>
        )}
        
        {/* Clipboard Toolbar */}
        {clipboard && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: '#fff7e6', 
            border: '1px solid #ffd591',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontWeight: '500', color: '#d46b08' }}>
              {clipboard.action === 'copy' ? '📋' : '✂️'} {clipboard.bulkItems ? `${clipboard.bulkItems.length} item(s)` : clipboard.item.name} {clipboard.action === 'copy' ? 'copied' : 'cut'} to clipboard
            </span>
            <Space>
              <Button
                icon={<CopyOutlined />}
                onClick={handlePasteItem}
                size="small"
                type="primary"
                disabled={!currentFolderId}
              >
                Paste Here
              </Button>
              <Button
                onClick={() => setClipboard(null)}
                size="small"
              >
                Clear Clipboard
              </Button>
            </Space>
          </div>
        )}
        
        <div className="table-responsive">
           <Table
             columns={columns}
             dataSource={items}
             rowKey="id"
             pagination={false}
             size="small"
             loading={loading}
             scroll={{ x: 'max-content' }}
           />
         </div>
      </>
    );
  };

  const renderGridView = () => {
    const items = sortedDocuments;

    if (items.length === 0) {
      return (
        <Empty
          description={t('files.noDocumentsFound')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {canWrite && (
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateFolderModalVisible(true)}>
                {t('files.createNewFolder')}
              </Button>
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                {t('files.sendDocument')}
              </Button>
            </Space>
          )}
        </Empty>
      );
    }

    return (
      <>
        {/* Bulk Operations Toolbar */}
        {selectedItems.length > 0 && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: '#f0f8ff', 
            border: '1px solid #d6e4ff',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              {t('Selected')}: {selectedItems.length} {t('item(s)')}
            </span>
            <Space>
                             <Button
                 icon={<CopyOutlined />}
                 onClick={handleBulkCopy}
               >
                 {t('files.copyText')} {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
               </Button>
               <Button
                 icon={<ScissorOutlined />}
                 onClick={handleBulkMove}
               >
                 {t('files.moveText')} {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
               </Button>
               <Button
                 danger
                 icon={<DeleteOutlined />}
                 onClick={handleBulkDelete}
               >
                 {t('files.deleteSelectedText')} ({selectedItems.length})
               </Button>
              <Button
                onClick={() => setSelectedItems([])}
              >
                {t('Clear Selection')}
              </Button>
            </Space>
          </div>
                )}
        
        {/* Clipboard Toolbar */}
        {clipboard && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: '#fff7e6', 
            border: '1px solid #ffd591',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontWeight: '500', color: '#d46b08' }}>
              {clipboard.action === 'copy' ? '📋' : '✂️'} {clipboard.bulkItems ? `${clipboard.bulkItems.length} item(s)` : clipboard.item.name} {clipboard.action === 'copy' ? 'copied' : 'cut'} to clipboard
            </span>
            <Space>
              <Button
                icon={<CopyOutlined />}
                onClick={handlePasteItem}
                size="small"
                type="primary"
                disabled={!currentFolderId}
              >
                Paste Here
              </Button>
              <Button
                onClick={() => setClipboard(null)}
                size="small"
              >
                Clear Clipboard
              </Button>
            </Space>
          </div>
        )}
        
        <div className="grid-responsive">
           {items.map(item => (
             <Card
               key={item.id}
               hoverable
               size="default"
               style={{ 
                 textAlign: 'center', 
                 minHeight: '160px',
                 position: 'relative'
               }}
               bodyStyle={{ padding: '20px', height: '100%' }}
                actions={[
                  <Tooltip key="properties" title={t('Properties')}>
                    <InfoCircleOutlined onClick={() => showPropertiesModal(item)} />
                  </Tooltip>,
                  item.type === 'file' && (
                    <Tooltip key="download" title={t('Download')}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <DownloadOutlined />
                      </a>
                    </Tooltip>
                  ),
                                     canRenameItem(item) && (
                     <Tooltip key="rename" title={t('files.renameItem')}>
                       <EditOutlined onClick={() => showRenameModal(item)} />
                     </Tooltip>
                   ),
                   canMoveCopyItem(item) && (
                     <>
                                               <Tooltip key="copy" title={t('files.copyItem')}>
                          <CopyOutlined onClick={() => openCopyModal(item)} />
                        </Tooltip>
                       <Tooltip key="cut" title={t('files.moveItem')}>
                         <ScissorOutlined onClick={() => openMoveModal(item)} />
                       </Tooltip>
                     </>
                   ),
                  canDeleteItem(item) && (
                    <Tooltip key="delete" title={t('Delete')}>
                      <Popconfirm
                        title={t('Are you sure you want to delete this item?')}
                        onConfirm={() => handleDeleteItem(item.id)}
                        okText={t('Yes')}
                        cancelText={t('No')}
                      >
                        <DeleteOutlined style={{ color: '#ff4d4f' }} />
                      </Popconfirm>
                    </Tooltip>
                  ),
                ].filter(Boolean)}
              >
                {/* Selection Checkbox */}
                <div style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  left: '8px', 
                  zIndex: 1,
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  padding: '2px'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  />
                </div>

                <div 
                  style={{ 
                    fontSize: '64px', 
                    marginBottom: '16px', 
                    cursor: item.type === 'folder' ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    if (item.type === 'folder') {
                      navigateToFolder(item.id, item.name);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (item.type === 'folder') {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {getFileIcon(item)}
                </div>
                <Text 
                  ellipsis 
                  title={item.name} 
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  {item.name}
                </Text>
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <Tag color={item.type === 'folder' ? 'blue' : 'green'}>
                    {getFileType(item)}
                  </Tag>
                </div>
                {item.size && (
                  <div style={{ marginTop: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatFileSize(item.size)}
                    </Text>
                  </div>
                )}
                {item.userName && (
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {t('files.by')}: {item.userName}
                    </Text>
                  </div>
                )}
              </Card>
            ))}
          </div>
      </>
    );
  };

  return (
    <div>
             <style jsx>{`
         /* Responsive Design */
         @media (max-width: 1200px) {
           .ant-col {
             margin-bottom: 16px;
           }
           .ant-table {
             font-size: 13px;
           }
         }
         
         @media (max-width: 768px) {
           .ant-space {
             justify-content: center !important;
           }
           .ant-col {
             margin-bottom: 16px;
           }
           .ant-card {
             margin-bottom: 16px;
           }
           .ant-table {
             font-size: 12px;
           }
           .ant-table td, .ant-table th {
             padding: 8px 4px !important;
           }
           .ant-modal {
             margin: 16px !important;
           }
           .ant-modal-content {
             margin: 0 !important;
           }
           .ant-form-item {
             margin-bottom: 16px !important;
           }
         }
         
         @media (max-width: 576px) {
           .ant-space {
             flex-direction: column;
             align-items: stretch;
           }
           .ant-button-group {
             justify-content: center;
           }
           .ant-input-search {
             width: 100% !important;
           }
           .ant-table {
             font-size: 11px;
           }
           .ant-table td, .ant-table th {
             padding: 4px 2px !important;
           }
           .ant-card-body {
             padding: 12px !important;
           }
           .ant-modal {
             margin: 8px !important;
             width: calc(100vw - 16px) !important;
           }
           .ant-form-item {
             margin-bottom: 12px !important;
           }
         }
         
         @media (max-width: 480px) {
           .ant-table {
             font-size: 10px;
           }
           .ant-table td, .ant-table th {
             padding: 2px 1px !important;
           }
           .ant-card-body {
             padding: 8px !important;
           }
           .ant-modal {
             margin: 4px !important;
             width: calc(100vw - 8px) !important;
           }
         }
         
         /* Grid View Responsiveness */
         .grid-responsive {
           display: grid;
           gap: 16px;
           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
         }
         
         @media (max-width: 768px) {
           .grid-responsive {
             grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
             gap: 12px;
           }
         }
         
         @media (max-width: 576px) {
           .grid-responsive {
             grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
             gap: 8px;
           }
         }
         
         /* Table Responsiveness */
         .table-responsive {
           overflow-x: auto;
           -webkit-overflow-scrolling: touch;
         }
         
         /* Button Responsiveness */
         .responsive-buttons {
           display: flex;
           flex-wrap: wrap;
           gap: 8px;
           justify-content: center;
         }
         
         @media (max-width: 768px) {
           .responsive-buttons {
             flex-direction: column;
             align-items: stretch;
           }
         }
         
                   /* Modal Responsiveness */
          .responsive-modal {
            max-width: 95vw;
            margin: 0 auto;
          }
          
          @media (max-width: 576px) {
            .responsive-modal {
              max-width: 100vw;
              margin: 0;
            }
          }
          
          /* Folder Tree Styling */
          .folder-tree .ant-tree-node-content-wrapper {
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .folder-tree .ant-tree-node-content-wrapper:hover {
            background-color: #e6f7ff;
          }
          
          .folder-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
            background-color: #bae7ff;
          }
          
          .folder-tree .ant-tree-checkbox {
            margin-right: 8px;
          }
          
          .folder-tree .ant-tree-treenode {
            padding: 4px 0;
          }
          
          .folder-tree .ant-tree-indent {
            margin-left: 8px;
          }
          
          .folder-tree .ant-tree-switcher {
            width: 24px;
            height: 24px;
            line-height: 24px;
          }
       `}</style>
      
      <Card>
        {/* Navigation Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={24} md={12} lg={12}>
                    <Title level={4} style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>
          {title || t('files.documents')}
        </Title>
            {renderBreadcrumbs()}
          </Col>
                     <Col xs={24} sm={24} md={12} lg={12}>
             <Space 
               wrap 
               size="small" 
               className="responsive-buttons"
               style={{ 
                 width: '100%', 
                 justifyContent: 'flex-end',
                 marginTop: '16px'
               }}
             >
              {/* Navigation Buttons */}
              <Button.Group size="small">
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={goBack}
                  disabled={currentHistoryIndex <= 0}
                  title={t('Go Back')}
                />
                <Button 
                  icon={<ArrowRightOutlined />} 
                  onClick={goForward}
                  disabled={currentHistoryIndex >= folderHistory.length - 1}
                  title={t('Go Forward')}
                />
              </Button.Group>
              
              <Divider type="vertical" />
              
              <Search
                placeholder={t('Search documents...')}
                onSearch={handleSearch}
                style={{ 
                  width: '100%', 
                  maxWidth: 250
                }}
                allowClear
                size="small"
              />
              
              <Radio.Group 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)} 
                size="small"
                buttonStyle="solid"
              >
                <Radio.Button value="list">
                  <UnorderedListOutlined /> {t('List')}
                </Radio.Button>
                <Radio.Button value="grid">
                  <AppstoreOutlined /> {t('Grid')}
                </Radio.Button>
              </Radio.Group>

              <Select 
                value={sortBy} 
                onChange={setSortBy} 
                style={{ width: 100 }} 
                size="small"
                dropdownMatchSelectWidth={false}
              >
                <Select.Option value="name">{t('Name')}</Select.Option>
                <Select.Option value="date">{t('Date')}</Select.Option>
                <Select.Option value="size">{t('Size')}</Select.Option>
                <Select.Option value="type">{t('Type')}</Select.Option>
              </Select>

              <Button
                icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                size="small"
                title={t('Sort Order')}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={loadDocuments}
                loading={loading}
                size="small"
                title={t('Refresh')}
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
                  {/*
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={() => setRichTextModalVisible(true)}
                    size="small"
                  >
                    {t('files.createNewDocument')}
                  </Button>
                  */}
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => setUploadModalVisible(true)}
                    size="small"
                  >
                    {t('files.uploadFiles')}
                  </Button>
                  {uploadProgress.length > 0 && (
                    <div className="flex items-center space-x-2 ml-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-600">
                        {uploadProgress.filter(item => item.status === 'uploading').length} uploading
                      </span>
                    </div>
                  )}
                                     {clipboard && (
                     <Button
                       icon={<ScissorOutlined />}
                       onClick={handlePasteItem}
                       disabled={!currentFolderId}
                       size="small"
                     >
                       {t('files.paste')} {clipboard.action === 'copy' ? t('files.copyText') : t('files.cut')}
                       {clipboard.bulkItems && clipboard.bulkItems.length > 1 && ` (${clipboard.bulkItems.length})`}
                     </Button>
                   )}

                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Main Content */}
        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </Card>

      {/* Create Folder Modal */}
      <Modal
                 title={t('files.createNewFolder')}
        open={createFolderModalVisible}
        onCancel={() => setCreateFolderModalVisible(false)}
        footer={null}
      >
        <Form form={createFolderForm} onFinish={handleCreateFolder} layout="vertical">
          <Form.Item
            name="name"
            label={t('Folder Name')}
            rules={[{ required: true, message: t('Please enter folder name') }]}
          >
            <Input placeholder={t('Enter folder name')} />
          </Form.Item>
          <Form.Item name="description" label={t('Description')}>
            <TextArea rows={3} placeholder={t('Optional description')} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('Create Folder')}
              </Button>
              <Button onClick={() => setCreateFolderModalVisible(false)}>
                {t('Cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

                     {/* Edit Document Modal */}
        <Modal
          title={t('files.editDocument')}
          open={editDocumentModalVisible}
          onCancel={() => {
            setEditDocumentModalVisible(false);
            setEditingDocument(null);
          }}
          footer={null}
          width="100vw"
          className="responsive-modal"
          style={{ top: 0, margin: 0, padding: 0 }}
          bodyStyle={{ height: '100vh', padding: 0, margin: 0 }}
        >
                 {editingDocument && (
           <RichTextEditor
             value={editingDocument.content || ''}
             onChange={(content) => {
               // Handle content changes if needed
             }}
             placeholder="Edit your document..."
             key={editingDocument.id} // Force re-render when editing different document
           />
         )}
      </Modal>

                     {/* Rich Text Editor Modal */}
        <Modal
          title={t('files.createNewDocument')}
          open={richTextModalVisible}
          onCancel={() => setRichTextModalVisible(false)}
          footer={null}
          width="100vw"
          className="responsive-modal"
          style={{ top: 0, margin: 0, padding: 0 }}
          bodyStyle={{ height: '100vh', padding: 0, margin: 0 }}
        >
        <RichTextEditor
          value=""
          onChange={(content) => {
            // Handle content changes if needed
          }}
          placeholder="Start writing your document..."
        />
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
             <p className="ant-upload-text">{t('Click or drag files to this area to upload')}</p>
             <p className="ant-upload-hint text-xs text-gray-500 mt-2">
               Supports files up to 10GB. Large files will be uploaded in chunks for reliability.
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
                        {item.file.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      )}
                      {item.status === 'completed' && (
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
                       item.status === 'completed' ? 'success' : 'active'
                     }
                     strokeColor={
                       item.status === 'error' ? '#ff4d4f' : 
                       item.status === 'completed' ? '#52c41a' : '#1890ff'
                     }
                   />
                   
                   {/* Chunk Information for Large Files */}
                   {item.totalChunks > 1 && (
                     <div className="text-xs text-blue-600 mt-1">
                       Chunk {item.uploadedChunks} of {item.totalChunks} 
                       ({Math.round((item.uploadedChunks / item.totalChunks) * 100)}%)
                     </div>
                   )}
                   
                   {/* Status Text */}
                   <div className="text-xs text-gray-500 mt-1">
                     {item.status === 'uploading' && (
                       item.totalChunks > 1 ? 'Uploading chunks...' : 'Uploading...'
                     )}
                     {item.status === 'completed' && 'Upload completed'}
                     {item.status === 'error' && (
                       <span className="text-red-500">
                         Error: {item.error || 'Upload failed'}
                       </span>
                     )}
                   </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                {uploadProgress.filter(item => item.status === 'completed').length} of {uploadProgress.length} completed
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
                {uploadProgress.every(item => item.status === 'completed') && (
                  <Button 
                    type="primary"
                    onClick={() => {
                      setUploadModalVisible(false);
                      setUploadProgress([]);
                      loadDocuments();
                      onDocumentsChange?.();
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
        <Form form={renameForm} layout="vertical" onFinish={handleRenameItem}>
          <Form.Item name="itemId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('New Name')}
            rules={[{ required: true, message: t('Please enter new name') }]}
          >
            <Input placeholder={t('Enter new name')} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('Rename')}
              </Button>
              <Button onClick={() => setRenameModalVisible(false)}>
                {t('Cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Properties Modal */}
      <Modal
                 title={t('files.itemProperties')}
        open={propertiesModalVisible}
        onCancel={() => setPropertiesModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPropertiesModalVisible(false)}>
            {t('Close')}
          </Button>
        ]}
        width={600}
      >
        {selectedItem && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t('Name')} span={1}>
              <Space>
                {getFileIcon(selectedItem)}
                {selectedItem.name}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('Type')}>
              <Tag color={selectedItem.type === 'folder' ? 'blue' : 'green'}>
                {getFileType(selectedItem)}
              </Tag>
            </Descriptions.Item>
            {/* <Descriptions.Item label={t('Description')}>
              {selectedItem.description || t('No description')}
            </Descriptions.Item> */}
            <Descriptions.Item label={t('Owner')}>
              <Space>
                <Avatar size="small">{selectedItem.userName.charAt(0)}</Avatar>
                {selectedItem.userName}
              </Space>
            </Descriptions.Item>
            {selectedItem.type === 'file' && (
              <>
                <Descriptions.Item label={t('Size')}>
                  {formatFileSize(selectedItem.size || 0)}
                </Descriptions.Item>
                <Descriptions.Item label={t('MIME Type')}>
                  {selectedItem.mimeType || t('Unknown')}
                </Descriptions.Item>
                {selectedItem.url && (
                  <Descriptions.Item label={t('Download')}>
                    <a href={selectedItem.url} target="_blank" rel="noopener noreferrer">
                      <DownloadOutlined /> {t('Download File')}
                    </a>
                  </Descriptions.Item>
                )}
              </>
            )}
            <Descriptions.Item label={t('Created')}>
              {new Date(selectedItem.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t('Last Modified')}>
              {new Date(selectedItem.updatedAt).toLocaleString()}
            </Descriptions.Item>
            {selectedItem.type === 'folder' && selectedItem._count && (
              <>
                <Descriptions.Item label={t('Subfolders')}>
                  {selectedItem._count.children}
                </Descriptions.Item>
                <Descriptions.Item label={t('Files')}>
                  {selectedItem._count.files}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

             {/* Copy Modal */}
       <Modal
         title={t('files.copyItem')}
         open={copyModalVisible}
         onCancel={() => setCopyModalVisible(false)}
         footer={null}
         width={600}
       >
         <Form form={copyForm} onFinish={handleCopyItem} layout="vertical">
           <Form.Item name="itemId" hidden>
             <Input />
           </Form.Item>
           <Form.Item
             name="targetFolderId"
             label={t('files.targetFolder')}
             rules={[{ required: true, message: t('files.pleaseSelectTargetFolder') }]}
           >
                           <Tree
                checkable
                selectable={false}
                onCheck={(checkedKeys) => {
                  const selectedKey = Array.isArray(checkedKeys) ? checkedKeys[0] : checkedKeys;
                  copyForm.setFieldsValue({ targetFolderId: selectedKey });
                }}
                treeData={buildFolderTree()}
                defaultExpandAll
                height={300}
                showLine
                showIcon={false}
                switcherIcon={null}
                style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '8px', 
                  padding: '16px',
                  backgroundColor: '#fafafa'
                }}
                className="folder-tree"
              />
           </Form.Item>
           <Form.Item>
             <Space>
               <Button type="primary" htmlType="submit" loading={loading}>
                 {t('files.copy')}
               </Button>
               <Button onClick={() => setCopyModalVisible(false)}>
                 {t('files.cancel')}
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
         width={600}
       >
         <Form form={moveForm} onFinish={handleMoveItem} layout="vertical">
           <Form.Item name="itemId" hidden>
             <Input />
           </Form.Item>
           <Form.Item
             name="targetFolderId"
             label={t('files.targetFolder')}
             rules={[{ required: true, message: t('files.pleaseSelectTargetFolder') }]}
           >
                           <Tree
                checkable
                selectable={false}
                onCheck={(checkedKeys) => {
                  const selectedKey = Array.isArray(checkedKeys) ? checkedKeys[0] : checkedKeys;
                  moveForm.setFieldsValue({ targetFolderId: selectedKey });
                }}
                treeData={buildFolderTree()}
                defaultExpandAll
                height={300}
                showLine
                showIcon={false}
                switcherIcon={null}
                style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '8px', 
                  padding: '16px',
                  backgroundColor: '#fafafa'
                }}
                className="folder-tree"
              />
           </Form.Item>
           <Form.Item>
             <Space>
               <Button type="primary" htmlType="submit" loading={loading}>
                 {t('files.move')}
               </Button>
               <Button onClick={() => setMoveModalVisible(false)}>
                 {t('files.cancel')}
               </Button>
             </Space>
           </Form.Item>
         </Form>
       </Modal>

             {/* Bulk Copy Modal - No longer needed since copy works like cut */}
       {/* Removed because copy now stores items in clipboard for paste operation */}

             {/* Bulk Move Modal - No longer needed since move works like cut */}
       {/* Removed because move now stores items in clipboard for paste operation */}
    </div>
  );
};

export default DocumentsManager;
