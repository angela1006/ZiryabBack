import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

describe('Courses grades y subjects (CURSO-95)', () => {
  let authCookie: string;
  let adminTeacherId: number;
  let courseId: number;

  const cookie = (sub: number, role: string, email: string, firebaseUID: string) => {
    const token = jwt.sign({ sub, role, email, firebaseUID }, env.JWT_SECRET, { expiresIn: '1h' });
    return `auth_token=${token}`;
  };

  beforeAll(async () => {
    await prisma.teacher.deleteMany({
      where: { email: 'course_grades_admin@example.com' },
    });
    await prisma.course.deleteMany({ where: { name: 'COURSE_GRADES_TEST' } });

    const course = await prisma.course.create({
      data: { name: 'COURSE_GRADES_TEST', description: 'Test', duration: 2 },
    });
    courseId = course.id;

    await prisma.subject.createMany({
      data: [
        { name: 'SUBJ_G1_A', grade: '1', idCourse: courseId },
        { name: 'SUBJ_G1_B', grade: '1', idCourse: courseId },
        { name: 'SUBJ_G2_A', grade: '2', idCourse: courseId },
      ],
    });

    const adminTeacher = await prisma.teacher.create({
      data: {
        email: 'course_grades_admin@example.com',
        name: 'Admin',
        surname: 'Grades',
        birthDate: new Date(),
        dni: 'CRSGRD01',
        firebaseUID: 'course_grades_uid',
        role: 'ADMIN',
      },
    });
    adminTeacherId = adminTeacher.id;
    authCookie = cookie(adminTeacherId, 'ADMIN', adminTeacher.email, adminTeacher.firebaseUID);
  });

  afterAll(async () => {
    await prisma.teacher.deleteMany({ where: { id: adminTeacherId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.$disconnect();
  });

  it('GET /api/courses/:id/grades — devuelve grades distintos ordenados', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/grades`)
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(['1', '2']);
    expect(res.body.count).toBe(2);
  });

  it('GET /api/courses/:id/subjects?grade=1 — filtra asignaturas', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/subjects`)
      .query({ grade: '1' })
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((s: { grade: string }) => s.grade === '1')).toBe(true);
    const names = res.body.data.map((s: { name: string }) => s.name).sort();
    expect(names).toEqual(['SUBJ_G1_A', 'SUBJ_G1_B']);
  });

  it('GET /api/courses/:id/subjects — 400 sin query grade', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/subjects`)
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/grade/i);
  });

  it('GET /api/courses/:id/grades — 404 si ciclo no existe', async () => {
    const res = await request(app)
      .get('/api/courses/999999/grades')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Curso no encontrado');
  });
});
