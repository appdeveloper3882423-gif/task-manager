"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

type TaskItem = {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  groupName?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  createdAt?: any;
};

export default function SuperAdminTasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        collection(db, "tasks")
      );

      const list: TaskItem[] =
        snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            title:
              data.title || "Untitled Task",
            description:
              data.description || "",
            assignedTo:
              data.assignedTo || "",
            assignedToName:
              data.assignedToName || "User",
            assignedBy:
              data.assignedBy || "",
            assignedByName:
              data.assignedByName || "Admin",
            groupName:
              data.groupName || "",
            status:
              data.status || "Pending",
            priority:
              data.priority || "Medium",
            dueDate:
              data.dueDate || "",
            createdAt:
              data.createdAt || null,
          };
        });

      setTasks(list);
    } catch (err: any) {
      setError(
        `Unable to load system tasks${
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

        await loadTasks();
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

  const filteredTasks = tasks.filter(
    (task) => {
      const searchValue =
        `${task.title} ${task.assignedToName} ${task.assignedByName} ${task.groupName}`
          .toLowerCase();

      const matchesSearch =
        searchValue.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        status === "All" ||
        task.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <main className="p-5 md:p-8">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            System Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            All Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View tasks across the complete system.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTasks}
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

      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          title="Total Tasks"
          value={tasks.length}
        />

        <Stat
          title="Pending"
          value={pending}
        />

        <Stat
          title="In Progress"
          value={inProgress}
        />

        <Stat
          title="Completed"
          value={completed}
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Task Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Global task visibility for Super Admin.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search tasks..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 sm:w-64"
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none"
              >
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Overdue</option>
              </select>

            </div>

          </div>

        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No tasks found.
          </div>
        ) : (
          <div className="divide-y">

            {filteredTasks.map(
              (task) => (
                <div
                  key={task.id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-slate-950">
                          {task.title}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {task.priority}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {task.status}
                        </span>

                      </div>

                      {task.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

                        <span>
                          Assigned to:{" "}
                          <strong className="text-slate-700">
                            {task.assignedToName}
                          </strong>
                        </span>

                        <span>
                          Given by:{" "}
                          <strong className="text-slate-700">
                            {task.assignedByName}
                          </strong>
                        </span>

                        {task.groupName && (
                          <span>
                            Group:{" "}
                            <strong className="text-slate-700">
                              {task.groupName}
                            </strong>
                          </span>
                        )}

                        {task.dueDate && (
                          <span>
                            Due:{" "}
                            <strong className="text-slate-700">
                              {task.dueDate}
                            </strong>
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="shrink-0 text-xs text-slate-400">
                      Created:{" "}
                      {formatDate(
                        task.createdAt
                      )}
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
