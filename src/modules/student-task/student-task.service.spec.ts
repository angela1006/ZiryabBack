import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../../config/prisma.js';
import * as studentTaskService from './student-task.service.js';

describe('StudentTaskService (Unit)', () => {
    beforeEach(() => {
        // Limpiamos los mocks antes de cada test
        jest.clearAllMocks();
        
        // Espiamos los métodos de studentTask en Prisma
        jest.spyOn(prisma.studentTask, 'findMany').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.studentTask, 'findUnique').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.studentTask, 'update').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.studentTask, 'delete').mockImplementation(jest.fn() as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findAll', () => {
        it('debe devolver todas las entregas correctamente', async () => {
            const mockData = [{ id: 1, status: 'PENDING' }, { id: 2, status: 'SUBMITTED' }];
            (prisma.studentTask.findMany as jest.Mock).mockResolvedValue(mockData as never);

            const result = await studentTaskService.findAll();

            expect(prisma.studentTask.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });

    describe('findById', () => {
        it('debe devolver la entrega si el ID es válido', async () => {
            const mockData = { id: 5, status: 'GRADED' };
            (prisma.studentTask.findUnique as jest.Mock).mockResolvedValue(mockData as never);

            const result = await studentTaskService.findById(5);

            expect(prisma.studentTask.findUnique).toHaveBeenCalledWith({
                where: { id: 5 },
                include: expect.any(Object),
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('findByTask', () => {
        it('debe devolver las entregas de una tarea específica', async () => {
            const mockData = [{ id: 10, idTask: 2 }];
            (prisma.studentTask.findMany as jest.Mock).mockResolvedValue(mockData as never);

            const result = await studentTaskService.findByTask(2);

            expect(prisma.studentTask.findMany).toHaveBeenCalledWith({
                where: { idTask: 2 },
                include: expect.any(Object),
                orderBy: { submissionDate: 'desc' }
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('findByStudent', () => {
        it('debe devolver las entregas de un estudiante específico', async () => {
            const mockData = [{ id: 11, idStudentEnrollment: 3 }];
            (prisma.studentTask.findMany as jest.Mock).mockResolvedValue(mockData as never);

            const result = await studentTaskService.findByStudent(3);

            expect(prisma.studentTask.findMany).toHaveBeenCalledWith({
                where: { idStudentEnrollment: 3 },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('update', () => {
        it('debe arrojar error si la entrega a actualizar no existe', async () => {
            (prisma.studentTask.findUnique as jest.Mock).mockResolvedValue(null as never);

            await expect(studentTaskService.update(99, { status: 'GRADED' })).rejects.toThrow('Entrega de estudiante no encontrada');
        });

        it('debe actualizar los datos correctamente si existe', async () => {
            (prisma.studentTask.findUnique as jest.Mock).mockResolvedValue({ id: 1, status: 'SUBMITTED' } as never);
            const mockUpdate = { id: 1, status: 'GRADED', score: 8.5 };
            (prisma.studentTask.update as jest.Mock).mockResolvedValue(mockUpdate as never);

            const result = await studentTaskService.update(1, { status: 'GRADED', score: 8.5 });

            expect(prisma.studentTask.update).toHaveBeenCalledWith(expect.objectContaining({
                 where: { id: 1 },
                 data: expect.objectContaining({ status: 'GRADED', score: 8.5 })
            }));
            expect(result).toEqual(mockUpdate);
        });
    });

    describe('remove', () => {
        it('debe fallar si la entrega a eliminar no existe', async () => {
            (prisma.studentTask.findUnique as jest.Mock).mockResolvedValue(null as never);

            await expect(studentTaskService.remove(999)).rejects.toThrow('Entrega de estudiante no encontrada');
        });

        it('debe eliminar la entrega felizmente', async () => {
            (prisma.studentTask.findUnique as jest.Mock).mockResolvedValue({ id: 2 } as never);
            (prisma.studentTask.delete as jest.Mock).mockResolvedValue({ id: 2 } as never);

            const result = await studentTaskService.remove(2);

            expect(prisma.studentTask.delete).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(result).toEqual({ id: 2 });
        });
    });
});
