
import Link from "next/link";

const stats = [
  { title: "Total Admins", value: "12" },
  { title: "Total Users", value: "86" },
  { title: "Total Groups", value: "18" },
  { title: "Total Tasks", value: "342" },
];

export default function SuperAdminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Super Admin
            </h1>
            <p className="text-sm text-slate-500">
              System-wide administration
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <AdminCard
            title="Manage Admins"
            description="View and manage administrator accounts."
            href="/super-admin/admins"
          />

          <AdminCard
            title="Manage Groups"
            description="Create and manage system groups."
            href="/dashboard/groups"
          />

          <AdminCard
            title="System Users"
            description="View users across the system."
            href="/dashboard/users"
          />
        </div>
      </section>
    </main>
  );
}

function AdminCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 text-sm font-semibold text-slate-900">
        Open →
      </div>
    </Link>
  );
}
