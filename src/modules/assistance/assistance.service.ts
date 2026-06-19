import { AssistanceStatus, JustificationStatus } from '@prisma/client';
import prisma from '../../config/prisma.js';
export const findAllByStudentId = async (studentId: number, teacherId?: number) => {
    const whereClause: any = {
        studentEnrollment: { idStudent: studentId },
        OR: [{ status: AssistanceStatus.LATE }, { status: AssistanceStatus.ABSENT }, { status: AssistanceStatus.EXCUSED }]
    };

    if (teacherId) {
        whereClause.session = {
            schedule: {
                teacherAssignment: {
                    idTeacher: teacherId
                }
            }
        };
    }

    return await prisma.assistance.findMany({
        where: whereClause,
        select: {
            id: true,
            status: true,
            justificationUri: true,
            justificationStatus: true,
            session: {
                select: {
                    id: true,
                    date: true,
                    schedule: {
                        select: {
                            startTime: true,
                            teacherAssignment: {
                                select: {
                                    subject: {
                                        select: { name: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};
export const updateStatusToJustified = async (idAssistance: number) => {
    return await prisma.assistance.update({
        where: {
            id: idAssistance,
        },
        data: {
            status: AssistanceStatus.EXCUSED,
            justificationStatus: JustificationStatus.VIEWED,
        },
    });
};

export const rejectJustification = async (idAssistance: number) => {
    return await prisma.assistance.update({
        where: { id: idAssistance },
        data: { justificationStatus: JustificationStatus.REJECTED },
    });
};

export const findPendingJustificationsByTeacher = async (
    teacherId: number,
    idTeacherAssignment?: number
) => {
    const assignmentFilter = idTeacherAssignment
        ? { id: idTeacherAssignment, idTeacher: teacherId }
        : { idTeacher: teacherId };

    return await prisma.assistance.findMany({
        where: {
            justificationStatus: JustificationStatus.PENDING,
            justificationUri: { not: null },
            session: {
                schedule: {
                    teacherAssignment: assignmentFilter,
                },
            },
        },
        select: {
            id: true,
            status: true,
            justificationUri: true,
            justificationStatus: true,
            session: {
                select: {
                    date: true,
                    schedule: {
                        select: {
                            startTime: true,
                            teacherAssignment: {
                                select: {
                                    subject: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
            },
            studentEnrollment: {
                select: {
                    student: {
                        select: { name: true, surname: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const updateStatusById = async (id: number, status: AssistanceStatus) => {
    return await prisma.assistance.update({
        where: { id },
        data: { status }
    });
};

export const updateJustificationUrl = async (id: number, justificationUri: string) => {
    return await prisma.assistance.update({
        where: { id },
        data: { 
            justificationUri,
            justificationStatus: 'PENDING'
        }
    });
};

export const updateJustificationOnUpload = async (id: number, justificationUri: string) => {
    return await prisma.assistance.update({
        where: { id },
        data: {
            justificationUri,
            justificationStatus: 'PENDING',
        },
    });
};

export const findAll = async () => {
    return await prisma.assistance.findMany({
        include: {
            session: {
                include: {
                    schedule: {
                        include: {
                            teacherAssignment: {
                                select: {
                                    idTeacher: true,
                                    subject: {
                                        select: { name: true }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            studentEnrollment: { include: { student: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const findById = async (id: number) => {
    return await prisma.assistance.findUnique({
        where: { id },
        include: {
            session: true,
            studentEnrollment: { include: { student: true } }
        }
    });
};

export const findJustificationDetailsById = async (id: number) => {
    return await prisma.assistance.findUnique({
        where: { id },
        select: {
            id: true,
            status: true,
            studentEnrollment: {
                select: { idStudent: true }
            },
            session: {
                select: {
                    date: true,
                    schedule: {
                        select: {
                            startTime: true,
                            teacherAssignment: {
                                select: {
                                    subject: {
                                        select: { name: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
};

export const findBySessionId = async (idSession: number) => {
    return await prisma.assistance.findMany({
        where: { idSession },
        include: {
            session: true,
            studentEnrollment: { include: { student: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};


export const findAllByStudentEnrollment = async (studentEnrollmentId: number, teacherId?: number) => {
    const whereClause: any = {
        idStudentEnrollment: studentEnrollmentId,
        OR: [{ status: AssistanceStatus.LATE }, { status: AssistanceStatus.ABSENT }]
    };

    if (teacherId) {
        whereClause.session = {
            schedule: {
                teacherAssignment: {
                    idTeacher: teacherId
                }
            }
        };
    }

    return await prisma.assistance.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });
};

export const findAllBySessionId = async (sessionId: number) => {
    return await prisma.assistance.findMany({
        where: { idSession: sessionId },
        select: {
            id: true,
            status: true,
            studentEnrollment: {
                select: {
                    student: {
                        select: {
                            name: true,
                            surname: true,
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const create = async (data: {
    idSession: number;
    idStudentEnrollment: number;
    status?: AssistanceStatus;
}) => {
    return await prisma.assistance.create({
        data: {
            idSession: data.idSession,
            idStudentEnrollment: data.idStudentEnrollment,
            status: data.status || AssistanceStatus.PRESENT
        }
    });
};

export const createMany = async (assistances: {
    idSession: number;
    idStudentEnrollment: number;
    status: AssistanceStatus;
}[]) => {
    return await prisma.$transaction(
        assistances.map((ast) =>
            prisma.assistance.upsert({
                where: {
                    idSession_idStudentEnrollment: {
                        idSession: ast.idSession,
                        idStudentEnrollment: ast.idStudentEnrollment,
                    },
                },
                update: {
                    status: ast.status,
                    createdAt: new Date(), // actualizamos la fecha de creacion al sobreescribir
                },
                create: {
                    idSession: ast.idSession,
                    idStudentEnrollment: ast.idStudentEnrollment,
                    status: ast.status,
                },
            })
        )
    );
};




export const remove = async (id: number) => {
    const exists = await prisma.assistance.findUnique({ where: { id } });
    if (!exists) throw new Error('Asistencia no encontrada');

    return await prisma.assistance.delete({ where: { id } });
};

export const findAllByTeacher = async (teacherId: number) => {
    return await prisma.assistance.findMany({
        where: {
            session: {
                schedule: {
                    teacherAssignment: {
                        idTeacher: teacherId
                    }
                }
            }
        },
        include: {
            session: {
                include: {
                    schedule: {
                        include: {
                            teacherAssignment: {
                                include: {
                                    subject: true
                                }
                            }
                        }
                    }
                }
            },
            studentEnrollment: { include: { student: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const checkSessionOwnership = async (sessionId: number, teacherId: number): Promise<boolean> => {
    const session = await prisma.sessionClass.findUnique({
        where: { id: sessionId },
        include: { schedule: true }
    });
    if (!session) return false;

    const teacherAssignment = await prisma.teacherOnSubjectOnGroup.findUnique({
        where: { id: session.schedule.idTeacherAssignment }
    });
    return teacherAssignment?.idTeacher === teacherId;
};

export const checkAssistanceOwnership = async (assistanceId: number, teacherId: number): Promise<boolean> => {
    const assistance = await prisma.assistance.findUnique({
        where: { id: assistanceId },
        include: { session: { include: { schedule: true } } }
    });
    if (!assistance) return false;

    const teacherAssignment = await prisma.teacherOnSubjectOnGroup.findUnique({
        where: { id: assistance.session.schedule.idTeacherAssignment }
    });
    return teacherAssignment?.idTeacher === teacherId;
};
