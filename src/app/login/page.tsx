export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <form>
        <label>
          Account
          <input name="account" autoComplete="username" />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
