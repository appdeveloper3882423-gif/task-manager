"use client";

import { useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Karachi Team",
      admins: 2,
      users: 8,
    },
    {
      id: 2,
      name: "Support Team",
      admins: 3,
      users: 12,
    },
  ]);

  const [name, setName] = useState("");

  function createGroup(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    setGroups([
      ...groups,
      {
        id: Date.now(),
        name,
        admins: 1,
        users: 0,
      },
    ]);

    setName("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
          <p className="mt-1 text-slate-500">
            Create and manage shared groups.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Create Group
            </h2>

            <form onSubmit={createGroup} className="mt-5 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group Name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">
                Create Group
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Group List
              </h2>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {group.name}
                  </h3>

                  <div className="mt-4 flex gap-5 text-sm text-slate-500">
                    <span>{group.admins} Admins</span>
                    <span>{group.users} Users</span>
                  </div>

                  <button className="mt-5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                    Group Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
      }
