import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold text-slate-900">
            Task Manager
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Simple • Secure • Professional
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Manage your tasks,
            <br />
            teams and groups.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A simple task management system where admins can manage users,
            groups and tasks while every user sees only the information
            relevant to them.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Get Started
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <Feature
            title="Task Management"
            description="Create, assign, track and complete tasks from one place."
          />

          <Feature
            title="Groups"
            description="Organize admins and users into shared groups."
          />

          <Feature
            title="Private Data"
            description="Keep personal information separate while allowing controlled group sharing."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
        ✓
      </div>

      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
