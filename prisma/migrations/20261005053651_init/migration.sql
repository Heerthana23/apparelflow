-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stdFabricYards" REAL NOT NULL,
    "wastageCap" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "RecipeComponent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "componentName" TEXT NOT NULL,
    "piecesPerGarment" INTEGER NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "RecipeComponent_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CuttingOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNo" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "targetQty" INTEGER NOT NULL,
    "fabricRollId" TEXT NOT NULL,
    "actualFabricYds" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CUTTING_IN_PROGRESS',
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CuttingOrder_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CuttingOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "expectedQty" INTEGER NOT NULL,
    "actualQty" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "VerificationItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CuttingOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VerificationItem_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "RecipeComponent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "verifierId" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "rejectionNote" TEXT,
    "wastagePct" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CuttingOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VerificationLog_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_recipeCode_key" ON "Recipe"("recipeCode");

-- CreateIndex
CREATE UNIQUE INDEX "CuttingOrder_orderNo_key" ON "CuttingOrder"("orderNo");
