import type { Request, Response } from 'express';
import * as substitutionService from './assignment-substitution.service.js';

// GET ALL
export const getAllSubstitutions = async (req: Request, res: Response) => {
  try {
    const data = await substitutionService.findAll();
    res.json({ success: true, data, count: data.length });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener sustituciones',
      error: error.message,
    });
  }
};

// GET BY ID
export const getSubstitutionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inv?lido' });
    }

    const data = await substitutionService.findById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Sustituci?n no encontrada' });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener sustituci?n',
      error: error.message,
    });
  }
};

// GET BY ASSIGNMENT ? historial de un assignment concreto
export const getSubstitutionsByAssignment = async (req: Request, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId || '0');
    if (isNaN(assignmentId) || assignmentId === 0) {
      return res.status(400).json({ success: false, message: 'ID de assignment inv?lido' });
    }

    const data = await substitutionService.findByAssignmentId(assignmentId);
    res.json({ success: true, data, count: data.length });
  } catch (error: any) {
    if (error.message === 'Assignment no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de sustituciones',
      error: error.message,
    });
  }
};

// POST
export const createSubstitution = async (req: Request, res: Response) => {
  try {
    const data = await substitutionService.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Sustituci?n creada exitosamente',
      data,
    });
  } catch (error: any) {
    if (error.message === 'Assignment no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Ya existe una sustituci?n activa para este assignment') {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: 'Error al crear sustituci?n',
      error: error.message,
    });
  }
};

// PUT
export const updateSubstitution = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inv?lido' });
    }

    const data = await substitutionService.update(id, req.body);
    res.json({
      success: true,
      message: 'Sustituci?n actualizada exitosamente',
      data,
    });
  } catch (error: any) {
    if (error.message === 'Sustituci?n no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: 'Error al actualizar sustituci?n',
      error: error.message,
    });
  }
};

// PATCH
export const patchSubstitution = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inv?lido' });
    }

    const data = await substitutionService.patch(id, req.body);
    res.json({
      success: true,
      message: 'Sustituci?n actualizada parcialmente',
      data,
    });
  } catch (error: any) {
    if (error.message === 'Sustituci?n no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: 'Error al actualizar sustituci?n',
      error: error.message,
    });
  }
};

// DELETE
export const deleteSubstitution = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inv?lido' });
    }

    const data = await substitutionService.remove(id);
    res.json({
      success: true,
      message: 'Sustituci?n eliminada exitosamente',
      data,
    });
  } catch (error: any) {
    if (error.message === 'Sustituci?n no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sustituci?n',
      error: error.message,
    });
  }
};

// PATCH /:id/close ? cierra la sustituci?n y reactiva al titular
export const closeSubstitution = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inv?lido' });
    }

    const { endDate } = req.body;
    if (!endDate) {
      return res.status(400).json({ success: false, message: 'endDate es obligatorio' });
    }

    const data = await substitutionService.closeSubstitution(id, new Date(endDate));
    res.json({
      success: true,
      message: 'Sustituci?n cerrada y titular reactivado',
      data,
    });
  } catch (error: any) {
    if (error.message === 'Sustituci?n no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: 'Error al cerrar sustituci?n',
      error: error.message,
    });
  }
};