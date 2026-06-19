import prisma from '../../config/prisma.js';

export const findAll = async () => {
    return await prisma.admin.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
};
//nuevos cambios para git

export const findById = async (id: number) => {
    return await prisma.admin.findUnique({
        where: { id },
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
    return await prisma.admin.create({
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
    const exists = await prisma.admin.findUnique({ where: { id } });
    if (!exists) {
        throw new Error('Admin no encontrado');
    }

    const updateData: any = { ...data };
    if (data.birthDate) {
        updateData.birthDate = new Date(data.birthDate);
    }

    return await prisma.admin.update({
        where: { id },
        data: updateData,
    });
};

export const remove = async (id: number) => {
    const exists = await prisma.admin.findUnique({ where: { id } });
    if (!exists) {
        throw new Error('Admin no encontrado');
    }

    return await prisma.admin.delete({
        where: { id },
    });
};