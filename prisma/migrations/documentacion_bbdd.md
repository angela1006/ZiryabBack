# Documentación de la Base de Datos

> **Tecnología:** PostgreSQL gestionado mediante Prisma ORM  
> **Versión del esquema:** 1.0  
> **Última actualización:** *(pendiente de rellenar)*

---

## Índice

1. [Visión general](#1-visión-general)
2. [Diagrama de entidades](#2-diagrama-de-entidades)
3. [Modelos de usuario](#3-modelos-de-usuario)
   - [Student](#31-student-alumno)
   - [Teacher](#32-teacher-profesor)
   - [Admin](#33-admin-administrador)
4. [Estructura académica](#4-estructura-académica)
   - [Course](#41-course-ciclo-formativo)
   - [Subject](#42-subject-asignatura)
   - [Group](#43-group-grupo)
5. [Relaciones muchos a muchos](#5-relaciones-muchos-a-muchos)
   - [TeacherOnSubjectOnGroup](#51-teacheronsubjectongroup)
   - [StudentOnSubjectOnGroup](#52-studentonsubjectongroup)
6. [Horarios y sesiones](#6-horarios-y-sesiones)
   - [WeekSchedule](#61-weekschedule-horario-semanal)
   - [SessionClass](#62-sessionclass-sesión-de-clase)
7. [Control de asistencia](#7-control-de-asistencia)
   - [Assistance](#71-assistance-asistencia)
8. [Tareas y entregas](#8-tareas-y-entregas)
   - [Task](#81-task-tarea)
   - [StudentTask](#82-studenttask-entrega-del-alumno)
9. [Enumerados (Enums)](#9-enumerados-enums)
10. [Índices y restricciones de unicidad](#10-índices-y-restricciones-de-unicidad)
11. [Consideraciones de diseño y decisiones técnicas](#11-consideraciones-de-diseño-y-decisiones-técnicas)

---

## 1. Visión general

Esta base de datos da soporte a una plataforma de gestión educativa orientada a **ciclos formativos de Formación Profesional**. Permite gestionar:

- La **estructura académica**: ciclos, asignaturas y grupos.
- Los **usuarios del sistema**: alumnos, profesores y administradores.
- Las **asignaciones**: qué profesor imparte qué asignatura a qué grupo y en qué año escolar.
- Las **matrículas**: qué alumnos están matriculados en qué asignatura/grupo.
- Los **horarios semanales** y las **sesiones de clase** concretas.
- El **control de asistencia** por sesión.
- Las **tareas** publicadas por los profesores y las **entregas** de los alumnos.

La autenticación se gestiona de forma externa mediante **Firebase Authentication**, por lo que cada usuario tiene un campo `firebaseUID` que actúa como puente entre el sistema de autenticación externo y la base de datos propia.

---

## 2. Diagrama de entidades

```
Course ──< Subject >──────────────────── TeacherOnSubjectOnGroup >──── Teacher
                  \                     /        |
                   └── StudentOnSubjectOnGroup ──┤        
                                 |               |
                              Student        WeekSchedule
                                 |               |
                           StudentTask       SessionClass
                                 |               |
                               Task          Assistance
```

> *El diagrama anterior es una representación simplificada. Las relaciones completas se describen en cada sección.*

---

## 3. Modelos de usuario

El sistema distingue tres roles de usuario, cada uno con su propio modelo en la base de datos. **_Aquí explicarías la decisión de tener tres tablas separadas en lugar de una tabla única con campo `role`, y las ventajas que esto aporta en vuestro contexto._**

### 3.1 Student (Alumno)

Representa a un alumno matriculado en el centro.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `email` | String (único) | Correo electrónico, sirve de identificador de login |
| `name` | String | Nombre |
| `surname` | String | Primer apellido |
| `ndSurname` | String? | Segundo apellido (opcional) |
| `birthDate` | DateTime | Fecha de nacimiento |
| `dni` | String? (único) | DNI/NIE del alumno (opcional) |
| `role` | String | Siempre `"STUDENT"` por defecto |
| `firebaseUID` | String (único) | UID de Firebase para autenticación |
| `createdAt` | DateTime | Fecha de alta en el sistema |

**Relaciones:**
- `enrollments` → lista de `StudentOnSubjectOnGroup`: las matrículas activas o históricas del alumno.

**Notas:**
- El campo `dni` es opcional en Student pero obligatorio en Teacher y Admin. **Como podemos encontrarnos con alumnos menores de 14 años que no tengan D.N.I. por eso en Student es nulo y en Teacher y Admin no es nulable**
- Existe un campo `isActive` comentado. **Con esta campo filtramos si el usuario esta activo (puede haberse dado de baja pero no por ello queremos eliminarlo del sistema)**

---

### 3.2 Teacher (Profesor)

Representa a un profesor que imparte clase en el centro.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `email` | String (único) | Correo electrónico |
| `name` | String | Nombre |
| `surname` | String | Primer apellido |
| `ndSurname` | String? | Segundo apellido (opcional) |
| `birthDate` | DateTime | Fecha de nacimiento |
| `dni` | String (único) | DNI obligatorio |
| `role` | String | Siempre `"TEACHER"` por defecto |
| `firebaseUID` | String (único) | UID de Firebase para autenticación |
| `createdAt` | DateTime | Fecha de alta en el sistema |

**Relaciones:**
- `assignments` → lista de `TeacherOnSubjectOnGroup`: las asignaciones del profesor a asignaturas y grupos.

---

### 3.3 Admin (Administrador)

Representa a un usuario administrador del sistema con permisos de gestión global.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `email` | String (único) | Correo electrónico |
| `name` | String | Nombre |
| `surname` | String | Primer apellido |
| `ndSurname` | String? | Segundo apellido (opcional) |
| `birthDate` | DateTime | Fecha de nacimiento |
| `dni` | String (único) | DNI obligatorio |
| `role` | String | Siempre `"ADMIN"` por defecto |
| `firebaseUID` | String (único) | UID de Firebase para autenticación |
| `createdAt` | DateTime | Fecha de alta en el sistema |

**Notas:**
- El modelo Admin no tiene relaciones directas con el resto de entidades académicas ya que su función es administrativa. 

---

## 4. Estructura académica

### 4.1 Course (Ciclo Formativo)

Representa un ciclo formativo completo (por ejemplo: DAM, DAW, ASIR...).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `name` | String (único) | Nombre del ciclo (ej: `"DAM"`) |
| `description` | String? | Descripción del ciclo formativo |
| `duration` | Int | Duración en años (valor por defecto: `2`) |
| `createdAt` | DateTime | Fecha de creación |

**Relaciones:**
- `subjects` → lista de `Subject`: las asignaturas que pertenecen a este ciclo.

**Notas:**
- La restricción `@unique` en `name` evita duplicar el mismo ciclo. **Si un ciclo se impartiera en distintos turnos estos turnos serán tratados como grupos**
- Existe un campo `isActive` comentado. **Al igual que en otras tablas nos permite ver si el ciclo sigue funcionando o no, sin tener que borrarlo del sistema**

---

### 4.2 Subject (Asignatura)

Representa una asignatura dentro de un ciclo formativo, asociada a un curso concreto (1º o 2º).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `name` | String | Nombre de la asignatura |
| `grade` | String | Curso dentro del ciclo: `"1"` o `"2"` |
| `hours` | Int? | Horas semanales (opcional) |
| `description` | String? | Descripción breve (opcional) |
| `idCourse` | Int (FK) | Referencia al ciclo al que pertenece |

**Relaciones:**
- `course` → `Course`: ciclo formativo al que pertenece.
- `studentEnrollments` → lista de `StudentOnSubjectOnGroup`.
- `teacherAssignments` → lista de `TeacherOnSubjectOnGroup`.

**Restricciones:**
- `@@unique([name, idCourse, grade])`: no puede existir la misma asignatura dos veces dentro del mismo ciclo y curso.
- `onDelete: Cascade`: si se elimina un ciclo, sus asignaturas se eliminan en cascada.

**Notas:**
- El campo `grade` es un `String` con valores `"1"` o `"2"`. **Se plantea solo con estos valores por que practitacmente todos los ciclos academicos estan divididos en dos cursos ya sea los ciclos de primaria o secundaria, bachillerato, ciclos formativos...etc, entonces en el caso de ser un 3º o 4º o 5º o 6º sería una asignatura del 1 curso del 2º o 3º ciclo de Primaria**
- Existe un campo `code` comentado. **Posibilidad de incluir un codigo en al asignatura aparte de su Id automático de la base de datos**

---

### 4.3 Group (Grupo)

Representa un grupo de alumnos dentro del centro (por ejemplo: `"A"`, `"B"`, `"Tarde"`...).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `name` | String | Nombre identificativo del grupo |
| `capacity` | Int? | Número máximo de alumnos (opcional) |
| `createdAt` | DateTime | Fecha de creación |

**Relaciones:**
- `studentEnrollments` → lista de `StudentOnSubjectOnGroup`.
- `teacherAssignments` → lista de `TeacherOnSubjectOnGroup`.

**Notas:**
- Los grupos no están vinculados directamente a un `Course`. La relación se establece de forma indirecta a través de `Subject`. **Cada ciclo oferta asiganturas distintas al igual que los cursos, pues no es lo mismo matemáticas de 1º que de 2º para no alargar una relación que podría dificultar más que ayudar, las asignaturas se asocian a ciclos, así en caso de ciclos de secundaria por ejemplo, tendriamos que en el ciclo 1, hay 2 asignaturas de matemáticas una con curso 1 y otra con curso 2 y distinto Id(son elementos distintos)**
- Existe un campo `shift` comentado. **Se puso opcional en caso de encontrar una asignatura que se pueda impartir en un mismo grupo en dos turnos distintos, ejemplo 1 mañana a o 1 tarde a, puede darse el caso en un instituto que tenga bachillerato diurno y nocturno donde no hay cambio en asignaturas, pero puede separarse igualmente creando dentro del mismo nombre de grupo toda esta información**

---

## 5. Relaciones muchos a muchos

El núcleo del modelo de datos son dos tablas de unión que conectan usuarios, asignaturas y grupos. Ambas incluyen el campo `schoolYear` para poder mantener el histórico de cursos anteriores sin perder datos.

### 5.1 TeacherOnSubjectOnGroup

Representa la asignación de **un profesor** a **una asignatura** de **un grupo** en **un año escolar** concreto.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idTeacher` | Int (FK) | Referencia al profesor |
| `idSubject` | Int (FK) | Referencia a la asignatura |
| `idGroup` | Int (FK) | Referencia al grupo |
| `schoolYear` | String | Año escolar en formato `"2024-2025"` |
| `status` | AssignmentStatus | Estado del profesor en esta asignación |
| `createdAt` | DateTime | Fecha de creación |

**Restricciones:**
- `@@unique([idTeacher, idSubject, idGroup, schoolYear])`: un profesor no puede estar asignado dos veces a la misma combinación en el mismo año.
- `onDelete: Cascade` en todas las FK.

**Relaciones derivadas:**
- `WeekSchedule`: los horarios semanales asociados a esta asignación.
- `tasks`: las tareas creadas por el profesor para este grupo/asignatura.

**Notas:**
- El enum `AssignmentStatus` permite reflejar situaciones laborales del profesor (baja, excedencia...) sin eliminar la asignación. **Otro campo distitno a is active en el usuario que en lugar de actualizar el estado según este el usuario, guarda el estado en que estuvo en ese año académico**

---

### 5.2 StudentOnSubjectOnGroup

Representa la **matrícula de un alumno** en una **asignatura** de un **grupo** para un **año escolar**.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idStudent` | Int (FK) | Referencia al alumno |
| `idGroup` | Int (FK) | Referencia al grupo |
| `idSubject` | Int (FK) | Referencia a la asignatura |
| `schoolYear` | String | Año escolar en formato `"2024-2025"` |
| `status` | EnrollmentStatus | Estado de la matrícula |
| `createdAt` | DateTime | Fecha de creación |

**Restricciones:**
- `@@unique([idStudent, idGroup, idSubject, schoolYear])`: un alumno no puede estar matriculado dos veces en la misma combinación durante el mismo año.
- `onDelete: Cascade` en todas las FK.

**Relaciones derivadas:**
- `Assistance`: los registros de asistencia del alumno en las sesiones de esta matrícula.
- `studentTasks`: las entregas de tareas vinculadas a esta matrícula.

**Notas:**
- La granularidad de la matrícula es a nivel de **asignatura individual**, no de grupo completo. **La matriculación se hace por cada estudiante, grupo y asignatura en un año acádemico, por que puede darse la posibilidad de que un alumno este repitiendo y solo tenga ciertas asignaturas, o convalide algunas por formación previa, o que curse asignaturas de varios cursos dentro de un mismo ciclo, en el mismo año.**
- Se menciona en comentarios la posibilidad de añadir `finalGrade` y `examGrades`. ** Estos atributos irian manejando las notas parciales y por último la final del alumno en esa asignatura y grupo en ese año.(Revisadla, no me gusta mucho)**

---

## 6. Horarios y sesiones

### 6.1 WeekSchedule (Horario Semanal)

Define las franjas horarias recurrentes en las que un profesor imparte una asignatura a un grupo.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idTeacherAssignment` | Int (FK) | Referencia a `TeacherOnSubjectOnGroup` |
| `weekDay` | Int | Día de la semana (`1` = Lunes, `7` = Domingo) |
| `startTime` | String | Hora de inicio en formato `"HH:MM"` |
| `finishTime` | String | Hora de fin en formato `"HH:MM"` |
| `createdAt` | DateTime | Fecha de creación |

**Relaciones:**
- `teacherAssignment` → `TeacherOnSubjectOnGroup`.
- `sessions` → lista de `SessionClass`: las clases concretas generadas a partir de este horario.

**Notas:**
- Las horas se almacenan como `String` en formato `"HH:MM"`. **Elegí String para este campo por mayor facilidad de organización, como siempre es posible convertir a String un Date o un DateTime(Revisad igualmente)**
- El campo `aula` (aula/sala) está comentado. **Con este atributo se pretende identificar en que aula se desarrolla la clase, (revisar si deberia estar en otra tabla)**

---

### 6.2 SessionClass (Sesión de Clase)

Representa una **clase concreta** que ocurre en una fecha específica, generada a partir de un horario semanal.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idSchedule` | Int (FK) | Referencia al `WeekSchedule` del que proviene |
| `date` | DateTime | Fecha y hora exacta de la sesión |
| `status` | String | Estado: `PROGRAMADA`, `REALIZADA`, `CANCELADA` |
| `apointments` | String? | Observaciones o notas de la sesión (opcional) |
| `createdAt` | DateTime | Fecha de creación |

**Relaciones:**
- `schedule` → `WeekSchedule`.
- `assistances` → lista de `Assistance`: los registros de asistencia de cada alumno en esta sesión.

**Notas:**
- El campo `status` es un `String` libre en lugar de un enum. **En este punto se debería plantear que los valores que pueda recibir ya que son limitados sean en una enumeración.**
- **El flujo para construir una sesión de clase parte del login del profesor, donde se obtienen sus assignments (relación entre asignatura, grupo y año académico). Al seleccionar una asignatura, se fija ese contexto (assignmentId, idSubject, idGroup, schoolYear) y se cargan tanto los alumnos matriculados (obteniendo los enrollmentId) como los horarios asociados (WeekSchedule). Con la fecha y hora actuales se determina qué bloque horario corresponde (filtrando por día de la semana y rango de horas), lo que devuelve un scheduleId concreto. A partir de ese scheduleId y la fecha del día, el sistema busca si ya existe una SessionClass; si no existe, la crea automáticamente, y si existe la reutiliza. El resultado final es una sesión de clase única para ese horario y día, lista para ser utilizada en el resto del flujo.**

---

## 7. Control de asistencia

### 7.1 Assistance (Asistencia)

Registra la asistencia (o falta) de **un alumno** en **una sesión de clase** concreta.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idSession` | Int (FK) | Referencia a la `SessionClass` |
| `idStudentEnrollment` | Int (FK) | Referencia a `StudentOnSubjectOnGroup` |
| `status` | AssistanceStatus | Estado de asistencia del alumno |
| `justificationUri` | String? | URL/ruta del archivo de justificante (opcional) |
| `justificationStatus` | JustificationStatus? | Estado del justificante enviado |
| `createdAt` | DateTime | Fecha de creación |

**Restricciones:**
- `@@unique([idSession, idStudentEnrollment])`: un alumno solo puede tener un registro de asistencia por sesión.

**Notas:**
- El flujo de justificación contempla dos actores: el alumno (que sube el justificante) y el profesor (que lo revisa). **Una vez el alumno visualiza el estado de sus faltas puede proceder a justificar las que sean retraso o perdida, al clikar en la falta obtendra el id de asistencia y adjuntará el documento haciendo que esto nos actualice el campo de uri con el nombre del fichero y su dirección para poder descargarlo después por el profesor, haciendo que el estado de justificación pase a pendiente, cuando el profesor descargue el fichero y compruebe el justificante podrá validarlo o rechazarlo haciendo que cuando lo valide, su estado pase a aceptado y el estado de la asistencia pase a justificada, mientras que si lo rechaza el estado de la asistencia seguirá siendo perdida o retraso y el estado de justificación será rechazado, de esta manera el estudiante podrá conocer en que estado se encuentra su justificación**
- **Los registros de asistencias se generan obteniendo la sesión de clase explicado en el paso anterior y obtenendo el estado de cada una segun vaya marcando el profesor en la lista de alumnos**

---

## 8. Tareas y entregas

### 8.1 Task (Tarea)

Representa una tarea, examen, práctica o material publicado por un profesor para su grupo.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idTeacherAssignment` | Int (FK) | Referencia a `TeacherOnSubjectOnGroup` |
| `title` | String | Título de la tarea |
| `description` | String? | Descripción detallada (opcional) |
| `type` | TaskType | Tipo de tarea (ver enum) |
| `startDate` | DateTime | Fecha desde la que es visible para los alumnos |
| `dueDate` | DateTime | Fecha límite de entrega |
| `attachmentUrl` | String? | URL de un archivo adjunto del profesor (opcional) |
| `schoolYear` | String | Año escolar en formato `"2024-2025"` |
| `createdAt` | DateTime | Fecha de creación |

**Relaciones:**
- `teacherAssignment` → `TeacherOnSubjectOnGroup`.
- `studentTasks` → lista de `StudentTask`: las entregas de cada alumno.

**Notas:**
- El campo `startDate` permite a los profesores programar tareas con antelación sin que sean visibles hasta la fecha indicada. **El profesor pondrá una tarea y hasta que no lleguemos a la fecha de startDate no se crearán las tareas para los alumnos, con lo cual no podrán visualizarlas.**
- Una tarea está vinculada al `TeacherOnSubjectOnGroup`, lo que significa que pertenece a un año escolar, grupo y asignatura concretos. **Y de momento cada tarea debe ser creada para cada assingment por cada año escolar.**

---

### 8.2 StudentTask (Entrega del Alumno)

Representa la entrega (o estado de entrega) de **un alumno** para **una tarea** concreta.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (PK) | Identificador autoincremental |
| `idTask` | Int (FK) | Referencia a la `Task` |
| `idStudentEnrollment` | Int (FK) | Referencia a `StudentOnSubjectOnGroup` |
| `status` | SubmissionStatus | Estado de la entrega |
| `submissionDate` | DateTime? | Fecha y hora de la entrega (null si no ha entregado) |
| `score` | Decimal? | Nota del profesor (null si no está calificada) |
| `feedback` | String? | Comentarios del profesor (opcional) |
| `attachmentUrl` | String? | URL del archivo subido por el alumno (opcional) |
| `createdAt` | DateTime | Fecha de creación |

**Restricciones:**
- `@@unique([idTask, idStudentEnrollment])`: un alumno solo puede tener una entrega por tarea.

**Notas:**
- **Como se ha explicado en el paso anterior cada vez que el profesor mande una tarea y llegue la fecha de startDate se crearán los registros de studentTask, los cuales ya podrán visualizar los alumnos.**
- La distinción entre `SUBMITTED` y `LATE` permite saber si el alumno entregó fuera de plazo. **Este atributo nos permite ver si cuando fue entregado el trabajo pero hay cosas que quiero modificar aqui.Por que si se entrega despues de dueDate sera Late (late ya implica submmited) y cuando sea subida antes de dueDate sera submited, pero no tenemos ningun campo especifico para indicar si la tarea es entregable después de dueDate o por otro lado quede bloqueada sin entregar.**
- El campo `score` usa `Decimal` para mayor precisión numérica. **Usando decimal podemos hacer que el profesor eliga el metodo de puntuacion ya sea sobre 10 con decimales o sobre 100 con enteros, por ejemplo.**

---

## 9. Enumerados (Enums)

### AssignmentStatus
Estado de un profesor en una asignación concreta.

| Valor | Descripción |
|---|---|
| `ACTIVE` | El profesor está activo e imparte clase |
| `SUSPENDED` | Suspendido de empleo |
| `ILLNESS` | Baja por enfermedad |
| `EXCEDENCE` | En situación de excedencia |
| `WITHDRAWN` | Baja voluntaria del puesto de trabajo |
| `STANDBY` | En el sistema pero sin asignación activa en ningún centro |

> **Este enumerado nos permite controlar el estado del profesor en ese curso, haciendonos poder prescindir de isActive en Teacher**

---

### EnrollmentStatus
Estado de la matrícula de un alumno en una asignatura.

| Valor | Descripción |
|---|---|
| `ENROLLED` | Matriculado y cursando normalmente |
| `EVALUATION_LOST` | Ha perdido la evaluación continua |
| `COMPLETED` | Ha superado la asignatura |
| `FAILED` | Ha suspendido la asignatura |
| `WITHDRAWN` | Se ha dado de baja voluntariamente |
| `EXPELLED` | Ha sido expulsado |

> **Aquí manejamos el caso concreto del alumno con la mismo efecto que en el profesor.**

---

### AssistanceStatus
Estado de asistencia de un alumno a una sesión.

| Valor | Descripción |
|---|---|
| `PRESENT` | El alumno asistió a clase |
| `MISSING` | El alumno no asistió |
| `LAG` | El alumno llegó tarde |
| `JUSTIFY` | La falta está justificada |

---

### JustificationStatus
Estado del justificante enviado por un alumno para una falta.

| Valor | Descripción |
|---|---|
| `PENDING` | El alumno ha enviado el justificante, pendiente de revisión |
| `VIEWED` | El profesor ha visto el justificante |
| `REJECTED` | El justificante ha sido rechazado |

> **Aquí podemos o devolver el estado a nulo cuando sea aceptada y hacer que cambie el estado a Justify quedando resuelto el problema o que como expliqué más arriba también tenga un estado aceptado que tambien cambia como justify.**

---

### TaskType
Tipo de tarea publicada por el profesor.

| Valor | Descripción |
|---|---|
| `PRACTICE` | Práctica |
| `THEORY` | Teoría, trabajo o material de estudio |
| `EXAM` | Examen |
| `PROJECT` | Proyecto |
| `HOMEWORK` | Deberes |

---

### SubmissionStatus
Estado de la entrega de un alumno para una tarea.

| Valor | Descripción |
|---|---|
| `PENDING` | Pendiente de entregar (dentro de plazo) |
| `SUBMITTED` | Entregada dentro del plazo |
| `LATE` | Entregada fuera de plazo |
| `GRADED` | Calificada por el profesor |
| `NOT_SUBMITTED` | No entregada (el plazo ha expirado) |

---

## 10. Índices y restricciones de unicidad

A continuación se resumen los índices definidos en el esquema y su propósito:

| Modelo | Índice / Unique | Propósito |
|---|---|---|
| `Subject` | `@@unique([name, idCourse, grade])` | Evita duplicar asignaturas en el mismo ciclo y curso |
| `Subject` | `@@index([idCourse, grade])` | Optimiza búsquedas de asignaturas por ciclo y curso |
| `TeacherOnSubjectOnGroup` | `@@unique([idTeacher, idSubject, idGroup, schoolYear])` | Evita asignaciones duplicadas |
| `TeacherOnSubjectOnGroup` | `@@index([schoolYear])` | Optimiza consultas por año académico |
| `TeacherOnSubjectOnGroup` | `@@index([idTeacher, schoolYear])` | Optimiza la consulta de carga lectiva de un profesor |
| `StudentOnSubjectOnGroup` | `@@unique([idStudent, idGroup, idSubject, schoolYear])` | Evita matrículas duplicadas |
| `StudentOnSubjectOnGroup` | `@@index([schoolYear, status])` | Optimiza reportes por año y estado |
| `StudentOnSubjectOnGroup` | `@@index([idStudent, schoolYear])` | Optimiza la consulta del expediente de un alumno |
| `WeekSchedule` | `@@index([idTeacherAssignment, weekDay])` | Optimiza la consulta del horario de una asignación por día |
| `SessionClass` | `@@index([date])` | Optimiza búsquedas de sesiones por fecha |
| `SessionClass` | `@@index([idSchedule, date])` | Optimiza la búsqueda de sesiones de un horario concreto |
| `Assistance` | `@@unique([idSession, idStudentEnrollment])` | Garantiza un único registro de asistencia por alumno/sesión |
| `Assistance` | `@@index([idStudentEnrollment])` | Optimiza el historial de asistencia de un alumno |
| `Assistance` | `@@index([idSession, status])` | Optimiza los listados de asistencia por sesión y estado |
| `Task` | `@@index([idTeacherAssignment, schoolYear])` | Optimiza la lista de tareas de una asignación |
| `Task` | `@@index([dueDate])` | Optimiza búsquedas de tareas por fecha límite |
| `StudentTask` | `@@unique([idTask, idStudentEnrollment])` | Garantiza una única entrega por alumno/tarea |
| `StudentTask` | `@@index([idStudentEnrollment, status])` | Optimiza el seguimiento de tareas de un alumno |
| `StudentTask` | `@@index([idTask, status])` | Optimiza la corrección de tareas por parte del profesor |

---

## 11. Consideraciones de diseño y decisiones técnicas

### Autenticación externa con Firebase
La autenticación de usuarios no se gestiona dentro de esta base de datos sino a través de Firebase Authentication. El campo `firebaseUID` en los tres modelos de usuario actúa como clave de enlace. **Hasta ahora hemos manejado esto haciendo que el usuario se registraba primero contra firebase y cuando firebase nos devolvia las credenciales, en este caso el firebase UID lo enviabamos en el cuerpo de la petición para registrar así al usuario en nuetra bse de datos pero esto ahora cambia debido al cambio de firebaseUID a token. **

### Tres tablas de usuarios vs. una tabla unificada
Se ha optado por modelar los tres roles (Student, Teacher, Admin) en tablas separadas en lugar de una única tabla `User` con campo `role`. **Se decide sacar 3 tabas del modelo de usuario en lugar de una tabla solo diferenciada por roles, por la facilidad par poder conectar luego estos sin que cause inconsistencias en la base de datos.**

### Histórico por año escolar
El campo `schoolYear` en `TeacherOnSubjectOnGroup`, `StudentOnSubjectOnGroup` y `Task` permite conservar el histórico de cursos anteriores sin eliminar registros. **Con esto podemos conservar historiales de alumnos profesores y demás usuarios del sistema. Pudiendo emitir documentación para estos en caso de necesitarla, por ejemplo un resultado de un curso para un alumno que cambia de centro, etc. Este cambiara automaticamente al cumplirse la fecha de inicio del siguiente curso escolar.**

### Campos comentados (pendientes de activar)
A lo largo del esquema existen varios campos comentados que representan funcionalidades previstas pero no implementadas aún:

- `isActive` en Student, Teacher y Course.
- `code` en Subject.
- `shift` en Group.
- `aula` en WeekSchedule.
- `finalGrade` y `examGrades` en StudentOnSubjectOnGroup.

**Todos estos campos han sido comentados en su respectiva sección**

### Cascade deletes
Todas las claves foráneas utilizan `onDelete: Cascade`. **Como la mayoria de los "borrados" son cambios de estado para que siga existiendo el registro en la base de datos cuando se elimina algo es o para hacerlo de nuevo o para eliminarlo permanentemente, y el borrado en cascada nos permite borrar por ejemplo un ciclo sin tener que ir borrando sus asignaturas asociadas una por una.**
