import type { Request, Response } from 'express';
import * as studentOnSubjectService from './student-registration.service.js';

export const createStudentOnSubjectOnGroup = async (req: Request, res: Response) => {
  try {
    const studentData = req.body; 
    const newEntries = await studentOnSubjectService.create(studentData);
    
    res.status(201).json({
      success: true,
      data: newEntries,
    });
    
    console.log('CONTROLLER: Respuesta enviada exitosamente');
  } catch (error: any) {
    
    res.status(400).json({
      success: false,
      message: 'Error al matricular estudiante',
      error: error.message,
    });
  }
};



/*
// Controller
export const createStudentOnSubjectOnGroup = async (req: Request, res: Response) => {
  try {
    const studentData = req.body; // aquí está todo el array de registros

    const newEntries = await studentOnSubjectService.create(studentData);

    res.status(201).json({
      success: true,
      data: newEntries,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error al matricular estudiante',
      error: error.message,
    });
  }
};

*/
