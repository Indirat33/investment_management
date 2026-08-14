import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run make-admin -- user@example.com");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const users = await prisma.user.findMany({ select: { email: true, role: true } });

    console.error(`No user found with email "${email}".`);
    console.error(
      users.length === 0
        ? "There are no registered users yet. Sign up at /register first."
        : `Registered emails:\n${users.map((user) => `  - ${user.email} (${user.role})`).join("\n")}`
    );
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { email: true, role: true },
  });

  console.log(`${user.email} is now ${user.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
