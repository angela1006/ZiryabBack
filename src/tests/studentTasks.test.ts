import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

describe('StudentTasks Endpoints (Integration)', () => {
    let authCookie: string;
    let mockTeacherId: number;
    let mockStudentId: number;
    let mockTaskId: number;
    let mockStudentTaskId: number;
    let mockStudentEnrollmentId: number;

    const generateCookie = (payload: { sub: number, role: string, email: string, firebaseUID: string }) => {
        const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
        return `auth_token=${token}`;
    };

    beforeAll(async () => {
        // 1. Limpiar rastro anterior
        await prisma.teacher.deleteMany({ where: { email: 'admin_test_stask@example.com' } });
        await prisma.student.deleteMany({ where: { email: 'student_test_stask@example.com' } });

        // 2. Crear datos de entorno
        const course = await prisma.course.create({
            data: { name: 'CICLO_STASK', description: 'Test', duration: 2 }
        });

        const subject = await prisma.subject.create({
            data: { name: 'SUBJ_STASK', grade: '1', idCourse: course.id }
        });

        const group = await prisma.group.create({
            data: { name: 'GROUP_STASK' }
        });

        const teacher = await prisma.teacher.create({
            data: {
                email: 'admin_test_stask@example.com',
                name: 'Teacher',
                surname: 'Test',
                birthDate: new Date(),
                dni: '12345678TAS',
                firebaseUID: 'testuid_stask',
                role: 'ADMIN' // ADMIN para acceso total
            }
        });
        mockTeacherId = teacher.id;

        const student = await prisma.student.create({
            data: {
                email: 'student_test_stask@example.com',
                name: 'Student',
                surname: 'Test',
                birthDate: new Date(),
                dni: '87654321TAS',
                firebaseUID: 'testuid_student_stask',
            }
        });
        mockStudentId = student.id;

        const teacherAssignment = await prisma.teacherOnSubjectOnGroup.create({
            data: {
                idTeacher: teacher.id,
                idSubject: subject.id,
                idGroup: group.id,
                schoolYear: '2024-2025'
            }
        });

        const studentEnrollment = await prisma.studentOnSubjectOnGroup.create({
            data: {
                idStudent: student.id,
                idSubject: subject.id,
                idGroup: group.id,
                schoolYear: '2024-2025'
            }
        });
        mockStudentEnrollmentId = studentEnrollment.id;

        // Crear auth cookie (ADMIN)
        authCookie = generateCookie({
            sub: teacher.id,
            role: 'ADMIN',
            email: teacher.email,
            firebaseUID: teacher.firebaseUID
        });

        // Crear una tarea. Esto debería desencadenar (en el service, o lo insertamos directo)
        // Para simplificar la base de datos de test, insertamos la tarea y el studentTask manualmente porque en supertest a lo mejor no llamamos al servicio de task
        const task = await prisma.task.create({
            data: {
                idTeacherAssignment: teacherAssignment.id,
                title: 'Integration Test Task (StudentTask)',
                type: 'HOMEWORK',
                startDate: new Date(),
                dueDate: new Date(Date.now() + 1000000),
                schoolYear: '2024-2025'
            }
        });
        mockTaskId = task.id;

        const studentTask = await prisma.studentTask.create({
            data: {
                idTask: task.id,
                idStudentEnrollment: studentEnrollment.id,
                status: 'PENDING'
            }
        });
        mockStudentTaskId = studentTask.id;
    });

    afterAll(async () => {
        // Borrados en cascada a partir de los elementos base (o directo)
        if (mockTeacherId) await prisma.teacher.delete({ where: { id: mockTeacherId } });
        if (mockStudentId) await prisma.student.delete({ where: { id: mockStudentId } });
        
        await prisma.course.deleteMany({ where: { name: 'CICLO_STASK' } });
        await prisma.group.deleteMany({ where: { name: 'GROUP_STASK' } });

        await prisma.$disconnect();
    });

    describe('GET /api/student-tasks', () => {
        it('debe obtener la lista de entregas', async () => {
            const res = await request(app)
                .get('/api/student-tasks')
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.map((st: any) => st.id)).toContain(mockStudentTaskId);
        });
    });

    describe('GET /api/student-tasks/:id', () => {
        it('debe obtener una entrega específica por id', async () => {
            const res = await request(app)
                .get(`/api/student-tasks/${mockStudentTaskId}`)
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(mockStudentTaskId);
        });
    });

    describe('GET /api/student-tasks/task/:idTask', () => {
        it('debe obtener entregas por id de la tarea', async () => {
            const res = await request(app)
                .get(`/api/student-tasks/task/${mockTaskId}`)
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data[0].idTask).toBe(mockTaskId);
        });
    });

    describe('GET /api/student-tasks/student/:idStudentEnrollment', () => {
        it('debe obtener entregas por id de matricula del estudiante', async () => {
            const res = await request(app)
                .get(`/api/student-tasks/student/${mockStudentEnrollmentId}`)
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data[0].idStudentEnrollment).toBe(mockStudentEnrollmentId);
        });
    });


    describe('PATCH /api/student-tasks/:id', () => {
        it('debe actualizar una entrega exitosamente (ej. el profe califica)', async () => {
            const res = await request(app)
                .patch(`/api/student-tasks/${mockStudentTaskId}`)
                .set('Cookie', [authCookie])
                .send({ status: 'GRADED', score: 9.5, feedback: 'Buen trabajo' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('GRADED');
            expect(Number(res.body.data.score)).toBe(9.5);
            expect(res.body.data.feedback).toBe('Buen trabajo');
        });
    });

    describe('DELETE /api/student-tasks/:id', () => {
        it('debe borrar la entrega exitosamente', async () => {
            const res = await request(app)
                .delete(`/api/student-tasks/${mockStudentTaskId}`)
                .set('Cookie', [authCookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Fetch to ensure deleted
            const check = await request(app)
                .get(`/api/student-tasks/${mockStudentTaskId}`)
                .set('Cookie', [authCookie]);
            expect(check.status).toBe(404);
        });
    });
});
