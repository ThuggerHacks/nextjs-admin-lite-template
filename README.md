# Tonelizer Platform

A comprehensive business management platform with user authentication, file management, and organizational tools.

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Initialize the database with test data:
```bash
npm run init
```

6. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Test Accounts

After running the initialization script, you can use these test accounts:

### Admin Accounts
- **Super Admin**: superadmin@company.com / superadmin123
- **Admin**: admin@company.com / admin123

### Department Supervisors
- **HR Supervisor**: hr.supervisor@company.com / password123
- **IT Supervisor**: it.supervisor@company.com / password123

## Departments Available for Testing
- **Human Resources** - Managed by HR Supervisor
- **Information Technology** - Managed by IT Supervisor

## Testing Registration

You can now register new users and select from these departments:
1. Go to the login page
2. Switch to the registration tab
3. Fill in the form with any name, email, and password
4. Select either "Human Resources" or "Information Technology" as the department
5. Click "Request Access"
6. The user will be created with PENDING status and needs approval from their department supervisor

## Features

- ✅ User authentication with role-based access control
- ✅ Multi-language support (Portuguese/English)
- ✅ File and folder management with permissions
- ✅ Notification system with real-time updates
- ✅ Department-based user management
- ✅ Goal tracking and reporting
- ✅ Document scanning and PDF generation
- ✅ Library management system

## API Endpoints

The backend provides comprehensive REST APIs for:
- Authentication (`/api/auth`)
- User management (`/api/users`)
- Department management (`/api/departments`)
- File operations (`/api/files`)
- Folder operations (`/api/folders`)
- Notifications (`/api/notifications`)
- Goals (`/api/goals`)
- Reports (`/api/reports`)
- And more...

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SUCURSAL_NAME="Default Sucursal"
PORT=3003
NODE_ENV="development"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

## Database Schema

The application uses SQLite with Prisma ORM and includes tables for:
- Users with roles and department assignments
- Departments with supervisors
- Files and folders with hierarchical structure
- Notifications with read/unread status
- Goals and reports
- Libraries and permissions
- And more...

## Troubleshooting

### "Sucursal not configured" Error
If you get this error, it means the database hasn't been initialized properly:

1. Make sure you've run the database migrations: `npx prisma migrate deploy`
2. Initialize the database with test data: `npm run init`
3. Restart the backend server: `npm start`

### Login Issues
- Make sure you're using one of the test accounts listed above
- Check that the backend server is running on port 3003
- Verify that the frontend is configured to connect to the correct API URL

### Registration Issues
- Make sure you've selected a department when registering
- The registration creates users with PENDING status that need approval
- Only supervisors and admins can approve new users

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev  # Starts Next.js development server
```

### Database Management
```bash
npx prisma studio  # Open Prisma Studio for database management
npx prisma migrate dev  # Create new migrations during development
```

## Business Requirements

The platform supports:
- Users with roles (USER, SUPERVISOR, ADMIN, SUPER_ADMIN, DEVELOPER)
- Department-based organization with supervisors
- File and folder management with tree structure
- Goal tracking and reporting system
- Document scanning and PDF generation
- Library management with permissions
- Multi-sucursal architecture
- Notification system for all actions
- Multi-language support (Portuguese/English)
- Role-based access control throughout the system