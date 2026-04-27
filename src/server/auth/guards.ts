import type { Session } from "./session";

function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}

function forbidden(): Response {
  return new Response("Forbidden", { status: 403 });
}

function requireSession(session: Session | null | undefined): Session {
  if (!session) {
    throw unauthorized();
  }

  return session;
}

export function requireAdmin(session: Session | null | undefined): Session {
  const currentSession = requireSession(session);

  if (currentSession.role !== "ADMIN") {
    throw forbidden();
  }

  return currentSession;
}

export function requireMember(session: Session | null | undefined): Session {
  const currentSession = requireSession(session);

  if (currentSession.role !== "MEMBER" && currentSession.role !== "ADMIN") {
    throw forbidden();
  }

  return currentSession;
}
