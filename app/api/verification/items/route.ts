import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { Role, VerificationStatus } from "@prisma/client";

export async function PATCH(request: Request) {
  const auth = await requireRole(request, [
    Role.CUTTING_VERIFIER,
  ]);

  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await request.json();

    const {
      itemId,
      actualQty,
    } = body;

    if (
      !itemId ||
      actualQty === undefined
    ) {
      return NextResponse.json(
        {
          message: "itemId and actualQty are required",
        },
        { status: 400 }
      );
    }

    const item = await prisma.verificationItem.findUnique({
      where: {
        id: Number(itemId),
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          message: "Verification item not found",
        },
        { status: 404 }
      );
    }

    const quantity = Number(actualQty);

    if (!Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json(
        {
          message: "actualQty must be a non-negative integer",
        },
        { status: 400 }
      );
    }

    let status: VerificationStatus;

    if (quantity >= item.expectedQty) {
      status = VerificationStatus.GREEN;
    } else if (quantity > 0) {
      status = VerificationStatus.YELLOW;
    } else {
      status = VerificationStatus.RED;
    }

    const updatedItem = await prisma.verificationItem.update({
      where: {
        id: item.id,
      },
      data: {
        actualQty: quantity,
        status,
      },
      include: {
        component: true,
      },
    });

    return NextResponse.json({
      message: "Verification item updated",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update verification item error:", error);

    return NextResponse.json(
      {
        message: "Failed to update verification item",
      },
      { status: 500 }
    );
  }
}