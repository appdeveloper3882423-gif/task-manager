"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setEmail(user.email || "");
      setName(user.displayName || "");

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();

          setName(data.name || user.displayName || "");
          setRole(data.role || "");
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function saveChanges() {
    if (!auth.currentUser || !name.trim()) return;

    setSaving(true);
    setMessage("");

    try {
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
      });

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: name.trim(),
      });

      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-slate-500">
            Manage your account information.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
              {name.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                {name || "User"}
              </h2>

              <p className="text-sm text-slate-500">{email}</p>

              {role && (
                <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                  {role}
                </p>
              )}
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

            <button
              onClick={saveChanges}
              disabled={saving}
              className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
