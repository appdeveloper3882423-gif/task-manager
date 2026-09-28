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

const SUPER_ADMIN_EMAIL = "labpc4308077@gmail.com";

export default function SuperAdminAdminsPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");

      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const currentEmail =
        currentUser.email?.trim().toLowerCase() || "";

      if (
        currentEmail !==
        SUPER_ADMIN_EMAIL.toLowerCase()
      ) {
        router.replace("/dashboard");
        return;
      }

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
        "Super Admin Admins Error:",
        err
      );

      const code = err?.code || "";

      if (code === "permission-denied") {
        setError(
          "Firestore permission denied. Make sure the Super Admin email in Firestore Rules is labpc4308077@gmail.com and the rules are published."
        );
      } else {
        setError(
          `Unable to load Admin accounts${
            code ? ` (${code})` : ""
          }.`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        const email =
          user.email?.trim().toLowerCase() || "";

        if (
          email !==
          SUPER_ADMIN_EMAIL.toLowerCase()
        ) {
          router.replace("/dashboard");
          return;
        }

        await loadAdmins();
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

  const activeAdmins = admins.filter(
    (admin) => admin.status === "active"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Super Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Manage Admins
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View all Admin accounts registered in the system.
            </p>
          </div>

          <Link
            href="/super-admin"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Super Admin
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-7xl p-5 md:p-8">

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Unable to load Admin accounts
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-red-600">
              {error}
            </p>
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
              {loading ? "..." : activeAdmins}
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
                Every registered Admin appears here.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdmins}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading Admin accounts...
            </div>
          ) : admins.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl">
                👤
              </div>

              <p className="mt-4 font-semibold text-slate-700">
                No Admin accounts found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New Admin registrations will appear here.
              </p>

            </div>
          ) : (
            <div className="divide-y">

              {admins.map((admin, index) => (
                <div
                  key={admin.id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                        {admin.name
                          .charAt(0)
                          .toUpperCase() || "A"}
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
                          {admin.email || "No email"}
                        </p>

                        <p className="mt-2 break-all text-xs text-slate-400">
                          UID: {admin.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Registered:{" "}
                          {formatDate(admin.createdAt)}
                        </p>

                      </div>

                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          admin.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {admin.status}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {admin.role}
                      </span>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </section>
    </main>
  );
}
