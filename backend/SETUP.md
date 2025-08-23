# Tonelizer Backend Setup

This document provides step-by-step instructions for setting up and running the Tonelizer backend.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (included with Node.js)

## Quick Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=3001
   NODE_ENV=development
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Initialize database with default data
   npm run init:db
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses Prisma with SQLite and includes the following models:

### Core Models
- **Sucursal**: Multi-sucursal support with inter-sucursal communication
- **User**: User accounts with role-based access control
- **Department**: Department structure with supervisors
- **Folder**: Tree-structured folder system
- **File**: File storage with metadata and public/private support
- **Library**: Collaborative libraries with member management
- **Goal**: Goal management and tracking system
- **Report**: Comprehensive reporting system with file attachments
- **Scan**: Image to PDF conversion and management
- **Notification**: System notifications for various events
- **ErrorLog**: Error tracking and monitoring

### Relationships
- Users belong to departments and can have supervisors
- Folders have a tree structure with parent-child relationships
- Files can be associated with folders and users
- Goals are assigned to users and departments
- Reports can be associated with goals
- Libraries have members and creators
- Notifications are sent to users for various events

## API Endpoints

The backend provides comprehensive REST API endpoints for all functionality:

### Authentication
- User registration with approval workflow
- JWT-based authentication
- Password change functionality
- User approval system

### User Management
- Complete CRUD operations for users
- Role-based access control
- Department assignment
- User status management

### File Management
- **Two-step file upload process**:
  1. Upload file to `/api/uploads` to get a file URL
  2. Use the returned URL to create file record via `/api/files`
- Tree-structured folder system
- File storage with metadata and permissions
- Public and private file support
- File sharing and permissions

### Goal Management
- Goal creation and assignment
- Goal tracking and progress
- Goal status management
- User assignment to goals

### Reporting System
- Report creation and submission
- File attachment support
- Report tracking and management
- Goal-associated reports

### Library System
- Collaborative libraries
- Member management
- Library sharing and permissions
- Library content management

### Scan System
- Image to PDF conversion
- Scan management and storage
- PDF download functionality
- Multiple image support

### Notification System
- Real-time notifications
- Notification management
- Read/unread status
- Notification types

### Multi-Sucursal Support
- Sucursal management with automatic notification to connected sucursals
- Inter-sucursal communication
- Data synchronization via cron jobs
- Connection management

### Error Logging and Monitoring
- **Comprehensive error logging**: All errors are automatically logged to the database
- **Global error handling**: Unhandled errors are captured and logged
- **Error categorization**: Errors are categorized by type (DATABASE_ERROR, NETWORK_ERROR, etc.)
- **Error details**: Full error context including stack traces, request details, and user information
- **Error management**: Developers can view and manage error logs via `/api/error-logs`

### Dashboard and Analytics
- Statistics and metrics
- User activity tracking
- Goal progress monitoring
- File usage analytics

## File Upload Process

The backend implements a **two-step file upload process** as requested:

### Step 1: File Upload
```bash
POST /api/uploads
Content-Type: multipart/form-data
Authorization: Bearer <token>

# Request body
file: <file>

# Response
{
  "message": "File uploaded successfully",
  "file": {
    "originalName": "document.pdf",
    "filename": "1234567890-987654321-document.pdf",
    "size": 1024000,
    "mimetype": "application/pdf",
    "url": "http://localhost:3001/api/uploads/files/1234567890-987654321-document.pdf",
    "path": "/api/uploads/files/1234567890-987654321-document.pdf"
  }
}
```

### Step 2: Create File Record
```bash
POST /api/files
Content-Type: application/json
Authorization: Bearer <token>

# Request body
{
  "name": "document.pdf",
  "url": "http://localhost:3001/api/uploads/files/1234567890-987654321-document.pdf",
  "description": "Important document",
  "folderId": "folder-id",
  "isPublic": false,
  "size": 1024000,
  "type": "application/pdf"
}
```

## Error Logging System

The backend includes a comprehensive error logging system:

### Automatic Error Logging
- **Global error handler**: Captures all unhandled errors
- **Route-specific logging**: Each route logs its own errors
- **Error categorization**: Errors are categorized by type
- **Context preservation**: Full error context is preserved

### Error Log Structure
```json
{
  "id": "error-log-id",
  "sucursalId": "sucursal-id",
  "errorType": "DATABASE_ERROR|NETWORK_ERROR|VALIDATION_ERROR|AUTHENTICATION_ERROR|FILE_UPLOAD_ERROR|UNHANDLED_ERROR|NOT_FOUND_ERROR",
  "description": "Human-readable error description",
  "errorDetails": "JSON string with error context",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Error Management Endpoints
- `GET /api/error-logs` - Get all error logs (Developer only)
- `GET /api/error-logs/:id` - Get specific error log
- `GET /api/error-logs/stats` - Get error statistics
- `DELETE /api/error-logs/:id` - Delete error log
- `DELETE /api/error-logs` - Clear all error logs

## Cron Jobs

The backend includes automated tasks:

### Sucursal Synchronization (Every 12 Hours)
- Syncs existing sucursal connections
- Discovers new sucursals from connected servers
- Updates sucursal information and server URLs
- Maintains strong connections between sucursals

### Error Log Cleanup
- Automatic cleanup of old error logs
- Error log rotation and archiving

## Default Users

After running `npm run init:db`, the following default users are created:

### Developer User
- Email: `developer@tonelizer.com`
- Password: `developer123`
- Role: `DEVELOPER`
- Status: `ACTIVE`

### Super Admin User
- Email: `admin@tonelizer.com`
- Password: `admin123`
- Role: `SUPER_ADMIN`
- Status: `ACTIVE`

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Database Management**
   ```bash
   # View database with Prisma Studio
   npx prisma studio
   
   # Reset database
   npx prisma migrate reset
   
   # Generate new migration
   npx prisma migrate dev --name <migration_name>
   ```

3. **Testing**
   ```bash
   # Run backend tests
   node test/test.js
   ```

## Production Deployment

1. **Environment Variables**
   Update the `.env` file for production:
   ```env
   DATABASE_URL="file:./prod.db"
   JWT_SECRET="your-production-jwt-secret"
   PORT=3001
   NODE_ENV=production
   ```

2. **Build and Start**
   ```bash
   npm start
   ```

## Monitoring and Logging

The backend includes comprehensive monitoring:

- **Error logging with categorization** and full context
- **Request logging** with Morgan
- **Performance monitoring** and metrics
- **Error tracking and reporting** via dedicated endpoints

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Ensure SQLite is properly configured
   - Check database file permissions
   - Verify DATABASE_URL in .env

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure user status is ACTIVE

3. **File Upload Issues**
   - Check file size limits (50MB default)
   - Verify upload directory permissions
   - Ensure proper file types
   - **Important**: Use the two-step upload process

4. **Cors Issues**
   - Update CORS configuration for frontend
   - Check allowed origins
   - Verify request headers

### Logs

Check the console output for detailed error messages and logs. The application logs all errors and important events to the database via the error logging system.

## Support

For issues and questions:
1. Check the logs for error details
2. Verify all prerequisites are met
3. Ensure environment variables are correct
4. Test with the provided test script
5. Check error logs via `/api/error-logs` endpoint 