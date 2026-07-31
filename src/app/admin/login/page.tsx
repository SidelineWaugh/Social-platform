import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={loginAction}
        className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8"
      >
        <div className="mb-1 font-display text-2xl uppercase tracking-wide text-ink">
          Sideline <span className="text-brand">Admin</span>
        </div>
        <p className="mb-6 text-sm text-ink-muted">
          Enter the admin password to manage events.
        </p>

        <label className="label mb-1.5 block text-ink-faint!">Password</label>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand/70 focus:ring-2 focus:ring-brand/25"
        />

        {error && (
          <p className="mt-3 text-sm text-brand">Incorrect password. Try again.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-brand py-2.5 font-cond text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
