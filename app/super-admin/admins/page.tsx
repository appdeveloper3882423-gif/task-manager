"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_EMAIL = "superadmin59@gmail.com";

export default function SuperAdminPage() {
const router = useRouter();

const [admins, setAdmins] = useState(0);
const [users, setUsers] = useState(0);
const [groups, setGroups] = useState(0);
const [tasks, setTasks] = useState(0);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const unsubscribe = onAuthStateChanged(
auth,
async (user) => {
if (!user) {
router.replace("/login");
return;
}

    const loggedInEmail =
      user.email?.trim().toLowerCase() || "";

    if (
      loggedInEmail !==
      SUPER_ADMIN_EMAIL.toLowerCase()
    ) {
      router.replace("/dashboard");
      return;
    }

    try {
      setError("");

      const usersSnap = await getDocs(
        collection(db, "users")
      );

      const groupsSnap = await getDocs(
        collection(db, "groups")
      );

      const tasksSnap = await getDocs(
        collection(db, "tasks")
      );

      let adminCount = 0;
      let userCount = 0;

      usersSnap.forEach((item) => {
        const data = item.data();

        if (data.role === "admin") {
          adminCount++;
        }

        if (data.role === "user") {
          userCount++;
        }
      });

      setAdmins(adminCount);
      setUsers(userCount);
      setGroups(groupsSnap.size);
      setTasks(tasksSnap.size);
    } catch (err: any) {
      console.error(
        "SUPER ADMIN FIRESTORE ERROR:",
        err
      );

      const code =
        err?.code || "unknown";

      const message =
        err?.message ||
        "Unknown Firestore error.";

      setError(
        `Firestore Error: ${code} — ${message}`
      );
    } finally {
      setLoading(false);
    }
  }
);

return () => unsubscribe();

}, [router]);

return (
<main className="min-h-screen bg-slate-50">

  <header className="border-b bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Super Admin
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          System-wide administration
        </p>
      </div>

      <Link
        href="/super-admin/admins"
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Manage Admins
      </Link>

    </div>
  </header>

  <section className="mx-auto max-w-7xl p-5 md:p-8">

    {error && (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          Unable to load system data
        </p>

        <p className="mt-2 break-words text-sm leading-6 text-red-600">
          {error}
        </p>
      </div>
    )}

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

      <Stat
        title="Total Admins"
        value={admins}
        loading={loading}
      />

      <Stat
        title="Total Users"
        value={users}
        loading={loading}
      />

      <Stat
        title="Total Groups"
        value={groups}
        loading={loading}
      />

      <Stat
        title="Total Tasks"
        value={tasks}
        loading={loading}
      />

    </div>

    <div className="mt-8 grid gap-5 md:grid-cols-2">

      <Card
        title="Manage Admins"
        description="View all Admin accounts registered in the system."
        href="/super-admin/admins"
      />

      <Card
        title="Manage Groups"
        description="View and manage system groups."
        href="/dashboard/groups"
      />

      <Card
        title="System Users"
        description="View users across the system."
        href="/dashboard/users"
      />

      <Card
        title="System Tasks"
        description="View and manage system tasks."
        href="/dashboard/tasks"
      />

    </div>

  </section>
</main>

);
}

function Stat({
title,
value,
loading,
}: {
title: string;
value: number;
loading: boolean;
}) {
return (
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

  <p className="text-sm text-slate-500">
    {title}
  </p>

  <p className="mt-2 text-3xl font-bold text-slate-900">
    {loading ? "..." : value}
  </p>

</div>

);
}

function Card({
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
