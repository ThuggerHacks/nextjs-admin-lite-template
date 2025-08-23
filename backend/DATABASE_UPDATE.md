# Database Schema Update for Department Supervisor

## Issue
The backend is failing to update departments with supervisor information because the `supervisorId` field doesn't exist in the database yet.

## Solution
You need to manually add the `supervisorId` field to the `departments` table.

## Method 1: Using SQLite Command Line

1. Navigate to your backend directory:
   ```bash
   cd backend
   ```

2. Open SQLite with your database:
   ```bash
   sqlite3 prisma/dev.db
   ```

3. Run the following SQL commands:
   ```sql
   ALTER TABLE departments ADD COLUMN supervisorId TEXT REFERENCES users(id);
   CREATE INDEX idx_departments_supervisor_id ON departments(supervisorId);
   ```

4. Verify the change:
   ```sql
   .schema departments
   ```

5. Exit SQLite:
   ```sql
   .quit
   ```

## Method 2: Using Prisma Studio

1. Navigate to your backend directory:
   ```bash
   cd backend
   ```

2. Open Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

3. Navigate to the Database tab
4. Run the SQL commands from Method 1

## Method 3: Using the Update Script

1. Install sqlite3:
   ```bash
   npm install sqlite3
   ```

2. Run the update script:
   ```bash
   node update_db.js
   ```

## After Update

Once the database schema is updated:

1. Restart your backend server
2. Try updating a department with a supervisor again
3. The supervisor assignment should now work properly

## Verification

You can verify the update worked by:
1. Checking the database schema
2. Creating/updating a department with a supervisor
3. Checking that the supervisor information appears in the departments list
