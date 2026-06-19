# Esquema Relacional — TFG Equipo Sonrisa

## Especialización total y exclusiva: USER

Un usuario es exactamente **ADMIN**, **TEACHER** o **STUDENT**.  
Mapeo relacional: una tabla por subtipo (los tres comparten los mismos atributos base).

| Atributo      | Tipo      | Restricción                         |
|---------------|-----------|-------------------------------------|
| **id**        | INT       | PK AUTO_INCREMENT                   |
| email         | VARCHAR   | UNIQUE NOT NULL                     |
| name          | VARCHAR   | NOT NULL                            |
| surname       | VARCHAR   | NOT NULL                            |
| ndSurname     | VARCHAR   | NULL                                |
| birthDate     | DATE      | NOT NULL                            |
| dni           | VARCHAR   | UNIQUE (NULL en STUDENT)            |
| role          | ENUM      | `ADMIN` \| `TEACHER` \| `STUDENT`  |
| firebaseUID   | VARCHAR   | UNIQUE NOT NULL                     |
| createdAt     | TIMESTAMP | DEFAULT NOW()                       |

### StudentPassword (contraseña de alumno gestionada por tutor)

| Atributo  | Tipo      | Restricción                              |
|-----------|-----------|------------------------------------------|
| **id**    | INT       | PK AUTO_INCREMENT                        |
| idStudent | INT       | FK → STUDENT (CASCADE), UNIQUE           |
| password  | VARCHAR   | NOT NULL                                 |
| idTutor   | INT       | FK → TEACHER (RESTRICT)                  |
| createdAt | TIMESTAMP | DEFAULT NOW()                            |
| updatedAt | TIMESTAMP | AUTO UPDATE                              |

> Un alumno tiene como máximo un registro. El tutor (`idTutor`) es el profesor que gestiona esa credencial.

---

## 2 · Dominio académico base

### COURSE (ciclo formativo)

| Atributo    | Tipo      | Restricción                    |
|-------------|-----------|--------------------------------|
| **id**      | INT       | PK AUTO_INCREMENT              |
| name        | VARCHAR   | UNIQUE NOT NULL — ej. "DAM"    |
| description | TEXT      | NULL                           |
| duration    | INT       | DEFAULT 2 (años)               |
| createdAt   | TIMESTAMP | DEFAULT NOW()                  |

### SUBJECT (asignatura)

| Atributo    | Tipo        | Restricción                              |
|-------------|-------------|------------------------------------------|
| **id**      | INT         | PK AUTO_INCREMENT                        |
| name        | VARCHAR     | NOT NULL                                 |
| grade       | `"1"` `"2"` | NOT NULL — **curso** dentro del ciclo    |
| hours       | INT         | NULL (horas/semana)                      |
| description | TEXT        | NULL                                     |
| idCourse    | INT         | FK → COURSE (CASCADE)                   |

> `UNIQUE(name, idCourse, grade)`  
> `grade` = curso (1º o 2º); `idCourse` = ciclo (DAM, DAW…). **No confundir.**

### GROUP (grupo)

| Atributo  | Tipo      | Restricción           |
|-----------|-----------|-----------------------|
| **id**    | INT       | PK AUTO_INCREMENT     |
| name      | VARCHAR   | NOT NULL — ej. "Mañana" |
| capacity  | INT       | NULL                  |
| createdAt | TIMESTAMP | DEFAULT NOW()         |

> La “clase real” (ej. 1º DAM Mañana 2024-2025) no es entidad propia: se infiere por `TeacherOnSubjectOnGroup` + `Subject.grade` + `schoolYear`.

---

## 3 · Relaciones ternarias asociativas

Tanto TEACHER como STUDENT se relacionan ternariamente con SUBJECT y GROUP.  
Ambas tablas tienen **PK propia** (`id`) y aportan FK a las tres entidades.

### TeacherOnSubjectOnGroup (asignación docente)

| Atributo              | Tipo      | Restricción                                                  |
|-----------------------|-----------|--------------------------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                                            |
| idTeacher             | INT       | FK → TEACHER (SET NULL) — **NULL** (plaza sin profesor)     |
| idSubject             | INT       | FK → SUBJECT (CASCADE)                                      |
| idGroup               | INT       | FK → GROUP (CASCADE)                                        |
| schoolYear            | VARCHAR   | NOT NULL — "2024-2025"                                       |
| status                | ENUM      | `ACTIVE` `SUSPENDED` `ILLNESS` `EXCEDENCE` `WITHDRAWN` `STANDBY` |
| isTutor               | BOOLEAN   | DEFAULT FALSE — tutor de la clase (course+grade+group+año)   |
| currentSubstituteId   | INT       | FK → TEACHER (SET NULL) — sustituto actual en la asignación   |
| createdAt             | TIMESTAMP | DEFAULT NOW()                                                |

> `UNIQUE(idSubject, idGroup, schoolYear)` — una oferta (asignatura+grupo+año); el profesor se asigna después (`idTeacher` NULL + `STANDBY`).  
> Un solo tutor por clase y año se controla en backend (`isTutor`).  
> API de alta: `idTeacher` opcional al crear la asignación.

### StudentOnSubjectOnGroup (matrícula)

| Atributo    | Tipo      | Restricción                                                       |
|-------------|-----------|-------------------------------------------------------------------|
| **id**      | INT       | PK AUTO_INCREMENT                                                 |
| idStudent   | INT       | FK → STUDENT (CASCADE)                                           |
| idSubject   | INT       | FK → SUBJECT (CASCADE)                                           |
| idGroup     | INT       | FK → GROUP (CASCADE)                                             |
| schoolYear  | VARCHAR   | NOT NULL                                                          |
| status      | ENUM      | `ENROLLED` `EVALUATION_LOST` `COMPLETED` `FAILED` `WITHDRAWN` `EXPELLED` |
| createdAt   | TIMESTAMP | DEFAULT NOW()                                                     |

> `UNIQUE(idStudent, idGroup, idSubject, schoolYear)`

### AssignmentSubstitution (histórico de sustituciones)

| Atributo              | Tipo      | Restricción                              |
|-----------------------|-----------|------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                        |
| idTeacherAssignment   | INT       | FK → TeacherOnSubjectOnGroup (CASCADE)  |
| idSubstitute          | INT       | FK → TEACHER (RESTRICT)                  |
| startDate             | TIMESTAMP | NULL                                     |
| endDate               | TIMESTAMP | NULL                                     |
| notes                 | TEXT      | NULL                                     |
| createdAt             | TIMESTAMP | DEFAULT NOW()                            |

---

## 4 · Gestión de clases y asistencia

### WeekSchedule (franja horaria semanal)

| Atributo              | Tipo      | Restricción                                             |
|-----------------------|-----------|---------------------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                                       |
| idTeacherAssignment   | INT       | FK → TeacherOnSubjectOnGroup (CASCADE) — **NULL** (plantilla sin asignar) |
| label                 | VARCHAR   | NOT NULL, **sin DEFAULT** en BD — ej. "1º DAM Mañana"    |
| weekDay               | ENUM      | `MONDAY` … `SUNDAY`                                     |
| startTime             | VARCHAR   | "09:00"                                                 |
| finishTime            | VARCHAR   | "10:00"                                                 |
| createdAt             | TIMESTAMP | DEFAULT NOW()                                           |

> Las franjas se crean primero con `idTeacherAssignment` NULL y `label` obligatorio en la petición; la asignación docente se enlaza después.

### SessionClass (sesión de clase)

| Atributo     | Tipo      | Restricción                              |
|--------------|-----------|------------------------------------------|
| **id**       | INT       | PK AUTO_INCREMENT                        |
| idSchedule   | INT       | FK → WeekSchedule (CASCADE)             |
| date         | TIMESTAMP | NOT NULL                                 |
| status       | ENUM      | `SCHEDULED` `COMPLETED` `CANCELLED`      |
| apointments  | TEXT      | NULL (observaciones)                     |
| createdAt    | TIMESTAMP | DEFAULT NOW()                            |

> `UNIQUE(idSchedule, date)`

### Assistance (asistencia)

| Atributo              | Tipo      | Restricción                              |
|-----------------------|-----------|------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                        |
| idSession             | INT       | FK → SessionClass (CASCADE)             |
| idStudentEnrollment   | INT       | FK → StudentOnSubjectOnGroup (CASCADE)  |
| status                | ENUM      | `PRESENT` `ABSENT` `LATE` `EXCUSED`      |
| justificationUri      | VARCHAR   | NULL (archivo de justificante)           |
| justificationStatus   | ENUM      | `PENDING` `VIEWED` `REJECTED` — NULL    |
| createdAt             | TIMESTAMP | DEFAULT NOW()                            |

> `UNIQUE(idSession, idStudentEnrollment)`

---

## 5 · Tareas y entregas

### TaskGroup

| Atributo  | Tipo      | Restricción       |
|-----------|-----------|-------------------|
| **id**    | INT       | PK AUTO_INCREMENT |
| name      | VARCHAR   | NOT NULL          |
| createdAt | TIMESTAMP | DEFAULT NOW()     |

### Task (tarea)

| Atributo              | Tipo      | Restricción                                               |
|-----------------------|-----------|-----------------------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                                         |
| idTeacherAssignment   | INT       | FK → TeacherOnSubjectOnGroup (CASCADE)                   |
| idTaskGroup           | INT       | FK → TaskGroup (SET NULL) — NULL                         |
| title                 | VARCHAR   | NOT NULL                                                  |
| description           | TEXT      | NULL                                                      |
| type                  | ENUM      | `PRACTICE` `THEORY` `EXAM` `PROJECT` `HOMEWORK`           |
| startDate             | TIMESTAMP | NOT NULL                                                  |
| dueDate               | TIMESTAMP | NOT NULL                                                  |
| isPublished           | BOOLEAN   | DEFAULT FALSE                                             |
| allowLateSubmission   | BOOLEAN   | DEFAULT FALSE                                             |
| attachmentUrl         | VARCHAR   | NULL                                                      |
| schoolYear            | VARCHAR   | NOT NULL                                                  |
| createdAt             | TIMESTAMP | DEFAULT NOW()                                             |

### StudentTask (entrega)

| Atributo              | Tipo      | Restricción                                               |
|-----------------------|-----------|-----------------------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                                         |
| idTask                | INT       | FK → Task (CASCADE)                                      |
| idStudentEnrollment   | INT       | FK → StudentOnSubjectOnGroup (CASCADE)                   |
| isEnabled             | BOOLEAN   | DEFAULT TRUE                                              |
| status                | ENUM      | `PENDING` `SUBMITTED` `LATE` `GRADED` `NOT_SUBMITTED`    |
| submissionDate        | TIMESTAMP | NULL                                                      |
| score                 | DECIMAL   | NULL                                                      |
| feedback              | TEXT      | NULL                                                      |
| attachmentUrl         | VARCHAR   | NULL                                                      |
| createdAt             | TIMESTAMP | DEFAULT NOW()                                             |

> `UNIQUE(idTask, idStudentEnrollment)`

---

## 6 · Evaluaciones

### SubjectEvaluation (calificación por periodo)

| Atributo              | Tipo      | Restricción                                               |
|-----------------------|-----------|-----------------------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                                         |
| idStudentEnrollment   | INT       | FK → StudentOnSubjectOnGroup (CASCADE)                   |
| period                | ENUM      | `INITIAL` `FIRST_TRIMESTER` `SECOND_TRIMESTER` `THIRD_TRIMESTER` `FINAL` |
| value                 | INT       | NULL (1–10)                                               |
| observations          | TEXT      | NULL                                                      |
| createdAt             | TIMESTAMP | DEFAULT NOW()                                             |
| updatedAt             | TIMESTAMP | AUTO UPDATE                                               |

> `UNIQUE(idStudentEnrollment, period)` — la nota pertenece al alumno en la matrícula, no al profesor.

---

## 7 · Comunicación

### Issue (tablón de anuncios)

| Atributo          | Tipo        | Restricción                                                                          |
|-------------------|-------------|--------------------------------------------------------------------------------------|
| **id**            | INT         | PK AUTO_INCREMENT                                                                    |
| idAdmin           | INT         | FK → ADMIN (RESTRICT) — emisor, siempre admin                                        |
| audience          | ENUM        | `CENTER` `ALL_TEACHERS` `ALL_STUDENTS` `GROUP` `COURSE` `SUBJECT_GROUP` `TEACHER` `STUDENT` |
| idGroup           | INT         | FK → GROUP (SET NULL) — NULL                                                        |
| idCourse          | INT         | FK → COURSE (SET NULL) — NULL — **ciclo**                                           |
| idSubject         | INT         | FK → SUBJECT (SET NULL) — NULL                                                      |
| grade             | `"1"` `"2"` | NULL — **curso** 1º/2º; solo con `audience = COURSE`                                |
| idTargetTeacher   | INT         | FK → TEACHER (SET NULL) — NULL                                                      |
| idTargetStudent   | INT         | FK → STUDENT (SET NULL) — NULL                                                      |
| title             | VARCHAR     | NOT NULL                                                                             |
| body              | TEXT        | NOT NULL                                                                             |
| attachmentUrl     | VARCHAR     | NULL                                                                                 |
| isPublished       | BOOLEAN     | DEFAULT FALSE                                                                        |
| publishAt         | TIMESTAMP   | NULL (publicación diferida)                                                          |
| expiresAt         | TIMESTAMP   | NULL (caducidad)                                                                     |
| createdAt         | TIMESTAMP   | DEFAULT NOW()                                                                        |
| updatedAt         | TIMESTAMP   | AUTO UPDATE                                                                          |

### Notification (push Firebase)

| Atributo              | Tipo      | Restricción                                           |
|-----------------------|-----------|-------------------------------------------------------|
| **id**                | INT       | PK AUTO_INCREMENT                                     |
| recipientFirebaseUID  | VARCHAR   | NOT NULL — FK lógica al campo `firebaseUID` del usuario |
| title                 | VARCHAR   | NOT NULL                                              |
| message               | TEXT      | NOT NULL                                              |
| type                  | VARCHAR   | DEFAULT "INFO"                                        |
| isRead                | BOOLEAN   | DEFAULT FALSE                                         |
| readAt                | TIMESTAMP | NULL                                                  |
| createdAt             | TIMESTAMP | DEFAULT NOW()                                         |

> Sin FK declarada explícitamente: `recipientFirebaseUID` referencia el campo `firebaseUID`
> de ADMIN, TEACHER o STUDENT según el destinatario.

---

## Resumen de relaciones

| Tabla origen                | FK                    | Tabla destino               | Cardinalidad | onDelete   |
|-----------------------------|-----------------------|-----------------------------|:------------:|------------|
| StudentPassword             | idStudent             | STUDENT                     | 1 : 0..1     | CASCADE    |
| StudentPassword             | idTutor               | TEACHER                     | N : 1        | RESTRICT   |
| SUBJECT                     | idCourse              | COURSE                      | N : 1        | CASCADE    |
| TeacherOnSubjectOnGroup     | idTeacher             | TEACHER                     | N : 0..1     | SET NULL   |
| TeacherOnSubjectOnGroup     | idSubject             | SUBJECT                     | N : 1        | CASCADE    |
| TeacherOnSubjectOnGroup     | idGroup               | GROUP                       | N : 1        | CASCADE    |
| TeacherOnSubjectOnGroup     | currentSubstituteId   | TEACHER                     | N : 0..1     | SET NULL   |
| StudentOnSubjectOnGroup     | idStudent             | STUDENT                     | N : 1        | CASCADE    |
| StudentOnSubjectOnGroup     | idSubject             | SUBJECT                     | N : 1        | CASCADE    |
| StudentOnSubjectOnGroup     | idGroup               | GROUP                       | N : 1        | CASCADE    |
| AssignmentSubstitution      | idTeacherAssignment   | TeacherOnSubjectOnGroup     | N : 1        | CASCADE    |
| AssignmentSubstitution      | idSubstitute          | TEACHER                     | N : 1        | RESTRICT   |
| WeekSchedule                | idTeacherAssignment   | TeacherOnSubjectOnGroup     | N : 0..1     | CASCADE    |
| SessionClass                | idSchedule            | WeekSchedule                | N : 1        | CASCADE    |
| Assistance                  | idSession             | SessionClass                | N : 1        | CASCADE    |
| Assistance                  | idStudentEnrollment   | StudentOnSubjectOnGroup     | N : 1        | CASCADE    |
| Task                        | idTeacherAssignment   | TeacherOnSubjectOnGroup     | N : 1        | CASCADE    |
| Task                        | idTaskGroup           | TaskGroup                   | N : 0..1     | SET NULL   |
| StudentTask                 | idTask                | Task                        | N : 1        | CASCADE    |
| StudentTask                 | idStudentEnrollment   | StudentOnSubjectOnGroup     | N : 1        | CASCADE    |
| SubjectEvaluation           | idStudentEnrollment   | StudentOnSubjectOnGroup     | N : 1        | CASCADE    |
| Issue                       | idAdmin               | ADMIN                       | N : 1        | RESTRICT   |
| Issue                       | idGroup               | GROUP                       | N : 0..1     | SET NULL   |
| Issue                       | idCourse              | COURSE                      | N : 0..1     | SET NULL   |
| Issue                       | idSubject             | SUBJECT                     | N : 0..1     | SET NULL   |
| Issue                       | idTargetTeacher       | TEACHER                     | N : 0..1     | SET NULL   |
| Issue                       | idTargetStudent       | STUDENT                     | N : 0..1     | SET NULL   |

---

*Motor: PostgreSQL · ORM: Prisma · PKs: INT SERIAL (autoincrement) · ENUMs: tipos nativos PostgreSQL*  
*Última revisión: `prisma/schema.prisma` + migraciones `revert_20260525174509_curso71` y `week_schedule_label_drop_default`.*

**Reglas clave (asignación / horario):**

| Campo | Regla |
|-------|--------|
| `TeacherOnSubjectOnGroup.idTeacher` | NULL permitido · FK `SET NULL` · unique `(idSubject, idGroup, schoolYear)` |
| `WeekSchedule.idTeacherAssignment` | NULL permitido (plantilla) |
| `WeekSchedule.label` | NOT NULL · sin default en BD |
| `isTutor`, `AssignmentSubstitution`, `SubjectEvaluation`, `StudentPassword` | Sin cambio respecto al bloque tutoría/sustituciones |
