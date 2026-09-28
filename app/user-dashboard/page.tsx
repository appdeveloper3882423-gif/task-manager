"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description?: string;
  assignedByName?: string;
  groupName?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
};

export default function UserDashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState("User");
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

        try {
          const profile = await getDoc(
            doc(db, "users", user.uid)
          );

          if (
            profile.exists() &&
            profile.data().role !== "user"
          ) {
            router.replace("/dashboard");
            return;
          }

          setName(
            profile.exists()
              ? profile.data().name ||
                  user.displayName ||
                  "User"
              : user.displayName || "User"
          );

          const q = query(
            collection(db, "tasks"),
            where(
              "assignedTo",
              "==",
              user.uid
            )
          );

          const snap = await getDocs(q);

          const loaded = snap.docs.map(
            (item) => ({
              id: item.id,
              ...item.data(),
            })
          ) as Task[];

          setTasks(loaded);
        } catch {
          setError(
            "Unable to load your tasks."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function markCompleted(
    taskId: string
  ) {
    try {
      await updateDoc(
        doc(db, "tasks", taskId),
        {
          status: "Completed",
        }
      );

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "Completed",
              }
            : task
        )
      );
    } catch {
      setError(
        "Unable to update task."
      );
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  const pending = tasks.filter(
    (task) =>
      task.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (task) =>
      task.status === "In Progress"
  ).length;

  const completed = tasks.filter(
    (task) =>
      task.status === "Completed"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Task Manager
            </h1>

            <p className="text-sm text-slate-500">
              Welcome, {name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            My Tasks
          </h2>

          <p className="mt-1 text-slate-500">
            View and complete tasks assigned to you.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b p-6">
            <h3 className="text-lg font-bold text-slate-900">
              Assigned Tasks
            </h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading your tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">
                No tasks assigned to you.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New tasks will appear here when an Admin assigns them.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>
                          Given by{" "}
                          <strong className="text-slate-700">
                            {task.assignedByName ||
                              "Admin"}
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

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {task.priority ||
                          "Medium"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {task.status ||
                          "Pending"}
                      </span>

                      {task.status !==
                        "Completed" && (
                        <button
                          onClick={() =>
                            markCompleted(
                              task.id
                            )
                          }
                          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Mark as Completed
                        </button>
                      )}
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

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
