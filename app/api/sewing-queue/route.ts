import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { Role, OrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  const auth = await requireRole(request, [
    Role.SEWING_SUPERVISOR,
  ]);

  if (auth.error) {
    return auth.error;
  }

  try {
    const orders = await prisma.cuttingOrder.findMany({
      where: {
        status: OrderStatus.VERIFIED,
      },
      include: {
        recipe: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("Sewing queue error:", error);

    return NextResponse.json(
      {
        message: "Failed to load sewing queue",
      },
      { status: 500 }
    );
  }
}