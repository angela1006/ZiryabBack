import type { Request, Response, NextFunction } from 'express';
import { mapAttachmentUrls } from '../utils/cloudinary.js';

/** Firma `attachmentUrl` / `justificationUri` en JSON (PDF sin firma → 401 o sin extensión). */
export function resolveCloudinaryUrlsMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const json = res.json.bind(res);
  res.json = (body: unknown) => json(mapAttachmentUrls(body));
  next();
}
