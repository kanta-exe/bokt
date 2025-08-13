-- CreateTable
CREATE TABLE "SavedModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brandUserId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    CONSTRAINT "SavedModel_brandUserId_fkey" FOREIGN KEY ("brandUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ModelProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedModel_brandUserId_modelId_key" ON "SavedModel"("brandUserId", "modelId");
