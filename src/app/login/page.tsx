import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section
        className="page-card login-card"
        aria-labelledby="login-title"
      >
        <p className="eyebrow">Welcome back</p>
        <h1 id="login-title">Login</h1>
        <p className="muted">
          Use the seeded admin account first, then configure your image provider.
        </p>
        <div className="login-hint">
          <span>Default local account</span>
          <strong>admin / admin123456</strong>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
