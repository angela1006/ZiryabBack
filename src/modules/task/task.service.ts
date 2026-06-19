import { TaskType } from '@prisma/client';
import prisma from '../../config/prisma.js';
// ============================================
// TIPOS
// ============================================

export interface CreateTaskData {
  idTeacherAssignment: number;
  title: string;
  description?: string;
  type: TaskType;
  startDate: string;
  dueDate: string;
  attachmentUrl?: string;
  schoolYear: string;
  idTaskGroup?: number;
  isPublished?: boolean;
  allowLateSubmission?: boolean;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: TaskType;
  startDate?: string;
  dueDate?: string;
  attachmentUrl?: string | null;
  idTaskGroup?: number | null;
  isPublished?: boolean;
  allowLateSubmission?: boolean;
}

// ============================================
// QUERIES
// ============================================

export const findAll = async () => {
  return prisma.task.findMany({
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      taskGroup: true,
      studentTasks: true,
    },
    orderBy: {
      dueDate: 'desc',
    },
  });
};

export const findById = async (id: number) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      taskGroup: true,
      studentTasks: {
        include: {
          studentEnrollment: {
            include: {
              student: true,
            },
          },
        },
      },
    },
  });
};

export const findByTeacherAssignment = async (idTeacherAssignment: number) => {
  return prisma.task.findMany({
    where: { idTeacherAssignment },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      taskGroup: true,
      studentTasks: true,
    },
    orderBy: {
      dueDate: 'desc',
    },
  });
};

// ============================================
// MUTACIONES
// ============================================

/**
 * Crea una tarea y genera automáticamente un StudentTask
 * en estado PENDING para cada alumno matriculado en la
 * asignatura + grupo + curso académico correspondientes.
 */
export const create = async (data: CreateTaskData) => {
  // 1. Verificar que el teacher assignment existe
  const assignment = await prisma.teacherOnSubjectOnGroup.findUnique({
    where: { id: data.idTeacherAssignment },
    include: {
      subject: true,
      group: true,
    },
  });

  if (!assignment) {
    throw new Error('La asignación de profesor no existe');
  }

  // 2. Validar coherencia de fechas
  const startDate = new Date(data.startDate);
  const dueDate = new Date(data.dueDate);

  if (startDate >= dueDate) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha límite de entrega');
  }

  // 3. Crear la tarea
  const task = await prisma.task.create({
    data: {
      idTeacherAssignment: data.idTeacherAssignment,
      title: data.title,
      description: data.description || null,
      type: data.type as any,
      startDate: new Date(data.startDate),
      dueDate: new Date(data.dueDate),
      attachmentUrl: data.attachmentUrl ?? null,
      schoolYear: data.schoolYear,
      isPublished: data.isPublished ?? false,
      allowLateSubmission: data.allowLateSubmission ?? false,
      ...(data.idTaskGroup && { idTaskGroup: data.idTaskGroup }),
    },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      taskGroup: true,
    },
  });

  // 4-5. Si se publica, generar StudentTask PENDING para matriculados.
  if (task.isPublished) {
    const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
      where: {
        idSubject: assignment.idSubject,
        idGroup: assignment.idGroup,
        schoolYear: data.schoolYear,
        status: 'ENROLLED',
      },
    });

    if (enrollments.length > 0) {
      await prisma.studentTask.createMany({
        data: enrollments.map(enrollment => ({
          idTask: task.id,
          idStudentEnrollment: enrollment.id,
          status: 'PENDING',
        })),
      });
    }
  }

  return task;
};

/**
 * Actualiza los campos editables de una tarea.
 * Comprueba que el profesor autenticado es el dueño de la asignación
 * salvo que sea ADMIN.
 *
 * @param id             - ID de la tarea a actualizar
 * @param data           - Campos a modificar (todos opcionales)
 * @param requesterId    - ID del usuario que realiza la petición
 * @param requesterRole  - Rol del usuario que realiza la petición
 */
export const update = async (
  id: number,
  data: UpdateTaskData,
  requesterId: number,
  requesterRole: string,
) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      teacherAssignment: { include: { teacher: true } },
    },
  });

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  // Ownership check: solo el profesor dueño o ADMIN pueden editar
  if (requesterRole !== 'ADMIN' && task.teacherAssignment.teacher.id !== requesterId) {
    throw new Error('No tienes permiso para modificar esta tarea');
  }

  // Validar coherencia de fechas si se cambia alguna de las dos
  const startDate = data.startDate ? new Date(data.startDate) : task.startDate;
  const dueDate = data.dueDate ? new Date(data.dueDate) : task.dueDate;

  if (startDate >= dueDate) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha límite de entrega');
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.type && { type: data.type as any }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.attachmentUrl !== undefined && { attachmentUrl: data.attachmentUrl }),
      ...(data.idTaskGroup !== undefined && { idTaskGroup: data.idTaskGroup }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.allowLateSubmission !== undefined && { allowLateSubmission: data.allowLateSubmission }),
    },
    include: {
      teacherAssignment: true,
      taskGroup: true,
      studentTasks: true,
    },
  });

  const justPublished = task.isPublished === false && data.isPublished === true;
  const existingStudentTaskCount = await prisma.studentTask.count({
    where: { idTask: id },
  });

  const shouldCreateStudentTasks =
    updatedTask.isPublished &&
    (justPublished || existingStudentTaskCount === 0);

  if (shouldCreateStudentTasks) {
    const assignment = await prisma.teacherOnSubjectOnGroup.findUnique({
      where: { id: updatedTask.idTeacherAssignment },
    });

    if (assignment) {
      const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
        where: {
          idSubject: assignment.idSubject,
          idGroup: assignment.idGroup,
          schoolYear: updatedTask.schoolYear,
          status: 'ENROLLED',
        },
      });

      if (enrollments.length > 0) {
        await prisma.studentTask.createMany({
          data: enrollments.map((enrollment) => ({
            idTask: updatedTask.id,
            idStudentEnrollment: enrollment.id,
            status: 'PENDING',
          })),
          skipDuplicates: true,
        });
      }
    }
  }

  return updatedTask;
};

/**
 * Elimina una tarea y en cascada sus StudentTask asociados.
 * Comprueba ownership igual que update.
 *
 * @param id             - ID de la tarea a eliminar
 * @param requesterId    - ID del usuario que realiza la petición
 * @param requesterRole  - Rol del usuario que realiza la petición
 */
export const remove = async (
  id: number,
  requesterId: number,
  requesterRole: string,
) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      teacherAssignment: { include: { teacher: true } },
    },
  });

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  // Ownership check
  if (requesterRole !== 'ADMIN' && task.teacherAssignment.teacher.id !== requesterId) {
    throw new Error('No tienes permiso para eliminar esta tarea');
  }

  return prisma.task.delete({ where: { id } });
};