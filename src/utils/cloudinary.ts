import { v2 as cloudinary } from 'cloudinary';
import type { Express } from 'express';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const CLOUDINARY_FOLDERS = {
  justifications: 'ziryab/justifications',
  tasks: 'ziryab/tasks',
  submissions: 'ziryab/submissions',
} as const;

const ATTACHMENT_KEYS = new Set(['attachmentUrl', 'justificationUri']);

function fileExt(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length < 2) return undefined;
  const ext = parts.pop()?.toLowerCase();
  return ext && ext.length <= 10 ? ext : undefined;
}

/** PDF como `image`+`pdf` → URL con `.pdf`; PNG/JPG igual con su extensión. */
function uploadOptions(mimetype: string, filename: string) {
  const mime = mimetype.toLowerCase();
  const ext = fileExt(filename);

  if (mime === 'application/pdf' || ext === 'pdf') {
    return { resource_type: 'image' as const, format: 'pdf' };
  }
  if (mime.startsWith('image/')) {
    return { resource_type: 'image' as const, format: ext };
  }
  if (mime.startsWith('audio/') || mime.startsWith('video/')) {
    return { resource_type: 'video' as const, format: ext };
  }

  const rawExts = ['zip', 'doc', 'docx', 'odt', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
  const isRaw =
    mime.includes('zip') ||
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('spreadsheet') ||
    mime.includes('presentation') ||
    mime === 'text/plain' ||
    mime === 'application/msword' ||
    mime === 'application/vnd.ms-excel' ||
    mime === 'application/vnd.ms-powerpoint' ||
    (ext !== undefined && rawExts.includes(ext));

  if (isRaw) {
    return { resource_type: 'raw' as const, format: ext };
  }
  return { resource_type: 'auto' as const, format: ext };
}

type UploadResult = {
  secure_url?: string;
  public_id?: string;
  version?: number;
  resource_type?: string;
  format?: string;
};

/** URL canónica pública en res.cloudinary.com (carpeta + extensión). */
function buildCanonicalUrl(result: UploadResult): string {
  const resourceType = result.resource_type ?? 'image';
  const format = result.format;
  const publicId = result.public_id;
  const version = result.version;

  if (!publicId || !version) {
    return result.secure_url ?? '';
  }

  const suffix = format ? `.${format}` : '';
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/v${version}/${publicId}${suffix}`;
}

/** URL canónica sin firma para guardar en BD (ignora URLs api.cloudinary.com rotas). */
export function toStoredCloudinaryUrl(url: string): string {
  if (url.includes('api.cloudinary.com')) return url;
  if (!url.includes('res.cloudinary.com')) return url;
  const m = url.match(/\/(image|raw|video)\/upload\/v(\d+)\/(.+?)(?:\?.*)?$/i);
  if (!m) return url;
  const [, resourceType, version, path] = m;
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/v${version}/${path}`;
}

/**
 * Devuelve la URL de entrega sin api.cloudinary.com.
 * Con "Allow PDF and ZIP" activo en Cloudinary, la URL pública con extensión basta.
 */
export function resolveAttachmentUrl(
  url: string | null | undefined,
): string | null | undefined {
  if (!url) return url ?? null;
  if (url.includes('api.cloudinary.com')) return null;
  return url.includes('res.cloudinary.com') ? url : url;
}

function shouldDeepMap(value: unknown): value is Record<string, unknown> | unknown[] {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return true;
  if (value instanceof Date) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Solo reemplaza URLs api.cloudinary.com rotas; no altera fechas ni Decimal. */
export function mapAttachmentUrls<T>(payload: T): T {
  if (payload == null || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) {
    return payload.map((x) => mapAttachmentUrls(x)) as T;
  }
  if (!shouldDeepMap(payload)) {
    return payload;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (ATTACHMENT_KEYS.has(k) && typeof v === 'string') {
      const resolved = resolveAttachmentUrl(v);
      out[k] = resolved ?? v;
    } else if (shouldDeepMap(v)) {
      out[k] = mapAttachmentUrls(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export async function uploadFromMulter(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  const { resource_type, format } = uploadOptions(file.mimetype, file.originalname);

  const result = (await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    {
      folder,
      resource_type,
      access_mode: 'public',
      use_filename: true,
      unique_filename: true,
      ...(format ? { format } : {}),
    },
  )) as UploadResult;

  const canonical = buildCanonicalUrl(result);
  if (!canonical) {
    throw new Error('Cloudinary no devolvió URL del archivo');
  }
  return canonical;
}
