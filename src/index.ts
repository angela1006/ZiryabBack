// ✅ PRIMERO - Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

// Después los demás imports
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './config/prisma.js';

logger.debug(`Cargando .env desde: ${envPath}`);

prisma.$connect()
  .then(() => {
    logger.info('✅ Conectado a la base de datos');
    
    // 0.0.0.0: acepta conexiones desde red local (teléfonos/emulador), no sólo localhost
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 API escuchando en http://0.0.0.0:${env.PORT} (LAN incluida)`);
      logger.info(`📚 Entorno: ${env.NODE_ENV}`);
      logger.info(`📖 Documentación: http://localhost:${env.PORT}/api-docs`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM recibido, cerrando servidor...');
      await prisma.$disconnect();
      server.close(() => {
        logger.info('Servidor cerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT recibido, cerrando servidor...');
      await prisma.$disconnect();
      server.close(() => {
        logger.info('Servidor cerrado');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    logger.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  });
