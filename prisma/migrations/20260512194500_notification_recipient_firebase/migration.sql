-- Modelo actual de Notification (recipientFirebaseUID + SSE / REST).
-- Elimina la tabla legacy de 20260426101500_init_notifications si existía (otro esquema de columnas).
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TYPE IF EXISTS "NotificationAction" CASCADE;
DROP TYPE IF EXISTS "NotificationEntityType" CASCADE;

CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "recipientFirebaseUID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_recipientFirebaseUID_isRead_createdAt_idx" ON "Notification"("recipientFirebaseUID", "isRead", "createdAt");
