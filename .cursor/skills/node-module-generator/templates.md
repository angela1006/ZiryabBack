# Templates — node-module-generator

Placeholders: `{recurso}` (kebab singular), `{Recurso}` (PascalCase), `{recursos}`
(kebab plural), `{Modelo}` (nombre del modelo Prisma), `{CURSO-XX}`.

## `{recurso}.routes.ts`

```typescript
import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as {recurso}Controller from './{recurso}.controller.js';
import { create{Recurso}Schema, update{Recurso}Schema } from './{recurso}.schema.js';

const router = Router();

/**
 * @swagger
 * /api/{recursos}:
 *   get:
 *     summary: Lista {recursos}
 *     tags: [{Recurso}]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', auth, {recurso}Controller.getAll);

router.get('/:id', auth, {recurso}Controller.getById);

router.post('/', auth, validate(create{Recurso}Schema), {recurso}Controller.create);

router.patch('/:id', auth, validate(update{Recurso}Schema), {recurso}Controller.update);

router.delete('/:id', auth, {recurso}Controller.remove);

export default router;
```

## `{recurso}.controller.ts`

```typescript
import type { Request, Response } from 'express';
import * as {recurso}Service from './{recurso}.service.js';

export const getAll = async (_req: Request, res: Response) => {
  const items = await {recurso}Service.findAll();
  return res.status(200).json({ message: 'OK', data: items });
};

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const item = await {recurso}Service.findById(id);
  if (!item) {
    return res.status(404).json({ message: '{Recurso} no encontrado' });
  }

  return res.status(200).json({ message: 'OK', data: item });
};

export const create = async (req: Request, res: Response) => {
  const item = await {recurso}Service.create(req.body);
  return res.status(201).json({ message: '{Recurso} creado', data: item });
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const item = await {recurso}Service.update(id, req.body);
  return res.status(200).json({ message: '{Recurso} actualizado', data: item });
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  await {recurso}Service.remove(id);
  return res.status(204).send();
};
```

## `{recurso}.service.ts`

```typescript
import prisma from '../../config/prisma.js';
import type { Create{Recurso}Input, Update{Recurso}Input } from './{recurso}.schema.js';

export const findAll = async () => {
  return prisma.{Modelo}.findMany();
};

export const findById = async (id: number) => {
  return prisma.{Modelo}.findUnique({ where: { id } });
};

export const create = async (data: Create{Recurso}Input) => {
  return prisma.{Modelo}.create({ data });
};

export const update = async (id: number, data: Update{Recurso}Input) => {
  return prisma.{Modelo}.update({ where: { id }, data });
};

export const remove = async (id: number) => {
  return prisma.{Modelo}.delete({ where: { id } });
};
```

## `{recurso}.schema.ts`

```typescript
import { z } from 'zod';

export const create{Recurso}Schema = z.object({
  // name: z.string().min(1),
});

export const update{Recurso}Schema = create{Recurso}Schema.partial();

export type Create{Recurso}Input = z.infer<typeof create{Recurso}Schema>;
export type Update{Recurso}Input = z.infer<typeof update{Recurso}Schema>;
```

## Registro en `src/app.ts`

```typescript
import {recurso}Routes from './modules/{recurso}/{recurso}.routes.js';
// ...
app.use('/api/{recursos}', {recurso}Routes);
```

## Test mínimo (`src/tests/{recurso}.test.ts`)

```typescript
import request from 'supertest';
import app from '../app.js';

describe('{Recurso} endpoints', () => {
  it('GET /api/{recursos} responde 401 sin auth', async () => {
    const res = await request(app).get('/api/{recursos}');
    expect(res.status).toBe(401);
  });
});
```

## Añadir al `schema.prisma` (si el modelo no existe)

```prisma
model {Modelo} {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ...campos del dominio
}
```

Luego:

```bash
npx prisma migrate dev --name add-{recurso}-model
npx prisma generate
```
