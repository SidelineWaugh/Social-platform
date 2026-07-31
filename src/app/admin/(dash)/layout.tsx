import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b-2 border-brand bg-navy-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-3.5 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-display text-2xl leading-none tracking-wide text-ink"
            >
              Sideline
            </Link>
            <span className="h-4 w-px bg-line-strong" />
            <span className="font-cond text-sm font-semibold uppercase tracking-[0.24em] text-ink-muted">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-cond text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted transition hover:text-ink"
            >
              View site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-cond text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted transition hover:text-brand"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[960px] px-4 py-8 lg:px-6">{children}</main>
    </div>
  );
}
