# 🔄 Guía para Migrar tu Base de Datos con Prisma

## Opción 1: Reset completo (RECOMENDADO para desarrollo local)

Si estás en **desarrollo local** y no te importa perder los datos actuales:

### Paso 1: Hacer backup (por si acaso)
```bash
# Opcional pero recomendado
pg_dump -U tu_usuario -d nombre_bd > backup_antes_migracion.sql
```

### Paso 2: Reset de Prisma
```bash
# Esto BORRA TODA la base de datos y crea el nuevo esquema
npx prisma migrate reset
```

Este comando:
- ✅ Borra todas las tablas existentes
- ✅ Crea las nuevas tablas según tu nuevo schema.prisma
- ✅ Ejecuta los seeds si los tienes configurados

### Paso 3: Aplicar la migración inicial
```bash
# Crea la primera migración con el nuevo esquema
npx prisma migrate dev --name init_v2_schema
```

### Paso 4: Generar el cliente de Prisma
```bash
npx prisma generate
```

---

## Opción 2: Migración progresiva (si tienes datos que conservar)

Si ya tienes **datos en producción o importante en desarrollo**:

### Paso 1: Crear una migración manual
```bash
# Crea un archivo de migración vacío
npx prisma migrate dev --create-only --name update_to_v2
```

### Paso 2: Editar el archivo SQL generado

Prisma creará un archivo en `prisma/migrations/XXXXXXX_update_to_v2/migration.sql`

Deberás editarlo manualmente para:

1. **Añadir nuevas columnas con valores por defecto:**
```sql
-- Añadir isActive a Student
ALTER TABLE "Student" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "Student" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Añadir isActive a Teacher
ALTER TABLE "Teacher" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "Teacher" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Añadir grade a Subject
ALTER TABLE "Subject" ADD COLUMN "grade" VARCHAR(10) DEFAULT '1';
ALTER TABLE "Subject" ADD COLUMN "code" VARCHAR(50);
ALTER TABLE "Subject" ADD COLUMN "hours" INTEGER;
ALTER TABLE "Subject" ADD COLUMN "description" TEXT;

-- Y así sucesivamente...
```

2. **Renombrar tabla TeacherOnSubject → TeacherOnSubjectOnGroup:**
```sql
-- Primero añade la columna idGroup
ALTER TABLE "TeacherOnSubject" ADD COLUMN "idGroup" INTEGER;

-- Aquí necesitarás asignar un grupo por defecto a los registros existentes
-- Por ejemplo, si tienes un grupo "General" con id=1:
UPDATE "TeacherOnSubject" SET "idGroup" = 1;

-- Hacer la columna NOT NULL
ALTER TABLE "TeacherOnSubject" ALTER COLUMN "idGroup" SET NOT NULL;

-- Añadir la foreign key
ALTER TABLE "TeacherOnSubject" 
  ADD CONSTRAINT "TeacherOnSubject_idGroup_fkey" 
  FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE CASCADE;

-- Renombrar la tabla
ALTER TABLE "TeacherOnSubject" RENAME TO "TeacherOnSubjectOnGroup";

-- Recrear el constraint único
ALTER TABLE "TeacherOnSubjectOnGroup" DROP CONSTRAINT IF EXISTS "TeacherOnSubject_pkey";
ALTER TABLE "TeacherOnSubjectOnGroup" 
  ADD CONSTRAINT "TeacherOnSubjectOnGroup_unique" 
  UNIQUE ("idTeacher", "idSubject", "idGroup", "schoolYear");
```

3. **Crear índices:**
```sql
CREATE INDEX "Subject_idCourse_grade_idx" ON "Subject"("idCourse", "grade");
CREATE INDEX "Group_isActive_idx" ON "Group"("isActive");
-- etc...
```

### Paso 3: Aplicar la migración
```bash
npx prisma migrate dev
```

### Paso 4: Generar cliente
```bash
npx prisma generate
```

---

## ⚠️ Problemas comunes y soluciones

### Error: "Column already exists"
```bash
# Si algo falla, puedes volver atrás
npx prisma migrate resolve --rolled-back NOMBRE_MIGRACION
```

### Error: "Foreign key constraint"
Asegúrate de que todos los `idGroup` existan en la tabla Group antes de crear foreign keys.

### Verificar el estado de migraciones
```bash
npx prisma migrate status
```

---

## 🎯 Recomendación

**Para desarrollo local**: Usa **Opción 1** (reset completo)
- Más rápido
- Menos errores
- Esquema limpio desde cero

**Para producción con datos**: Usa **Opción 2** (migración progresiva)
- Conserva datos
- Requiere más cuidado
- Necesita testing exhaustivo

---

## 📝 Checklist final

Después de migrar, verifica:

- [ ] Todas las tablas existen: `npx prisma studio`
- [ ] Las relaciones funcionan
- [ ] Puedes crear registros de prueba
- [ ] El cliente de Prisma tiene los nuevos campos (autocompletado en tu IDE)
- [ ] Tus seeders funcionan (si los tienes)

---

## 🆘 Si algo sale mal

```bash
# Ver estado de migraciones
npx prisma migrate status

# Marcar una migración como aplicada manualmente
npx prisma migrate resolve --applied NOMBRE_MIGRACION

# Marcar como revertida
npx prisma migrate resolve --rolled-back NOMBRE_MIGRACION

# Último recurso: Reset total
npx prisma migrate reset
```