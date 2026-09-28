"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";

type Task = {
  id: string;
  title: string;
  assignedByName?: string;
  groupName?: string;
  status?: string;
  priority?: string;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "tasks"),
          where("visibleToAdminIds", "array-contains", user.uid)
        );

        const snap = await getDocs(q);

        const loaded = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Task[];

        setTasks(loaded);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const completed = tasks.filter(
    (t) => t.status === "Completed"
  ).length;

  return (
    <main className="p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Welcome back. Here is your task overview.
          </p>
        </div>

        <Link
          href="/dashboard/tasks"
          className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
        >
          Create Task
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Total Tasks" value={total} />
        <Stat title="Pending" value={pending} />
        <Stat title="In Progress" value={inProgress} />
        <Stat title="Completed" value={completed} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Recent Tasks
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No tasks found.
          </div>
        ) : (
          <div className="divide-y">
            {tasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Given by {task.assignedByName || "Admin"}
                    {task.groupName
                      ? ` • Group: ${task.groupName}`
                      : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {task.priority || "Medium"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {task.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
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
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
