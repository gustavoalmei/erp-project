-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark', 'system');

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT 'Minha Empresa',
    "logoBase64" TEXT,
    "defaultTheme" "Theme" NOT NULL DEFAULT 'system',
    "colorPrimary" TEXT NOT NULL DEFAULT '#f24987',
    "colorPrimaryHover" TEXT NOT NULL DEFAULT '#db3f78',
    "colorPrimaryActive" TEXT NOT NULL DEFAULT '#c53569',
    "colorAccent" TEXT NOT NULL DEFAULT '#b2bf4b',
    "colorBgPrimary" TEXT NOT NULL DEFAULT '#ffffff',
    "colorBgSecondary" TEXT NOT NULL DEFAULT '#f7f7f7',
    "colorSurface" TEXT NOT NULL DEFAULT '#ffffff',
    "colorTextPrimary" TEXT NOT NULL DEFAULT '#262626',
    "colorTextSecondary" TEXT NOT NULL DEFAULT '#5f6b73',
    "colorTextMuted" TEXT NOT NULL DEFAULT '#8c959c',
    "colorTextInverse" TEXT NOT NULL DEFAULT '#ffffff',
    "colorBorderDefault" TEXT NOT NULL DEFAULT '#d9d9d9',
    "colorBorderStrong" TEXT NOT NULL DEFAULT '#5f6b73',

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
