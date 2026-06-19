import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TaskType } from '@prisma/client';
import prisma from '../../config/prisma.js';
import * as taskService from './task.service.js';

describe('TaskService (Unit)', () => {
    beforeEach(() => {
        // Clear all previous mocks
        jest.clearAllMocks();
        
        // Spy on prisma methods
        jest.spyOn(prisma.task, 'findMany').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.task, 'findUnique').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.task, 'create').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.task, 'update').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.task, 'delete').mockImplementation(jest.fn() as any);
        
        jest.spyOn(prisma.teacherOnSubjectOnGroup, 'findUnique').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.studentOnSubjectOnGroup, 'findMany').mockImplementation(jest.fn() as any);
        jest.spyOn(prisma.studentTask, 'createMany').mockImplementation(jest.fn() as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findAll', () => {
        it('debe devolver todas las tareas correctamente', async () => {
            const mockTasks = [{ id: 1, title: 'Test Task' }, { id: 2, title: 'Task 2' }];
            (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks as never);

            const result = await taskService.findAll();

            expect(prisma.task.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockTasks);
        });
    });

    describe('findById', () => {
        it('debe devolver la tarea si el ID es válido', async () => {
            const mockTask = { id: 5, title: 'Task 5' };
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask as never);

            const result = await taskService.findById(5);

            expect(prisma.task.findUnique).toHaveBeenCalledWith({
                where: { id: 5 },
                include: expect.any(Object),
            });
            expect(result).toEqual(mockTask);
        });
    });

    describe('create', () => {
        const createTaskInput = {
            idTeacherAssignment: 10,
            title: 'Nueva Tarea',
            type: TaskType.HOMEWORK,
            startDate: '2025-01-01',
            dueDate: '2025-01-10',
            schoolYear: '2024-2025'
        };

        it('debe arrojar error si la asignación no existe', async () => {
            (prisma.teacherOnSubjectOnGroup.findUnique as jest.Mock).mockResolvedValue(null as never);

            await expect(taskService.create(createTaskInput)).rejects.toThrow('La asignación de profesor no existe');
        });

        it('debe crear la tarea y generar los studentTasks para los alumnos matriculados', async () => {
            (prisma.teacherOnSubjectOnGroup.findUnique as jest.Mock).mockResolvedValue({
                id: 10, idSubject: 1, idGroup: 2
            } as never);

            const createdTask = { id: 100, ...createTaskInput, isPublished: true };
            (prisma.task.create as jest.Mock).mockResolvedValue(createdTask as never);

            const mockEnrollments = [{ id: 20 }, { id: 21 }];
            (prisma.studentOnSubjectOnGroup.findMany as jest.Mock).mockResolvedValue(mockEnrollments as never);

            const result = await taskService.create(createTaskInput);

            expect(prisma.task.create).toHaveBeenCalled();
            expect(prisma.studentTask.createMany).toHaveBeenCalledWith({
                data: [
                    { idTask: 100, idStudentEnrollment: 20, status: 'PENDING' },
                    { idTask: 100, idStudentEnrollment: 21, status: 'PENDING' }
                ]
            });
            expect(result).toEqual(createdTask);
        });

        it('no debe crear studentTasks si la tarea se crea sin publicar', async () => {
            (prisma.teacherOnSubjectOnGroup.findUnique as jest.Mock).mockResolvedValue({
                id: 10, idSubject: 1, idGroup: 2
            } as never);

            const createdTask = { id: 101, ...createTaskInput, isPublished: false };
            (prisma.task.create as jest.Mock).mockResolvedValue(createdTask as never);

            const result = await taskService.create(createTaskInput);

            expect(prisma.studentOnSubjectOnGroup.findMany).not.toHaveBeenCalled();
            expect(prisma.studentTask.createMany).not.toHaveBeenCalled();
            expect(result).toEqual(createdTask);
        });
    });

    describe('update', () => {
        it('debe arrojar error si la tarea a actualizar no existe', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null as never);

            await expect(taskService.update(99, { title: 'No existe' }, 1, 'ADMIN')).rejects.toThrow('Tarea no encontrada');
        });

        it('debe actualizar los datos correctamente si existe', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                title: 'Old Title',
                startDate: new Date('2025-01-01'),
                dueDate: new Date('2025-01-10'),
                isPublished: false,
                teacherAssignment: { teacher: { id: 1 } }
            } as never);
            const mockUpdate = { id: 1, title: 'New Title' };
            (prisma.task.update as jest.Mock).mockResolvedValue(mockUpdate as never);

            const result = await taskService.update(1, { title: 'New Title' }, 1, 'TEACHER');

            expect(prisma.task.update).toHaveBeenCalledWith(expect.objectContaining({
                 where: { id: 1 },
                 data: { title: 'New Title' }
            }));
            expect(result).toEqual(mockUpdate);
        });

        it('debe crear studentTasks al pasar de no publicada a publicada', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                title: 'Task',
                startDate: new Date('2025-01-01'),
                dueDate: new Date('2025-01-10'),
                isPublished: false,
                idTeacherAssignment: 10,
                schoolYear: '2024-2025',
                teacherAssignment: { teacher: { id: 1 } }
            } as never);

            (prisma.task.update as jest.Mock).mockResolvedValue({
                id: 1,
                isPublished: true,
                idTeacherAssignment: 10,
                schoolYear: '2024-2025'
            } as never);

            (prisma.teacherOnSubjectOnGroup.findUnique as jest.Mock).mockResolvedValue({
                id: 10, idSubject: 1, idGroup: 2
            } as never);

            (prisma.studentOnSubjectOnGroup.findMany as jest.Mock).mockResolvedValue([{ id: 20 }] as never);

            await taskService.update(1, { isPublished: true }, 1, 'TEACHER');

            expect(prisma.studentTask.createMany).toHaveBeenCalledWith({
                data: [{ idTask: 1, idStudentEnrollment: 20, status: 'PENDING' }],
                skipDuplicates: true,
            });
        });
    });

    describe('remove', () => {
        it('debe fallar si la tarea a eliminar no existe', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null as never);

            await expect(taskService.remove(999, 1, 'ADMIN')).rejects.toThrow('Tarea no encontrada');
        });

        it('debe eliminar la tarea felizmente', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue({
                id: 2,
                teacherAssignment: { teacher: { id: 1 } }
            } as never);
            (prisma.task.delete as jest.Mock).mockResolvedValue({ id: 2, title: 'Deleted' } as never);

            const result = await taskService.remove(2, 1, 'TEACHER');

            expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(result).toEqual({ id: 2, title: 'Deleted' });
        });
    });
});

