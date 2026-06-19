import request from 'supertest';
import app from '../app.js';
import { PrismaClient, AssignmentStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

describe('Assignments API (CURSO-94 / CURSO-101)', () => {
  let authCookie: string;
  let adminTeacherId: number;
  let courseId: number;
  let subjectId: number;
  let groupId: number;
  let otherTeacherId: number;
  const schoolYear = '2024-2025';

  const cookie = (sub: number, role: string, email: string, firebaseUID: string) => {
    const token = jwt.sign({ sub, role, email, firebaseUID }, env.JWT_SECRET, { expiresIn: '1h' });
    return `auth_token=${token}`;
  };

  beforeAll(async () => {
    await prisma.teacher.deleteMany({
      where: { email: { in: ['assign_admin_test@example.com', 'assign_other_teacher@example.com'] } },
    });
    await prisma.course.deleteMany({ where: { name: 'COURSE_ASSIGN_TEST' } });
    await prisma.group.deleteMany({ where: { name: 'GROUP_ASSIGN_TEST' } });

    const course = await prisma.course.create({
      data: { name: 'COURSE_ASSIGN_TEST', description: 'Test', duration: 2 },
    });
    courseId = course.id;

    const subject = await prisma.subject.create({
      data: { name: 'SUBJ_ASSIGN_TEST', grade: '1', idCourse: courseId },
    });
    subjectId = subject.id;

    const group = await prisma.group.create({
      data: { name: 'GROUP_ASSIGN_TEST' },
    });
    groupId = group.id;

    const adminTeacher = await prisma.teacher.create({
      data: {
        email: 'assign_admin_test@example.com',
        name: 'Admin',
        surname: 'Test',
        birthDate: new Date(),
        dni: 'ASGNADM01',
        firebaseUID: 'assign_admin_uid',
        role: 'ADMIN',
      },
    });
    adminTeacherId = adminTeacher.id;

    const other = await prisma.teacher.create({
      data: {
        email: 'assign_other_teacher@example.com',
        name: 'Other',
        surname: 'T',
        birthDate: new Date(),
        dni: 'ASGNOTH01',
        firebaseUID: 'assign_other_uid',
        role: 'TEACHER',
      },
    });
    otherTeacherId = other.id;

    authCookie = cookie(adminTeacherId, 'ADMIN', adminTeacher.email, adminTeacher.firebaseUID);
  });

  afterAll(async () => {
    await prisma.teacher.deleteMany({
      where: { id: { in: [adminTeacherId, otherTeacherId] } },
    });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.group.deleteMany({ where: { id: groupId } });
    await prisma.$disconnect();
  });

  it('POST /api/assignments — crea una asignación', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Cookie', [authCookie])
      .send({
        idTeacher: adminTeacherId,
        idSubject: subjectId,
        idGroup: groupId,
        schoolYear,
        status: AssignmentStatus.ACTIVE,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Asignación creada');
    expect(res.body.data).toMatchObject({
      idTeacher: adminTeacherId,
      idSubject: subjectId,
      idGroup: groupId,
      schoolYear,
      status: AssignmentStatus.ACTIVE,
    });
  });

  it('POST /api/assignments — 409 si duplicado (misma asignatura+grupo+año)', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Cookie', [authCookie])
      .send({
        idTeacher: otherTeacherId,
        idSubject: subjectId,
        idGroup: groupId,
        schoolYear,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toHaveProperty('existingId');
  });

  it('POST /api/assignments — 400 si faltan campos obligatorios (Zod)', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Cookie', [authCookie])
      .send({
        idTeacher: adminTeacherId,
        idSubject: subjectId,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Cuerpo inválido');
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/assignments/bulk — 400 si assignments vacío', async () => {
    const res = await request(app)
      .post('/api/assignments/bulk')
      .set('Cookie', [authCookie])
      .send({ assignments: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Cuerpo inválido');
  });

  it('POST /api/assignments — 400 si profesor inexistente', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Cookie', [authCookie])
      .send({
        idTeacher: 999999,
        idSubject: subjectId,
        idGroup: groupId,
        schoolYear,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Profesor no encontrado');
  });

  it('POST /api/assignments/bulk — parcial: una nueva y una duplicada', async () => {
    const subject2 = await prisma.subject.create({
      data: { name: 'SUBJ_ASSIGN_TEST_2', grade: '1', idCourse: courseId },
    });

    const res = await request(app)
      .post('/api/assignments/bulk')
      .set('Cookie', [authCookie])
      .send({
        assignments: [
          {
            idTeacher: adminTeacherId,
            idSubject: subject2.id,
            idGroup: groupId,
            schoolYear,
          },
          {
            idTeacher: adminTeacherId,
            idSubject: subjectId,
            idGroup: groupId,
            schoolYear,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toHaveLength(1);
    expect(res.body.data.duplicates).toHaveLength(1);
    expect(res.body.data.duplicates[0].index).toBe(1);

    await prisma.subject.delete({ where: { id: subject2.id } });
  });

  it('GET /api/assignments/by-course/:idCourse — filtra por grade y schoolYear', async () => {
    const res = await request(app)
      .get(`/api/assignments/by-course/${courseId}`)
      .query({ grade: '1', schoolYear })
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.every((a: { schoolYear: string; subject: { grade: string; idCourse: number } }) =>
      a.schoolYear === schoolYear &&
      a.subject.grade === '1' &&
      a.subject.idCourse === courseId,
    )).toBe(true);
  });

  it('GET /api/assignments/by-course/:idCourse — 400 sin schoolYear', async () => {
    const res = await request(app)
      .get(`/api/assignments/by-course/${courseId}`)
      .query({ grade: '1' })
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/schoolYear/i);
  });

  it('GET /api/assignments/by-course/:idCourse — 404 si ciclo no existe', async () => {
    const res = await request(app)
      .get('/api/assignments/by-course/999999')
      .query({ grade: '1', schoolYear })
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Curso no encontrado');
  });

  it('POST /api/assignments — 403 si no es ADMIN', async () => {
    const teacherCookie = cookie(otherTeacherId, 'TEACHER', 'assign_other_teacher@example.com', 'assign_other_uid');
    const res = await request(app)
      .post('/api/assignments')
      .set('Cookie', [teacherCookie])
      .send({
        idTeacher: otherTeacherId,
        idSubject: subjectId,
        idGroup: groupId,
        schoolYear,
      });

    expect(res.status).toBe(403);
  });
});
