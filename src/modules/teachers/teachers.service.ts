import prisma from '../../config/prisma.js';
import { firebaseAdmin } from '../../firebase.js';
import { logger } from '../../utils/logger.js';

export const findAll = async () => {
    return await prisma.teacher.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const findById = async (id: number) => {
    return await prisma.teacher.findUnique({
        where: { id },
        include: {
           assignments: {
            include: {
                subject:{
                    select:{
                        name : true,
                        grade: true,
                        course: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
           }
        },
    });
};

export const create = async (data: {
    email: string;
    name: string;
    surname: string;
    ndSurname?: string;
    birthDate: string | Date;
    dni: string;
    firebaseUID: string;
}) => {
    return await prisma.teacher.create({
        data: {
            ...data,
            birthDate: new Date(data.birthDate),
        },
    });
};

export const update = async (
    id: number,
    data: {
        email?: string;
        name?: string;
        surname?: string;
        ndSurname?: string;
        birthDate?: string | Date;
        dni?: string;
    }
) => {
    const exists = await prisma.teacher.findUnique({ where: { id } });
    if (!exists) {
        throw new Error('Profesor no encontrado');
    }

    const updateData: any = { ...data };
    if (data.birthDate) {
        updateData.birthDate = new Date(data.birthDate);
    }

    return await prisma.teacher.update({
        where: { id },
        data: updateData,
    });
};

export const remove = async (id: number) => {
    const exists = await prisma.teacher.findUnique({ where: { id } });
    if (!exists) {
        throw new Error('Profesor no encontrado');
    }

  try {
        await firebaseAdmin.auth().deleteUser(exists.firebaseUID);
        logger.info('Usuario Firebase eliminado', { firebaseUID: exists.firebaseUID });
        return await prisma.teacher.delete({
        where: { id },
    }
);
    } catch (err) {
        logger.error('Error borrando usuario Firebase', { err, teacherId: id });
        throw new Error('No se pudo eliminar usuario en Firebase');
    }

    // ------------------------
    // Solo si Firebase fue eliminado, borramos de la BD
    // ------------------------
    
};

export const findSubjectsByTeacherId = async (teacherId: number) => {
    return await prisma.teacherOnSubjectOnGroup.findMany({
        where: { idTeacher: teacherId },
        include: {
            subject: {
                include: {
                    course: true
                }
            },
            group: true
        }
    });
};

export const findStudentsAbsencesByTeacher = async (teacherId: number) => {
    const teacherAssignments = await prisma.teacherOnSubjectOnGroup.findMany({
        where: { idTeacher: teacherId },
        select: { idSubject: true, idGroup: true, schoolYear: true, subject: { select: { name: true } } }
    });

    if (teacherAssignments.length === 0) return [];

    const orConditions = teacherAssignments.map(a => ({
        idSubject: a.idSubject,
        idGroup: a.idGroup,
        schoolYear: a.schoolYear
    }));

    const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
        where: {
            OR: orConditions
        },
        include: {
            student: {
                select: { id: true, name: true, surname: true, email: true }
            },
            subject: {
                select: { name: true }
            },
            assistances: {
                where: {
                    OR: [
                        { status: 'ABSENT' },
                        { status: 'LATE' },
                        { status: 'EXCUSED' }
                    ]
                },
                select: {
                    id: true,
                    status: true,
                    justificationStatus: true
                }
            }
        }
    });

    const studentMap = new Map();
    
    for (const enr of enrollments) {
        if (!studentMap.has(enr.student.id)) {
            studentMap.set(enr.student.id, {
                student: enr.student,
                subjects: [],
                totalAbsences: 0
            });
        }
        
        const stData = studentMap.get(enr.student.id);
        const absenceCount = enr.assistances.length;
        
        stData.subjects.push({
            subjectName: enr.subject.name,
            absences: absenceCount
        });
        
        stData.totalAbsences += absenceCount;
    }
    
    return Array.from(studentMap.values()).sort((a: any, b: any) => b.totalAbsences - a.totalAbsences);
};
