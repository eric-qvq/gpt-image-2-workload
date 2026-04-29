import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "../../../server/auth/password";
import { createSessionToken, type SessionRole } from "../../../server/auth/session";
import { prisma } from "../../../server/db/client";

const loginSchema = z.object({
  account: z.string().trim().min(1),
  password: z.string().min(1)
});

function invalidCredentials() {
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { account: body.account },
          { email: body.account }
        ]
      }
    });

    if (!user || user.status !== "ACTIVE") {
      return invalidCredentials();
    }

    const passwordMatches = await verifyPassword(body.password, user.passwordHash);

    if (!passwordMatches) {
      return invalidCredentials();
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role as SessionRole
    });
    const response = NextResponse.json({
      user: {
        id: user.id,
        account: user.account,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 400 }
    );
  }
}
