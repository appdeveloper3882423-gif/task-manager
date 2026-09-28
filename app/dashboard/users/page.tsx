"use client";

import { useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Hassan",
      email: "hassan@example.com",
      groups: "Karachi Team",
      status: "Active",
    },
    {
      id: 2,
      name: "Ahmed",
      email: "ahmed@example.com",
      groups: "Support Team",
      status: "Active",
    },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function addUser(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    setUsers([
      ...users,
      {
        id: Date.now(),
        name,
        email,
        groups: "No Group",
        status: "Active",
      },
    ]);

    setName("");
    setEmail("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">
            Manage users and their group access.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Add User
            </h2>

            <form onSubmit={addUser} className="mt-5 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">
                Add User
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-lg font-bold text-slate-900">
                User List
              </h2>
            </div>

            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-slate-500">
                      Group: <span className="text-slate-900">{user.groups}</span>
                    </p>
                    <p className="mt-1 text-green-600">{user.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
