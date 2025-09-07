/*
  Warnings:

  - You are about to drop the column `canSeeTemperatureMenu` on the `departments` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sucursalId" TEXT NOT NULL,
    "supervisorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "departments_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_departments" ("createdAt", "description", "id", "name", "sucursalId", "supervisorId", "updatedAt") SELECT "createdAt", "description", "id", "name", "sucursalId", "supervisorId", "updatedAt" FROM "departments";
DROP TABLE "departments";
ALTER TABLE "new_departments" RENAME TO "departments";
CREATE UNIQUE INDEX "departments_name_sucursalId_key" ON "departments"("name", "sucursalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
