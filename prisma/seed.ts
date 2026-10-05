import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  // Create demo users
  await prisma.user.upsert({
    where: { email: "cutting.supervisor@apparelflow.local" },
    update: {},
    create: {
      email: "cutting.supervisor@apparelflow.local",
      passwordHash: password,
      fullName: "Cutting Supervisor",
      role: Role.CUTTING_SUPERVISOR,
    },
  });

  await prisma.user.upsert({
    where: { email: "cutting.verifier@apparelflow.local" },
    update: {},
    create: {
      email: "cutting.verifier@apparelflow.local",
      passwordHash: password,
      fullName: "Cutting Verifier",
      role: Role.CUTTING_VERIFIER,
    },
  });

  await prisma.user.upsert({
    where: { email: "sewing.supervisor@apparelflow.local" },
    update: {},
    create: {
      email: "sewing.supervisor@apparelflow.local",
      passwordHash: password,
      fullName: "Sewing Supervisor",
      role: Role.SEWING_SUPERVISOR,
    },
  });

  // Casual Blouse
  await prisma.recipe.upsert({
    where: { recipeCode: "REC-BL01" },
    update: {
      name: "Casual Blouse",
      category: "Blouse",
      stdFabricYards: 1.8,
      wastageCap: 5.0,
    },
    create: {
      recipeCode: "REC-BL01",
      name: "Casual Blouse",
      category: "Blouse",
      stdFabricYards: 1.8,
      wastageCap: 5.0,
      components: {
        create: [
          {
            componentName: "Front Body Panel",
            piecesPerGarment: 1,
          },
          {
            componentName: "Back Body Panel",
            piecesPerGarment: 1,
          },
          {
            componentName: "Sleeves (Left & Right)",
            piecesPerGarment: 2,
          },
          {
            componentName: "Collar & Stand",
            piecesPerGarment: 1,
          },
          {
            componentName: "Sleeve Cuffs",
            piecesPerGarment: 2,
          },
        ],
      },
    },
  });

  // Crop Top
  await prisma.recipe.upsert({
    where: { recipeCode: "REC-CT02" },
    update: {
      name: "Crop Top",
      category: "Crop Top",
      stdFabricYards: 1.1,
      wastageCap: 8.0,
    },
    create: {
      recipeCode: "REC-CT02",
      name: "Crop Top",
      category: "Crop Top",
      stdFabricYards: 1.1,
      wastageCap: 8.0,
      components: {
        create: [
          {
            componentName: "Front Chest Panel",
            piecesPerGarment: 1,
          },
          {
            componentName: "Back Support Panel",
            piecesPerGarment: 1,
          },
          {
            componentName: "Neck Binding Strip",
            piecesPerGarment: 1,
          },
          {
            componentName: "Hem Elastic Casing",
            piecesPerGarment: 1,
          },
          {
            componentName: "Side Strap Accents",
            piecesPerGarment: 2,
          },
        ],
      },
    },
  });

  console.log("Demo users created.");
  console.log("REC-BL01 Casual Blouse created.");
  console.log("REC-CT02 Crop Top created.");
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