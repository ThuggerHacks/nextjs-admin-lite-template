# Tonelizer Backend

A comprehensive Node.js backend API built with Express, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Management**: Upload, download, and manage files with Multer
- **Email Service**: Nodemailer integration for password resets and notifications
- **Database**: PostgreSQL with Prisma ORM
- **TypeScript**: Full TypeScript support with strict typing
- **Validation**: Express-validator for request validation
- **Security**: Helmet, CORS, rate limiting, and password hashing
- **Development**: Nodemon for hot reloading, Sucrase for fast compilation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer
- **HTTP Client**: Axios
- **Validation**: Express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **Development**: Nodemon, Sucrase, ts-node

## Project Structure

```
src/
├── controllers/     # Route controllers
├── services/        # Business logic services
├── routes/          # Express route definitions
├── middlewares/     # Custom middleware functions
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
└── index.ts         # Application entry point

prisma/
└── schema.prisma    # Database schema definition

uploads/             # File upload directory
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository and navigate to backend folder**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tonelizer?schema=public"
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run database migrations
   npm run migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run dev:sucrase` - Start development server with sucrase
- `npm start` - Start production server
- `npm run build` - Build for production
- `npm run build:sucrase` - Build with sucrase
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/password` - Change user password

### User Profile
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### Files
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/my-files` - Get current user's files
- `GET /api/files/stats` - Get file statistics
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file
- `GET /api/files` - Get all files (Admin only)

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **File**: Uploaded files with metadata
- **PasswordReset**: Password reset tokens

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File type restrictions for uploads

## File Upload

- Supports images and documents
- 10MB file size limit
- Automatic file naming with timestamps
- Category-based organization
- Secure file storage in uploads directory

## Email Features

- Welcome emails for new users
- Password reset emails with secure tokens
- Configurable SMTP settings
- HTML email templates

## Development

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and database operations
- **Middlewares**: Handle authentication, validation, and file uploads
- **Utils**: Helper functions for common operations
- **Types**: TypeScript type definitions

### Adding New Features

1. Define types in `src/types/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Add routes in `src/routes/`
5. Add middleware if needed in `src/middlewares/`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
