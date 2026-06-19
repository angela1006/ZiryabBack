import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';
import { AuthService } from '../modules/auth/auth.service.js';

describe('Auth Me Endpoint', () => {
  let bearerToken: string;
  const firebaseUID = `uid_me_${Date.now()}`;
  const registerPayload = {
    token: 'firebase-token-me-mock',
    email: `testuser${Date.now()}@example.com`,
    name: 'Test',
    surname: 'User',
    birthDate: '2001-01-01',
    dni: `M${Date.now()}`.slice(0, 9),
    role: 'STUDENT',
  };

  beforeAll(async () => {
    jest.spyOn(AuthService, 'verifyFirebaseToken').mockResolvedValue(firebaseUID);

    await request(app)
      .post('/api/auth/register')
      .send(registerPayload);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ token: 'firebase-token-me-mock' });

    bearerToken = loginRes.headers['set-cookie']?.[0]?.includes('auth_token=')
      ? loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1]
      : '';
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('debe obtener perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.email).toBe(registerPayload.email);
      expect(res.body.data.name).toBe(registerPayload.name);
    });

    it('debe fallar sin autenticación', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('No autorizado');
    });
  });
});

