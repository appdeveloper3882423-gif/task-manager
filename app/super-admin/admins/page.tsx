"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
collection,
getDocs,
query,
where,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AdminItem = {
id: string;
name: string;
email: string;
role: string;
status: string;
createdAt: any;
};

export default function SuperAdminAdminsPage() {
const router = useRouter();

const [admins, setAdmins] = useState<AdminItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

async function loadAdmins() {
try {
setLoading(true);
setError("");

  const q = query(
    collection(db, "users"),
    where("role", "==", "admin")
  );

  const snapshot = await getDocs(q);

  const list: AdminItem[] = [];

  snapshot.forEach((document) => {
    const data = document.data();

    list.push({
      id: document.id,
      name: data.name || "Unnamed Admin",
      email: data.email || "",
      role: data.role || "admin",
      status: data.status || "active",
      createdAt: data.createdAt || null,
    });
  });

  setAdmins(list);
} catch (err: any) {
  console.error(
    "Manage Admins Error:",
    err
  );

  setError(
    "Unable to load Admin accounts."
  );
} finally {
  setLoading(false);
}

}

useEffect(() => {
const unsubscribe = onAuthStateChanged(
auth,
(user) => {
if (!user) {
router.replace("/login");
return;
}

    loadAdmins();
  }
);

return () => unsubscribe();

}, [router]);

function formatDate(value: any) {
if (!value) {
return "—";
}

try {
  if (
    typeof value.toDate === "function"
  ) {
    return value
      .toDate()
      .toLocaleString();
  }

  return "—";
} catch {
  return "—";
}

}

return (
<main className="min-h-screen bg-slate-50">
<header className="border-b bg-white">
<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
<div>
<h1 className="text-2xl font-bold text-slate-900">
Manage Admins
</h1>

        <p className="mt-1 text-sm text-slate-500">
          View all registered Admin accounts.
        </p>
      </div>

      <Link
        href="/super-admin"
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Super Admin
      </Link>
    </div>
  </header>

  <section className="mx-auto max-w-7xl p-5 md:p-8">

    {error && (
      <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    <div className="mb-6 grid gap-5 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Total Admins
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {loading ? "..." : admins.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Active Admins
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {loading
            ? "..."
            : admins.filter(
                (admin) =>
                  admin.status === "active"
              ).length}
        </p>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Admin Accounts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All Admin accounts created through registration.
          </p>
        </div>

        <button
          onClick={loadAdmins}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Loading Admin accounts...
        </div>
      ) : admins.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium text-slate-700">
            No Admin accounts found.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            New Admin registrations will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {admins.map(
            (admin, index) => (
              <div
                key={admin.id}
                className="p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {admin.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {admin.name}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          Admin #{index + 1}
                        </span>
                      </div>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {admin.email}
                      </p>

                      <p className="mt-2 break-all text-xs text-slate-400">
                        UID: {admin.id}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Registered:{" "}
                        {formatDate(
                          admin.createdAt
                        )}
                      </p>

                    </div>
                  </div>

                  <div>
                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                      {admin.status}
                    </span>
                  </div>

                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  </section>
</main>

);
}
