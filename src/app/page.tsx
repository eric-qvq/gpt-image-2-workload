import Link from "next/link";

const entries = [
  { href: "/login", label: "Login" },
  { href: "/generate", label: "Generate" },
  { href: "/history", label: "History" },
  { href: "/admin/providers", label: "Provider Admin" }
];

export default function HomePage() {
  return (
    <main>
      <h1>GPT Image Delivery Platform</h1>
      <nav aria-label="Dashboard entry points">
        <ul>
          {entries.map((entry) => (
            <li key={entry.href}>
              <Link href={entry.href}>{entry.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
