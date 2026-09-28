"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

type Stat = {
  title: string;
  value: number;
};

export default function SuperAdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState<Stat[]>([
    { title: "Total Admins", value: 0 },
    { title: "Total Users", value: 0 },
    { title: "Total Groups", value: 0 },
    { title: "Total Tasks", value: 0 },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const [usersSnap, groupsSnap, tasksSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "groups")),
          getDocs(collection(db, "tasks")),
        ]);

        const users = usersSnap.docs.map((item) => item.data());

        const adminCount = users.filter(
          (user) => user.role === "admin"
        ).length;

        const userCount = users.filter(
          (user) => user.role === "user"
        ).length;

        setStats([
          { title: "Total Admins", value: adminCount },
          { title: "Total Users", value: userCount },
          { title: "Total Groups", value: groupsSnap.size },
          { title: "Total Tasks", value: tasksSnap.size },
        ]);
      } catch {
        setError(
          "Unable to load system data. Make sure your Super Admin email is configured in Firestore Rules."
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

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

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-5 md:p-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <AdminCard
            title="Manage Admins"
            description="View administrator accounts and system access."
            href="/super-admin/admins"
          />

          <AdminCard
            title="Manage Groups"
            description="Create groups and manage Admin and User membership."
            href="/dashboard/groups"
          />

          <AdminCard
            title="System Users"
            description="View users across the Task Manager system."
            href="/dashboard/users"
          />
        </div>

        <div className="mt-5">
          <AdminCard
            title="System Tasks"
            description="Open the task management area and review accessible tasks."
            href="/dashboard/tasks"
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
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 text-sm font-semibold text-slate-900">
        Open →
      </div>
    </Link>
  );
}
