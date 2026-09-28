"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTasks(userId: string) {
    const q = query(
      collection(db, "tasks"),
      where("visibleToAdminIds", "array-contains", userId)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as Task[];

    setTasks(data);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        await loadTasks(user.uid);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;
    if (!auth.currentUser) return;

    setSaving(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        description: description.trim(),
        assignedTo: user.uid,
        assignedBy: user.uid,
        assignedByName: user.displayName || "Admin",
        groupId: "",
        groupName: "",
        status: "Pending",
        priority,
        dueDate,
        visibleToAdminIds: [user.uid],
        createdAt: serverTimestamp(),
      });

      await loadTasks(user.uid);

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setMessage("Task created successfully.");
    } catch {
      setMessage("Unable to create task.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    taskId: string,
    status: string
  ) {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status,
      });

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status } : task
        )
      );
    } catch {
      setMessage("Unable to update task.");
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
        <p className="mt-1 text-slate-500">
          Create and manage your tasks.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Create Task
          </h2>

          <form onSubmit={createTask} className="mt-5 space-y-4">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <button
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Task List
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No tasks found.
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task) => (
                <div key={task.id} className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-400">
                        Given by {task.assignedByName || "Admin"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                        {task.priority}
                      </span>

                      <select
                        value={task.status || "Pending"}
                        onChange={(e) =>
                          changeStatus(task.id, e.target.value)
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
