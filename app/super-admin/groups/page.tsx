"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

type GroupItem = {
  id: string;
  name: string;
  createdBy?: string;
  type?: string;
  adminIds?: string[];
  userIds?: string[];
  createdAt?: any;
};

export default function SuperAdminGroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadGroups() {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        collection(db, "groups")
      );

      const list: GroupItem[] =
        snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            name:
              data.name || "Unnamed Group",
            createdBy:
              data.createdBy || "",
            type:
              data.type || "admin",
            adminIds:
              data.adminIds || [],
            userIds:
              data.userIds || [],
            createdAt:
              data.createdAt || null,
          };
        });

      setGroups(list);
    } catch (err: any) {
      setError(
        `Unable to load system groups${
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

        await loadGroups();
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

  const filteredGroups = groups.filter(
    (group) =>
      group.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <main className="p-5 md:p-8">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            System Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            All Groups
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View groups across the entire Task Manager system.
          </p>
        </div>

        <button
          type="button"
          onClick={loadGroups}
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
          title="Total Groups"
          value={groups.length}
        />

        <Stat
          title="Admins"
          value={groups.reduce(
            (total, group) =>
              total +
              (group.adminIds?.length || 0),
            0
          )}
        />

        <Stat
          title="Users"
          value={groups.reduce(
            (total, group) =>
              total +
              (group.userIds?.length || 0),
            0
          )}
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Group Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Global group information.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search groups..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 lg:max-w-xs"
          />

        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading groups...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No groups found.
          </div>
        ) : (
          <div className="grid gap-5 p-6 md:grid-cols-2">

            {filteredGroups.map(
              (group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-200 p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                        ◫
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          {group.name}
                        </h3>

                        <p className="text-xs text-slate-400">
                          {group.type || "admin"} group
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Admins
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-950">
                        {group.adminIds?.length || 0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Users
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-950">
                        {group.userIds?.length || 0}
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 border-t pt-4">

                    <p className="text-xs text-slate-400">
                      Group ID
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      {group.id}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Created:{" "}
                      {formatDate(
                        group.createdAt
                      )}
                    </p>

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
