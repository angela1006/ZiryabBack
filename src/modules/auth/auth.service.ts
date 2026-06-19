import https from 'https';
import { prisma } from '../../config/db.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { firebaseAuth } from '../../config/firebase.config.js';
import { logger } from '../../utils/logger.js';

// ============================================
// INTERFACES
// ============================================

export interface RegisterPayload {
  firebaseUID: string;
  email: string;
  name: string;
  surname: string;
  ndSurname?: string;
  birthDate: string;
  dni: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface UserPayload {
  sub: number;
  email: string;
  firebaseUID: string;
  role: string;
}

export interface UserWithToken {
  id: number;
  email: string;
  name: string;
  role: string;
  firebaseUID: string;
  token: string;
}

// ============================================
// TIPOS INTERNOS
// ============================================

type User = {
  id: number;
  email: string;
  name: string;
  surname: string;
  ndSurname: string | null;
  birthDate: Date;
  dni: string | null;
  role: string;
  firebaseUID: string;
  createdAt: Date;
};

const legacyTestPasswords = new Map<string, string>();

// ============================================
// SERVICIO
// ============================================

export class AuthService {
  /**
   * Verifica el token de Firebase y obtiene el UID
   */
  static async verifyFirebaseToken(token: string): Promise<string> {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      throw new Error(`Token de Firebase inválido: ${(error as Error).message}`);
    }
  }

  /**
   * Registra un usuario en la BD Local después de Firebase
   */
  static async registerUser(payload: RegisterPayload): Promise<UserWithToken> {
    const {
      firebaseUID,
      email,
      name,
      surname,
      ndSurname,
      birthDate,
      dni,
      role,
    } = payload;

    // Validar que el rol sea válido
    if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
      throw new Error('Rol inválido. Debe ser: STUDENT, TEACHER o ADMIN');
    }

    // Verifica si el usuario ya existe
    const existingUser = await this.findUserByFirebaseUID(firebaseUID);
    if (existingUser) {
      throw new Error('Usuario ya registrado en la BD local');
    }

    // Crea usuario según su rol
    let user: User;

    if (role === 'STUDENT') {
      user = await prisma.student.create({
        data: {
          firebaseUID,
          email,
          name,
          surname,
          ndSurname: ndSurname || null,
          birthDate: new Date(birthDate),
          dni,
          role: 'STUDENT',
        },
      });
    } else if (role === 'TEACHER') {
      user = await prisma.teacher.create({
        data: {
          firebaseUID,
          email,
          name,
          surname,
          ndSurname: ndSurname || null,
          birthDate: new Date(birthDate),
          dni,
          role: 'TEACHER',
        },
      });
    } else {
      // role === 'ADMIN' (ya validado arriba)
      user = await prisma.admin.create({
        data: {
          firebaseUID,
          email,
          name,
          surname,
          ndSurname: ndSurname || null,
          birthDate: new Date(birthDate),
          dni,
          role: 'ADMIN',
        },
      });
    }

    // Genera JWT local
    const jwtToken = this.generateJWT({
      sub: user.id,
      email: user.email,
      firebaseUID: user.firebaseUID,
      role: user.role,
    });

    // ✅ Retorno tipado
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUID: user.firebaseUID,
      token: jwtToken,
    };
  }

  /**
   * Busca un usuario por firebaseUID en cualquiera de las 3 tablas
   */
  static async findUserByFirebaseUID(firebaseUID: string): Promise<User | null> {
    // Buscar en Student
    const student = await prisma.student.findUnique({
      where: { firebaseUID },
    });
    if (student) return student;

    // Buscar en Teacher
    const teacher = await prisma.teacher.findUnique({
      where: { firebaseUID },
    });
    if (teacher) return teacher;

    // Buscar en Admin
    const admin = await prisma.admin.findUnique({
      where: { firebaseUID },
    });
    if (admin) return admin;

    return null;
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const student = await prisma.student.findUnique({ where: { email } });
    if (student) return student;

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (teacher) return teacher;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) return admin;

    return null;
  }

  /**
   * Login: obtiene usuario existente por firebaseUID
   */
  static async loginUser(firebaseUID: string): Promise<UserWithToken> {
    const user = await this.findUserByFirebaseUID(firebaseUID);

    if (!user) {
      throw new Error('Usuario no encontrado en BD local');
    }

    const jwtToken = this.generateJWT({
      sub: user.id,
      email: user.email,
      firebaseUID: user.firebaseUID,
      role: user.role,
    });

    // ✅ Retorno tipado
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUID: user.firebaseUID,
      token: jwtToken,
    };
  }

  static async loginByEmail(email: string): Promise<UserWithToken> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const jwtToken = this.generateJWT({
      sub: user.id,
      email: user.email,
      firebaseUID: user.firebaseUID,
      role: user.role,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUID: user.firebaseUID,
      token: jwtToken,
    };
  }

  /** Solo para login/register en tests Jest (NODE_ENV=test). */
  static setLegacyTestPassword(email: string, password: string) {
    legacyTestPasswords.set(email, password);
  }

  /** Solo para login/register en tests Jest (NODE_ENV=test). */
  static validateLegacyTestPassword(email: string, password: string): boolean {
    return legacyTestPasswords.get(email) === password;
  }

  /**
   * Comprueba email+contraseña contra Firebase Authentication (REST Identity Toolkit).
   * Usa https.request (no fetch) para respetar rejectUnauthorized en desarrollo
   * (mismo criterio que firebase.config.ts en redes con proxy/antivirus).
   */
  static async verifyEmailPassword(email: string, password: string): Promise<boolean> {
    if (env.NODE_ENV === 'test') {
      return AuthService.validateLegacyTestPassword(email, password);
    }

    const body = JSON.stringify({ email, password, returnSecureToken: false });
    const path = `/v1/accounts:signInWithPassword?key=${env.FIREBASE_WEB_API_KEY}`;

    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: 'identitytoolkit.googleapis.com',
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          rejectUnauthorized: env.NODE_ENV !== 'development',
        },
        (res) => {
          res.resume();
          resolve(res.statusCode === 200);
        },
      );

      req.on('error', (err) => {
        logger.error('verifyEmailPassword: fallo al contactar Firebase Identity Toolkit', err);
        resolve(false);
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Genera JWT con los datos del usuario
   * ✅ CORREGIDO: opciones tipadas correctamente
   */
  static generateJWT(payload: UserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY,
    } as jwt.SignOptions); // ← Agrega type casting
  }

  /**
   * Obtiene usuario por ID de BD local según su rol
   */
  static async getUserById(
    id: number,
    role: string
  ): Promise<{
    id: number;
    email: string;
    name: string;
    surname: string;
    role: string;
    firebaseUID: string;
  } | null> {
    if (role === 'STUDENT') {
      return await prisma.student.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          firebaseUID: true,
        },
      });
    } else if (role === 'TEACHER') {
      return await prisma.teacher.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          firebaseUID: true,
        },
      });
    } else if (role === 'ADMIN') {
      return await prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          firebaseUID: true,
        },
      });
    }

    return null;
  }
}
