-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ticker" TEXT NOT NULL,
    "currentPrice" DECIMAL(12,4),
    "pmh" DECIMAL(12,4),
    "ydh" DECIMAL(12,4),
    "pml" DECIMAL(12,4),
    "ydl" DECIMAL(12,4),
    "keyLevels" TEXT,
    "premarketGaps" BOOLEAN,
    "strategyOrb15" BOOLEAN NOT NULL DEFAULT false,
    "strategyOrb5" BOOLEAN NOT NULL DEFAULT false,
    "strategy3Conf" BOOLEAN NOT NULL DEFAULT false,
    "waitedAPlus" BOOLEAN,
    "tradedInZone" BOOLEAN,
    "followedRules" BOOLEAN,
    "feelings" TEXT,
    "reflections" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyLog_userId_date_idx" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_ticker_key" ON "DailyLog"("userId", "date", "ticker");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
