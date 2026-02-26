import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function main(): Promise<void> {
  // Bootstrap initial manager account for first-time deployment.
  // Safe to re-run: if a manager already exists, it will do nothing.
  const email = requiredEnv('INITIAL_MANAGER_EMAIL').toLowerCase();
  const password = requiredEnv('INITIAL_MANAGER_PASSWORD');
  const name = requiredEnv('INITIAL_MANAGER_NAME');
  const branchName = requiredEnv('INITIAL_BRANCH_NAME');

  const existingManager = await prisma.user.findFirst({ where: { role: 'manager' } });
  if (existingManager) {
    // Do not mutate existing production data.
    console.log('Seed: manager already exists — skipping bootstrap.');
    return;
  }

  const branch =
    (await prisma.branch.findFirst({ where: { name: branchName } })) ??
    (await prisma.branch.create({
      data: { name: branchName },
    }));

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'manager',
      branchId: branch.id,
      isActive: true,
    },
  });

  console.log(`Seed: created initial manager ${email} for branch "${branch.name}".`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

