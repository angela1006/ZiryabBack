import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './modules/auth/auth.routes.js';
import studentsRoutes from './modules/students/students.routes.js';
import subjectsRoutes from './modules/subjects/subjects.routes.js';
import teachersRoutes from './modules/teachers/teachers.routes.js';
import adminsRoutes from './modules/admin/admins.routes.js';
import enrollmentRoutes from './modules/enrollments/enrollments.routes.js';
import horariosRoutes from './modules/weekSchedule/weekSchedule.routes.js';
import classSesionRoutes from './modules/classSession/classSession.routes.js'
import assistanceRoutes from './modules/assistance/assistance.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import studentTaskRoutes from './modules/student-task/student-task.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import issueRoutes from './modules/issue/issue.routes.js';
import subjectEvaluationRoutes from './modules/subject-evaluation/subject-evaluation.routes.js';
import assignmentsRoutes from './modules/assignments/assignments.routes.js';
import assignmentSubstitutionRoutes from './modules/assignment-substitution/assignment-substitution.routes.js';
import studentPasswordsRoutes from './modules/student-passwords/student-passwords.routes.js';


import courseRouter from './modules/course/course.routes.js';
import groupRouter from './modules/group/group.routes.js';
import studentregsitrationRouter from './modules/student-registration/student-registration.routes.js'
//SACO UNA RAMA PARA IR HACIENDO PEQUEÑOS CAMBIOS EN LA BASE DE DATOS DE CARA A LA FUTURA ASIGNACIÓN DE UN PROFESOR A UNA ASIGNATURA IMPARTIDA EN UN GRUPO
const app = express();
app.use(cookieParser());

/** Orígenes permitidos en CSP `connect-src` (API + frontend para SPA y SSE desde otro puerto/host). */
const frontendOrigin = (() => {
  try {
    return new URL(env.FRONTEND_URL).origin;
  } catch {
    return env.FRONTEND_URL.replace(/\/$/, '');
  }
})();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],          
      connectSrc: ["'self'", frontendOrigin],
      frameAncestors: ["'none'"],    
      formAction: ["'self'"],        
      baseUri: ["'self'"],           
      objectSrc: ["'none'"],         
      upgradeInsecureRequests: [],   
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, 
}));
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : true, 
  methods: env.NODE_ENV === 'production' 
    ? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);

if (env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API operativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 */
app.get('/health', (_req, res) => res.json({ ok: true }));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Metadatos y enlaces útiles
 */
app.get('/', (_req, res) => {
  res.json({
    message: '🎓 API Escolar - Bienvenido',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      students: '/api/students',
      subjects: '/api/subjects',
      tasks: '/api/tasks',
      assignments: '/api/assignments',
      assignmentSubstitutions: '/api/assignment-substitutions',
      studentPasswords: '/api/student-passwords',
      issues: '/api/issues',
      subjectEvaluations: '/api/subject-evaluations',
    },
  });
});

// Legacy: ficheros antiguos en disco local (nuevas subidas van a Cloudinary)
app.use('/uploads', express.static('uploads'));

// Documentación Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Ziryab API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  }),
);

// Rutas de la API
app.use('/api/students', studentsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/admins', adminsRoutes);

app.use('/api/courses', courseRouter);
app.use('/api/groups', groupRouter);
app.use('/api/auth', authRoutes);
app.use('/api/studentregistration', studentregsitrationRouter);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/horarios-semanales', horariosRoutes);
app.use('/api/sessions', classSesionRoutes);
app.use('/api/assistances', assistanceRoutes)


app.use('/api/tasks', taskRoutes);


app.use('/api/student-tasks', studentTaskRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/subject-evaluations', subjectEvaluationRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/assignment-substitutions', assignmentSubstitutionRoutes);
app.use('/api/student-passwords', studentPasswordsRoutes);



/*
**URLs para probar en Bruno:**
GET http://localhost:3000/api/tasks
GET http://localhost:3000/api/tasks/1
GET http://localhost:3000/api/tasks/teacher-assignment/1
*/





/*
**URLs para probar en Bruno:**

GET http://localhost:3000/api/student-tasks
GET http://localhost:3000/api/student-tasks/1
GET http://localhost:3000/api/student-tasks/task/1
GET http://localhost:3000/api/student-tasks/student/1
*/
app.use(errorHandler);

export default app;