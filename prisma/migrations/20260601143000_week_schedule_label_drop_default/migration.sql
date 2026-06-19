-- Quitar DEFAULT '' en label (comportamiento previo: obligatorio sin default en BD)
ALTER TABLE "WeekSchedule" ALTER COLUMN "label" DROP DEFAULT;
