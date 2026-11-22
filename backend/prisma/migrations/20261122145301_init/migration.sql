-- CreateEnum
CREATE TYPE "PayloadType" AS ENUM ('file', 'link', 'text');

-- CreateTable
CREATE TABLE "Payload" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayloadType" NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "device" TEXT NOT NULL,
    "totalTTL" INTEGER NOT NULL,
    "remainingTTL" INTEGER NOT NULL,
    "size" TEXT,
    "mime" TEXT,
    "hash" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "Payload_pkey" PRIMARY KEY ("id")
);
