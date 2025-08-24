# Documents Integration System

This document describes the integration between the documents page and the backend file management system.

## Overview

The documents system provides a unified interface for managing files and folders across different contexts:
- **Public Documents**: Company-wide documents accessible to all users
- **Department Documents**: Department-specific documents with role-based access
- **Personal Documents**: Private document storage for individual users
- **All Departments**: Admin view of all department documents

## Architecture

### Backend Components

1. **Files Route** (`/backend/src/routes/files.js`)
   - `GET /documents/all` - Get all documents with type filtering
   - `POST /` - Create file records
   - `PUT /:fileId` - Update file metadata
   - `DELETE /:fileId` - Delete files
   - `PATCH /:fileId/rename` - Rename files

2. **Folders Route** (`/backend/src/routes/folders.js`)
   - `GET /documents/all` - Get all folders with type filtering
   - `POST /` - Create folders
   - `PUT /:folderId` - Update folder metadata
   - `DELETE /:folderId` - Delete folders
   - `PATCH /:folderId/rename` - Rename folders

3. **Uploads Route** (`/backend/src/routes/uploads.js`)
   - `POST /` - Handle file uploads
   - `GET /files/:filename` - Serve uploaded files

4. **Users Route** (`/backend/src/routes/users.js`)
   - `GET /:userId/files` - Get user's personal files and folders
   - `POST /:userId/folders` - Create folders for specific users (admin only)

### Frontend Components

1. **DocumentsManager** (`/components/DocumentsManager.tsx`)
   - Main component for managing documents
   - Supports list and grid view modes
   - Handles file uploads, folder creation, renaming, and deletion
   - Integrates with the document sync system

2. **Documents Service** (`/lib/services/documentsService.ts`)
   - Service layer for document operations
   - Converts backend data to unified DocumentItem format
   - Handles CRUD operations for files and folders

3. **Document Sync Hook** (`/hooks/use-documents-sync.ts`)
   - Manages real-time synchronization between components
   - Notifies all subscribers when documents change
   - Ensures consistency across the application

## Features

### File Management
- **Upload Files**: Drag and drop or click to upload
- **Create Folders**: Organize files in hierarchical structure
- **Rename Items**: Change names of files and folders
- **Delete Items**: Remove files and empty folders
- **Download Files**: Access uploaded files

### View Modes
- **List View**: Table format with detailed information
- **Grid View**: Card-based layout for visual browsing

### Sorting and Filtering
- Sort by name, date, size, or type
- Ascending/descending order
- Search functionality
- Type-based filtering (public, department, personal)

### Access Control
- **Public Documents**: Read-only for all users, write for admins
- **Department Documents**: Read/write for department members and admins
- **Personal Documents**: Full control for owner, read for admins

## Integration Points

### Documents Page
The main documents page (`/app/(main)/(routes)/documents/page.tsx`) uses the DocumentsManager component for each tab, providing different access levels and contexts.

### User Files Drawer
The user files drawer in the users page can subscribe to document sync events to automatically refresh when changes occur in the documents system.

### Real-time Updates
When documents are created, updated, renamed, moved, or deleted, the sync system notifies all subscribers, ensuring consistency across the application.

## Usage Examples

### Creating a Folder
```typescript
const { createItem } = useDocumentsSync();

const handleCreateFolder = async (values: any) => {
  const result = await documentsService.createFolder(values);
  createItem(result.id, 'folder'); // Notify sync system
};
```

### Uploading Files
```typescript
const { createItem } = useDocumentsSync();

const handleFileUpload = async (file: File) => {
  const result = await documentsService.uploadFile(file);
  createItem(result.id, 'file'); // Notify sync system
};
```

### Subscribing to Changes
```typescript
const { subscribe } = useDocumentsSync();

useEffect(() => {
  const unsubscribe = subscribe((event) => {
    if (event.type === 'create') {
      // Refresh the file list
      loadFiles();
    }
  });

  return unsubscribe;
}, []);
```

## Database Schema

The system uses the following Prisma models:

- **Folder**: Hierarchical folder structure with user ownership
- **File**: File metadata with folder relationships and user ownership
- **User**: User accounts with role-based permissions
- **Department**: Department information for access control

## Security

- All routes require authentication
- Role-based access control (USER, SUPERVISOR, ADMIN, SUPER_ADMIN, DEVELOPER)
- Users can only access files and folders they own or have permission to view
- Public documents are accessible to all authenticated users
- Department documents are restricted to department members

## Future Enhancements

- **File Sharing**: Allow users to share files with specific users or groups
- **Version Control**: Track file versions and changes
- **Advanced Search**: Full-text search and metadata filtering
- **Collaboration**: Real-time editing and commenting
- **Audit Trail**: Track all file operations and access
- **Storage Quotas**: Limit storage per user or department
- **File Encryption**: Encrypt sensitive documents
- **Backup and Recovery**: Automated backup and restore capabilities
