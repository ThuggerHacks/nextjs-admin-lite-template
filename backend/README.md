# Tonelizer Backend

A comprehensive backend API for the Tonelizer platform built with Node.js, Express, and Prisma.

## Features

- **User Management**: Complete user registration, authentication, and role-based access control
- **Department Management**: Hierarchical department structure with supervisors
- **File Management**: Tree-structured folder system with file uploads
- **Goal Management**: Goal creation, assignment, and tracking
- **Report System**: Comprehensive reporting system with file attachments
- **Library System**: Collaborative libraries with member management
- **Scan System**: Image to PDF conversion and management
- **Notification System**: Real-time notifications for system events
- **Multi-Sucursal Support**: Inter-sucursal communication and data sync
- **Error Logging**: Comprehensive error tracking and monitoring
- **Dashboard**: Analytics and statistics for supervisors and admins

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite database

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `PATCH /api/auth/approve/:userId` - Approve user (Supervisor/Admin)
- `PATCH /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin/Supervisor)
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user (Admin)
- `GET /api/users/department/:departmentId` - Get users by department

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:departmentId` - Get department by ID
- `POST /api/departments` - Create department (Admin/Developer)
- `PUT /api/departments/:departmentId` - Update department (Admin/Developer)
- `DELETE /api/departments/:departmentId` - Delete department (Admin/Developer)

### Folders
- `GET /api/folders` - Get user folders
- `GET /api/folders/:folderId` - Get folder by ID
- `POST /api/folders` - Create folder
- `PUT /api/folders/:folderId` - Update folder
- `DELETE /api/folders/:folderId` - Delete folder
- `GET /api/folders/tree/:folderId?` - Get folder tree

### Files
- `GET /api/files` - Get files
- `GET /api/files/:fileId` - Get file by ID
- `POST /api/files` - Upload file
- `PUT /api/files/:fileId` - Update file
- `DELETE /api/files/:fileId` - Delete file
- `GET /api/files/public/files` - Get public files

### Libraries
- `GET /api/libraries` - Get libraries
- `GET /api/libraries/:libraryId` - Get library by ID
- `POST /api/libraries` - Create library
- `PUT /api/libraries/:libraryId` - Update library
- `DELETE /api/libraries/:libraryId` - Delete library
- `POST /api/libraries/:libraryId/members` - Add member
- `DELETE /api/libraries/:libraryId/members/:userId` - Remove member

### Goals
- `GET /api/goals` - Get goals
- `GET /api/goals/:goalId` - Get goal by ID
- `POST /api/goals` - Create goal (Supervisor/Admin)
- `PUT /api/goals/:goalId` - Update goal (Supervisor/Admin)
- `DELETE /api/goals/:goalId` - Delete goal (Supervisor/Admin)
- `POST /api/goals/:goalId/assign` - Assign users to goal

### Reports
- `GET /api/reports` - Get reports
- `GET /api/reports/:reportId` - Get report by ID
- `POST /api/reports` - Create report
- `PUT /api/reports/:reportId` - Update report
- `DELETE /api/reports/:reportId` - Delete report

### Scans
- `GET /api/scans` - Get scans
- `GET /api/scans/:scanId` - Get scan by ID
- `POST /api/scans` - Create scan (upload images)
- `DELETE /api/scans/:scanId` - Delete scan
- `GET /api/scans/:scanId/download` - Download PDF

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/:notificationId` - Get notification by ID
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/count/unread` - Get unread count

### Sucursals
- `GET /api/sucursals` - Get all sucursals (Developer)
- `GET /api/sucursals/:sucursalId` - Get sucursal by ID (Developer)
- `POST /api/sucursals` - Create sucursal (Developer)
- `PUT /api/sucursals/:sucursalId` - Update sucursal (Developer)
- `DELETE /api/sucursals/:sucursalId` - Delete sucursal (Developer)
- `GET /api/sucursals/:sucursalId/connections` - Get connections
- `POST /api/sucursals/:sucursalId/connect` - Connect sucursals
- `DELETE /api/sucursals/:sucursalId/disconnect/:targetSucursalId` - Disconnect
- `GET /api/sucursals/current/info` - Get current sucursal info

### Error Logs
- `GET /api/error-logs` - Get error logs (Developer)
- `GET /api/error-logs/:errorLogId` - Get error log by ID (Developer)
- `GET /api/error-logs/stats/summary` - Get error statistics (Developer)
- `DELETE /api/error-logs/:errorLogId` - Delete error log (Developer)
- `DELETE /api/error-logs/clear/all` - Clear error logs (Developer)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/goals/progress` - Get goal progress
- `GET /api/dashboard/users/activity` - Get user activity
- `GET /api/dashboard/files/stats` - Get file statistics

## Database Schema

The application uses Prisma with SQLite. The schema includes:

- **Users**: User accounts with roles and permissions
- **Departments**: Department structure with supervisors
- **Folders**: Tree-structured folder system
- **Files**: File storage with metadata
- **Libraries**: Collaborative libraries
- **Goals**: Goal management and tracking
- **Reports**: Report system with attachments
- **Scans**: Image to PDF conversion
- **Notifications**: System notifications
- **Sucursals**: Multi-sucursal support
- **Error Logs**: Error tracking and monitoring

## Environment Variables

- `DATABASE_URL`: SQLite database URL
- `JWT_SECRET`: JWT secret key for authentication
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Development

### Running in Development
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Architecture

The backend follows a modular architecture:

- **Routes**: Express routes for API endpoints
- **Middleware**: Authentication and validation middleware
- **Services**: Business logic services
- **Utils**: Utility functions and helpers
- **Lib**: Database and external service connections

## Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers

## Error Handling

Comprehensive error handling with:
- Custom error logging
- Structured error responses
- Error categorization
- Error monitoring and tracking

## Monitoring

- Error logging system
- Request logging with Morgan
- Performance monitoring
- Health check endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 