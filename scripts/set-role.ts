import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.argv[2];
  const role = process.argv[3]?.toUpperCase();

  if (!email || !role || !["USER", "ADMIN"].includes(role)) {
    console.error("Usage: npx tsx scripts/set-role.ts user@example.com [USER|ADMIN]");
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    console.log("Current Users:");
    users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.error(`User with email "${email}" not found.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role },
    select: { email: true, role: true },
  });

  console.log(`Successfully updated ${updated.email} role to ${updated.role}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
