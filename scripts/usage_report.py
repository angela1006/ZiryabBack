#!/usr/bin/env python3
"""
Informe de uso / adopción de Ziryab (Pandas + PostgreSQL).

Lee DATABASE_URL desde .env en la raíz del backend, agrega actividad operativa
de la BD y exporta un Excel multi-hoja listo para análisis o Power BI.

Uso:
  pip install -r scripts/requirements-usage-report.txt
  python scripts/usage_report.py --anyo 2024-2025 --output ./informes

Opciones:
  --anyo 2024-2025     Año académico (schoolYear)
  --ciclo todos|DAM    Filtrar por Course.name
  --grupo todos|Mañana Filtrar por Group.name
  --inactivos          Incluir matrículas/asignaciones retiradas o suspendidas
  --completo           Ignora ciclo/grupo
  --output ./informes  Carpeta de salida
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# --- Configuración ---
SCHOOL_YEAR_DEFAULT = "2024-2025"
OPERATIONAL_ASSIGNMENT_STATUSES = ("ACTIVE", "STANDBY")
WEIGHTS = {
    "asistencia": 0.35,
    "tareas": 0.35,
    "notas": 0.15,
    "notificaciones": 0.15,
}

NODE_ROOT = Path(__file__).resolve().parent.parent
SCRIPT_DIR = Path(__file__).resolve().parent


def load_database_url() -> str:
    load_dotenv(NODE_ROOT / ".env")
    import os

    url = os.getenv("DATABASE_URL")
    if not url:
        print("ERROR: DATABASE_URL no definida en node/.env", file=sys.stderr)
        sys.exit(1)
    return url


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Informe de uso Ziryab (Pandas)")
    p.add_argument("--anyo", default=SCHOOL_YEAR_DEFAULT, help="Año académico")
    p.add_argument("--ciclo", default="todos", help="Ciclo formativo (Course.name)")
    p.add_argument("--grupo", default="todos", help="Grupo (Group.name)")
    p.add_argument("--inactivos", action="store_true", help="Incluir matrículas/asignaciones retiradas o suspendidas")
    p.add_argument("--completo", action="store_true", help="Sin filtro ciclo/grupo")
    p.add_argument("--output", default=str(NODE_ROOT / "informes"), help="Carpeta salida")
    return p.parse_args()


def dim_filters(args: argparse.Namespace) -> tuple[str, str, dict, str]:
    """Fragmentos SQL AND + params para ciclo/grupo."""
    parts: list[str] = []
    params: dict = {"anyo": args.anyo}

    if not args.completo and args.ciclo != "todos":
        parts.append('AND c.name = :ciclo')
        params["ciclo"] = args.ciclo
    if not args.completo and args.grupo != "todos":
        parts.append('AND g.name = :grupo')
        params["grupo"] = args.grupo

    if args.inactivos:
        enrollment_extra = ""
        assignment_extra = ""
    else:
        enrollment_extra = "AND e.status = 'ENROLLED'"
        statuses = ", ".join(f"'{s}'" for s in OPERATIONAL_ASSIGNMENT_STATUSES)
        assignment_extra = f"AND ta.status IN ({statuses})"

    return enrollment_extra, assignment_extra, params, " ".join(parts)


def fetch_available_school_years(engine) -> pd.DataFrame:
    q = """
    SELECT "schoolYear" AS anyo, COUNT(*)::int AS matriculas
    FROM "StudentOnSubjectOnGroup"
    GROUP BY "schoolYear"
    ORDER BY "schoolYear" DESC
    """
    return pd.read_sql(text(q), engine)


def table_exists(engine, table_name: str) -> bool:
    q = text(
        """
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = :table
        ) AS exists
        """
    )
    with engine.connect() as conn:
        return bool(conn.execute(q, {"table": table_name}).scalar())


def resolve_grades_source(engine) -> tuple[str, str]:
    """Devuelve (tabla, fragmento SELECT de profesor) según el esquema migrado."""
    check = text(
        """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('SubjectEvaluation', 'Grade')
        ORDER BY CASE table_name
          WHEN 'SubjectEvaluation' THEN 0
          ELSE 1
        END
        LIMIT 1
        """
    )
    with engine.connect() as conn:
        row = conn.execute(check).fetchone()
    if not row:
        return "", ""
    table = row[0]
    if table == "Grade":
        return table, 'gr."idTeacher" AS teacher_id,'
    return table, "NULL::int AS teacher_id,"


def fetch_enrollments(engine, enrollment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    q = f"""
    SELECT e.id AS enrollment_id, e."schoolYear", e.status AS enrollment_status,
           e."createdAt", c.name AS course_name, s.grade, g.name AS group_name,
           g.capacity, e."idStudent" AS student_id, s.name AS subject_name
    FROM "StudentOnSubjectOnGroup" e
    JOIN "Subject" sub ON sub.id = e."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = e."idGroup"
    JOIN "Subject" s ON s.id = e."idSubject"
    WHERE e."schoolYear" = :anyo {enrollment_extra} {dim_sql}
    """
    # Fix: duplicate alias s for subject - use sub for join
    q = f"""
    SELECT e.id AS enrollment_id, e."schoolYear", e.status AS enrollment_status,
           e."createdAt", c.name AS course_name, sub.grade, g.name AS group_name,
           g.capacity, e."idStudent" AS student_id, sub.name AS subject_name
    FROM "StudentOnSubjectOnGroup" e
    JOIN "Subject" sub ON sub.id = e."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = e."idGroup"
    WHERE e."schoolYear" = :anyo {enrollment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_assignments(engine, assignment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    q = f"""
    SELECT ta.id AS assignment_id, ta."schoolYear", ta.status AS assignment_status,
           ta."idTeacher" AS teacher_id, c.name AS course_name, sub.grade,
           g.name AS group_name, sub.hours, sub.name AS subject_name
    FROM "TeacherOnSubjectOnGroup" ta
    JOIN "Subject" sub ON sub.id = ta."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = ta."idGroup"
    WHERE ta."schoolYear" = :anyo {assignment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_assistances(engine, enrollment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    q = f"""
    SELECT a.id, a.status, a."justificationUri", a."justificationStatus",
           a."createdAt", sc.date AS session_date, sc.status AS session_status,
           c.name AS course_name, g.name AS group_name, sub.grade
    FROM "Assistance" a
    JOIN "SessionClass" sc ON sc.id = a."idSession"
    JOIN "WeekSchedule" ws ON ws.id = sc."idSchedule"
    JOIN "TeacherOnSubjectOnGroup" ta ON ta.id = ws."idTeacherAssignment"
    JOIN "Subject" sub ON sub.id = ta."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = ta."idGroup"
    JOIN "StudentOnSubjectOnGroup" e ON e.id = a."idStudentEnrollment"
    WHERE e."schoolYear" = :anyo {enrollment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_sessions(engine, assignment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    q = f"""
    SELECT sc.id AS session_id, sc.date, sc.status AS session_status,
           c.name AS course_name, g.name AS group_name, sub.grade,
           ta.id AS assignment_id
    FROM "SessionClass" sc
    JOIN "WeekSchedule" ws ON ws.id = sc."idSchedule"
    JOIN "TeacherOnSubjectOnGroup" ta ON ta.id = ws."idTeacherAssignment"
    JOIN "Subject" sub ON sub.id = ta."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = ta."idGroup"
    WHERE ta."schoolYear" = :anyo {assignment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_tasks(engine, assignment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    q = f"""
    SELECT t.id AS task_id, t.title, t.type AS task_type, t."isPublished",
           t."startDate", t."dueDate", t."schoolYear", t."createdAt",
           c.name AS course_name, g.name AS group_name, sub.grade
    FROM "Task" t
    JOIN "TeacherOnSubjectOnGroup" ta ON ta.id = t."idTeacherAssignment"
    JOIN "Subject" sub ON sub.id = ta."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = ta."idGroup"
    WHERE t."schoolYear" = :anyo {assignment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_student_tasks(engine, enrollment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    q = f"""
    SELECT st.id, st.status, st."submissionDate", st.score, st."isEnabled",
           t.id AS task_id, t."dueDate", t.type AS task_type, t."isPublished",
           c.name AS course_name, g.name AS group_name
    FROM "StudentTask" st
    JOIN "Task" t ON t.id = st."idTask"
    JOIN "StudentOnSubjectOnGroup" e ON e.id = st."idStudentEnrollment"
    JOIN "Subject" sub ON sub.id = e."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = e."idGroup"
    WHERE e."schoolYear" = :anyo AND t."schoolYear" = :anyo {enrollment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_grades(engine, enrollment_extra: str, dim_sql: str, params: dict) -> pd.DataFrame:
    table, teacher_select = resolve_grades_source(engine)
    if not table:
        return pd.DataFrame(
            columns=[
                "id",
                "period",
                "value",
                "createdAt",
                "updatedAt",
                "teacher_id",
                "course_name",
                "group_name",
            ]
        )

    q = f"""
    SELECT gr.id, gr.period, gr.value, gr."createdAt", gr."updatedAt",
           {teacher_select}
           c.name AS course_name, g.name AS group_name
    FROM "{table}" gr
    JOIN "StudentOnSubjectOnGroup" e ON e.id = gr."idStudentEnrollment"
    JOIN "Subject" sub ON sub.id = e."idSubject"
    JOIN "Course" c ON c.id = sub."idCourse"
    JOIN "Group" g ON g.id = e."idGroup"
    WHERE e."schoolYear" = :anyo {enrollment_extra} {dim_sql}
    """
    return pd.read_sql(text(q), engine, params=params)


def fetch_notifications(engine) -> pd.DataFrame:
    q = """
    SELECT id, type, "isRead", "readAt", "createdAt", title
    FROM "Notification"
    """
    return pd.read_sql(text(q), engine)


def fetch_issues(engine) -> pd.DataFrame:
    q = """
    SELECT i.id, i.audience, i."isPublished", i."publishAt", i."expiresAt",
           i."createdAt", c.name AS course_name, g.name AS group_name
    FROM "Issue" i
    LEFT JOIN "Course" c ON c.id = i."idCourse"
    LEFT JOIN "Group" g ON g.id = i."idGroup"
    """
    return pd.read_sql(text(q), engine)


def fetch_announcements(engine) -> pd.DataFrame:
    columns = ["id", "title", "createdAt"]
    if not table_exists(engine, "Announcement"):
        # Esquema reciente: el tablón vive en Issue (ver fetch_issues).
        return pd.DataFrame(columns=columns)

    q = """
    SELECT id, title, "createdAt" FROM "Announcement"
    """
    return pd.read_sql(text(q), engine)


def fetch_users_count(engine) -> pd.DataFrame:
    q = """
    SELECT 'STUDENT' AS role, COUNT(*)::int AS total FROM "Student"
    UNION ALL SELECT 'TEACHER', COUNT(*)::int FROM "Teacher"
    UNION ALL SELECT 'ADMIN', COUNT(*)::int FROM "Admin"
    """
    return pd.read_sql(text(q), engine)


def sheet_resumen(
    enrollments: pd.DataFrame,
    assignments: pd.DataFrame,
    assistances: pd.DataFrame,
    sessions: pd.DataFrame,
    tasks: pd.DataFrame,
    student_tasks: pd.DataFrame,
    notifications: pd.DataFrame,
    issues: pd.DataFrame,
    users: pd.DataFrame,
) -> pd.DataFrame:
    rows = []

    def add(metric: str, value, note: str = ""):
        rows.append({"metrica": metric, "valor": value, "nota": note})

    if not enrollments.empty:
        active = enrollments[enrollments["enrollment_status"] == "ENROLLED"]
        add("matriculas", len(enrollments), "filas matrícula (puede repetir alumno por asignatura)")
        add("alumnos_unicos", enrollments["student_id"].nunique())
        add("ciclos_con_alumnado", enrollments["course_name"].nunique())
        add("grupos_con_alumnado", enrollments["group_name"].nunique())
    else:
        add("matriculas", 0)
        add("alumnos_unicos", 0)

    if not assignments.empty:
        add("profesores_en_asignaciones", assignments["teacher_id"].nunique())
        add("asignaciones_docentes", len(assignments))
    else:
        add("profesores_en_asignaciones", 0)

    if not sessions.empty:
        total_s = len(sessions)
        completed = (sessions["session_status"] == "COMPLETED").sum()
        cancelled = (sessions["session_status"] == "CANCELLED").sum()
        add("sesiones_totales", total_s)
        add("sesiones_completadas", int(completed))
        add("sesiones_canceladas", int(cancelled))
        pct = round(100 * cancelled / total_s, 2) if total_s else None
        add("pct_sesiones_canceladas", pct, "% sobre total sesiones")

    if not assistances.empty:
        present = (assistances["status"] == "PRESENT").sum()
        absent = (assistances["status"] == "ABSENT").sum()
        late = (assistances["status"] == "LATE").sum()
        base = present + absent + late
        rate = round(100 * present / base, 2) if base else None
        add(
            "tasa_asistencia_global_pct",
            rate,
            "PRESENT / (PRESENT+ABSENT+LATE); EXCUSED excluido del denominador",
        )
        add("registros_asistencia", len(assistances))

    if not tasks.empty:
        pub = tasks[tasks["isPublished"] == True]  # noqa: E712
        add("tareas_totales", len(tasks))
        add("tareas_publicadas", len(pub))

    if not student_tasks.empty:
        enabled = student_tasks[student_tasks["isEnabled"] == True]  # noqa: E712
        delivered = enabled["status"].isin(["SUBMITTED", "LATE", "GRADED"]).sum()
        slots = len(enabled)
        add("entregas_registradas", int(delivered))
        add(
            "tasa_entrega_global_pct",
            round(100 * delivered / slots, 2) if slots else None,
            "entregas / filas StudentTask habilitadas",
        )

    if not notifications.empty:
        read = notifications["isRead"].sum()
        add("notificaciones_enviadas", len(notifications))
        add("notificaciones_leidas", int(read))
        add(
            "pct_lectura_notificaciones",
            round(100 * read / len(notifications), 2) if len(notifications) else None,
        )

    if not issues.empty:
        add("incidencias_publicadas", int(issues["isPublished"].sum()))
        add("incidencias_totales", len(issues))

    for _, r in users.iterrows():
        add(f"usuarios_{r['role'].lower()}", r["total"], "registrados en el sistema")

    return pd.DataFrame(rows)


def sheet_alumnado_ciclo(enrollments: pd.DataFrame) -> pd.DataFrame:
    if enrollments.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "grade",
                "enrollment_status",
                "matriculas",
                "alumnos_unicos",
            ]
        )
    g = enrollments.groupby(["course_name", "grade", "enrollment_status"], dropna=False)
    out = g.agg(matriculas=("enrollment_id", "count"), alumnos_unicos=("student_id", "nunique")).reset_index()
    return out.sort_values(["course_name", "grade", "enrollment_status"])


def sheet_alumnado_grupo(enrollments: pd.DataFrame) -> pd.DataFrame:
    if enrollments.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "group_name",
                "matriculas",
                "alumnos_unicos",
                "capacity",
                "ocupacion_pct",
            ]
        )

    g = enrollments.groupby(["course_name", "group_name"], dropna=False)
    out = g.agg(
        matriculas=("enrollment_id", "count"),
        alumnos_unicos=("student_id", "nunique"),
        capacity=("capacity", "first"),
    ).reset_index()
    out["ocupacion_pct"] = out.apply(
        lambda r: round(100 * r["alumnos_unicos"] / r["capacity"], 2)
        if pd.notna(r["capacity"]) and r["capacity"] and r["capacity"] > 0
        else None,
        axis=1,
    )
    return out.sort_values("alumnos_unicos", ascending=False)


def sheet_profesorado(assignments: pd.DataFrame) -> pd.DataFrame:
    if assignments.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "assignment_status",
                "asignaciones",
                "profesores_unicos",
                "horas_totales",
            ]
        )

    g = assignments.groupby(["course_name", "assignment_status"], dropna=False)
    out = g.agg(
        asignaciones=("assignment_id", "count"),
        profesores_unicos=("teacher_id", "nunique"),
        horas_totales=("hours", lambda s: s.fillna(0).sum()),
    ).reset_index()
    return out.sort_values(["course_name", "assignment_status"])


def sheet_asistencia_mensual(assistances: pd.DataFrame) -> pd.DataFrame:
    if assistances.empty:
        return pd.DataFrame(
            columns=[
                "mes",
                "course_name",
                "registros",
                "presentes",
                "ausentes",
                "tardes",
                "justificados",
                "tasa_asistencia_pct",
            ]
        )

    df = assistances.copy()
    df["mes"] = pd.to_datetime(df["session_date"], utc=True).dt.strftime("%Y-%m")

    rows = []
    for (mes, course), g in df.groupby(["mes", "course_name"]):
        present = (g["status"] == "PRESENT").sum()
        absent = (g["status"] == "ABSENT").sum()
        late = (g["status"] == "LATE").sum()
        excused = (g["status"] == "EXCUSED").sum()
        base = present + absent + late
        rows.append(
            {
                "mes": mes,
                "course_name": course,
                "registros": len(g),
                "presentes": int(present),
                "ausentes": int(absent),
                "tardes": int(late),
                "justificados": int(excused),
                "tasa_asistencia_pct": round(100 * present / base, 2) if base else None,
            }
        )
    return pd.DataFrame(rows).sort_values(["mes", "course_name"])


def sheet_sesiones(sessions: pd.DataFrame, assistances: pd.DataFrame) -> pd.DataFrame:
    if sessions.empty:
        return pd.DataFrame(
            columns=[
                "mes",
                "course_name",
                "group_name",
                "programadas",
                "completadas",
                "canceladas",
                "con_asistencia",
                "cobertura_asistencia_pct",
            ]
        )

    df = sessions.copy()
    df["mes"] = pd.to_datetime(df["date"], utc=True).dt.strftime("%Y-%m")

    rows = []
    for (mes, course, group), g in df.groupby(["mes", "course_name", "group_name"]):
        sched = (g["session_status"] == "SCHEDULED").sum()
        comp = (g["session_status"] == "COMPLETED").sum()
        canc = (g["session_status"] == "CANCELLED").sum()
        con_att = 0
        for _, row in g.iterrows():
            key = (row["date"], row["course_name"], row["group_name"])
            if not assistances.empty:
                mask = (
                    (assistances["session_date"] == row["date"])
                    & (assistances["course_name"] == row["course_name"])
                    & (assistances["group_name"] == row["group_name"])
                )
                if mask.any():
                    con_att += 1
        denom = int(comp) if int(comp) > 0 else max(int(sched + comp + canc), 1)
        rows.append(
            {
                "mes": mes,
                "course_name": course,
                "group_name": group,
                "programadas": int(sched),
                "completadas": int(comp),
                "canceladas": int(canc),
                "con_asistencia": con_att,
                "cobertura_asistencia_pct": round(100 * con_att / denom, 2) if denom else None,
            }
        )
    return pd.DataFrame(rows).sort_values(["mes", "course_name", "group_name"])


def sheet_tareas(tasks: pd.DataFrame, student_tasks: pd.DataFrame) -> pd.DataFrame:
    if tasks.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "task_type",
                "tareas",
                "publicadas",
                "entregas",
                "calificadas",
                "pendientes",
                "tasa_entrega_pct",
                "tasa_calificacion_pct",
                "dias_medios_entrega",
            ]
        )

    rows = []
    for (course, ttype), tg in tasks.groupby(["course_name", "task_type"]):
        tids = set(tg["task_id"])
        st = student_tasks[student_tasks["task_id"].isin(tids)] if not student_tasks.empty else pd.DataFrame()
        enabled = st[st["isEnabled"] == True] if not st.empty else st  # noqa: E712
        entregas = (
            enabled["status"].isin(["SUBMITTED", "LATE", "GRADED"]).sum() if not enabled.empty else 0
        )
        calificadas = (enabled["status"] == "GRADED").sum() if not enabled.empty else 0
        pendientes = (enabled["status"] == "PENDING").sum() if not enabled.empty else 0
        slots = len(enabled) if not enabled.empty else 0

        dias_medios = None
        if not enabled.empty:
            sub = enabled[enabled["submissionDate"].notna()].merge(
                tg[["task_id", "startDate"]].drop_duplicates("task_id"),
                on="task_id",
            )
            if not sub.empty:
                delta = pd.to_datetime(sub["submissionDate"], utc=True) - pd.to_datetime(
                    sub["startDate"], utc=True
                )
                dias_medios = round(delta.dt.total_seconds().mean() / 86400, 2)

        rows.append(
            {
                "course_name": course,
                "task_type": ttype,
                "tareas": len(tg),
                "publicadas": int((tg["isPublished"] == True).sum()),  # noqa: E712
                "entregas": int(entregas),
                "calificadas": int(calificadas),
                "pendientes": int(pendientes),
                "tasa_entrega_pct": round(100 * entregas / slots, 2) if slots else None,
                "tasa_calificacion_pct": round(100 * calificadas / slots, 2) if slots else None,
                "dias_medios_entrega": dias_medios,
            }
        )
    return pd.DataFrame(rows).sort_values(["course_name", "task_type"])


def sheet_justificantes(assistances: pd.DataFrame) -> pd.DataFrame:
    if assistances.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "group_name",
                "con_justificante",
                "pending",
                "viewed",
                "rejected",
            ]
        )

    df = assistances[
        assistances["justificationUri"].notna() | (assistances["status"] == "EXCUSED")
    ].copy()
    if df.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "group_name",
                "con_justificante",
                "pending",
                "viewed",
                "rejected",
            ]
        )

    rows = []
    for (course, group), g in df.groupby(["course_name", "group_name"]):
        rows.append(
            {
                "course_name": course,
                "group_name": group,
                "con_justificante": len(g),
                "pending": int((g["justificationStatus"] == "PENDING").sum()),
                "viewed": int((g["justificationStatus"] == "VIEWED").sum()),
                "rejected": int((g["justificationStatus"] == "REJECTED").sum()),
            }
        )
    return pd.DataFrame(rows)


def sheet_comunicacion(
    notifications: pd.DataFrame, issues: pd.DataFrame, announcements: pd.DataFrame
) -> pd.DataFrame:
    rows = []

    if not notifications.empty:
        for ntype, g in notifications.groupby("type"):
            read = g["isRead"].sum()
            rows.append(
                {
                    "bloque": "notificaciones",
                    "categoria": ntype,
                    "total": len(g),
                    "leidas": int(read),
                    "pct_lectura": round(100 * read / len(g), 2),
                    "horas_media_lectura": None,
                }
            )
        read_rows = notifications[notifications["readAt"].notna()].copy()
        if not read_rows.empty:
            read_rows["horas"] = (
                pd.to_datetime(read_rows["readAt"], utc=True)
                - pd.to_datetime(read_rows["createdAt"], utc=True)
            ).dt.total_seconds() / 3600
            rows.append(
                {
                    "bloque": "notificaciones",
                    "categoria": "_media_global",
                    "total": len(notifications),
                    "leidas": int(notifications["isRead"].sum()),
                    "pct_lectura": round(100 * notifications["isRead"].sum() / len(notifications), 2),
                    "horas_media_lectura": round(read_rows["horas"].mean(), 2),
                }
            )

    if not issues.empty:
        for aud, g in issues.groupby("audience"):
            rows.append(
                {
                    "bloque": "incidencias",
                    "categoria": str(aud),
                    "total": len(g),
                    "leidas": int(g["isPublished"].sum()),
                    "pct_lectura": round(100 * g["isPublished"].sum() / len(g), 2),
                    "horas_media_lectura": None,
                }
            )
        now = pd.Timestamp.now(tz="UTC")
        exp = issues[issues["expiresAt"].notna() & (pd.to_datetime(issues["expiresAt"], utc=True) < now)]
        rows.append(
            {
                "bloque": "incidencias",
                "categoria": "caducadas",
                "total": len(exp),
                "leidas": None,
                "pct_lectura": None,
                "horas_media_lectura": None,
            }
        )

    if not announcements.empty:
        ann = announcements.copy()
        ann["mes"] = pd.to_datetime(ann["createdAt"], utc=True).dt.strftime("%Y-%m")
        for mes, g in ann.groupby("mes"):
            rows.append(
                {
                    "bloque": "anuncios",
                    "categoria": mes,
                    "total": len(g),
                    "leidas": None,
                    "pct_lectura": None,
                    "horas_media_lectura": None,
                }
            )

    return pd.DataFrame(rows) if rows else pd.DataFrame(columns=["bloque", "categoria", "total"])


def sheet_calificaciones(grades: pd.DataFrame) -> pd.DataFrame:
    if grades.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "period",
                "notas_con_valor",
                "profesores_unicos",
                "matriculas_con_nota",
            ]
        )

    g = grades.groupby(["course_name", "period"], dropna=False)
    out = g.agg(
        notas_con_valor=("value", lambda s: s.notna().sum()),
        profesores_unicos=("teacher_id", "nunique"),
        matriculas_con_nota=("id", "count"),
    ).reset_index()
    return out.sort_values(["course_name", "period"])


def sheet_heatmap(asistencia_mensual: pd.DataFrame) -> pd.DataFrame:
    if asistencia_mensual.empty:
        return pd.DataFrame()
    return asistencia_mensual.pivot_table(
        index="mes",
        columns="course_name",
        values="tasa_asistencia_pct",
        aggfunc="mean",
    ).reset_index()


def sheet_adopcion(
    alumnado_grupo: pd.DataFrame,
    sesiones: pd.DataFrame,
    tareas: pd.DataFrame,
    calificaciones: pd.DataFrame,
    comunicacion: pd.DataFrame,
) -> pd.DataFrame:
    if alumnado_grupo.empty:
        return pd.DataFrame(
            columns=[
                "course_name",
                "group_name",
                "score_asistencia",
                "score_tareas",
                "score_notas",
                "score_notificaciones",
                "indice_adopcion",
                "ranking",
            ]
        )

    base = alumnado_grupo[["course_name", "group_name"]].drop_duplicates().copy()

    # Asistencia por grupo
    if not sesiones.empty:
        att = (
            sesiones.groupby(["course_name", "group_name"])["cobertura_asistencia_pct"]
            .mean()
            .reset_index()
        )
        base = base.merge(att, on=["course_name", "group_name"], how="left")
        base["score_asistencia"] = base["cobertura_asistencia_pct"].fillna(0)
    else:
        base["score_asistencia"] = 0

    # Tareas: media tasa_entrega del ciclo aplicada por grupo (aproximación)
    if not tareas.empty:
        t_rate = tareas["tasa_entrega_pct"].mean()
        base["score_tareas"] = t_rate if pd.notna(t_rate) else 0
    else:
        base["score_tareas"] = 0

    if not calificaciones.empty:
        base["score_notas"] = min(100, 100 * calificaciones["notas_con_valor"].sum() / max(len(base), 1))
    else:
        base["score_notas"] = 0

    notif_pct = 0
    if not comunicacion.empty:
        n = comunicacion[comunicacion["bloque"] == "notificaciones"]
        if not n.empty and n["pct_lectura"].notna().any():
            notif_pct = n["pct_lectura"].dropna().mean()
    base["score_notificaciones"] = notif_pct or 0

    base["indice_adopcion"] = (
        base["score_asistencia"] * WEIGHTS["asistencia"]
        + base["score_tareas"] * WEIGHTS["tareas"]
        + base["score_notas"] * WEIGHTS["notas"]
        + base["score_notificaciones"] * WEIGHTS["notificaciones"]
    ).round(2)

    base = base.sort_values("indice_adopcion", ascending=False)
    base["ranking"] = range(1, len(base) + 1)
    return base[
        [
            "course_name",
            "group_name",
            "score_asistencia",
            "score_tareas",
            "score_notas",
            "score_notificaciones",
            "indice_adopcion",
            "ranking",
        ]
    ]


def sheet_anomalias(
    enrollments: pd.DataFrame,
    assignments: pd.DataFrame,
    assistances: pd.DataFrame,
    sessions: pd.DataFrame,
    tasks: pd.DataFrame,
    student_tasks: pd.DataFrame,
) -> pd.DataFrame:
    alerts = []
    now = pd.Timestamp.now(tz="UTC")

    if not enrollments.empty:
        enrolled = enrollments[enrollments["enrollment_status"] == "ENROLLED"]
        if not assistances.empty:
            with_att = set(assistances["course_name"].astype(str) + "|" + assistances["group_name"].astype(str))
        else:
            with_att = set()
        for (course, group), g in enrolled.groupby(["course_name", "group_name"]):
            key = f"{course}|{group}"
            if key not in with_att and len(g) > 0:
                alerts.append(
                    {
                        "severidad": "WARN",
                        "tipo": "matricula_sin_asistencia",
                        "detalle": f"{course} / {group}: {g['student_id'].nunique()} alumnos sin registros de asistencia",
                    }
                )
            cap = g["capacity"].iloc[0]
            alumnos = g["student_id"].nunique()
            if pd.notna(cap) and cap and alumnos > cap:
                alerts.append(
                    {
                        "severidad": "CRITICAL",
                        "tipo": "ocupacion_superada",
                        "detalle": f"{course} / {group}: {alumnos} alumnos > capacity {cap}",
                    }
                )

    if not sessions.empty:
        past = sessions[pd.to_datetime(sessions["date"], utc=True) < now]
        stuck = past[past["session_status"] == "SCHEDULED"]
        if len(stuck):
            alerts.append(
                {
                    "severidad": "WARN",
                    "tipo": "sesiones_pasadas_programadas",
                    "detalle": f"{len(stuck)} sesiones en el pasado siguen SCHEDULED",
                }
            )

    if not tasks.empty and not student_tasks.empty:
        past_due = tasks[pd.to_datetime(tasks["dueDate"], utc=True) < now]
        for tid in past_due["task_id"]:
            st = student_tasks[student_tasks["task_id"] == tid]
            delivered = st["status"].isin(["SUBMITTED", "LATE", "GRADED"]).sum()
            if delivered == 0 and len(st) > 0:
                t = past_due[past_due["task_id"] == tid].iloc[0]
                alerts.append(
                    {
                        "severidad": "INFO",
                        "tipo": "tarea_vencida_sin_entregas",
                        "detalle": f"Tarea {tid} ({t.get('title', '')}) vencida sin entregas",
                    }
                )

    if not assignments.empty:
        active = assignments[assignments["assignment_status"] == "ACTIVE"]
        active_ids = set(active["assignment_id"])
        if not sessions.empty:
            sess_assign = set(sessions["assignment_id"].dropna())
        else:
            sess_assign = set()
        for aid in active_ids - sess_assign:
            a = active[active["assignment_id"] == aid].iloc[0]
            alerts.append(
                {
                    "severidad": "INFO",
                    "tipo": "asignacion_sin_sesiones",
                    "detalle": f"Asignación {aid} ACTIVE sin sesiones ({a['course_name']}/{a['group_name']})",
                }
            )
        standby = assignments[assignments["assignment_status"] == "STANDBY"]
        if not standby.empty and (not sessions.empty or not tasks.empty):
            alerts.append(
                {
                    "severidad": "INFO",
                    "tipo": "profesor_standby_con_actividad",
                    "detalle": f"{len(standby)} asignaciones STANDBY en el año filtrado",
                }
            )

    return pd.DataFrame(alerts) if alerts else pd.DataFrame(columns=["severidad", "tipo", "detalle"])


def sheet_filtros(args: argparse.Namespace, sheets: dict[str, int]) -> pd.DataFrame:
    assignment_scope = (
        "todos los estados"
        if args.inactivos
        else f"operativos ({', '.join(OPERATIONAL_ASSIGNMENT_STATUSES)})"
    )
    rows = [
        {"clave": "generado_en", "valor": datetime.now(timezone.utc).isoformat()},
        {"clave": "anyo", "valor": args.anyo},
        {"clave": "ciclo", "valor": args.ciclo},
        {"clave": "grupo", "valor": args.grupo},
        {"clave": "inactivos", "valor": str(args.inactivos)},
        {"clave": "completo", "valor": str(args.completo)},
        {"clave": "asignaciones_incluidas", "valor": assignment_scope},
        {"clave": "pesos_adopcion", "valor": str(WEIGHTS)},
    ]
    for name, n in sheets.items():
        rows.append({"clave": f"filas_{name}", "valor": str(n)})
    return pd.DataFrame(rows)


def print_console_summary(resumen: pd.DataFrame, path: Path) -> None:
    print("\n=== Ziryab — Informe de uso ===\n")
    if resumen.empty:
        print("(sin datos para los filtros aplicados)")
    else:
        for _, r in resumen.head(15).iterrows():
            print(f"  {r['metrica']}: {r['valor']}" + (f"  ({r['nota']})" if r.get("nota") else ""))
    print(f"\nExcel generado: {path.resolve()}\n")


def export_workbook(path: Path, sheets: dict[str, pd.DataFrame]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        for name, df in sheets.items():
            safe = name[:31]  # límite Excel
            df.to_excel(writer, sheet_name=safe, index=False)


def print_load_summary(counts: dict[str, int], args: argparse.Namespace) -> None:
    print("Filas cargadas desde PostgreSQL:")
    for name, n in counts.items():
        print(f"  {name}: {n}")
    if counts.get("matriculas", 0) == 0:
        print(
            f"\nAVISO: no hay matrículas para el año {args.anyo!r}. "
            "Comprueba --anyo o ejecuta npm run seed.",
            file=sys.stderr,
        )


def main() -> None:
    args = parse_args()
    enrollment_extra, assignment_extra, params, dim_sql = dim_filters(args)

    engine = create_engine(load_database_url())

    print("Cargando datos desde PostgreSQL...")
    enrollments = fetch_enrollments(engine, enrollment_extra, dim_sql, params)
    assignments = fetch_assignments(engine, assignment_extra, dim_sql, params)
    assistances = fetch_assistances(engine, enrollment_extra, dim_sql, params)
    sessions = fetch_sessions(engine, assignment_extra, dim_sql, params)
    tasks = fetch_tasks(engine, assignment_extra, dim_sql, params)
    student_tasks = fetch_student_tasks(engine, enrollment_extra, dim_sql, params)
    grades = fetch_grades(engine, enrollment_extra, dim_sql, params)
    notifications = fetch_notifications(engine)
    issues = fetch_issues(engine)
    announcements = fetch_announcements(engine)
    users = fetch_users_count(engine)

    print_load_summary(
        {
            "matriculas": len(enrollments),
            "asignaciones_docentes": len(assignments),
            "asistencias": len(assistances),
            "sesiones": len(sessions),
            "tareas": len(tasks),
            "entregas_alumnado": len(student_tasks),
            "calificaciones": len(grades),
            "notificaciones": len(notifications),
            "incidencias": len(issues),
            "anuncios": len(announcements),
        },
        args,
    )

    if len(enrollments) == 0:
        available = fetch_available_school_years(engine)
        if not available.empty:
            print("\nAños académicos con matrículas en la BD:", file=sys.stderr)
            for _, row in available.iterrows():
                print(f"  - {row['anyo']}: {row['matriculas']} matrículas", file=sys.stderr)

    resumen = sheet_resumen(
        enrollments,
        assignments,
        assistances,
        sessions,
        tasks,
        student_tasks,
        notifications,
        issues,
        users,
    )
    alumnado_ciclo = sheet_alumnado_ciclo(enrollments)
    alumnado_grupo = sheet_alumnado_grupo(enrollments)
    profesorado = sheet_profesorado(assignments)
    asistencia_mensual = sheet_asistencia_mensual(assistances)
    sesiones = sheet_sesiones(sessions, assistances)
    tareas = sheet_tareas(tasks, student_tasks)
    justificantes = sheet_justificantes(assistances)
    comunicacion = sheet_comunicacion(notifications, issues, announcements)
    calificaciones = sheet_calificaciones(grades)
    heatmap = sheet_heatmap(asistencia_mensual)
    adopcion = sheet_adopcion(alumnado_grupo, sesiones, tareas, calificaciones, comunicacion)
    anomalias = sheet_anomalias(enrollments, assignments, assistances, sessions, tasks, student_tasks)

    scope = "completo" if args.completo else "filtrado"
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = Path(args.output)
    filename = out_dir / f"ziryab_uso_{args.anyo}_{scope}_{ts}.xlsx"

    sheets = {
        "Filtros_aplicados": sheet_filtros(
            args,
            {
                "Resumen": len(resumen),
                "Alumnado_ciclo": len(alumnado_ciclo),
                "Alumnado_grupo": len(alumnado_grupo),
            },
        ),
        "Resumen": resumen,
        "Alumnado_ciclo": alumnado_ciclo,
        "Alumnado_grupo": alumnado_grupo,
        "Profesorado": profesorado,
        "Asistencia_mensual": asistencia_mensual,
        "Sesiones": sesiones,
        "Tareas": tareas,
        "Justificantes": justificantes,
        "Comunicacion": comunicacion,
        "Calificaciones": calificaciones,
        "Heatmap_mes_ciclo": heatmap,
        "Adopcion_modulos": adopcion,
        "Anomalias": anomalias,
    }

    export_workbook(filename, sheets)
    print_console_summary(resumen, filename)


if __name__ == "__main__":
    main()
