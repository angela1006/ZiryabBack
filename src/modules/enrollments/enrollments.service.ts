import prisma from '../../config/prisma.js'

// teacher-assignment.service.ts
/**
 * Obtiene todas lineas de relación entre teacher-subject-group(assingment pero esta aquí de momento)
 * @param assignmentId - ID de TeacherOnSubjectOnGroup
 * @returns Assignment con lista de estudiantes matriculados
 */


export const getAllEnrollments = async () => {
    const enrollments = await prisma.teacherOnSubjectOnGroup.findMany({
        include: {
            group: true,
            subject: true,
            teacher: true
        }
    });
    return enrollments;
};


/**
 * Obtiene las asignaciones de un profesor en un año académico
 * @param idTeacher - ID del profesor 
 * @param schoolYear - Año académico (ej: "2024-2025")
 * @returns Lista de asignaciones con toda la información necesaria para mostrar tarjetas
 */
export const getAssignmentsByTeacher = async (
  idTeacher: number,
  schoolYear: string
) => {
  return prisma.teacherOnSubjectOnGroup.findMany({
    where: {
      idTeacher,
      schoolYear
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          grade: true,
          course: {
            select: {
              id: true,
              name: true  // Para mostrar "DAM", "DAW", etc.
            }
          }
        }
      },
      group: {
        select: {
          id: true,
          name: true  // "Mañana", "Tarde"
        }
      }
    },
    orderBy: [
      { subject: { course: { name: 'asc' } } },  // Primero por ciclo
      { subject: { grade: 'asc' } },              // Luego por curso
      { subject: { name: 'asc' } },               // Luego por asignatura
      { group: { name: 'asc' } }                  // Finalmente por grupo
    ]
  });
};

export const getStudentsByAssignmentId = async (id: number) => {
  const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
    where: {
      group: {
        teacherAssignments: {
          some: {
            id,
          },
        },
      },
    },
    include: {
      student: true,
    },
  });

  return enrollments;
};
/*
export const getStudentsByAssignment = async (assignmentId: number) => {
  // Primero obtenemos el assignment para saber subject y schoolYear
  const assignment = await prisma.teacherOnSubjectOnGroup.findUnique({
    where: { id: assignmentId },
    include: {
      subject: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
    }
  });

  if (!assignment) {
    return null;
  }

  // Luego buscamos los enrollments que coincidan
  const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
    where: {
      idSubject: assignment.idSubject,  // ← Aquí usa el idSubject del assignment
      idGroup: assignment.idGroup,
      schoolYear: assignment.schoolYear  // ← Aquí usa el schoolYear del assignment
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          surname: true,
          ndSurname: true,
          email: true
        }
      }
    }
  });

};
 */ 

export const getEnrollmentsByFilters = async (
  idSubject: number,
  idGroup: number,
  schoolYear: string
) => {
  const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
    where: {
      idSubject: idSubject,
      idGroup: idGroup,
      schoolYear: schoolYear,
    },
    include: {
      student: true,
    },
    orderBy: {
      student: {
        surname: 'asc',
      },
    },
  });
    return enrollments;
};