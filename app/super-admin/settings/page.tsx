"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

export default function SuperAdminSettingsPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [systemName, setSystemName] =
    useState("Task Manager");
  const [maintenance, setMaintenance] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        if (user.uid !== SUPER_ADMIN_UID) {
          router.replace("/dashboard");
          return;
        }

        setChecking(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function logout() {
    setLoading(true);

    try {
      await signOut(auth);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  function saveSettings() {
    setMessage(
      "System settings are saved for this session."
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading settings...
        </p>
      </main>
    );
  }

  return (
    <main className="p-5 md:p-8">

      <div className="mb-8">

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          System Management
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          System Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage global application settings and Super Admin controls.
        </p>

      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">

        {/* General */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-950">
            General
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic application configuration.
          </p>

          <div className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                System Name
              </label>

              <input
                value={systemName}
                onChange={(e) =>
                  setSystemName(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            <div className="flex items-center justify-between gap-5 rounded-xl bg-slate-50 p-4">

              <div>
                <p className="font-semibold text-slate-800">
                  Maintenance Mode
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Temporarily indicate that the system is under maintenance.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMaintenance(
                    !maintenance
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full ${
                  maintenance
                    ? "bg-slate-950"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    maintenance
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            <button
              type="button"
              onClick={saveSettings}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save Settings
            </button>

          </div>

        </section>


        {/* Access */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-950">
            Super Admin Access
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current system-level administrator information.
          </p>

          <div className="mt-6 space-y-4">

            <Info
              label="Role"
              value="Super Admin"
            />

            <Info
              label="Authentication"
              value="Firebase Authentication"
            />

            <Info
              label="Database"
              value="Firebase Firestore"
            />

            <Info
              label="Super Admin UID"
              value={SUPER_ADMIN_UID}
            />

          </div>

        </section>


        {/* Security */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-950">
            Security
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            System access and security information.
          </p>

          <div className="mt-6 space-y-3">

            <SecurityRow
              title="Firestore Security Rules"
              value="Active"
            />

            <SecurityRow
              title="Super Admin Verification"
              value="UID Verified"
            />

            <SecurityRow
              title="Authentication Provider"
              value="Email / Password"
            />

          </div>

        </section>


        {/* Danger Zone */}
        <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-red-700">
            Account
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sign out from the Super Admin account on this device.
          </p>

          <button
            type="button"
            onClick={logout}
            disabled={loading}
            className="mt-6 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loading
              ? "Logging Out..."
              : "Logout"}
          </button>

        </section>

      </div>

    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

function SecurityRow({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">

      <p className="text-sm font-medium text-slate-700">
        {title}
      </p>

      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        {value}
      </span>

    </div>
  );
          }
