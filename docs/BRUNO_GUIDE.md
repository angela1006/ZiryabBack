# Guía de uso con Bruno

Esta guía te explica cómo obtener y usar el Bearer Token para hacer peticiones autenticadas desde Bruno.

## 📋 Requisitos previos

- Servidor corriendo en `http://localhost:3000` (o el puerto configurado en tu `.env`)
- Un usuario registrado en la base de datos (o usar el endpoint de registro)

---

## 🔑 Paso 1: Obtener el Bearer Token

### Opción A: Login (si ya tienes un usuario)

**Petición en Bruno:**

```
POST http://localhost:3000/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "tu_email@ejemplo.com",
  "password": "tu_contraseña"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "email": "tu_email@ejemplo.com",
    "name": "Tu Nombre",
    "createdAt": "2025-11-04T11:34:54.797Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYzNjAzNDQ5NCwiZXhwIjoxNjM2NjM5Mjk0fQ..."
}
```

**⚠️ Copia el valor de `token`** - lo necesitarás para las siguientes peticiones.

---

### Opción B: Registro (si no tienes usuario)

**Petición en Bruno:**

```
POST http://localhost:3000/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "nuevo_usuario@ejemplo.com",
  "name": "Nombre del Usuario",
  "password": "contraseña_segura_minimo_8_caracteres"
}
```

**Respuesta exitosa (201):**
```json
{
  "user": {
    "id": 1,
    "email": "nuevo_usuario@ejemplo.com",
    "name": "Nombre del Usuario",
    "createdAt": "2025-11-04T11:34:54.797Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

El registro también devuelve un token que puedes usar directamente.

---

## 🔒 Paso 2: Usar el Token en peticiones autenticadas

Una vez que tengas el token, úsalo en el header `Authorization` de todas las peticiones que requieran autenticación.

### Formato del header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante:** 
- El formato debe ser exactamente `Bearer ` (con espacio) seguido del token
- No incluyas comillas alrededor del token

---

## 📝 Ejemplos de peticiones autenticadas

### 1. Obtener perfil del usuario autenticado

```
GET http://localhost:3000/api/users/me
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

---

### 2. Actualizar perfil

```
PATCH http://localhost:3000/api/users/me
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo_email@ejemplo.com"
}
```

---

### 3. Cambiar contraseña

```
PATCH http://localhost:3000/api/users/me/password
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña_segura"
}
```

---

### 4. Listar todos los usuarios

```
GET http://localhost:3000/api/users
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

### 5. Obtener usuario por ID

```
GET http://localhost:3000/api/users/1
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

### 6. Actualizar usuario por ID

```
PATCH http://localhost:3000/api/users/1
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Nombre Actualizado",
  "email": "email_actualizado@ejemplo.com"
}
```

---

### 7. Eliminar usuario

```
DELETE http://localhost:3000/api/users/1
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

## ⚠️ Errores comunes

### Error 401: "No autorizado"

**Causa:** No has incluido el header `Authorization` o el formato es incorrecto.

**Solución:**
- Verifica que el header sea exactamente: `Authorization: Bearer TU_TOKEN`
- Asegúrate de que hay un espacio entre `Bearer` y el token
- Verifica que el token no haya expirado (los tokens expiran en 7 días)

---

### Error 401: "Token inválido"

**Causa:** El token es inválido o ha expirado.

**Solución:**
- Obtén un nuevo token haciendo login nuevamente
- Verifica que estés copiando el token completo (son strings largos)

---

### Error 400: "Credenciales inválidas"

**Causa:** El email o contraseña son incorrectos en el login.

**Solución:**
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el usuario exista en la base de datos

---

## 💡 Tips para Bruno

1. **Variables de entorno:** Puedes crear una variable en Bruno para el token y reutilizarla en todas las peticiones:
   - Crea una variable `token` con el valor de tu token
   - Usa `{{token}}` en el header: `Authorization: Bearer {{token}}`

2. **Guardar token automáticamente:** Algunas versiones de Bruno permiten guardar el token de la respuesta del login automáticamente usando scripts.

3. **Colección organizada:** Crea carpetas en Bruno:
   - `Auth` - Para login y registro
   - `Users` - Para todas las peticiones de usuarios

---

## 🔄 Flujo completo recomendado

1. **Primero:** Haz un `POST /api/auth/login` o `POST /api/auth/register`
2. **Copia el token** de la respuesta
3. **Usa el token** en el header `Authorization: Bearer ...` de todas las peticiones protegidas
4. **Si el token expira** (después de 7 días), vuelve a hacer login para obtener uno nuevo

---

## 📚 Endpoints disponibles

### Sin autenticación:
- `GET /health` - Health check
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Con autenticación (requieren Bearer Token):
- `GET /api/users` - Listar usuarios
- `GET /api/users/me` - Perfil del usuario autenticado
- `GET /api/users/:id` - Obtener usuario por ID
- `PATCH /api/users/me` - Actualizar perfil propio
- `PATCH /api/users/me/password` - Cambiar contraseña
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

---

¿Necesitas ayuda? Revisa los logs del servidor o consulta `docs/API_EXAMPLES.md` para más ejemplos.

