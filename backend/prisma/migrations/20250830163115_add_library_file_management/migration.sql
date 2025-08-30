/*
  Warnings:

  - You are about to drop the column `userId` on the `library_files` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `library_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `library_files` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "library_folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "library_folders_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_folders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_library_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT,
    "libraryId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "library_files_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_files_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_library_files" ("createdAt", "description", "id", "libraryId", "mimeType", "name", "originalName", "size", "type", "updatedAt", "url") SELECT "createdAt", "description", "id", "libraryId", "mimeType", "name", "originalName", "size", "type", "updatedAt", "url" FROM "library_files";
DROP TABLE "library_files";
ALTER TABLE "new_library_files" RENAME TO "library_files";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
