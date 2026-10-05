import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function requireRole(
  request: Request,
  allowedRoles: string[]
) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const token = authorization.substring(7);

  try {
    const payload = verifyToken(token);

    if (!allowedRoles.includes(payload.role)) {
      return {
        error: NextResponse.json(
          { message: "Forbidden" },
          { status: 403 }
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return {
        error: NextResponse.json(
          { message: "User not found" },
          { status: 401 }
        ),
      };
    }

    return {
      user,
    };
  } catch {
    return {
      error: NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}