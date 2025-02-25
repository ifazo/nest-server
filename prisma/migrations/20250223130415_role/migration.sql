/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'seller', 'buyer');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'buyer';

-- DropEnum
DROP TYPE "UserRole";
