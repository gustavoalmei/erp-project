/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `SystemSettings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[company_id,sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "customers_document_key";

-- DropIndex
DROP INDEX "customers_email_key";

-- DropIndex
DROP INDEX "products_sku_key";

-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN     "company_id" INTEGER;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "SystemSettings";

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_companies" (
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "user_companies_pkey" PRIMARY KEY ("user_id","company_id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "company_id" INTEGER NOT NULL,
    "company_name" TEXT NOT NULL DEFAULT 'Minha Empresa',
    "logo_base64" TEXT,
    "default_theme" "Theme" NOT NULL DEFAULT 'system',
    "color_primary" TEXT NOT NULL DEFAULT '#f24987',
    "color_primary_hover" TEXT NOT NULL DEFAULT '#db3f78',
    "color_primary_active" TEXT NOT NULL DEFAULT '#c53569',
    "color_accent" TEXT NOT NULL DEFAULT '#b2bf4b',
    "color_bg_primary" TEXT NOT NULL DEFAULT '#ffffff',
    "color_bg_secondary" TEXT NOT NULL DEFAULT '#f7f7f7',
    "color_surface" TEXT NOT NULL DEFAULT '#ffffff',
    "color_text_primary" TEXT NOT NULL DEFAULT '#262626',
    "color_text_secondary" TEXT NOT NULL DEFAULT '#5f6b73',
    "color_text_muted" TEXT NOT NULL DEFAULT '#8c959c',
    "color_text_inverse" TEXT NOT NULL DEFAULT '#ffffff',
    "color_border_default" TEXT NOT NULL DEFAULT '#d9d9d9',
    "color_border_strong" TEXT NOT NULL DEFAULT '#5f6b73',

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_sku_key" ON "products"("company_id", "sku");

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
