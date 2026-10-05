import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { Role, OrderStatus } from "@prisma/client";

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
      orderNo,
      recipeId,
      targetQty,
      fabricRollId,
      actualFabricYds,
    } = body;

    if (
      !orderNo ||
      !recipeId ||
      !targetQty ||
      !fabricRollId ||
      actualFabricYds === undefined
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: {
        id: Number(recipeId),
      },
      include: {
        components: true,
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { message: "Recipe not found" },
        { status: 404 }
      );
    }

    const order = await prisma.cuttingOrder.create({
      data: {
        orderNo,
        recipeId: Number(recipeId),
        targetQty: Number(targetQty),
        fabricRollId,
        actualFabricYds: Number(actualFabricYds),
        status: OrderStatus.PENDING_VERIFICATION,
        createdBy: auth.user.id,
      },
    });

    const verificationItems = recipe.components.map((component) => ({
      orderId: order.id,
      componentId: component.id,
      expectedQty: component.piecesPerGarment * Number(targetQty),
      actualQty: 0,
      status: "RED" as const,
    }));

    await prisma.verificationItem.createMany({
      data: verificationItems,
    });

    return NextResponse.json(
      {
        message: "Cutting order created",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create cutting order error:", error);

    return NextResponse.json(
      { message: "Failed to create cutting order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const auth = await requireRole(request, [
    Role.CUTTING_VERIFIER,
    Role.CUTTING_SUPERVISOR,
  ]);

  if (auth.error) {
    return auth.error;
  }

  try {
    const orders = await prisma.cuttingOrder.findMany({
      where: {
        status: OrderStatus.PENDING_VERIFICATION,
      },
      include: {
        recipe: {
          include: {
            components: true,
          },
        },
        verificationItems: {
          include: {
            component: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("Get cutting orders error:", error);

    return NextResponse.json(
      { message: "Failed to get cutting orders" },
      { status: 500 }
    );
  }
}