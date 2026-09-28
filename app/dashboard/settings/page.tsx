"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-slate-500">
            Manage your application preferences.
          </p>
        </div>

        <div className="space-y-5">
          <Setting
            title="Task Notifications"
            description="Receive notifications about task changes."
            enabled={notifications}
            onChange={setNotifications}
          />

          <Setting
            title="Email Updates"
            description="Receive important account and task updates by email."
            enabled={emailUpdates}
            onChange={setEmailUpdates}
          />

          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-red-700">Account</h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign out from this account on the current device.
            </p>

            <button className="mt-5 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Setting({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled ? "bg-slate-900" : "bg-slate-300"
        }`}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
