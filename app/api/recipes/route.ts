import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const auth = await requireRole(request, [
    Role.CUTTING_SUPERVISOR,
  ]);

  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await request.json();

    const {
      recipeCode,
      name,
      category,
      stdFabricYards,
      wastageCap,
      components,
    } = body;

    if (
      !recipeCode ||
      !name ||
      !category ||
      stdFabricYards === undefined ||
      wastageCap === undefined ||
      !Array.isArray(components) ||
      components.length === 0
    ) {
      return NextResponse.json(
        { message: "All recipe fields and components are required" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        recipeCode,
        name,
        category,
        stdFabricYards: Number(stdFabricYards),
        wastageCap: Number(wastageCap),
        components: {
          create: components.map((component) => ({
            componentName: component.componentName,
            piecesPerGarment: Number(component.piecesPerGarment),
            imageUrl: component.imageUrl || null,
          })),
        },
      },
      include: {
        components: true,
      },
    });

    return NextResponse.json(
      {
        message: "Recipe created successfully",
        recipe,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create recipe error:", error);

    return NextResponse.json(
      { message: "Failed to create recipe" },
      { status: 500 }
    );
  }
}