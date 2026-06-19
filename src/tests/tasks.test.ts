import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

describe('Tasks Endpoints (Integration)', () => {
    let authCookie: string;
    let mockTeacherId: number;
    let mockTeacherAssignmentId: number;
    let mockTaskId: number;

    const generateCookie = (payload: { sub: number, role: string, email: string, firebaseUID: string }) => {
        const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
        return `auth_token=${token}`;
    };

    beforeAll(async () => {
        // 1. Limpiar rastro anterior si quedó por error
        await prisma.teacher.deleteMany({ where: { email: 'admin_test_task@example.com' } });

        // 2. Crear datos de entorno
        const course = await prisma.course.create({
            data: { name: 'CICLO_TEST_TASK', description: 'Test', duration: 2 }
        });

        const subject = await prisma.subject.create({
            data: { name: 'SUBJ_TEST', grade: '1', idCourse: course.id }
        });

        const group = await prisma.group.create({
            data: { name: 'GROUP_TEST' }
        });

        const teacher = await prisma.teacher.create({
            data: {
                email: 'admin_test_task@example.com',
                name: 'Teacher',
                surname: 'Test',
                birthDate: new Date(),
                dni: '12345678TEST',
                firebaseUID: 'testuid_task',
                role: 'ADMIN' // Lo hacemos ADMIN para asegurar acceso total
            }
        });
        mockTeacherId = teacher.id;

        const assignment = await prisma.teacherOnSubjectOnGroup.create({
            data: {
                idTeacher: teacher.id,
                idSubject: subject.id,
                idGroup: group.id,
                schoolYear: '2024-2025'
            }
        });
        mockTeacherAssignmentId = assignment.id;

        // 3. Generar cookie
        authCookie = generateCookie({
            sub: teacher.id,
            role: 'ADMIN',
            email: teacher.email,
            firebaseUID: teacher.firebaseUID
        });
    });

    afterAll(async () => {
        // Al borrar el profe, todo se borra en cascada (Asignaciones, Tareas, etc.)
        if (mockTeacherId) {
            await prisma.teacher.delete({ where: { id: mockTeacherId } });
        }
        // Borramos tb el ciclo que arrastra la asignatura
        await prisma.course.deleteMany({ where: { name: 'CICLO_TEST_TASK' } });
        await prisma.group.deleteMany({ where: { name: 'GROUP_TEST' } });

        await prisma.$disconnect();
    });

    describe('POST /api/tasks', () => {
        it('debe crear una nueva tarea exitosamente como ADMIN', async () => {
            const newTask = {
                idTeacherAssignment: mockTeacherAssignmentId,
                title: 'Test Integration Task',
                description: 'Description',
                type: 'HOMEWORK',
                startDate: '2025-01-01T00:00:00Z',
                dueDate: '2025-01-31T23:59:59Z',
                schoolYear: '2024-2025'
            };

            const res = await request(app)
                .post('/api/tasks')
                .set('Cookie', [authCookie])
                .send(newTask);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Test Integration Task');
            mockTaskId = res.body.data.id;
        });
    });

    describe('GET /api/tasks', () => {
        it('debe obtener la lista de tareas', async () => {
            const res = await request(app)
                .get('/api/tasks')
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.map((t: any) => t.id)).toContain(mockTaskId);
        });
    });

    describe('GET /api/tasks/:id', () => {
        it('debe obtener una tarea específica por id', async () => {
            const res = await request(app)
                .get(`/api/tasks/${mockTaskId}`)
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(mockTaskId);
            expect(res.body.data.title).toBe('Test Integration Task');
        });
    });

    describe('PATCH /api/tasks/:id', () => {
        it('debe actualizar una tarea exitosamente', async () => {
            const res = await request(app)
                .patch(`/api/tasks/${mockTaskId}`)
                .set('Cookie', [authCookie])
                .send({ title: 'Title Updated' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Title Updated');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('debe borrar la tarea exitosamente', async () => {
            const res = await request(app)
                .delete(`/api/tasks/${mockTaskId}`)
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Fetch to ensure deleted
            const check = await request(app)
                .get(`/api/tasks/${mockTaskId}`)
                .set('Cookie', [authCookie]);
            expect(check.status).toBe(404);
        });
    });
});
