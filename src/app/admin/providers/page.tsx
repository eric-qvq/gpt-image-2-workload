import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LogoutButton } from "../../../components/auth/LogoutButton";
import { ProviderForm } from "../../../components/admin/ProviderForm";
import { ProviderModelForm } from "../../../components/admin/ProviderModelForm";
import { requireAdmin } from "../../../server/auth/guards";
import { getSessionFromToken } from "../../../server/auth/request-session";
import { listProviders } from "../../../server/providers/repository";

export const dynamic = "force-dynamic";

async function requireAdminPageSession() {
  const cookieStore = await cookies();
  const session = await getSessionFromToken(cookieStore.get("session")?.value);

  try {
    return requireAdmin(session);
  } catch {
    redirect("/login");
  }
}

export default async function AdminProvidersPage() {
  await requireAdminPageSession();
  const providers = await listProviders().catch(() => []);

  return (
    <main>
      <LogoutButton />
      <h1>Provider Admin</h1>
      <section>
        <h2>Configured providers</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Base URL</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {providers.length ? (
              providers.map((provider) => (
                <tr key={provider.id}>
                  <td>{provider.name}</td>
                  <td>{provider.type}</td>
                  <td>{provider.baseUrl}</td>
                  <td>{provider.enabled ? "Enabled" : "Disabled"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No providers configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <ProviderForm />
      <ProviderModelForm providers={providers} />
    </main>
  );
}
