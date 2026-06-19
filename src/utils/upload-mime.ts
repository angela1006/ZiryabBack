/**
 * Tipos MIME y extensiones permitidas para subidas (Multer + Cloudinary).
 * Incluye alias habituales en Windows/macOS y fallback por extensión si el navegador
 * envía `application/octet-stream` o un tipo vacío.
 */

/** Justificantes de asistencia: documentos e imágenes habituales. */
export const JUSTIFICATION_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

/** Adjuntos de tareas y entregas de alumnos. */
export const TASK_ATTACHMENT_MIME_TYPES = new Set([
  ...JUSTIFICATION_MIME_TYPES,
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  zip: 'application/zip',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  txt: 'text/plain',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
};

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'application/x-pdf': 'application/pdf',
};

export function normalizeUploadMime(mimetype: string): string {
  const trimmed = mimetype.trim().toLowerCase();
  return MIME_ALIASES[trimmed] ?? trimmed;
}

export function mimeFromFilename(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return EXTENSION_TO_MIME[ext] ?? null;
}

export function resolveUploadMime(mimetype: string, originalname: string): string {
  const normalized = normalizeUploadMime(mimetype);
  if (
    normalized &&
    normalized !== 'application/octet-stream' &&
    normalized !== 'binary/octet-stream'
  ) {
    return normalized;
  }
  return mimeFromFilename(originalname) ?? normalized;
}

export function isJustificationMime(mimetype: string, originalname: string): boolean {
  const resolved = resolveUploadMime(mimetype, originalname);
  return JUSTIFICATION_MIME_TYPES.has(resolved);
}

export function isTaskAttachmentMime(mimetype: string, originalname: string): boolean {
  const resolved = resolveUploadMime(mimetype, originalname);
  return TASK_ATTACHMENT_MIME_TYPES.has(resolved);
}

export const JUSTIFICATION_FORMATS_MESSAGE =
  'Formato no soportado. Permitidos: PDF, PNG, JPG, WEBP, GIF o HEIC.';

export const TASK_ATTACHMENT_FORMATS_MESSAGE =
  'Formato no soportado. Permitidos: PDF, imágenes (PNG, JPG, WEBP…), ZIP, DOC/DOCX, ODT, TXT, XLS/XLSX o PPT/PPTX.';
