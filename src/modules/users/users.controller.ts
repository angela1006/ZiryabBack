import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service.js';
import * as usersService from './users.service.js';
import { firebaseAuth } from '../../config/firebase.config.js';
import { cookieAuthOptions } from '../../utils/cookie-options.js';

const getRequester = (req: Request) => ({
  id: req.user?.sub,
  role: req.user?.role,
});

export const getUsers = async (_req: Request, res: Response) => {
  const users = await usersService.findAllUsers();
  return res.status(200).json(users);
};

export const getMe = async (req: Request, res: Response) => {
  const requester = getRequester(req);
  if (!requester.id || !requester.role) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const user = await usersService.findCurrentUser(requester.id, requester.role);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  return res.status(200).json(user);
};

export const updateMe = async (req: Request, res: Response) => {
  const requester = getRequester(req);
  if (!requester.id || !requester.role) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const current = await usersService.findCurrentUser(requester.id, requester.role);
  if (!current) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const { name, email } = req.body as { name?: string; email?: string };
  if (email !== undefined && !email.includes('@')) {
    return res.status(400).json({ message: 'Email inválido' });
  }

  const emailChanged = email !== undefined && email.trim() !== current.email;

  if (emailChanged && email !== undefined) {
    try {
      await firebaseAuth.updateUser(current.firebaseUID, { email: email.trim() });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-exists') {
        return res.status(409).json({ message: 'El email ya está en uso' });
      }
      if (code === 'auth/invalid-email') {
        return res.status(400).json({ message: 'Email inválido' });
      }
      return res.status(400).json({
        message: 'No se pudo actualizar el email en Firebase',
      });
    }
  }

  const user = await usersService.updateCurrentUser(requester.id, requester.role, { name, email });
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  let newToken: string | undefined;
  if (emailChanged) {
    newToken = AuthService.generateJWT({
      sub: user.id,
      email: user.email,
      firebaseUID: user.firebaseUID,
      role: user.role,
    });
    res.cookie('auth_token', newToken, cookieAuthOptions);
  }

  return res.status(200).json({
    message: 'Perfil actualizado',
    data: user,
    ...(newToken ? { token: newToken } : {}),
  });
};

export const updateMyPassword = async (req: Request, res: Response) => {
  const requester = getRequester(req);
  if (!requester.id || !requester.role) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword y newPassword son requeridos' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  const user = await usersService.findCurrentUser(requester.id, requester.role);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const passwordOk = await AuthService.verifyEmailPassword(user.email, currentPassword);
  if (!passwordOk) {
    return res.status(400).json({ message: 'Contraseña actual incorrecta' });
  }

  try {
    await firebaseAuth.updateUser(user.firebaseUID, { password: newPassword });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'auth/weak-password') {
      return res.status(400).json({ message: 'La contraseña es demasiado débil' });
    }
    return res.status(400).json({ message: 'No se pudo actualizar la contraseña' });
  }

  return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const user = await usersService.findUserById(id);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  return res.status(200).json(user);
};
