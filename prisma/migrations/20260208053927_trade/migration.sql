-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "timeIn" TEXT,
    "timeOut" TEXT,
    "profitLoss" DECIMAL(12,2),
    "dripPercent" DECIMAL(6,2),
    "amountLeveraged" DECIMAL(12,2),
    "runner" BOOLEAN NOT NULL DEFAULT false,
    "contractsCount" INTEGER,
    "optionType" TEXT,
    "outcomeColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_userId_dailyLogId_idx" ON "Trade"("userId", "dailyLogId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
