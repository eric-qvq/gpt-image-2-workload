import { ProviderForm } from "../../../components/admin/ProviderForm";
import { listProviders } from "../../../server/providers/repository";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  const providers = await listProviders().catch(() => []);

  return (
    <main>
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
    </main>
  );
}
