import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { encryptCredential } from '../../src/utils/credential-crypto.js';

dotenv.config();

const VERSION_PREFIX = 'v1:';
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.studentPassword.findMany({
    select: { id: true, password: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.password.startsWith(VERSION_PREFIX)) {
      skipped++;
      continue;
    }

    await prisma.studentPassword.update({
      where: { id: row.id },
      data: { password: encryptCredential(row.password) },
    });
    updated++;
  }

  console.log(
    `StudentPassword: ${updated} cifradas, ${skipped} ya cifradas (v1:), ${rows.length} total`,
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error cifrando contraseñas:', message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
