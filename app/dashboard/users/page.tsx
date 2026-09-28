"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

type UserItem = {
  id: string;
  name: string;
  email: string;
  status?: string;
};

const firebaseConfig = {
  apiKey: "AIzaSyA__VCR9IGqmFxjSk0e3pcu5dh6IRdzNr0",
  authDomain: "task-6ced7.firebaseapp.com",
  projectId: "task-6ced7",
  storageBucket: "task-6ced7.firebasestorage.app",
  messagingSenderId: "693208081052",
  appId: "1:693208081052:web:1e8336dca22b53d9e80359",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadUsers(adminId: string) {
    const q = query(
      collection(db, "users"),
      where("adminIds", "array-contains", adminId)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as UserItem[];

    setUsers(data.filter((item) => item.id !== adminId));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        await loadUsers(user.uid);
      } catch {
        setMessage("Unable to load users.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || password.length < 6) {
      setMessage("Enter all fields. Password must be at least 6 characters.");
      return;
    }

    if (!auth.currentUser) return;

    setSaving(true);
    setMessage("");

    try {
      const adminId = auth.currentUser.uid;

      const secondaryApp =
        getApps().find((app) => app.name === "UserCreator") ||
        initializeApp(firebaseConfig, "UserCreator");

      const secondaryAuth = getAuth(secondaryApp);

      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim().toLowerCase(),
        password
      );

      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "user",
        status: "active",
        adminIds: [adminId],
        createdBy: adminId,
        createdAt: serverTimestamp(),
      });

      await loadUsers(adminId);

      setName("");
      setEmail("");
      setPassword("");

      setMessage("User account created successfully.");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setMessage("This email already has an account.");
      } else if (err?.code === "auth/weak-password") {
        setMessage("Password must be at least 6 characters.");
      } else {
        setMessage("Unable to create user.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="mt-1 text-slate-500">
          Create and manage users.
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
            Create User
          </h2>

          <form onSubmit={addUser} className="mt-5 space-y-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary Password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <button
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b p-6">
            <h2 className="text-lg font-bold text-slate-900">
              User List
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
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
                    <p className="text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    {user.status || "active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
