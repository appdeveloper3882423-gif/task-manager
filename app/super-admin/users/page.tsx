"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  adminIds?: string[];
  createdAt?: any;
};

export default function SuperAdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        collection(db, "users")
      );

      const list: UserItem[] = snapshot.docs
        .map((item) => {
          const data = item.data();

          return {
            id: item.id,
            name: data.name || "Unnamed User",
            email: data.email || "",
            role: data.role || "user",
            status: data.status || "active",
            adminIds: data.adminIds || [],
            createdAt: data.createdAt || null,
          };
        })
        .filter(
          (item) => item.role === "user"
        );

      setUsers(list);
    } catch (err: any) {
      setError(
        `Unable to load system users${
          err?.code ? ` (${err.code})` : ""
        }.`
      );
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

        if (user.uid !== SUPER_ADMIN_UID) {
          router.replace("/dashboard");
          return;
        }

        await loadUsers();
      }
    );

    return () => unsubscribe();
  }, [router]);

  function formatDate(value: any) {
    if (!value) return "—";

    try {
      if (
        typeof value.toDate === "function"
      ) {
        return value.toDate().toLocaleString();
      }

      return "—";
    } catch {
      return "—";
    }
  }

  const filteredUsers = users.filter(
    (user) => {
      const value =
        `${user.name} ${user.email}`
          .toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    }
  );

  return (
    <main className="p-5 md:p-8">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            System Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            All Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View every User account across the entire system.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>

      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-5 sm:grid-cols-3">

        <Stat
          title="Total Users"
          value={users.length}
        />

        <Stat
          title="Active Users"
          value={
            users.filter(
              (user) =>
                user.status === "active"
            ).length
          }
        />

        <Stat
          title="Filtered Results"
          value={filteredUsers.length}
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              User Accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              System-wide User directory.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 lg:max-w-xs"
          />

        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No users found.
          </div>
        ) : (
          <div className="divide-y">

            {filteredUsers.map(
              (user, index) => (
                <div
                  key={user.id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                        {user.name
                          .charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-slate-950">
                            {user.name}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            User #{index + 1}
                          </span>

                        </div>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          {user.email}
                        </p>

                        <p className="mt-2 break-all text-xs text-slate-400">
                          UID: {user.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Admin relationships:{" "}
                          {user.adminIds?.length || 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Registered:{" "}
                          {formatDate(
                            user.createdAt
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        {user.status}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {user.role}
                      </span>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
        }
