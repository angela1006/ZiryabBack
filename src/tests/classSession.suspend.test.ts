import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

describe('Sessions bulk suspend (CURSO-110)', () => {
  let authCookie: string;
  let teacherCookie: string;
  let adminTeacherId: number;
  let regularTeacherId: number;
  let assignmentId: number;
  let scheduleId: number;
  let sessionScheduledId: number;
  let sessionCompletedId: number;
  let sessionCancelledId: number;

  const cookie = (sub: number, role: string, email: string, firebaseUID: string) => {
    const token = jwt.sign({ sub, role, email, firebaseUID }, env.JWT_SECRET, { expiresIn: '1h' });
    return `auth_token=${token}`;
  };

  beforeAll(async () => {
    await prisma.teacher.deleteMany({
      where: {
        email: { in: ['suspend_admin@example.com', 'suspend_teacher@example.com'] },
      },
    });
    await prisma.course.deleteMany({ where: { name: 'COURSE_SUSPEND_TEST' } });
    await prisma.group.deleteMany({ where: { name: 'GROUP_SUSPEND_TEST' } });

    const course = await prisma.course.create({
      data: { name: 'COURSE_SUSPEND_TEST', description: 'Test', duration: 2 },
    });
    const subject = await prisma.subject.create({
      data: { name: 'SUBJ_SUSPEND_TEST', grade: '1', idCourse: course.id },
    });
    const group = await prisma.group.create({ data: { name: 'GROUP_SUSPEND_TEST' } });

    const adminTeacher = await prisma.teacher.create({
      data: {
        email: 'suspend_admin@example.com',
        name: 'Admin',
        surname: 'Suspend',
        birthDate: new Date(),
        dni: 'SUSPADM01',
        firebaseUID: 'suspend_admin_uid',
        role: 'ADMIN',
      },
    });
    adminTeacherId = adminTeacher.id;

    const regularTeacher = await prisma.teacher.create({
      data: {
        email: 'suspend_teacher@example.com',
        name: 'Teacher',
        surname: 'Suspend',
        birthDate: new Date(),
        dni: 'SUSPTCH01',
        firebaseUID: 'suspend_teacher_uid',
        role: 'TEACHER',
      },
    });
    regularTeacherId = regularTeacher.id;

    const assignment = await prisma.teacherOnSubjectOnGroup.create({
      data: {
        idTeacher: regularTeacherId,
        idSubject: subject.id,
        idGroup: group.id,
        schoolYear: '2024-2025',
      },
    });
    assignmentId = assignment.id;

    const schedule = await prisma.weekSchedule.create({
      data: {
        idTeacherAssignment: assignmentId,
        label: 'Suspend test class',
        weekDay: 'MONDAY',
        startTime: '09:00',
        finishTime: '10:00',
      },
    });
    scheduleId = schedule.id;

    const baseDate = new Date('2025-06-10T10:00:00.000Z');
    const scheduled = await prisma.sessionClass.create({
      data: { idSchedule: scheduleId, date: baseDate, status: 'SCHEDULED' },
    });
    sessionScheduledId = scheduled.id;

    const completed = await prisma.sessionClass.create({
      data: {
        idSchedule: scheduleId,
        date: new Date('2025-06-11T10:00:00.000Z'),
        status: 'COMPLETED',
      },
    });
    sessionCompletedId = completed.id;

    const cancelled = await prisma.sessionClass.create({
      data: {
        idSchedule: scheduleId,
        date: new Date('2025-06-12T10:00:00.000Z'),
        status: 'CANCELLED',
      },
    });
    sessionCancelledId = cancelled.id;

    authCookie = cookie(
      adminTeacherId,
      'ADMIN',
      adminTeacher.email,
      adminTeacher.firebaseUID,
    );
    teacherCookie = cookie(
      regularTeacherId,
      'TEACHER',
      regularTeacher.email,
      regularTeacher.firebaseUID,
    );
  });

  afterAll(async () => {
    await prisma.sessionClass.deleteMany({
      where: {
        id: { in: [sessionScheduledId, sessionCompletedId, sessionCancelledId] },
      },
    });
    await prisma.weekSchedule.deleteMany({ where: { id: scheduleId } });
    await prisma.teacherOnSubjectOnGroup.deleteMany({ where: { id: assignmentId } });
    await prisma.teacher.deleteMany({
      where: { id: { in: [adminTeacherId, regularTeacherId] } },
    });
    await prisma.$disconnect();
  });

  const body = {
    dateFrom: '2025-06-01',
    dateTo: '2025-06-30',
    idTeacher: regularTeacherId,
  };

  it('POST suspend-preview cuenta solo SCHEDULED y COMPLETED', async () => {
    const res = await request(app)
      .post('/api/sessions/suspend-preview')
      .set('Cookie', authCookie)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, count: 2 });
  });

  it('POST bulk-suspend actualiza sesiones y es idempotente', async () => {
    const first = await request(app)
      .post('/api/sessions/bulk-suspend')
      .set('Cookie', authCookie)
      .send(body);

    expect(first.status).toBe(200);
    expect(first.body).toEqual({ success: true, count: 2 });

    const scheduled = await prisma.sessionClass.findUnique({
      where: { id: sessionScheduledId },
    });
    expect(scheduled?.status).toBe('CANCELLED');

    const second = await request(app)
      .post('/api/sessions/bulk-suspend')
      .set('Cookie', authCookie)
      .send(body);

    expect(second.status).toBe(200);
    expect(second.body).toEqual({ success: true, count: 0 });
  });

  it('rechaza TEACHER en bulk-suspend', async () => {
    const res = await request(app)
      .post('/api/sessions/bulk-suspend')
      .set('Cookie', teacherCookie)
      .send(body);

    expect(res.status).toBe(403);
  });

  it('valida rango de fechas', async () => {
    const res = await request(app)
      .post('/api/sessions/suspend-preview')
      .set('Cookie', authCookie)
      .send({ dateFrom: '2025-07-01', dateTo: '2025-06-01' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
