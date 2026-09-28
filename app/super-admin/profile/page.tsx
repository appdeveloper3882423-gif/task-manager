"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

export default function SuperAdminProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

        setEmail(user.email || "");
        setName(user.displayName || "");
        setRole("Super Admin");

        try {
          const snapshot = await getDoc(
            doc(db, "users", user.uid)
          );

          if (snapshot.exists()) {
            const data = snapshot.data();

            setName(
              data.name ||
                user.displayName ||
                "Super Admin"
            );

            setRole(
              data.role === "admin"
                ? "Super Admin"
                : data.role ||
                    "Super Admin"
            );
          }
        } catch {
          setMessage(
            "Unable to load profile details."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function saveProfile() {
    if (!auth.currentUser) return;

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await updateProfile(
        auth.currentUser,
        {
          displayName: name.trim(),
        }
      );

      await updateDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid
        ),
        {
          name: name.trim(),
        }
      );

      setMessage(
        "Profile updated successfully."
      );
    } catch (err: any) {
      setMessage(
        `Unable to update profile${
          err?.code
            ? ` (${err.code})`
            : ""
        }.`
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading profile...
        </p>
      </main>
    );
  }

  return (
    <main className="p-5 md:p-8">

      <div className="mx-auto max-w-4xl">

        <div className="mb-8">

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your Super Admin account information.
          </p>

        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 border-b border-slate-100 pb-8 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-bold text-white">
              {name
                .charAt(0)
                .toUpperCase() || "S"}
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-950">
                {name || "Super Admin"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {email}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Super Admin
              </span>

            </div>

          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                value={email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role
              </label>

              <input
                value={role}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                User UID
              </label>

              <input
                value={SUPER_ADMIN_UID}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-500"
              />
            </div>

          </div>

          <div className="mt-8">

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </div>

    </main>
  );
      }
