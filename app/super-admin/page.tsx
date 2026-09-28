"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

type AdminItem = {
  id: string;
  name: string;
  email: string;
  status?: string;
  createdAt?: any;
};

type ActivityItem = {
  type: string;
  title: string;
  detail: string;
  date?: any;
};

export default function SuperAdminPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState(0);
  const [users, setUsers] = useState(0);
  const [groups, setGroups] = useState(0);
  const [tasks, setTasks] = useState(0);

  const [adminList, setAdminList] = useState<AdminItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [name, setName] = useState("Super Admin");
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

        if (user.uid !== SUPER_ADMIN_UID) {
          router.replace("/dashboard");
          return;
        }

        setName(
          user.displayName ||
            "Super Admin"
        );

        await loadSystemData();
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function loadSystemData() {
    setLoading(true);
    setError("");

    try {
      const [
        usersSnap,
        groupsSnap,
        tasksSnap,
      ] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "groups")),
        getDocs(collection(db, "tasks")),
      ]);

      let adminCount = 0;
      let userCount = 0;

      const loadedAdmins: AdminItem[] = [];

      usersSnap.docs.forEach((item) => {
        const data = item.data();

        if (data.role === "admin") {
          adminCount++;

          loadedAdmins.push({
            id: item.id,
            name:
              data.name ||
              "Unnamed Admin",
            email:
              data.email || "",
            status:
              data.status ||
              "active",
            createdAt:
              data.createdAt ||
              null,
          });
        }

        if (data.role === "user") {
          userCount++;
        }
      });

      setAdmins(adminCount);
      setUsers(userCount);
      setGroups(groupsSnap.size);
      setTasks(tasksSnap.size);
      setAdminList(loadedAdmins);

      const recentActivities: ActivityItem[] =
        [];

      loadedAdmins
        .filter((item) => item.createdAt)
        .sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() || 0;

          const bTime =
            b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        })
        .slice(0, 5)
        .forEach((admin) => {
          recentActivities.push({
            type: "Admin",
            title: "New Admin registered",
            detail: `${admin.name} • ${admin.email}`,
            date: admin.createdAt,
          });
        });

      setActivities(recentActivities);
    } catch (err: any) {
      console.error(
        "Super Admin Dashboard Error:",
        err
      );

      setError(
        `Unable to load system data${
          err?.code
            ? ` (${err.code})`
            : ""
        }.`
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: any) {
    if (!value) return "—";

    try {
      if (
        typeof value.toDate ===
        "function"
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
    <main className="p-5 md:p-8">

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            System Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Super Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back, {name}. Manage the complete Task Manager system from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={loadSystemData}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh Data"}
          </button>

          <Link
            href="/super-admin/admins"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Manage Admins
          </Link>

        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

          <p className="font-semibold text-red-700">
            System Data Error
          </p>

          <p className="mt-1 break-words text-sm text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* Main Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <SystemCard
          title="Total Admins"
          value={admins}
          description="Administrator accounts"
          icon="♙"
          loading={loading}
          href="/super-admin/admins"
        />

        <SystemCard
          title="Total Users"
          value={users}
          description="User accounts"
          icon="♟"
          loading={loading}
          href="/super-admin/users"
        />

        <SystemCard
          title="Total Groups"
          value={groups}
          description="Admin and User groups"
          icon="◫"
          loading={loading}
          href="/super-admin/groups"
        />

        <SystemCard
          title="Total Tasks"
          value={tasks}
          description="Tasks across the system"
          icon="✓"
          loading={loading}
          href="/super-admin/tasks"
        />

      </div>


      {/* Management Cards */}
      <div className="mt-8">

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-950">
            System Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Access and manage every major part of the application.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <ManagementCard
            title="Admins"
            description="View all administrator accounts and registration information."
            href="/super-admin/admins"
            icon="♙"
          />

          <ManagementCard
            title="Groups"
            description="View and manage groups across the entire system."
            href="/super-admin/groups"
            icon="◫"
          />

          <ManagementCard
            title="Users"
            description="View users and their system relationships."
            href="/super-admin/users"
            icon="♟"
          />

          <ManagementCard
            title="Tasks"
            description="View tasks created throughout the application."
            href="/super-admin/tasks"
            icon="✓"
          />

        </div>

      </div>


      {/* Lower Dashboard */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">

        {/* Recent Admins */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b p-6">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Admin Registrations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest administrator accounts.
              </p>
            </div>

            <Link
              href="/super-admin/admins"
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              View All
            </Link>

          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : adminList.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No Admin accounts found.
            </div>
          ) : (
            <div className="divide-y">

              {adminList
                .slice(0, 5)
                .map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center gap-4 p-5"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                      {admin.name
                        .charAt(0)
                        .toUpperCase() ||
                        "A"}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate font-semibold text-slate-900">
                        {admin.name}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {admin.email}
                      </p>

                    </div>

                    <div className="hidden text-right sm:block">

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {admin.status ||
                          "active"}
                      </span>

                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatDate(
                          admin.createdAt
                        )}
                      </p>

                    </div>

                  </div>
                ))}

            </div>
          )}

        </div>


        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b p-6">

            <h2 className="text-lg font-bold text-slate-950">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent system events available from current data.
            </p>

          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">
                ◷
              </div>

              <p className="mt-4 font-medium text-slate-700">
                No recent activity.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New system activity will appear here when supported by the stored data.
              </p>

            </div>
          ) : (
            <div className="divide-y">

              {activities.map(
                (activity, index) => (
                  <div
                    key={`${activity.title}-${index}`}
                    className="flex gap-4 p-5"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm">
                      ♙
                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold text-slate-900">
                        {activity.title}
                      </p>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {activity.detail}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(
                          activity.date
                        )}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>


      {/* Security / Access */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Security
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Super Admin access is active
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              You have system-wide access to Admins, Users, Groups and Tasks. Normal Admin accounts continue to use their own restricted dashboard and permissions.
            </p>

          </div>

          <Link
            href="/super-admin/settings"
            className="shrink-0 rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            System Settings
          </Link>

        </div>

      </div>

    </main>
  );
}


function SystemCard({
  title,
  value,
  description,
  icon,
  loading,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
  loading: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-900">
          {icon}
        </div>

        <span className="text-slate-300 transition group-hover:text-slate-700">
          →
        </span>

      </div>

      <p className="mt-6 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-950">
        {loading ? "..." : value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </Link>
  );
}


function ManagementCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 text-sm font-semibold text-slate-900">
        Open {title} →
      </div>

    </Link>
  );
              }
