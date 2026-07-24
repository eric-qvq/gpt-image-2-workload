import { seedDefaultAdmin } from "../src/server/auth/admin-seed";
import { prisma } from "../src/server/db/client";

async function main() {
  const user = await seedDefaultAdmin();

  console.log(`Seeded admin user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
