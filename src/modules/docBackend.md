
# ASSISTANCES (/api/assistances)

## GET /
- Obtiene todas las asistencias registradas en el sistema.
- Devuelve listado completo sin filtros.
aqui explica si hay paginacion, limites o si esto puede ser pesado

## GET /student-enrollment/:idStudentEnrollment
- Obtiene las faltas asociadas a un enrollment concreto (relación alumno-asignatura-grupo).
- Sirve para ver asistencias de un alumno en un contexto específico.
aqui explica por que se usa enrollment y no directamente student

## GET /student/:idStudent
- Obtiene todas las faltas de un alumno independientemente del enrollment.
- Útil para vista global del alumno.
aqui explica diferencias reales con el endpoint anterior y posibles duplicados

## GET /session/:idSession
- Obtiene asistencias asociadas a una sesión concreta.
- Permite ver quién asistió o faltó en una clase específica.
aqui explica si siempre existe asistencia por sesión o se crea bajo demanda

## GET /:id
- Obtiene una asistencia concreta por su ID.

## POST /bulk
- Crea múltiples asistencias en una sola petición.
- Pensado para registrar asistencia de toda una clase en bloque.
- Requiere rol ADMIN o TEACHER.
aqui explica formato esperado del array y validaciones

## POST /
- Crea una única asistencia.
- Uso puntual o manual.
- Requiere ADMIN o TEACHER.

## PATCH /justify/:id
-  Marca una falta como justificada.
- Requiere ADMIN o TEACHER.
aqui explica estados posibles (justificada, injustificada, etc)

## PATCH /assistancestatus/:id
- Actualiza el estado de una asistencia.
- Requiere ADMIN o TEACHER.
aqui explica todos los estados posibles del sistema de asistencia

## DELETE /:id
- Elimina una asistencia.
- Solo ADMIN.

# AUTH (/api/auth)

## POST /register
- Registra un nuevo usuario en el sistema.
aqui explica roles disponibles y flujo de creacion

## POST /login
- Autentica usuario y devuelve token JWT.
aqui explica expiracion del token y estructura

## GET /me
- Devuelve información del usuario autenticado a partir del token.
- Requiere JWT válido.

## POST /verify-firebase
- Verifica un token de Firebase.
- Uso opcional para login federado.
aqui explica en que casos se usa firebase realmente

## POST /logout
- Cierra sesión del usuario.
- Requiere autenticación.
aqui explica si invalida token o es solo frontend

## SESSIONS (/api/sessions)

## GET /
- Obtiene todas las sesiones de clase.

## GET /active
- Obtiene o crea la sesión activa en el momento actual.
aqui explica que significa "activa" (por hora, horario, etc)

## GET /:id
- Obtiene una sesión por ID.

## GET /schedule/:idSchedule
- Obtiene sesiones asociadas a un horario concreto.

## GET /active
- Duplicado del endpoint anterior.
aqui explica por que está duplicado o si es error

## POST /
- Crea una nueva sesión de clase.
ADMIN y TEACHER.

## PATCH /:id
- Actualiza una sesión existente.
ADMIN y TEACHER.

## DELETE /:id
- Elimina una sesión.
- Solo ADMIN.

# COURSES (/api/courses)

## GET /
- Obtiene todos los cursos.

## GET /:id
- Obtiene un curso por ID.

## POST /
- Crea un curso.
- Solo ADMIN.

## PUT /:id
- Actualiza completamente un curso.
- Solo ADMIN.

## PATCH /:id
- Actualiza parcialmente un curso.
- Solo ADMIN.

## DELETE /:id
- Elimina un curso.
- Solo ADMIN.

# ENROLLMENTS (/api/enrollments)

## GET /
- Obtiene todos los enrollments sin filtro.
aqui explica si esto es solo para debug o uso interno

## GET /by-filters?idSubject=&idGroup=&schoolYear=
- Obtiene enrollments filtrados por asignatura, grupo y año académico.
- Permite listar alumnos de una clase concreta.
aqui explica si los filtros son obligatorios o combinables

## GET /teacher/:idTeacher?schoolYear=
- Obtiene asignaciones (assignments) de un profesor.
- Sirve para saber qué asignaturas imparte.
aqui explica que es exactamente un assignment en tu modelo

# GROUPS (/api/groups)

## GET /
- Obtiene todos los grupos.

## GET /:id
- Obtiene un grupo por ID.

## POST /
- Crea un grupo.
- Solo ADMIN.

## PUT /:id
- Actualiza completamente un grupo.
- Solo ADMIN.

## PATCH /:id
- Actualiza parcialmente un grupo.
- Solo ADMIN.

## DELETE /:id
- Elimina un grupo.
- Solo ADMIN.

# STUDENT REGISTRATION (/api/studentregistration)

## POST /
- Matricula un estudiante en una asignatura y grupo.
- Genera relación student + subject + group.
- Solo ADMIN.
aqui explica si evita duplicados o reinscripciones

# STUDENT TASKS (/api/student-tasks)

## GET /
- Obtiene todas las entregas de estudiantes.

## GET /:id
- Obtiene una entrega concreta.

## GET /task/:idTask
- Obtiene entregas asociadas a una tarea.

## GET /student/:idStudentEnrollment
- Obtiene entregas de un alumno en base a enrollment.

## PATCH /:id
- Actualiza una entrega (estado, nota, etc).
- Roles: ADMIN, TEACHER, STUDENT.
aqui explica que puede modificar cada rol

## DELETE /:id
- Elimina una entrega.
- Solo ADMIN.

## STUDENTS (/api/students)

## GET /
- Obtiene todos los estudiantes.

## GET /:id
- Obtiene estudiante por ID.

## GET /:id/subjects
- Obtiene asignaturas del estudiante.
aqui explica si viene via enrollment o relación directa

## POST /
- Crea estudiante.
- Solo ADMIN.

## PUT /:id
- Actualiza completamente estudiante.
- Solo ADMIN.

## PATCH /:id
- Actualiza parcialmente estudiante.
- Solo ADMIN.

## DELETE /:id
- Elimina estudiante.
- Solo ADMIN.

# SUBJECTS (/api/subjects)

## GET /
- Obtiene todas las asignaturas.

## GET /:id
- Obtiene asignatura por ID.

## GET /:id/teachers
- Obtiene profesores de la asignatura.

## GET /:id/students
- Obtiene estudiantes de la asignatura.

## GET /:id/course
- Obtiene el curso al que pertenece la asignatura.
aqui explica si es relación 1:N o N:N

## POST /
- Crea asignatura.
- Solo ADMIN.

## PUT /:id
- Actualiza completamente.
- Solo ADMIN.

## PATCH /:id
- Actualiza parcialmente.
- Solo ADMIN.

## DELETE /:id
- Elimina asignatura.
- Solo ADMIN.

# TASKS (/api/tasks)

## GET /
- Obtiene todas las tareas.

## GET /:id
- Obtiene tarea por ID.

## GET /teacher-assignment/:idTeacherAssignment
- Obtiene tareas asociadas a una asignación de profesor.
aqui explica relación entre tarea y assignment

## POST /
- Crea tarea.
ADMIN y TEACHER.

## PATCH /:id
- Actualiza tarea.
- ADMIN y TEACHER.

## DELETE /:id
- Elimina tarea.
- Solo ADMIN.

# TEACHERS (/api/teachers)

## GET /
- Obtiene todos los profesores.

## GET /:id/subjects
- Obtiene asignaturas de un profesor.

## GET /:id
- Obtiene profesor por ID.

## POST /
- Crea profesor.
aqui explica por que es publico (posible riesgo)

## PATCH /:id
- Actualiza parcialmente profesor.

## DELETE /:id
- Elimina profesor.
aqui explica por que no hay protección con roles

# WEEK SCHEDULE (/api/horarios-semanales)

## GET /
- Obtiene todos los horarios semanales.

## GET /:id
- Obtiene horario por ID.

## GET /teacher-assignment/:idTeacherAssignment
- Obtiene horarios de una asignación.

## GET /dia/:diaSemana
- Obtiene horarios por día (1-7).
aqui explica convencion de dias

## GET /teacher/:idTeacher
- Obtiene horarios de un profesor.

## GET /student/:idStudent
- Obtiene horarios de un alumno.
aqui explica si se calcula via enrollment

## POST /
- Crea horario.
- ADMIN y TEACHER.

## PUT /:id
- Actualiza completamente.
- ADMIN y TEACHER.

## PATCH /:id
- Actualiza parcialmente.
- ADMIN y TEACHER.

## DELETE /:id
- Elimina horario.
- Solo ADMIN.