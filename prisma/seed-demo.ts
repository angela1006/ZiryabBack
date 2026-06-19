/**
 * seed-demo.ts — Caso controlado para pruebas Android (TFG)
 *
 * Ejecutar: npm run seed:demo
 *
 * ⚠️  ANTES DE EJECUTAR:
 *  1. Crea los 3 usuarios en Firebase Console (ver instrucciones al final del archivo).
 *  2. Pega los UIDs reales en las constantes FIREBASE_UID_* de abajo.
 *  3. npm run seed:demo
 *
 * Cubre: usuarios, matrículas, horario, sesiones, asistencias (con justificantes),
 * tareas (todos los TaskType), entregas en distintos estados, anuncios y notificaciones.
 * Caso reducido: 1 profesor + 2 alumnos.
 */

import {
  PrismaClient,
  TaskType,
  EnrollmentStatus,
  AssignmentStatus,
  DayOfWeek,
  SessionStatus,
  AssistanceStatus,
  JustificationStatus,
  SubmissionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
//  PASO 1 — UIDs de Firebase
// ─────────────────────────────────────────────
const FIREBASE_UID_PROFESOR: string = 'hDSXMkow9qMuIPxOSehAYsbsH3L2'; // profesor.demo@ziryab.es
const FIREBASE_UID_ALUMNO_1: string = 'LKdrueilWDdRnEdFPEzMhcdC7Z63'; // alumno1.demo@ziryab.es
const FIREBASE_UID_ALUMNO_2: string = 'r49QBujkh3OiPZkFoqSHCn6lAb83'; // alumno2.demo@ziryab.es

// Credenciales: profesor.demo@ziryab.es / alumno1.demo@ziryab.es / alumno2.demo@ziryab.es → Demo2026!
// Año académico alineado con Android (lista de alumnos usa "2024-2025" hardcodeado).
const SCHOOL_YEAR = '2024-2025';

const DEMO_EMAILS = [
  'profesor.demo@ziryab.es',
  'alumno1.demo@ziryab.es',
  'alumno2.demo@ziryab.es',
];

const DEMO_FIREBASE_UIDS = [
  FIREBASE_UID_PROFESOR,
  FIREBASE_UID_ALUMNO_1,
  FIREBASE_UID_ALUMNO_2,
];

const WEEKDAY_TO_JS: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const JS_DAY_TO_ENUM: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

function buildClassLabel(grade: string, courseName: string, groupName: string): string {
  const normalizedGrade = grade.trim().endsWith('º') ? grade.trim() : `${grade.trim()}º`;
  return `${normalizedGrade} ${courseName} — ${groupName}`;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Fecha del último `weekDay` anterior o igual a hoy (para sesiones pasadas). */
function lastDateForWeekDay(weekDay: DayOfWeek, weeksAgo = 0): Date {
  const today = startOfDay(new Date());
  const targetIdx = WEEKDAY_TO_JS[weekDay];
  let diff = today.getDay() - targetIdx;
  if (diff < 0) diff += 7;
  diff += weeksAgo * 7;
  const result = new Date(today);
  result.setDate(today.getDate() - diff);
  return result;
}

async function cleanupDemoData(studentIds: number[], teacherIds: number[]): Promise<void> {
  if (studentIds.length === 0 && teacherIds.length === 0) return;

  console.log('  ♻️  Eliminando demo anterior...');

  const demoEnrollments = await prisma.studentOnSubjectOnGroup.findMany({
    where: { idStudent: { in: studentIds } },
    select: { id: true },
  });
  const enrollmentIds = demoEnrollments.map((e) => e.id);

  const demoAssignments = await prisma.teacherOnSubjectOnGroup.findMany({
    where: { idTeacher: { in: teacherIds } },
    select: { id: true },
  });
  const assignmentIds = demoAssignments.map((a) => a.id);

  const demoSchedules =
    assignmentIds.length > 0
      ? await prisma.weekSchedule.findMany({
          where: { idTeacherAssignment: { in: assignmentIds } },
          select: { id: true },
        })
      : [];
  const scheduleIds = demoSchedules.map((s) => s.id);

  if (scheduleIds.length > 0) {
    const demoSessions = await prisma.sessionClass.findMany({
      where: { idSchedule: { in: scheduleIds } },
      select: { id: true },
    });
    const sessionIds = demoSessions.map((s) => s.id);
    if (sessionIds.length > 0) {
      await prisma.assistance.deleteMany({ where: { idSession: { in: sessionIds } } });
      await prisma.sessionClass.deleteMany({ where: { id: { in: sessionIds } } });
    }
    await prisma.weekSchedule.deleteMany({ where: { id: { in: scheduleIds } } });
  }

  if (enrollmentIds.length > 0) {
    await prisma.studentTask.deleteMany({ where: { idStudentEnrollment: { in: enrollmentIds } } });
    await prisma.assistance.deleteMany({ where: { idStudentEnrollment: { in: enrollmentIds } } });
  }

  if (assignmentIds.length > 0) {
    const demoTasks = await prisma.task.findMany({
      where: { idTeacherAssignment: { in: assignmentIds } },
      select: { id: true },
    });
    const taskIds = demoTasks.map((t) => t.id);
    if (taskIds.length > 0) {
      await prisma.studentTask.deleteMany({ where: { idTask: { in: taskIds } } });
    }
    await prisma.task.deleteMany({ where: { idTeacherAssignment: { in: assignmentIds } } });
  }

  await prisma.notification.deleteMany({
    where: { recipientFirebaseUID: { in: DEMO_FIREBASE_UIDS } },
  });

  if (studentIds.length > 0) {
    await prisma.studentOnSubjectOnGroup.deleteMany({ where: { idStudent: { in: studentIds } } });
  }
  if (teacherIds.length > 0) {
    await prisma.teacherOnSubjectOnGroup.deleteMany({ where: { idTeacher: { in: teacherIds } } });
  }
  if (studentIds.length > 0) {
    await prisma.student.deleteMany({ where: { id: { in: studentIds } } });
  }
  if (teacherIds.length > 0) {
    await prisma.teacher.deleteMany({ where: { id: { in: teacherIds } } });
  }
}

async function main() {
  console.log('🎬 Iniciando seed de demo...');

  const existingStudents = await prisma.student.findMany({
    // Usamos firebaseUID para identificar demo-users de forma estable,
    // aunque el email haya cambiado en la BD.
    where: { firebaseUID: { in: [FIREBASE_UID_ALUMNO_1, FIREBASE_UID_ALUMNO_2] } },
    select: { id: true },
  });
  const existingTeachers = await prisma.teacher.findMany({
    where: { firebaseUID: FIREBASE_UID_PROFESOR },
    select: { id: true },
  });

  await cleanupDemoData(
    existingStudents.map((s) => s.id),
    existingTeachers.map((t) => t.id),
  );

  // ─── USUARIOS ───────────────────────────────────────────────────────────
  console.log('  👨‍🏫 Creando profesor demo...');
  const profesor = await prisma.teacher.create({
    data: {
      email: 'profesor.demo@ziryab.es',
      name: 'Antonio',
      surname: 'Demo',
      ndSurname: 'Expo',
      birthDate: new Date('1985-06-15'),
      dni: '00000001D',
      firebaseUID: FIREBASE_UID_PROFESOR,
    },
  });

  console.log('  👨‍🎓 Creando alumnos demo...');
  const alumno1 = await prisma.student.create({
    data: {
      email: 'alumno1.demo@ziryab.es',
      name: 'Lucía',
      surname: 'Demo',
      ndSurname: 'Uno',
      birthDate: new Date('2005-03-10'),
      dni: '00000002A',
      firebaseUID: FIREBASE_UID_ALUMNO_1,
    },
  });

  const alumno2 = await prisma.student.create({
    data: {
      email: 'alumno2.demo@ziryab.es',
      name: 'Carlos',
      surname: 'Demo',
      ndSurname: 'Dos',
      birthDate: new Date('2005-09-22'),
      dni: '00000003A',
      firebaseUID: FIREBASE_UID_ALUMNO_2,
    },
  });

  // ─── CURSO, ASIGNATURA, GRUPO ───────────────────────────────────────────
  console.log('  📚 Creando curso y asignatura demo...');
  const curso = await prisma.course.upsert({
    where: { name: 'DAM - Demo TFG' },
    update: {},
    create: {
      name: 'DAM - Demo TFG',
      description: 'Ciclo DAM — datos de prueba para Android',
      duration: 2,
    },
  });

  let asignatura = await prisma.subject.findFirst({
    where: { name: 'Programación Móvil', idCourse: curso.id, grade: '2' },
  });
  if (!asignatura) {
    asignatura = await prisma.subject.create({
      data: {
        name: 'Programación Móvil',
        grade: '2',
        hours: 6,
        description: 'Android con Kotlin y Jetpack Compose',
        idCourse: curso.id,
      },
    });
  }

  console.log('  👥 Creando grupo demo...');
  let grupo = await prisma.group.findFirst({ where: { name: '2DAM-Demo' } });
  if (!grupo) {
    grupo = await prisma.group.create({
      data: { name: '2DAM-Demo', capacity: 25 },
    });
  }

  const classLabel = buildClassLabel('2', curso.name, grupo.name);

  // ─── ASSIGNMENT + MATRÍCULAS ────────────────────────────────────────────
  console.log('  📋 Asignando profesor a asignatura...');
  const assignment = await prisma.teacherOnSubjectOnGroup.create({
    data: {
      idTeacher: profesor.id,
      idSubject: asignatura.id,
      idGroup: grupo.id,
      schoolYear: SCHOOL_YEAR,
      status: AssignmentStatus.ACTIVE,
    },
  });

  console.log('  🎓 Matriculando alumnos...');
  const enrollment1 = await prisma.studentOnSubjectOnGroup.create({
    data: {
      idStudent: alumno1.id,
      idGroup: grupo.id,
      idSubject: asignatura.id,
      schoolYear: SCHOOL_YEAR,
      status: EnrollmentStatus.ENROLLED,
    },
  });

  const enrollment2 = await prisma.studentOnSubjectOnGroup.create({
    data: {
      idStudent: alumno2.id,
      idGroup: grupo.id,
      idSubject: asignatura.id,
      schoolYear: SCHOOL_YEAR,
      status: EnrollmentStatus.ENROLLED,
    },
  });

  // ─── HORARIO SEMANAL ──────────────────────────────────────────────────────
  console.log('  🗓️  Creando horario semanal...');
  const todayDay = JS_DAY_TO_ENUM[new Date().getDay()];

  const scheduleBase = {
    idTeacherAssignment: assignment.id,
    label: classLabel,
  };

  const scheduleMon = await prisma.weekSchedule.create({
    data: { ...scheduleBase, weekDay: DayOfWeek.MONDAY, startTime: '09:00', finishTime: '10:30' },
  });

  const scheduleWed = await prisma.weekSchedule.create({
    data: { ...scheduleBase, weekDay: DayOfWeek.WEDNESDAY, startTime: '09:00', finishTime: '10:30' },
  });

  const scheduleFri = await prisma.weekSchedule.create({
    data: { ...scheduleBase, weekDay: DayOfWeek.FRIDAY, startTime: '10:00', finishTime: '11:30' },
  });

  // Franja amplia el día actual → facilita GET /api/sessions/active en la demo
  const scheduleToday = await prisma.weekSchedule.create({
    data: { ...scheduleBase, weekDay: todayDay, startTime: '08:00', finishTime: '20:00' },
  });

  // ─── SESIONES DE CLASE ────────────────────────────────────────────────────
  console.log('  📅 Creando sesiones de clase...');
  const sessionPastMon = await prisma.sessionClass.create({
    data: {
      idSchedule: scheduleMon.id,
      date: lastDateForWeekDay(DayOfWeek.MONDAY, 1),
      status: SessionStatus.COMPLETED,
      apointments: 'Repaso de RecyclerView',
    },
  });

  const sessionPastWed = await prisma.sessionClass.create({
    data: {
      idSchedule: scheduleWed.id,
      date: lastDateForWeekDay(DayOfWeek.WEDNESDAY, 1),
      status: SessionStatus.COMPLETED,
      apointments: 'Práctica MVVM',
    },
  });

  const sessionPastFri = await prisma.sessionClass.create({
    data: {
      idSchedule: scheduleFri.id,
      date: lastDateForWeekDay(DayOfWeek.FRIDAY, 2),
      status: SessionStatus.COMPLETED,
    },
  });

  const sessionToday = await prisma.sessionClass.create({
    data: {
      idSchedule: scheduleToday.id,
      date: startOfDay(new Date()),
      status: SessionStatus.SCHEDULED,
      apointments: 'Sesión demo — pasar lista',
    },
  });

  // ─── ASISTENCIAS ──────────────────────────────────────────────────────────
  console.log('  ✅ Creando asistencias...');
  await prisma.assistance.createMany({
    data: [
      { idSession: sessionPastMon.id, idStudentEnrollment: enrollment1.id, status: AssistanceStatus.PRESENT },
      { idSession: sessionPastMon.id, idStudentEnrollment: enrollment2.id, status: AssistanceStatus.PRESENT },
      { idSession: sessionPastWed.id, idStudentEnrollment: enrollment1.id, status: AssistanceStatus.PRESENT },
      { idSession: sessionPastWed.id, idStudentEnrollment: enrollment2.id, status: AssistanceStatus.LATE },
      {
        idSession: sessionPastFri.id,
        idStudentEnrollment: enrollment1.id,
        status: AssistanceStatus.ABSENT,
        justificationUri: 'uploads/demo/justificante-lucia.pdf',
        justificationStatus: JustificationStatus.PENDING,
      },
      { idSession: sessionPastFri.id, idStudentEnrollment: enrollment2.id, status: AssistanceStatus.PRESENT },
      { idSession: sessionToday.id, idStudentEnrollment: enrollment1.id, status: AssistanceStatus.PRESENT },
      { idSession: sessionToday.id, idStudentEnrollment: enrollment2.id, status: AssistanceStatus.PRESENT },
    ],
  });

  // ─── GRUPO DE TAREAS + TAREAS (todos los TaskType) ────────────────────────
  console.log('  📝 Creando tareas demo...');
  const taskGroup = await prisma.taskGroup.create({
    data: { name: 'Bloque 2 — Programación Móvil (demo)' },
  });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const passed = new Date(now);
  passed.setDate(now.getDate() - 5);
  const passedRecent = new Date(now);
  passedRecent.setDate(now.getDate() - 2);

  const tareaPractice = await prisma.task.create({
    data: {
      idTeacherAssignment: assignment.id,
      idTaskGroup: taskGroup.id,
      title: 'Práctica 1 — RecyclerView con Retrofit',
      description: 'Lista con LazyColumn consumiendo un endpoint REST.',
      type: TaskType.PRACTICE,
      startDate: now,
      dueDate: nextWeek,
      isPublished: true,
      allowLateSubmission: false,
      schoolYear: SCHOOL_YEAR,
    },
  });

  const tareaTheory = await prisma.task.create({
    data: {
      idTeacherAssignment: assignment.id,
      idTaskGroup: taskGroup.id,
      title: 'Teoría — Arquitectura MVVM',
      description: 'Esquema de capas ViewModel + Repository + StateFlow.',
      type: TaskType.THEORY,
      startDate: now,
      dueDate: nextWeek,
      isPublished: true,
      allowLateSubmission: true,
      schoolYear: SCHOOL_YEAR,
    },
  });

  const tareaExam = await prisma.task.create({
    data: {
      idTeacherAssignment: assignment.id,
      title: 'Examen Parcial — Kotlin Coroutines',
      description: 'Coroutines, Flow y estados asíncronos en ViewModels.',
      type: TaskType.EXAM,
      startDate: passed,
      dueDate: passed,
      isPublished: true,
      allowLateSubmission: false,
      schoolYear: SCHOOL_YEAR,
    },
  });

  const tareaProject = await prisma.task.create({
    data: {
      idTeacherAssignment: assignment.id,
      title: 'Proyecto — App Ziryab (mínimo viable)',
      description: 'Entregar APK o enlace con login, horario y temario.',
      type: TaskType.PROJECT,
      startDate: now,
      dueDate: nextWeek,
      isPublished: true,
      allowLateSubmission: true,
      schoolYear: SCHOOL_YEAR,
    },
  });

  const tareaHomework = await prisma.task.create({
    data: {
      idTeacherAssignment: assignment.id,
      title: 'Deberes — Material Design 3',
      description: 'Adaptar la pantalla de perfil al tema Material 3.',
      type: TaskType.HOMEWORK,
      startDate: passedRecent,
      dueDate: tomorrow,
      isPublished: true,
      allowLateSubmission: false,
      schoolYear: SCHOOL_YEAR,
    },
  });

  // ─── ENTREGAS (estados variados) ──────────────────────────────────────────
  console.log('  📬 Creando entregas de alumnos...');
  await prisma.studentTask.createMany({
    data: [
      {
        idTask: tareaPractice.id,
        idStudentEnrollment: enrollment1.id,
        status: SubmissionStatus.GRADED,
        submissionDate: passedRecent,
        score: 8.5,
        feedback: 'Buen uso de Retrofit y estados de carga.',
      },
      {
        idTask: tareaTheory.id,
        idStudentEnrollment: enrollment1.id,
        status: SubmissionStatus.PENDING,
      },
      {
        idTask: tareaExam.id,
        idStudentEnrollment: enrollment1.id,
        status: SubmissionStatus.NOT_SUBMITTED,
      },
      {
        idTask: tareaProject.id,
        idStudentEnrollment: enrollment1.id,
        status: SubmissionStatus.SUBMITTED,
        submissionDate: now,
        attachmentUrl: 'uploads/demo/entrega-lucia-proyecto.zip',
      },
      {
        idTask: tareaHomework.id,
        idStudentEnrollment: enrollment1.id,
        status: SubmissionStatus.SUBMITTED,
        submissionDate: passedRecent,
      },
      {
        idTask: tareaPractice.id,
        idStudentEnrollment: enrollment2.id,
        status: SubmissionStatus.LATE,
        submissionDate: now,
        score: 6.0,
        feedback: 'Entrega fuera de plazo; revisar fechas límite.',
      },
      {
        idTask: tareaTheory.id,
        idStudentEnrollment: enrollment2.id,
        status: SubmissionStatus.SUBMITTED,
        submissionDate: passedRecent,
      },
      {
        idTask: tareaExam.id,
        idStudentEnrollment: enrollment2.id,
        status: SubmissionStatus.PENDING,
      },
      {
        idTask: tareaProject.id,
        idStudentEnrollment: enrollment2.id,
        status: SubmissionStatus.PENDING,
      },
      {
        idTask: tareaHomework.id,
        idStudentEnrollment: enrollment2.id,
        status: SubmissionStatus.PENDING,
      },
    ],
  });

  // ─── NOTIFICACIONES ─────────────────────────────────────────────────────────
  console.log('  🔔 Creando notificaciones de ejemplo...');
  await prisma.notification.createMany({
    data: [
      {
        recipientFirebaseUID: FIREBASE_UID_ALUMNO_1,
        title: 'Nueva tarea publicada',
        message: 'Teoría — Arquitectura MVVM',
        type: 'TASK',
        isRead: false,
      },
      {
        recipientFirebaseUID: FIREBASE_UID_PROFESOR,
        title: 'Justificante pendiente',
        message: 'Lucía Demo tiene una falta por revisar.',
        type: 'ASSISTANCE',
        isRead: false,
      },
    ],
  });

  // ─── RESUMEN ──────────────────────────────────────────────────────────────
  console.log('');
  console.log('✅ Seed de demo completado:');
  console.log('');
  console.log('  👨‍🏫 Profesor : profesor.demo@ziryab.es / Demo2026!');
  console.log('  👨‍🎓 Alumno 1 : alumno1.demo@ziryab.es  / Demo2026!  (Lucía)');
  console.log('  👨‍🎓 Alumno 2 : alumno2.demo@ziryab.es  / Demo2026!  (Carlos)');
  console.log(`  📅 Curso lectivo : ${SCHOOL_YEAR}`);
  console.log(`  📚 Asignatura    : Programación Móvil (${grupo.name})`);
  console.log('  🗓️  Horario       : 4 franjas (Lun/Mié/Vie + hoy 08:00–20:00)');
  console.log('  📅 Sesiones      : 4 (3 pasadas + hoy)');
  console.log('  ✅ Asistencias   : 8 (PRESENT/LATE/ABSENT + justificante PENDING)');
  console.log('  📢 Anuncios      : 2');
  console.log('  📝 Tareas        : 5 (PRACTICE, THEORY, EXAM, PROJECT, HOMEWORK)');
  console.log('  📬 Entregas      : 10 con estados variados');
  console.log('  🔔 Notificaciones: 2');
  console.log('');
  console.log('  ⚡ IDs útiles:');
  console.log(`     Assignment (profesor) id = ${assignment.id}`);
  console.log(`     Enrollment Lucía      id = ${enrollment1.id}`);
  console.log(`     Enrollment Carlos     id = ${enrollment2.id}`);
  console.log(`     Sesión de hoy         id = ${sessionToday.id}`);
  console.log(`     Horario hoy (activo)  id = ${scheduleToday.id}  (${todayDay} 08:00–20:00)`);
  console.log('');

  if (
    FIREBASE_UID_PROFESOR.startsWith('PENDIENTE') ||
    FIREBASE_UID_ALUMNO_1.startsWith('PENDIENTE') ||
    FIREBASE_UID_ALUMNO_2.startsWith('PENDIENTE')
  ) {
    console.log('  ⚠️  Sustituye los UIDs placeholder por los de Firebase Console.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en seed-demo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
 * ═══════════════════════════════════════════════════════
 *  INSTRUCCIONES FIREBASE
 * ═══════════════════════════════════════════════════════
 *
 *  1. Firebase Console → Authentication → Add user
 *  2. Crear: profesor.demo@ziryab.es, alumno1.demo@ziryab.es, alumno2.demo@ziryab.es
 *     Contraseña para los tres: Demo2026!
 *  3. Copiar cada User UID a las constantes FIREBASE_UID_* de arriba
 *  4. npm run seed:demo
 */
