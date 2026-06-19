import prisma from '../../config/prisma.js';

export const findAll = async () => {
  return await prisma.subject.findMany({
    include: {
      course: true,
    },
  });
};

export const findById = async (id: number) => {
  return await prisma.subject.findUnique({
    where: { id },
    include: {
      course: true,
       teacherAssignments: {
        include: {
          teacher: true,
        },
      },
      studentEnrollments: {
        include: {
          student: true,
          group: true,
        },
      },
    },
  });
};

export const create = async (data: {
  name: string;
  idCourse: number;
  grade: string;
}) => {
  return await prisma.subject.create({
    data,
    include: {
      course: true,
    },
  });
};

export const update = async (
  id: number,
  data: {
    name?: string;
    idCourse?: number;
  }
) => {
  const exists = await prisma.subject.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Asignatura no encontrada');
  }

  return await prisma.subject.update({
    where: { id },
    data,
    include: {
      course: true,
    },
  });
};

export const patch = async (
  id: number,
  data: Partial<{
    name: string;
    idCourse: number;
  }>
) => {
  const exists = await prisma.subject.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Asignatura no encontrada');
  }

  return await prisma.subject.update({
    where: { id },
    data,
    include: {
      course: true,
    },
  });
};


export const remove = async (id: number) => {
  const exists = await prisma.subject.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Asignatura no encontrada');
  }

  return await prisma.subject.delete({
    where: { id },
  });
};

export const findTeachersBySubjectId = async (subjectId: number) => {
  const result = await prisma.teacherOnSubjectOnGroup.findMany({
    where: { idSubject: subjectId },
    include: {
      teacher: true,
    },
  });

  return result.map((item) => item.teacher);
};

export const findStudentsBySubjectId = async (subjectId: number) => {
  const result = await prisma.studentOnSubjectOnGroup.findMany({
    where: { idSubject: subjectId },
    include: {
      student: true,
      group: true,
    },
  });

  return result.map((item) => ({
    enrollmentId: item.id,   // id del StudentOnSubjectOnGroup  (idStudentEnrollment)
    ...item.student,
    group: item.group,
    schoolYear: item.schoolYear,
  }));
};

export const findSubjectByCourseId = async (id: number) => {
    const result = await prisma.subject.findMany({
      where: { idCourse: id},
      include: {
        course: true,
        _count: true,
      },
    });

    return result.map((item) => ({
      ...item.course,
      subjectId: item.id,    // datos importantes del subject
      subjectName: item.name,
      idCourse: item.idCourse,
      count: item._count, 
    }))
}
