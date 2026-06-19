import type { Request, Response } from 'express';
import * as groupService from './group.service.js';

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groups = await groupService.findAll();
    res.json({
      success: true,
      data: groups,
      count: groups.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener grupos',
      error: error.message,
    });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const group = await groupService.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado',
      });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener grupo',
      error: error.message,
    });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    const newGroup = await groupService.create(groupData);

    res.status(201).json({
      success: true,
      data: newGroup,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error al crear grupo',
      error: error.message,
    });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const groupData = req.body;
    const updatedGroup = await groupService.update(id, groupData);

    res.json({
      success: true,
      message: 'Grupo actualizado exitosamente',
      data: updatedGroup,
    });
  } catch (error: any) {
    if (error.message === 'Grupo no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar grupo',
      error: error.message,
    });
  }
};

export const patchGroup = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const updatedGroup = await groupService.patch(id, req.body);

    res.json({
      success: true,
      message: 'Grupo actualizado parcialmente',
      data: updatedGroup,
    });
  } catch (error: any) {
    if (error.message === 'Grupo no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar grupo',
      error: error.message,
    });
  }
};



export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const deletedGroup = await groupService.remove(id);

    res.json({
      success: true,
      message: 'Grupo eliminado exitosamente',
      data: deletedGroup,
    });
  } catch (error: any) {
    if (error.message === 'Grupo no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar grupo',
      error: error.message,
    });
  }
};
