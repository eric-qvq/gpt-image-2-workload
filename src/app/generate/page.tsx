import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LogoutButton } from "../../components/auth/LogoutButton";
import { GenerateWorkspace } from "../../components/generate/GenerateWorkspace";
import { requireMember } from "../../server/auth/guards";
import { getSessionFromToken } from "../../server/auth/request-session";
import { listGenerationOptions } from "../../server/providers/repository";

export const dynamic = "force-dynamic";

type GeneratePageProps = {
  searchParams?: Promise<{
    prompt?: string;
    providerId?: string;
    modelId?: string;
    size?: string;
    count?: string;
    quality?: string;
  }>;
};

async function requireMemberPageSession() {
  const cookieStore = await cookies();
  const session = await getSessionFromToken(cookieStore.get("session")?.value);

  try {
    return requireMember(session);
  } catch {
    redirect("/login");
  }
}

function readCount(value: string | undefined): number {
  const count = Number(value ?? 1);

  return Number.isFinite(count) && count > 0 ? count : 1;
}

export default async function GeneratePage({ searchParams }: GeneratePageProps) {
  await requireMemberPageSession();
  const params = searchParams ? await searchParams : {};
  const options = await listGenerationOptions().catch(() => ({
    providers: [],
    models: []
  }));

  return (
    <main>
      <LogoutButton />
      <h1>Generate Images</h1>
      <GenerateWorkspace
        providers={options.providers}
        models={options.models}
        initialPrompt={params.prompt ?? ""}
        initialParameters={{
          providerId: params.providerId,
          modelId: params.modelId,
          size: params.size,
          count: readCount(params.count),
          quality: params.quality
        }}
      />
    </main>
  );
}
