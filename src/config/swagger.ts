import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** API desplegada en Render (sin barra final). */
export const PRODUCTION_API_URL = 'https://ziryabback.onrender.com';

const modulesDir = join(__dirname, '../modules');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ziryab API — Gestión educativa',
      version: '1.0.0',
      description:
        'API REST del TFG Ziryab. Autenticación con Firebase ID token + JWT (cookie httpOnly `auth_token` o header `Authorization: Bearer`). ' +
        'Respuestas habituales: `{ message, data? }`.',
      contact: {
        name: 'Equipo Ziryab',
      },
    },
    servers: [
      {
        url: env.API_PUBLIC_URL ?? PRODUCTION_API_URL,
        description: 'Producción (Render)',
      },
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Desarrollo local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT propio del backend. También se acepta la cookie httpOnly `auth_token` en el navegador.',
        },
      },
      schemas: {
        Role: {
          type: 'string',
          enum: ['STUDENT', 'TEACHER', 'ADMIN'],
          example: 'STUDENT',
        },
        ApiMessage: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operación correcta' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Recurso no encontrado' },
            error: { type: 'string', description: 'Detalle técnico (opcional)' },
          },
        },
        BasicUser: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'alumno@demo.es' },
            name: { type: 'string', example: 'Ana' },
            surname: { type: 'string', example: 'García' },
            role: { $ref: '#/components/schemas/Role' },
            firebaseUID: { type: 'string', example: 'firebase-uid-abc' },
          },
        },
        AuthUser: {
          allOf: [
            { $ref: '#/components/schemas/BasicUser' },
            {
              type: 'object',
              properties: {
                ndSurname: { type: 'string', nullable: true },
                birthDate: { type: 'string', format: 'date-time' },
                dni: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        RegisterInput: {
          type: 'object',
          required: ['token', 'email', 'name', 'surname', 'birthDate', 'dni', 'role'],
          properties: {
            token: {
              type: 'string',
              description: 'ID token de Firebase (obtenido tras sign-up en el cliente)',
            },
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 2 },
            surname: { type: 'string' },
            ndSurname: { type: 'string' },
            birthDate: { type: 'string', format: 'date', example: '2005-03-15' },
            dni: { type: 'string', example: '12345678A' },
            role: { $ref: '#/components/schemas/Role' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'ID token de Firebase tras sign-in en el cliente',
            },
            email: { type: 'string', format: 'email', description: 'Solo en tests legacy' },
            password: { type: 'string', description: 'Solo en tests legacy' },
          },
        },
        VerifyFirebaseInput: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', description: 'ID token de Firebase' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login exitoso' },
            data: { $ref: '#/components/schemas/AuthUser' },
            user: { $ref: '#/components/schemas/AuthUser' },
            token: { type: 'string', description: 'JWT (también en cookie auth_token)' },
          },
        },
        UpdateProfileInput: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 2 },
          },
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1, description: 'ID de la tarea' },
            idTeacherAssignment: { type: 'integer', example: 10, description: 'ID de la asignación del profesor' },
            title: { type: 'string', example: 'Práctica 1', description: 'Título de la tarea' },
            description: { type: 'string', nullable: true, example: 'Resolver ejercicios del 1 al 10', description: 'Descripción detallada' },
            type: { type: 'string', enum: ['PRACTICE', 'THEORY', 'EXAM', 'PROJECT', 'HOMEWORK'], example: 'PRACTICE' },
            startDate: { type: 'string', format: 'date-time', example: '2025-11-13T18:39:33.952Z' },
            dueDate: { type: 'string', format: 'date-time', example: '2025-11-20T23:59:59.999Z' },
            attachmentUrl: { type: 'string', nullable: true, example: '/uploads/tasks/document.pdf' },
            schoolYear: { type: 'string', example: '2024-2025' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-11-13T18:39:33.952Z' },
          },
        },
        CreateTask: {
          type: 'object',
          required: ['idTeacherAssignment', 'title', 'type', 'startDate', 'dueDate', 'schoolYear'],
          properties: {
            idTeacherAssignment: { type: 'integer', example: 10 },
            title: { type: 'string', example: 'Práctica 1' },
            description: { type: 'string', example: 'Resolver ejercicios' },
            type: { type: 'string', enum: ['PRACTICE', 'THEORY', 'EXAM', 'PROJECT', 'HOMEWORK'], example: 'PRACTICE' },
            startDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            schoolYear: { type: 'string', example: '2024-2025' },
          },
        },
        UpdateTask: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Práctica 1 Modificada' },
            description: { type: 'string', example: 'Resolver ejercicios extra' },
            dueDate: { type: 'string', format: 'date-time' },
          },
        },
        StudentTask: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            idTask: { type: 'integer', example: 5 },
            idStudentEnrollment: { type: 'integer', example: 12 },
            status: { type: 'string', enum: ['PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'NOT_SUBMITTED'], example: 'PENDING' },
            submissionDate: { type: 'string', format: 'date-time', nullable: true },
            score: { type: 'number', nullable: true, example: 8.5 },
            feedback: { type: 'string', nullable: true, example: 'Buen trabajo' },
            attachmentUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateStudentTask: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'NOT_SUBMITTED'] },
            score: { type: 'number', example: 9.0 },
            feedback: { type: 'string', example: 'Excelente!' },
          },
        },
        Assistance: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1, description: 'ID de la asistencia' },
            idSession: { type: 'integer', example: 5, description: 'ID de la sesión de clase' },
            idStudentEnrollment: { type: 'integer', example: 10, description: 'ID de la matrícula del estudiante' },
            status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], example: 'PRESENT', description: 'Estado de asistencia' },
            justificationUri: { type: 'string', nullable: true, example: '/uploads/justifications/file.pdf', description: 'URL del justificante (opcional)' },
            justificationStatus: { type: 'string', enum: ['PENDING', 'VIEWED', 'REJECTED'], nullable: true, example: 'PENDING', description: 'Estado del justificante (opcional)' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-11-13T18:39:33.952Z' },
          },
        },
        CreateAssistance: {
          type: 'object',
          required: ['idSession', 'idStudentEnrollment'],
          properties: {
            idSession: { type: 'integer', example: 5 },
            idStudentEnrollment: { type: 'integer', example: 10 },
            status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], example: 'PRESENT' },
          },
        },
        UpdateAssistanceStatus: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], example: 'LATE' },
          },
        },
        IssueAudience: {
          type: 'string',
          enum: [
            'CENTER',
            'ALL_TEACHERS',
            'ALL_STUDENTS',
            'GROUP',
            'COURSE',
            'SUBJECT_GROUP',
            'TEACHER',
            'STUDENT',
          ],
          example: 'ALL_STUDENTS',
        },
        Issue: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            idAdmin: { type: 'integer', example: 1 },
            admin: { type: 'object' },
            audience: { $ref: '#/components/schemas/IssueAudience' },
            idGroup: { type: 'integer', nullable: true, example: 1 },
            idCourse: { type: 'integer', nullable: true, example: 1 },
            idSubject: { type: 'integer', nullable: true, example: 3 },
            grade: { type: 'string', nullable: true, enum: ['1', '2'], example: '1' },
            idTargetTeacher: { type: 'integer', nullable: true, example: 2 },
            idTargetStudent: { type: 'integer', nullable: true, example: 10 },
            title: { type: 'string', example: 'Bienvenida al curso 2024-2025' },
            body: { type: 'string', example: 'Recordad revisar el tablón de anuncios cada semana.' },
            attachmentUrl: { type: 'string', nullable: true },
            isPublished: { type: 'boolean', example: true },
            publishAt: { type: 'string', format: 'date-time', nullable: true },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiSuccessIssue: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Issue' },
          },
        },
        ApiSuccessIssueList: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            count: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Issue' },
            },
          },
        },
        ApiErrorIssue: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Cuerpo inválido' },
            error: { type: 'string', description: 'Detalle técnico (opcional)' },
            errors: { type: 'object' },
          },
        },
        CreateIssueInput: {
          type: 'object',
          required: ['audience', 'title', 'body'],
          properties: {
            audience: { $ref: '#/components/schemas/IssueAudience' },
            title: { type: 'string', example: 'Aviso importante' },
            body: { type: 'string', example: 'Contenido del anuncio para el tablón.' },
            attachmentUrl: { type: 'string', example: '/uploads/issues/aviso.pdf' },
            idGroup: { type: 'integer', description: 'Grupo (audiencia GROUP o SUBJECT_GROUP)', example: 1 },
            idCourse: {
              type: 'integer',
              description: 'Ciclo formativo DAM/DAW… (audiencia COURSE). No confundir con grade.',
              example: 1,
            },
            idSubject: {
              type: 'integer',
              description: 'Asignatura concreta; incluye ciclo y curso 1º/2º en Subject (SUBJECT_GROUP)',
              example: 3,
            },
            grade: {
              type: 'string',
              enum: ['1', '2'],
              description: 'Curso dentro del ciclo (1º o 2º). Solo audiencia COURSE junto a idCourse.',
              example: '1',
            },
            idTargetTeacher: { type: 'integer', example: 2 },
            idTargetStudent: { type: 'integer', example: 10 },
            idTeacher: {
              type: 'integer',
              description: 'Alias de idTargetTeacher (compatibilidad front)',
              example: 2,
            },
            isPublished: { type: 'boolean', example: false },
            publishAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        SubjectEvaluation: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 12 },
            idStudentEnrollment: { type: 'integer', example: 44 },
            period: {
              type: 'string',
              enum: ['INITIAL', 'FIRST_TRIMESTER', 'SECOND_TRIMESTER', 'THIRD_TRIMESTER', 'FINAL'],
              example: 'FIRST_TRIMESTER',
            },
            value: { type: 'integer', nullable: true, example: 8 },
            observations: { type: 'string', nullable: true, example: 'Buen progreso' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateSubjectEvaluationInput: {
          type: 'object',
          required: ['idStudentEnrollment', 'period'],
          properties: {
            idStudentEnrollment: { type: 'integer', example: 44 },
            period: {
              type: 'string',
              enum: ['INITIAL', 'FIRST_TRIMESTER', 'SECOND_TRIMESTER', 'THIRD_TRIMESTER', 'FINAL'],
              example: 'FIRST_TRIMESTER',
            },
            value: { type: 'integer', minimum: 1, maximum: 10, example: 8 },
            observations: { type: 'string', nullable: true, example: 'Puede mejorar la entrega' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registro, login, sesión JWT y verificación Firebase' },
      { name: 'Users', description: 'Perfil y listado de usuarios (todos los roles)' },
      { name: 'Students', description: 'Alumnos' },
      { name: 'Teachers', description: 'Profesores' },
      { name: 'Admins', description: 'Administradores' },
      { name: 'Subjects', description: 'Asignaturas' },
      { name: 'Courses', description: 'Ciclos formativos (DAM, DAW…) y asignaturas por grade' },
      { name: 'Groups', description: 'Grupos de clase' },
      { name: 'CourseGroups', description: 'Grupos asociados a un ciclo (tutoría)' },
      { name: 'Enrollments', description: 'Matrículas y asignaciones alumno-grupo-asignatura' },
      { name: 'Assignments', description: 'Asignaciones profesor-asignatura-grupo' },
      { name: 'WeekSchedule', description: 'Horarios semanales' },
      { name: 'ClassSessions', description: 'Sesiones de clase' },
      { name: 'Sessions', description: 'Alias de sesiones de clase (tag en rutas)' },
      { name: 'Assistances', description: 'Asistencia y justificantes' },
      { name: 'Tasks', description: 'Tareas de asignatura' },
      { name: 'StudentTasks', description: 'Entregas y calificaciones de alumnos' },
      { name: 'Grades', description: 'Calificaciones académicas' },
      { name: 'Issues', description: 'Tablón de anuncios (audiencia por rol, grupo o ciclo)' },
      { name: 'Announcements', description: 'Anuncios (módulo announcements)' },
      { name: 'Notifications', description: 'Notificaciones y SSE' },
      { name: 'StudentRegistration', description: 'Alta de alumno en asignatura/grupo' },
      { name: 'Subject Evaluations', description: 'Evaluaciones por periodo sobre matrículas de alumnos' },
      { name: 'Health', description: 'Monitorización' },
    ],
  },
  // ESM en desarrollo (.ts) y build compilado (.js en dist/modules)
  apis: [
    join(modulesDir, '**/*.routes.ts'),
    join(modulesDir, '**/*.routes.js'),
    join(__dirname, '../app.ts'),
    join(__dirname, '../app.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
