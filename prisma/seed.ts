import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  // Create Cutting Supervisor
  await prisma.user.upsert({
    where: {
      email: "cutting.supervisor@apparelflow.local",
    },
    update: {},
    create: {
      email: "cutting.supervisor@apparelflow.local",
      passwordHash: password,
      fullName: "Cutting Supervisor",
      role: Role.CUTTING_SUPERVISOR,
    },
  });

  // Create Cutting Verifier
  await prisma.user.upsert({
    where: {
      email: "cutting.verifier@apparelflow.local",
    },
    update: {},
    create: {
      email: "cutting.verifier@apparelflow.local",
      passwordHash: password,
      fullName: "Cutting Verifier",
      role: Role.CUTTING_VERIFIER,
    },
  });

  // Create Sewing Supervisor
  await prisma.user.upsert({
    where: {
      email: "sewing.supervisor@apparelflow.local",
    },
    update: {},
    create: {
      email: "sewing.supervisor@apparelflow.local",
      passwordHash: password,
      fullName: "Sewing Supervisor",
      role: Role.SEWING_SUPERVISOR,
    },
  });

  // Create sample recipe
  const recipe = await prisma.recipe.upsert({
    where: {
      recipeCode: "SHIRT-001",
    },
    update: {},
    create: {
      recipeCode: "SHIRT-001",
      name: "Basic Shirt",
      category: "Shirt",
      stdFabricYards: 1.5,
      wastageCap: 8,

      components: {
        create: [
          {
            componentName: "Front Panel",
            piecesPerGarment: 1,
          },
          {
            componentName: "Back Panel",
            piecesPerGarment: 1,
          },
          {
            componentName: "Sleeve",
            piecesPerGarment: 2,
          },
          {
            componentName: "Collar",
            piecesPerGarment: 1,
          },
        ],
      },
    },
  });

  console.log("Sample recipe created:", recipe.recipeCode);
  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });