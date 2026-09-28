"use client";

import { useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Prepare monthly report",
      assignedBy: "Ali",
      group: "Karachi Team",
      status: "In Progress",
      priority: "High",
    },
    {
      id: 2,
      title: "Review customer requests",
      assignedBy: "Ahmed",
      group: "Support Team",
      status: "Pending",
      priority: "Medium",
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function createTask(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title,
        assignedBy: "You",
        group: "My Group",
        status: "Pending",
        priority: "Medium",
      },
    ]);

    setTitle("");
    setDescription("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-slate-500">
            Create and manage your tasks.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Create Task
            </h2>

            <form onSubmit={createTask} className="mt-5 space-y-4">
              <input
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

              <select className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option>Assign To</option>
                <option>Hassan</option>
                <option>Ahmed</option>
                <option>Ali</option>
              </select>

              <select className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option>Group</option>
                <option>Karachi Team</option>
                <option>Support Team</option>
              </select>

              <select className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option>Medium Priority</option>
                <option>Low Priority</option>
                <option>High Priority</option>
              </select>

              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">
                Create Task
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Task List
              </h2>
            </div>

            <div className="divide-y">
              {tasks.map((task) => (
                <div key={task.id} className="p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Given by {task.assignedBy} • Group: {task.group}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                        {task.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="p-10 text-center text-slate-500">
                  No tasks found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
                  }
