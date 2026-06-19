import type { Request, Response } from 'express';
import * as issueService from './issue.service.js';
import { createIssueBodySchema, updateIssueBodySchema } from './issue.schema.js';

const getRequester = (req: Request) => ({
  requesterId: req.user!.sub,
  requesterRole: req.user!.role,
});

const mapServiceErrorStatus = (message: string): number => {
  if (message.includes('no encontrado') || message === 'Anuncio no encontrado') {
    return 404;
  }
  if (message.startsWith('No autorizado')) {
    return 403;
  }
  return 400;
};

const handleServiceError = (res: Response, error: unknown, fallbackMessage: string) => {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const status = mapServiceErrorStatus(message);
  res.status(status).json({ success: false, message });
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const issues = await issueService.getActiveIssues(requesterId, requesterRole);
    res.json({
      success: true,
      data: issues,
      count: issues.length,
    });
  } catch (error: unknown) {
    handleServiceError(res, error, 'Error al obtener anuncios');
  }
};

export const getIssueById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0', 10);
    if (Number.isNaN(id) || id === 0) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    const { requesterId, requesterRole } = getRequester(req);
    const issue = await issueService.getIssueById(id, requesterId, requesterRole);
    res.json({ success: true, data: issue });
  } catch (error: unknown) {
    handleServiceError(res, error, 'Error al obtener anuncio');
  }
};

export const createIssue = async (req: Request, res: Response) => {
  const parsed = createIssueBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Cuerpo inválido',
      errors: parsed.error.flatten(),
    });
    return;
  }

  try {
    const { requesterId, requesterRole } = getRequester(req);
    const issue = await issueService.createIssue(parsed.data, requesterId, requesterRole);
    res.status(201).json({ success: true, data: issue });
  } catch (error: unknown) {
    handleServiceError(res, error, 'Error al crear anuncio');
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  const parsed = updateIssueBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Cuerpo inválido',
      errors: parsed.error.flatten(),
    });
    return;
  }

  try {
    const id = parseInt(req.params.id || '0', 10);
    if (Number.isNaN(id) || id === 0) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    const { requesterId, requesterRole } = getRequester(req);
    const issue = await issueService.updateIssue(id, parsed.data, requesterId, requesterRole);
    res.json({ success: true, data: issue });
  } catch (error: unknown) {
    handleServiceError(res, error, 'Error al actualizar anuncio');
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0', 10);
    if (Number.isNaN(id) || id === 0) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    const { requesterId, requesterRole } = getRequester(req);
    const deleted = await issueService.deleteIssue(id, requesterId, requesterRole);
    res.json({ success: true, data: deleted });
  } catch (error: unknown) {
    handleServiceError(res, error, 'Error al eliminar anuncio');
  }
};
