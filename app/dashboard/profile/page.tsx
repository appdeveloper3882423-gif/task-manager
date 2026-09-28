"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("Admin User");
  const [email] = useState("admin@example.com");

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-slate-500">
            Manage your account information.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
              A
            </div>

            <div>
              <h2 className="font-bold text-slate-900">{name}</h2>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                value={email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <button className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
