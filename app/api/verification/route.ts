import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Role,
  OrderStatus,
  VerificationDecision,
  VerificationStatus,
} from "@prisma/client";
import { requireRole } from "@/lib/require-role";

export async function POST(request: Request) {
  const auth = await requireRole(request, [
    Role.CUTTING_VERIFIER,
  ]);

  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await request.json();

    const {
      orderId,
      decision,
      rejectionNote,
    } = body;

    if (!orderId || !decision) {
      return NextResponse.json(
        {
          message: "orderId and decision are required",
        },
        { status: 400 }
      );
    }

    if (
      decision !== VerificationDecision.APPROVED &&
      decision !== VerificationDecision.REJECTED
    ) {
      return NextResponse.json(
        {
          message: "Invalid verification decision",
        },
        { status: 400 }
      );
    }

    if (
      decision === VerificationDecision.REJECTED &&
      !rejectionNote?.trim()
    ) {
      return NextResponse.json(
        {
          message: "Rejection reason is required",
        },
        { status: 400 }
      );
    }

    const order = await prisma.cuttingOrder.findUnique({
      where: {
        id: Number(orderId),
      },
      include: {
        verificationItems: true,
        recipe: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          message: "Cutting order not found",
        },
        { status: 404 }
      );
    }

    if (order.status !== OrderStatus.PENDING_VERIFICATION) {
      return NextResponse.json(
        {
          message: "Order is not pending verification",
        },
        { status: 400 }
      );
    }

    const hasRedItem = order.verificationItems.some(
      (item) => item.status === VerificationStatus.RED
    );

    const hasMissingOrShortage = order.verificationItems.some(
      (item) => item.actualQty < item.expectedQty
    );

    if (
      decision === VerificationDecision.APPROVED &&
      (hasRedItem || hasMissingOrShortage)
    ) {
      return NextResponse.json(
        {
          message:
            "Approval blocked: verification contains RED, shortage, or missing components",
        },
        { status: 422 }
      );
    }

    const wastagePct =
      order.recipe.stdFabricYards > 0
        ? ((order.actualFabricYds -
            order.recipe.stdFabricYards * order.targetQty) /
            (order.recipe.stdFabricYards * order.targetQty)) *
          100
        : 0;

    const newStatus =
      decision === VerificationDecision.APPROVED
        ? OrderStatus.VERIFIED
        : OrderStatus.REJECTED;

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.cuttingOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: newStatus,
        },
      });

      const log = await tx.verificationLog.create({
        data: {
          orderId: order.id,
          verifierId: auth.user.id,
          decision,
          rejectionNote:
            decision === VerificationDecision.REJECTED
              ? rejectionNote.trim()
              : null,
          wastagePct,
        },
      });

      return {
        updatedOrder,
        log,
      };
    });

    return NextResponse.json({
      message:
        decision === VerificationDecision.APPROVED
          ? "Order approved successfully"
          : "Order rejected successfully",
      ...result,
    });
  } catch (error) {
    console.error("Verification error:", error);

    return NextResponse.json(
      {
        message: "Verification failed",
      },
      { status: 500 }
    );
  }
}