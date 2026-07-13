-- CreateTable
CREATE TABLE "ForumReport" (
    "id" TEXT NOT NULL,
    "threadId" TEXT,
    "replyId" TEXT,
    "reason" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForumReport_resolved_createdAt_idx" ON "ForumReport"("resolved", "createdAt");

-- AddForeignKey
ALTER TABLE "ForumReport" ADD CONSTRAINT "ForumReport_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReport" ADD CONSTRAINT "ForumReport_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "ThreadReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

