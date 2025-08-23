/*
  Warnings:

  - You are about to drop the `_FileShared` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FolderShared` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goal_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scan_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `supervisorId` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `error_logs` table. All the data in the column will be lost.
  - You are about to drop the column `libraryId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `isRoot` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `libraries` table. All the data in the column will be lost.
  - You are about to drop the column `canDelete` on the `library_members` table. All the data in the column will be lost.
  - You are about to drop the column `canRead` on the `library_members` table. All the data in the column will be lost.
  - You are about to drop the column `canWrite` on the `library_members` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerId` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `submittedById` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `scans` table. All the data in the column will be lost.
  - You are about to drop the column `pdfPath` on the `scans` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `sucursals` table. All the data in the column will be lost.
  - You are about to drop the column `lastPing` on the `sucursals` table. All the data in the column will be lost.
  - Added the required column `type` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeline` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Made the column `departmentId` on table `goals` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `libraries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `images` to the `scans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `scans` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_FileShared_B_index";

-- DropIndex
DROP INDEX "_FileShared_AB_unique";

-- DropIndex
DROP INDEX "_FolderShared_B_index";

-- DropIndex
DROP INDEX "_FolderShared_AB_unique";

-- DropIndex
DROP INDEX "scan_files_scanId_order_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FileShared";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FolderShared";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "goal_reports";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "scan_files";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "general_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedById" TEXT NOT NULL,
    "submittedToId" TEXT,
    "respondedById" TEXT,
    "response" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "general_reports_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "general_reports_submittedToId_fkey" FOREIGN KEY ("submittedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "general_reports_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "general_reports_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "general_report_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generalReportId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    CONSTRAINT "general_report_files_generalReportId_fkey" FOREIGN KEY ("generalReportId") REFERENCES "general_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "general_report_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    CONSTRAINT "report_files_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "report_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DepartmentSupervisors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DepartmentSupervisors_A_fkey" FOREIGN KEY ("A") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DepartmentSupervisors_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_departments" ("createdAt", "description", "id", "name", "sucursalId", "updatedAt") SELECT "createdAt", "description", "id", "name", "sucursalId", "updatedAt" FROM "departments";
DROP TABLE "departments";
ALTER TABLE "new_departments" RENAME TO "departments";
CREATE UNIQUE INDEX "departments_name_sucursalId_key" ON "departments"("name", "sucursalId");
CREATE TABLE "new_error_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sucursalId" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "errorDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "error_logs_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_error_logs" ("createdAt", "description", "errorType", "id", "sucursalId") SELECT "createdAt", "description", "errorType", "id", "sucursalId" FROM "error_logs";
DROP TABLE "error_logs";
ALTER TABLE "new_error_logs" RENAME TO "error_logs";
CREATE TABLE "new_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "folderId" TEXT,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "files_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_files" ("createdAt", "folderId", "id", "isPublic", "name", "size", "sucursalId", "updatedAt") SELECT "createdAt", "folderId", "id", "isPublic", "name", "size", "sucursalId", "updatedAt" FROM "files";
DROP TABLE "files";
ALTER TABLE "new_files" RENAME TO "files";
CREATE TABLE "new_folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "folders_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_folders" ("createdAt", "id", "name", "parentId", "sucursalId", "updatedAt") SELECT "createdAt", "id", "name", "parentId", "sucursalId", "updatedAt" FROM "folders";
DROP TABLE "folders";
ALTER TABLE "new_folders" RENAME TO "folders";
CREATE TABLE "new_goal_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goal_assignments_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_goal_assignments" ("goalId", "id", "userId") SELECT "goalId", "id", "userId" FROM "goal_assignments";
DROP TABLE "goal_assignments";
ALTER TABLE "new_goal_assignments" RENAME TO "goal_assignments";
CREATE UNIQUE INDEX "goal_assignments_goalId_userId_key" ON "goal_assignments"("goalId", "userId");
CREATE TABLE "new_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timeline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "departmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "goals_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goals_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_goals" ("createdAt", "createdById", "departmentId", "description", "id", "status", "sucursalId", "updatedAt") SELECT "createdAt", "createdById", "departmentId", "description", "id", "status", "sucursalId", "updatedAt" FROM "goals";
DROP TABLE "goals";
ALTER TABLE "new_goals" RENAME TO "goals";
CREATE TABLE "new_libraries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "libraries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "libraries_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_libraries" ("createdAt", "description", "id", "name", "sucursalId", "updatedAt") SELECT "createdAt", "description", "id", "name", "sucursalId", "updatedAt" FROM "libraries";
DROP TABLE "libraries";
ALTER TABLE "new_libraries" RENAME TO "libraries";
CREATE TABLE "new_library_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "libraryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "library_members_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_library_members" ("id", "libraryId", "userId") SELECT "id", "libraryId", "userId" FROM "library_members";
DROP TABLE "library_members";
ALTER TABLE "new_library_members" RENAME TO "library_members";
CREATE UNIQUE INDEX "library_members_libraryId_userId_key" ON "library_members"("libraryId", "userId");
CREATE TABLE "new_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notifications" ("createdAt", "description", "id", "isRead", "sucursalId", "title", "type", "userId") SELECT "createdAt", "description", "id", "isRead", "sucursalId", "title", "type", "userId" FROM "notifications";
DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
CREATE TABLE "new_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goalId" TEXT,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reports_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reports" ("createdAt", "description", "id", "sucursalId", "title", "updatedAt") SELECT "createdAt", "description", "id", "sucursalId", "title", "updatedAt" FROM "reports";
DROP TABLE "reports";
ALTER TABLE "new_reports" RENAME TO "reports";
CREATE TABLE "new_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scans_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_scans" ("createdAt", "id", "sucursalId", "title", "updatedAt") SELECT "createdAt", "id", "sucursalId", "title", "updatedAt" FROM "scans";
DROP TABLE "scans";
ALTER TABLE "new_scans" RENAME TO "scans";
CREATE TABLE "new_sucursals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "serverUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_sucursals" ("createdAt", "description", "id", "location", "name", "serverUrl", "updatedAt") SELECT "createdAt", "description", "id", "location", "name", "serverUrl", "updatedAt" FROM "sucursals";
DROP TABLE "sucursals";
ALTER TABLE "new_sucursals" RENAME TO "sucursals";
CREATE UNIQUE INDEX "sucursals_name_key" ON "sucursals"("name");
CREATE UNIQUE INDEX "sucursals_serverUrl_key" ON "sucursals"("serverUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "general_report_files_generalReportId_fileId_key" ON "general_report_files"("generalReportId", "fileId");

-- CreateIndex
CREATE UNIQUE INDEX "report_files_reportId_fileId_key" ON "report_files"("reportId", "fileId");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentSupervisors_AB_unique" ON "_DepartmentSupervisors"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentSupervisors_B_index" ON "_DepartmentSupervisors"("B");
