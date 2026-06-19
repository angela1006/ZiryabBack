import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';
import { AuthService } from '../modules/auth/auth.service.js';

describe('Auth Endpoints', () => {
  const firebaseToken = 'firebase-token-mock';
  const firebaseUID = `uid_${Date.now()}`;
  const registerPayload = {
    token: firebaseToken,
    email: `test${Date.now()}@example.com`,
    name: 'Test',
    surname: 'User',
    birthDate: '2000-01-01',
    dni: `DNI${Date.now()}`.slice(0, 9),
    role: 'STUDENT',
  };

  beforeAll(() => {
    jest.spyOn(AuthService, 'verifyFirebaseToken').mockResolvedValue(firebaseUID);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.email).toBe(registerPayload.email);
      expect(res.body.data.name).toBe(registerPayload.name);
    });

    it('debe fallar con campos obligatorios ausentes', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incompleto@example.com' });

      expect(res.status).toBe(400);
    });

    it('debe fallar con email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...registerPayload, email: 'invalid-email', dni: `X${Date.now()}`.slice(0, 9) });

      expect(res.status).toBe(400);
    });

    it('debe fallar con rol inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...registerPayload, role: 'INVALID_ROLE', dni: `Y${Date.now()}`.slice(0, 9) });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe hacer login correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ token: firebaseToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.firebaseUID).toBe(firebaseUID);
    });

    it('debe fallar si no se envía token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});

