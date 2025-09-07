-- CreateTable
CREATE TABLE "library_file_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "sharedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,
    "isRemoteShare" BOOLEAN NOT NULL DEFAULT false,
    "remoteServerUrl" TEXT,
    CONSTRAINT "library_file_shares_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "library_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_file_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "library_file_shares_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "temperatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temperature" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "temperatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "temperatures_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "folderId" TEXT,
    "userId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "sharedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "library_files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "library_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "library_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_files_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_files_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "library_files_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_library_files" ("createdAt", "description", "folderId", "id", "libraryId", "mimeType", "name", "originalName", "size", "sucursalId", "type", "updatedAt", "url", "userId") SELECT "createdAt", "description", "folderId", "id", "libraryId", "mimeType", "name", "originalName", "size", "sucursalId", "type", "updatedAt", "url", "userId" FROM "library_files";
DROP TABLE "library_files";
ALTER TABLE "new_library_files" RENAME TO "library_files";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "library_file_shares_fileId_sharedWithId_key" ON "library_file_shares"("fileId", "sharedWithId");
